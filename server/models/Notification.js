import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  },

  // Notification details
  type: {
    type: String,
    enum: ['dose-reminder', 'missed-dose', 'low-stock', 'expiry', 'care-plan-review', 'system'],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },

  // Related entities
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
  },
  doseLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoseLog',
  },
  carePlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarePlan',
  },

  // Status
  read: {
    type: Boolean,
    default: false,
  },
  readAt: Date,

  // Actions taken
  actionTaken: String,
  actionAt: Date,

  // Delivery tracking
  channels: {
    inApp: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: false,
    },
    email: {
      type: Boolean,
      default: false,
    },
  },
  deliveryStatus: {
    inApp: String,
    push: String,
    email: String,
  },

  // Scheduled delivery
  scheduledFor: Date,
  sentAt: Date,

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,

  // Expiry for cleanup
  expiresAt: Date,
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ familyMember: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1, sentAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);
