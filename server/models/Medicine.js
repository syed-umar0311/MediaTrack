import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  // Owner information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  },

  // Medicine details
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  strength: String,
  strengthUnit: String,
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'cream', 'inhaler', 'patch', 'other'],
  },
  instructions: String,

  // Schedule information
  schedule: {
    type: {
      type: String,
      enum: ['daily', 'specific-days', 'specific-dates', 'as-needed', 'custom'],
    },
    frequency: Number, // times per day
    times: [String], // e.g., ['08:00', '20:00']
    days: [Number], // 0-6 for specific-days
    dates: [Date], // for specific-dates
    customPattern: String,
  },

  // Duration
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,

  // Stock management
  stock: {
    quantity: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'units',
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    doseQuantity: {
      type: Number,
      default: 1,
    },
  },

  // Expiry tracking
  expiryDate: Date,
  manufacturer: String,
  batchNumber: String,

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'finished', 'archived'],
    default: 'active',
  },

  // Metadata
  source: {
    type: String,
    enum: ['manual', 'prescription-scan', 'package-scan'],
    default: 'manual',
  },
  sourceId: mongoose.Schema.Types.ObjectId,

  notes: String,
}, {
  timestamps: true,
});

// Indexes for performance
medicineSchema.index({ user: 1, status: 1 });
medicineSchema.index({ familyMember: 1 });
medicineSchema.index({ expiryDate: 1 });

export default mongoose.model('Medicine', medicineSchema);
