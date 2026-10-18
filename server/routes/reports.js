import express from 'express';
import { protect } from '../middleware/auth.js';
import DoseLog from '../models/DoseLog.js';
import Medicine from '../models/Medicine.js';
import StockTransaction from '../models/StockTransaction.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/reports/adherence
// @desc    Get adherence report
// @access  Private
router.get('/adherence', async (req, res, next) => {
  try {
    const { period = '7days', medicineId, familyMemberId } = req.query;

    let startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const query = {
      user: req.user._id,
      scheduledTime: { $gte: startDate },
    };

    if (medicineId) query.medicine = medicineId;
    if (familyMemberId) query.familyMember = familyMemberId;

    const doses = await DoseLog.find(query)
      .populate('medicine', 'name strength')
      .populate('familyMember', 'name displayColor');

    // Calculate statistics
    const total = doses.length;
    const taken = doses.filter(d => d.status === 'taken').length;
    const skipped = doses.filter(d => d.status === 'skipped').length;
    const missed = doses.filter(d => d.status === 'missed').length;
    const pending = doses.filter(d => d.status === 'pending').length;

    const adherenceRate = total > 0 ? ((taken / (total - pending)) * 100).toFixed(1) : 0;

    // Group by medicine
    const byMedicine = {};
    doses.forEach(dose => {
      const medId = dose.medicine._id.toString();
      if (!byMedicine[medId]) {
        byMedicine[medId] = {
          medicine: dose.medicine,
          total: 0,
          taken: 0,
          skipped: 0,
          missed: 0,
        };
      }
      byMedicine[medId].total++;
      if (dose.status === 'taken') byMedicine[medId].taken++;
      if (dose.status === 'skipped') byMedicine[medId].skipped++;
      if (dose.status === 'missed') byMedicine[medId].missed++;
    });

    res.json({
      success: true,
      report: {
        period,
        startDate,
        endDate: new Date(),
        summary: {
          total,
          taken,
          skipped,
          missed,
          pending,
          adherenceRate: parseFloat(adherenceRate),
        },
        byMedicine: Object.values(byMedicine),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/reports/stock-history
// @desc    Get stock history report
// @access  Private
router.get('/stock-history', async (req, res, next) => {
  try {
    const { medicineId, from, to, limit = 100 } = req.query;

    const query = { user: req.user._id };

    if (medicineId) query.medicine = medicineId;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const transactions = await StockTransaction.find(query)
      .populate('medicine', 'name strength')
      .populate('familyMember', 'name displayColor')
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

// @route   GET /api/v1/reports/expiry-summary
// @desc    Get expiry summary
// @access  Private
router.get('/expiry-summary', async (req, res, next) => {
  try {
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const next90Days = new Date();
    next90Days.setDate(next90Days.getDate() + 90);

    // Expired
    const expired = await Medicine.find({
      user: req.user._id,
      status: 'active',
      expiryDate: { $lt: now },
    }).countDocuments();

    // Expiring in 30 days
    const expiring30 = await Medicine.find({
      user: req.user._id,
      status: 'active',
      expiryDate: {
        $gte: now,
        $lte: next30Days,
      },
    }).countDocuments();

    // Expiring in 31-90 days
    const expiring90 = await Medicine.find({
      user: req.user._id,
      status: 'active',
      expiryDate: {
        $gt: next30Days,
        $lte: next90Days,
      },
    }).countDocuments();

    res.json({
      success: true,
      summary: {
        expired,
        expiringIn30Days: expiring30,
        expiringIn31To90Days: expiring90,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/reports/dashboard-summary
// @desc    Get dashboard summary
// @access  Private
router.get('/dashboard-summary', async (req, res, next) => {
  try {
    const { familyMemberId } = req.query;

    // Today's doses
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayQuery = {
      user: req.user._id,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    };

    if (familyMemberId) todayQuery.familyMember = familyMemberId;

    const todayDoses = await DoseLog.find(todayQuery)
      .populate('medicine', 'name strength form')
      .populate('familyMember', 'name displayColor')
      .sort('scheduledTime');

    const todayTaken = todayDoses.filter(d => d.status === 'taken').length;
    const todayPending = todayDoses.filter(d => d.status === 'pending').length;
    const todayMissed = todayDoses.filter(d => d.status === 'missed').length;

    // Next upcoming dose
    const nextDose = await DoseLog.findOne({
      user: req.user._id,
      status: 'pending',
      scheduledTime: { $gte: new Date() },
      ...(familyMemberId && { familyMember: familyMemberId }),
    })
      .populate('medicine', 'name strength form')
      .populate('familyMember', 'name displayColor')
      .sort('scheduledTime');

    // Low stock medicines
    const medicinesQuery = {
      user: req.user._id,
      status: 'active',
      ...(familyMemberId && { familyMember: familyMemberId }),
    };

    const allMedicines = await Medicine.find(medicinesQuery);
    const lowStockMedicines = allMedicines.filter(
      med => med.stock.quantity <= med.stock.lowStockThreshold
    );

    // Expiring soon (next 30 days)
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const expiringSoon = await Medicine.find({
      ...medicinesQuery,
      expiryDate: {
        $gte: new Date(),
        $lte: next30Days,
      },
    })
      .populate('familyMember', 'name displayColor')
      .sort('expiryDate')
      .limit(5);

    res.json({
      success: true,
      summary: {
        today: {
          total: todayDoses.length,
          taken: todayTaken,
          pending: todayPending,
          missed: todayMissed,
          doses: todayDoses,
        },
        nextDose,
        lowStock: {
          count: lowStockMedicines.length,
          medicines: lowStockMedicines,
        },
        expiringSoon: {
          count: expiringSoon.length,
          medicines: expiringSoon,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
