import express from 'express';
import { protect } from '../middleware/auth.js';
import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/v1/families
// @desc    Create family
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if user already has a family
    const existingFamily = await Family.findOne({ createdBy: req.user._id });

    if (existingFamily) {
      return res.status(400).json({
        success: false,
        message: 'Family already exists',
        family: existingFamily,
      });
    }

    // Create family
    const family = await Family.create({
      name: name || 'My Family',
      createdBy: req.user._id,
    });

    // Create owner member
    const ownerMember = await FamilyMember.create({
      family: family._id,
      name: req.user.name,
      memberType: 'owner',
      connectedUser: req.user._id,
      displayColor: '#3b82f6',
    });

    family.members.push(ownerMember._id);
    await family.save();

    res.status(201).json({
      success: true,
      family,
      ownerMember,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/families/:id/members
// @desc    Get family members
// @access  Private
router.get('/:id/members', async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found',
      });
    }

    // Check access
    if (family.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const members = await FamilyMember.find({
      family: family._id,
    }).populate('connectedUser', 'name email');

    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/families/:id/members
// @desc    Add family member
// @access  Private
router.post('/:id/members', async (req, res, next) => {
  try {
    const { name, dateOfBirth, relationship, memberType, displayColor } = req.body;

    const family = await Family.findById(req.params.id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found',
      });
    }

    // Check access
    if (family.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Create member
    const member = await FamilyMember.create({
      family: family._id,
      name,
      dateOfBirth,
      relationship,
      memberType: memberType || 'managed',
      displayColor: displayColor || '#3b82f6',
    });

    family.members.push(member._id);
    await family.save();

    res.status(201).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/families/members/:memberId/permissions
// @desc    Update member permissions
// @access  Private
router.patch('/members/:memberId/permissions', async (req, res, next) => {
  try {
    const { permissions, notificationSharing } = req.body;

    const member = await FamilyMember.findById(req.params.memberId).populate('family');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Check access
    if (member.family.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (permissions) {
      member.permissions = { ...member.permissions, ...permissions };
    }

    if (notificationSharing) {
      member.notificationSharing = { ...member.notificationSharing, ...notificationSharing };
    }

    await member.save();

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/families/my-family
// @desc    Get user's family
// @access  Private
router.get('/my-family', async (req, res, next) => {
  try {
    const family = await Family.findOne({ createdBy: req.user._id })
      .populate({
        path: 'members',
        populate: {
          path: 'connectedUser',
          select: 'name email',
        },
      });

    if (!family) {
      return res.json({
        success: true,
        family: null,
      });
    }

    res.json({
      success: true,
      family,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
