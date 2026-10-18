import express from 'express';
import { protect } from '../middleware/auth.js';
import Medicine from '../models/Medicine.js';
import DoseLog from '../models/DoseLog.js';
import StockTransaction from '../models/StockTransaction.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/medicines
// @desc    Get all medicines for current user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { status, familyMemberId } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (familyMemberId) query.familyMember = familyMemberId;

    const medicines = await Medicine.find(query)
      .populate('familyMember', 'name displayColor')
      .sort('-createdAt');

    res.json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/medicines
// @desc    Create new medicine
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const medicineData = {
      ...req.body,
      user: req.user._id,
    };

    const medicine = await Medicine.create(medicineData);

    // Create initial stock transaction if stock quantity is provided
    if (medicine.stock.quantity > 0) {
      await StockTransaction.create({
        medicine: medicine._id,
        user: req.user._id,
        familyMember: medicine.familyMember,
        type: 'initial',
        quantityChange: medicine.stock.quantity,
        quantityAfter: medicine.stock.quantity,
        performedBy: req.user._id,
        reason: 'Initial stock entry',
      });
    }

    res.status(201).json({
      success: true,
      medicine,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/medicines/:id
// @desc    Get single medicine
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('familyMember', 'name displayColor');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    res.json({
      success: true,
      medicine,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/medicines/:id
// @desc    Update medicine
// @access  Private
router.patch('/:id', async (req, res, next) => {
  try {
    let medicine = await Medicine.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Don't allow updating certain fields directly
    const { user, familyMember, ...updateData } = req.body;

    medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      medicine,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/medicines/:id/archive
// @desc    Archive medicine
// @access  Private
router.post('/:id/archive', async (req, res, next) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'archived' },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    res.json({
      success: true,
      medicine,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/medicines/expiring
// @desc    Get medicines expiring soon
// @access  Private
router.get('/status/expiring', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const medicines = await Medicine.find({
      user: req.user._id,
      status: 'active',
      expiryDate: {
        $gte: new Date(),
        $lte: futureDate,
      },
    })
      .populate('familyMember', 'name displayColor')
      .sort('expiryDate');

    res.json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/medicines/expired
// @desc    Get expired medicines
// @access  Private
router.get('/status/expired', async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      user: req.user._id,
      expiryDate: { $lt: new Date() },
    })
      .populate('familyMember', 'name displayColor')
      .sort('-expiryDate');

    res.json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
