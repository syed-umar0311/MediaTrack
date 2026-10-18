import mongoose from 'mongoose';

const packageScanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  },

  // Image
  imagePath: {
    type: String,
    required: true,
  },
  imageUrl: String,

  // Processing status
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'extracted', 'reviewed', 'confirmed', 'failed'],
    default: 'uploaded',
  },

  // Extracted data
  extractedData: {
    name: String,
    strength: String,
    composition: String,
    manufacturer: String,
    batchNumber: String,
    manufacturingDate: Date,
    expiryDate: Date,
    confidence: Number,
    rawText: String,
  },

  // Reviewed data
  reviewedData: {
    name: String,
    strength: String,
    strengthUnit: String,
    form: String,
    composition: String,
    manufacturer: String,
    batchNumber: String,
    manufacturingDate: Date,
    expiryDate: Date,
  },

  // Created medicine
  createdMedicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
  },

  // Processing metadata
  ocrProvider: String,
  processingTime: Number,
  errorMessage: String,
}, {
  timestamps: true,
});

// Indexes
packageScanSchema.index({ user: 1, status: 1 });

export default mongoose.model('PackageScan', packageScanSchema);
