import mongoose from 'mongoose';

const doseLogSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  },

  // Scheduled time
  scheduledTime: {
    type: Date,
    required: true,
  },

  // Actual time (when marked)
  actualTime: Date,

  // Status
  status: {
    type: String,
    enum: ['pending', 'taken', 'skipped', 'missed'],
    default: 'pending',
  },

  // Quantity taken
  quantity: {
    type: Number,
    default: 1,
  },

  // Who marked it
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Stock transaction reference
  stockTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction',
  },

  // Deduplication key
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
  },

  notes: String,

  // Reminder tracking
  reminderSent: {
    type: Boolean,
    default: false,
  },
  reminderSentAt: Date,
  snoozedUntil: Date,
}, {
  timestamps: true,
});

// Indexes
doseLogSchema.index({ medicine: 1, scheduledTime: 1 });
doseLogSchema.index({ user: 1, status: 1, scheduledTime: 1 });
doseLogSchema.index({ status: 1, scheduledTime: 1 });
doseLogSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.model('DoseLog', doseLogSchema);
