import express from 'express';
import { protect } from '../middleware/auth.js';
import DoseLog from '../models/DoseLog.js';
import Medicine from '../models/Medicine.js';
import StockTransaction from '../models/StockTransaction.js';
import mongoose from 'mongoose';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/doses/today
// @desc    Get today's doses
// @access  Private
router.get('/today', async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const doses = await DoseLog.find({
      user: req.user._id,
      scheduledTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('medicine', 'name strength form')
      .populate('familyMember', 'name displayColor')
      .sort('scheduledTime');

    res.json({
      success: true,
      count: doses.length,
      doses,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/doses
// @desc    Get dose history
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { status, medicineId, familyMemberId, from, to, limit = 50 } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (medicineId) query.medicine = medicineId;
    if (familyMemberId) query.familyMember = familyMemberId;

    if (from || to) {
      query.scheduledTime = {};
      if (from) query.scheduledTime.$gte = new Date(from);
      if (to) query.scheduledTime.$lte = new Date(to);
    }

    const doses = await DoseLog.find(query)
      .populate('medicine', 'name strength form')
      .populate('familyMember', 'name displayColor')
      .sort('-scheduledTime')
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: doses.length,
      doses,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/doses/:id/mark-taken
// @desc    Mark dose as taken
// @access  Private
router.post('/:id/mark-taken', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity } = req.body;

    // Find the dose
    const dose = await DoseLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).session(session);

    if (!dose) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Dose not found',
      });
    }

    if (dose.status === 'taken') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Dose already marked as taken',
      });
    }

    // Get medicine details
    const medicine = await Medicine.findById(dose.medicine).session(session);

    if (!medicine) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const doseQuantity = quantity || medicine.stock.doseQuantity || 1;

    // Create idempotency key
    const idempotencyKey = `dose-${dose._id}-taken-${Date.now()}`;

    // Check if already processed
    const existingDose = await DoseLog.findOne({ idempotencyKey }).session(session);
    if (existingDose) {
      await session.abortTransaction();
      return res.status(200).json({
        success: true,
        message: 'Dose already processed',
        dose: existingDose,
      });
    }

    // Update dose
    dose.status = 'taken';
    dose.actualTime = new Date();
    dose.markedBy = req.user._id;
    dose.quantity = doseQuantity;
    dose.idempotencyKey = idempotencyKey;
    await dose.save({ session });

    // Deduct stock
    const newQuantity = Math.max(0, medicine.stock.quantity - doseQuantity);
    medicine.stock.quantity = newQuantity;
    await medicine.save({ session });

    // Create stock transaction
    const stockTransaction = await StockTransaction.create([{
      medicine: medicine._id,
      user: req.user._id,
      familyMember: dose.familyMember,
      type: 'dose-taken',
      quantityChange: -doseQuantity,
      quantityAfter: newQuantity,
      doseLog: dose._id,
      performedBy: req.user._id,
      reason: 'Dose marked as taken',
    }], { session });

    dose.stockTransaction = stockTransaction[0]._id;
    await dose.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      dose,
      stockTransaction: stockTransaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// @route   POST /api/v1/doses/:id/mark-skipped
// @desc    Mark dose as skipped
// @access  Private
router.post('/:id/mark-skipped', async (req, res, next) => {
  try {
    const { notes } = req.body;

    const dose = await DoseLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: 'skipped',
        actualTime: new Date(),
        markedBy: req.user._id,
        notes,
      },
      { new: true }
    );

    if (!dose) {
      return res.status(404).json({
        success: false,
        message: 'Dose not found',
      });
    }

    res.json({
      success: true,
      dose,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/doses/:id/snooze
// @desc    Snooze dose reminder
// @access  Private
router.post('/:id/snooze', async (req, res, next) => {
  try {
    const { minutes = 15 } = req.body;

    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);

    const dose = await DoseLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { snoozedUntil },
      { new: true }
    );

    if (!dose) {
      return res.status(404).json({
        success: false,
        message: 'Dose not found',
      });
    }

    res.json({
      success: true,
      dose,
      snoozedUntil,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
