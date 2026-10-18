import express from 'express';
import { protect } from '../middleware/auth.js';
import MedicineInfoCache from '../models/MedicineInfoCache.js';
import { fetchMedicineInfo } from '../services/medicineInfoService.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/v1/medicine-info/:medicineId
// @desc    Get medicine information
// @access  Private
router.get('/:medicineId', async (req, res, next) => {
  try {
    const { medicineName, strength } = req.query;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required',
      });
    }

    // Check cache first
    const cached = await MedicineInfoCache.findOne({
      medicineName: new RegExp(`^${medicineName}$`, 'i'),
      strength,
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      return res.json({
        success: true,
        info: cached,
        source: 'cache',
      });
    }

    // Fetch from external service
    const info = await fetchMedicineInfo(medicineName, strength);

    if (!info) {
      return res.json({
        success: true,
        info: null,
        message: 'No information available for this medicine',
      });
    }

    // Cache the result
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Cache for 30 days

    const cachedInfo = await MedicineInfoCache.create({
      medicineName,
      strength,
      ...info,
      expiresAt,
    });

    res.json({
      success: true,
      info: cachedInfo,
      source: 'fresh',
    });
  } catch (error) {
    // If external service fails, return gracefully
    if (error.message.includes('not configured') || error.message.includes('API')) {
      return res.json({
        success: true,
        info: null,
        message: 'Medicine information service not configured',
        requiresConfiguration: true,
      });
    }

    next(error);
  }
});

export default router;
