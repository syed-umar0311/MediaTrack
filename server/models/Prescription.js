import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
    medicines: [{
      name: String,
      strength: String,
      strengthUnit: String,
      instructions: String,
      duration: String,
      confidence: Number,
    }],
    rawText: String,
    processingNotes: String,
  },

  // Reviewed data (user-edited)
  reviewedData: {
    medicines: [{
      name: String,
      strength: String,
      strengthUnit: String,
      form: String,
      instructions: String,
      duration: String,
      keep: {
        type: Boolean,
        default: true,
      },
    }],
  },

  // Created medicines (after confirmation)
  createdMedicines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
  }],

  // Processing metadata
  ocrProvider: String,
  processingTime: Number,
  errorMessage: String,

  // Retention
  retainUntil: Date,
}, {
  timestamps: true,
});

// Indexes
prescriptionSchema.index({ user: 1, status: 1 });
prescriptionSchema.index({ createdAt: -1 });

export default mongoose.model('Prescription', prescriptionSchema);
