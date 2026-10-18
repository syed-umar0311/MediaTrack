import mongoose from 'mongoose';

const medicineInfoCacheSchema = new mongoose.Schema({
  // Medicine identification
  medicineName: {
    type: String,
    required: true,
  },
  strength: String,

  // Cached information
  genericName: String,
  brandName: String,
  activeIngredients: [String],
  composition: String,
  formulation: String,

  // Safety information
  commonSideEffects: [String],
  allergyWarnings: [String],
  interactions: [String],

  // Source
  source: {
    type: String,
    required: true,
  },
  sourceUrl: String,

  // Cache metadata
  retrievedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,

  // Match quality
  matchConfidence: Number,
}, {
  timestamps: true,
});

// Indexes
medicineInfoCacheSchema.index({ medicineName: 1, strength: 1 });
medicineInfoCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('MedicineInfoCache', medicineInfoCacheSchema);
