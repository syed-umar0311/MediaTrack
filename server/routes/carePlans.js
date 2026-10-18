import express from 'express';
import { protect } from '../middleware/auth.js';
import CarePlan from '../models/CarePlan.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/care-plans
// @desc    Get care plans
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { status, familyMemberId } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (familyMemberId) query.familyMember = familyMemberId;

    const carePlans = await CarePlan.find(query)
      .populate('familyMember', 'name displayColor')
      .populate('medicines', 'name strength form')
      .sort('-createdAt');

    res.json({
      success: true,
      count: carePlans.length,
      carePlans,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/care-plans
// @desc    Create care plan
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { title, purpose, familyMemberId, startDate, reviewDate, endDate, medicines, notes } = req.body;

    const carePlan = await CarePlan.create({
      user: req.user._id,
      familyMember: familyMemberId,
      title,
      purpose,
      startDate: startDate || new Date(),
      reviewDate,
      endDate,
      medicines: medicines || [],
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      carePlan,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/care-plans/:id
// @desc    Get care plan details
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const carePlan = await CarePlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('familyMember', 'name displayColor')
      .populate('medicines', 'name strength form status');

    if (!carePlan) {
      return res.status(404).json({
        success: false,
        message: 'Care plan not found',
      });
    }

    res.json({
      success: true,
      carePlan,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/care-plans/:id
// @desc    Update care plan
// @access  Private
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, purpose, reviewDate, endDate, medicines, notes, reviewNotes } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (purpose) updateData.purpose = purpose;
    if (reviewDate) updateData.reviewDate = reviewDate;
    if (endDate) updateData.endDate = endDate;
    if (medicines) updateData.medicines = medicines;
    if (notes) updateData.notes = notes;
    if (reviewNotes) updateData.reviewNotes = reviewNotes;

    const carePlan = await CarePlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!carePlan) {
      return res.status(404).json({
        success: false,
        message: 'Care plan not found',
      });
    }

    res.json({
      success: true,
      carePlan,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/care-plans/:id/review
// @desc    Mark care plan for review
// @access  Private
router.post('/:id/review', async (req, res, next) => {
  try {
    const carePlan = await CarePlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'under-review' },
      { new: true }
    );

    if (!carePlan) {
      return res.status(404).json({
        success: false,
        message: 'Care plan not found',
      });
    }

    res.json({
      success: true,
      carePlan,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/care-plans/:id/complete
// @desc    Complete care plan
// @access  Private
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { reviewNotes } = req.body;

    const carePlan = await CarePlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: 'completed',
        actualEndDate: new Date(),
        reviewNotes,
      },
      { new: true }
    );

    if (!carePlan) {
      return res.status(404).json({
        success: false,
        message: 'Care plan not found',
      });
    }

    res.json({
      success: true,
      carePlan,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/care-plans/:id/extend
// @desc    Extend care plan
// @access  Private
router.post('/:id/extend', async (req, res, next) => {
  try {
    const { newReviewDate, newEndDate, reviewNotes } = req.body;

    const carePlan = await CarePlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: 'extended',
        reviewDate: newReviewDate,
        endDate: newEndDate,
        reviewNotes,
      },
      { new: true }
    );

    if (!carePlan) {
      return res.status(404).json({
        success: false,
        message: 'Care plan not found',
      });
    }

    res.json({
      success: true,
      carePlan,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
