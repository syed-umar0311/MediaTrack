import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        allergies: user.allergies,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/users/me
// @desc    Update user profile
// @access  Private
router.patch('/me', async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/users/me/preferences
// @desc    Update user preferences
// @access  Private
router.patch('/me/preferences', async (req, res, next) => {
  try {
    const { timezone, theme, notifications } = req.body;

    const user = await User.findById(req.user._id);

    if (timezone) user.preferences.timezone = timezone;
    if (theme) {
      if (theme.mode) user.preferences.theme.mode = theme.mode;
      if (theme.palette) user.preferences.theme.palette = theme.palette;
    }
    if (notifications) {
      if (typeof notifications.email !== 'undefined') {
        user.preferences.notifications.email = notifications.email;
      }
      if (typeof notifications.push !== 'undefined') {
        user.preferences.notifications.push = notifications.push;
      }
      if (typeof notifications.inApp !== 'undefined') {
        user.preferences.notifications.inApp = notifications.inApp;
      }
    }

    await user.save();

    res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/users/me/allergies
// @desc    Add allergy
// @access  Private
router.post('/me/allergies', async (req, res, next) => {
  try {
    const { allergen, severity, notes } = req.body;

    const user = await User.findById(req.user._id);

    user.allergies.push({
      allergen,
      severity,
      notes,
      recordedAt: new Date(),
    });

    await user.save();

    res.status(201).json({
      success: true,
      allergies: user.allergies,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/users/me/allergies/:allergyId
// @desc    Remove allergy
// @access  Private
router.delete('/me/allergies/:allergyId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.allergies = user.allergies.filter(
      allergy => allergy._id.toString() !== req.params.allergyId
    );

    await user.save();

    res.json({
      success: true,
      allergies: user.allergies,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
