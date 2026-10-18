import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';
import { extractPrescriptionData } from '../services/ocrService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/prescriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 10485760), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG) and PDF are allowed'));
    }
  },
});

// All routes require authentication
router.use(protect);

// @route   POST /api/v1/prescriptions/upload
// @desc    Upload prescription image
// @access  Private
router.post('/upload', upload.single('prescription'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { familyMemberId } = req.body;

    const prescription = await Prescription.create({
      user: req.user._id,
      familyMember: familyMemberId,
      imagePath: req.file.path,
      imageUrl: `/uploads/prescriptions/${req.file.filename}`,
      status: 'uploaded',
    });

    res.status(201).json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/prescriptions/:id/extract
// @desc    Extract data from prescription
// @access  Private
router.post('/:id/extract', async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    if (prescription.status !== 'uploaded') {
      return res.status(400).json({
        success: false,
        message: 'Prescription has already been processed',
      });
    }

    // Update status to processing
    prescription.status = 'processing';
    await prescription.save();

    // Extract data using OCR service
    const startTime = Date.now();
    const extractedData = await extractPrescriptionData(prescription.imagePath);
    const processingTime = Date.now() - startTime;

    // Update prescription with extracted data
    prescription.extractedData = extractedData;
    prescription.status = 'extracted';
    prescription.processingTime = processingTime;
    prescription.ocrProvider = extractedData.provider;
    await prescription.save();

    res.json({
      success: true,
      prescription,
    });
  } catch (error) {
    // Update status to failed
    try {
      await Prescription.findByIdAndUpdate(req.params.id, {
        status: 'failed',
        errorMessage: error.message,
      });
    } catch (updateError) {
      console.error('Failed to update prescription status:', updateError);
    }

    next(error);
  }
});

// @route   GET /api/v1/prescriptions/:id/review
// @desc    Get prescription for review
// @access  Private
router.get('/:id/review', async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    res.json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/prescriptions/:id/review
// @desc    Update reviewed data
// @access  Private
router.patch('/:id/review', async (req, res, next) => {
  try {
    const { reviewedData } = req.body;

    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        reviewedData,
        status: 'reviewed',
      },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    res.json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/prescriptions/:id/confirm
// @desc    Confirm and create medicines
// @access  Private
router.post('/:id/confirm', async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    if (!prescription.reviewedData || !prescription.reviewedData.medicines) {
      return res.status(400).json({
        success: false,
        message: 'No reviewed data available',
      });
    }

    const createdMedicines = [];

    // Create medicines from reviewed data
    for (const medData of prescription.reviewedData.medicines) {
      if (medData.keep !== false) {
        const medicine = await Medicine.create({
          user: req.user._id,
          familyMember: prescription.familyMember,
          name: medData.name,
          strength: medData.strength,
          strengthUnit: medData.strengthUnit,
          form: medData.form,
          instructions: medData.instructions,
          source: 'prescription-scan',
          sourceId: prescription._id,
        });

        createdMedicines.push(medicine._id);
      }
    }

    prescription.createdMedicines = createdMedicines;
    prescription.status = 'confirmed';
    await prescription.save();

    res.json({
      success: true,
      prescription,
      medicinesCreated: createdMedicines.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/prescriptions/:id
// @desc    Delete prescription
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const prescription = await Prescription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // TODO: Delete file from filesystem

    res.json({
      success: true,
      message: 'Prescription deleted',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/prescriptions
// @desc    Get user's prescriptions
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('familyMember', 'name displayColor')
      .sort('-createdAt');

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
