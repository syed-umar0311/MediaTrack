import express from 'express';
import { protect } from '../middleware/auth.js';
import StockTransaction from '../models/StockTransaction.js';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/stock/summary
// @desc    Get stock summary
// @access  Private
router.get('/summary', async (req, res, next) => {
  try {
    const { familyMemberId } = req.query;

    const query = { user: req.user._id, status: 'active' };
    if (familyMemberId) query.familyMember = familyMemberId;

    const medicines = await Medicine.find(query)
      .populate('familyMember', 'name displayColor')
      .sort('name');

    // Identify low stock medicines
    const lowStock = medicines.filter(
      med => med.stock.quantity <= med.stock.lowStockThreshold
    );

    res.json({
      success: true,
      summary: {
        totalMedicines: medicines.length,
        lowStockCount: lowStock.length,
        lowStockMedicines: lowStock,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/stock/medicines/:medicineId/transactions
// @desc    Add stock transaction (refill/adjustment)
// @access  Private
router.post('/medicines/:medicineId/transactions', async (req, res, next) => {
  try {
    const { type, quantityChange, notes, reason } = req.body;

    const medicine = await Medicine.findOne({
      _id: req.params.medicineId,
      user: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Calculate new quantity
    const newQuantity = Math.max(0, medicine.stock.quantity + quantityChange);

    // Create transaction
    const transaction = await StockTransaction.create({
      medicine: medicine._id,
      user: req.user._id,
      familyMember: medicine.familyMember,
      type: type || 'adjustment',
      quantityChange,
      quantityAfter: newQuantity,
      performedBy: req.user._id,
      reason,
      notes,
    });

    // Update medicine stock
    medicine.stock.quantity = newQuantity;
    await medicine.save();

    res.status(201).json({
      success: true,
      transaction,
      newQuantity,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/stock/medicines/:medicineId/history
// @desc    Get stock history for a medicine
// @access  Private
router.get('/medicines/:medicineId/history', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const medicine = await Medicine.findOne({
      _id: req.params.medicineId,
      user: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const transactions = await StockTransaction.find({
      medicine: medicine._id,
    })
      .populate('performedBy', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
