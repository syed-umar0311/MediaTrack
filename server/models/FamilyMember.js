import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  // For managed profiles (children)
  name: String,
  dateOfBirth: Date,
  relationship: String,

  // For connected adult accounts
  connectedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  memberType: {
    type: String,
    enum: ['owner', 'managed', 'connected'],
    required: true,
  },

  // Visual identity
  displayColor: {
    type: String,
    default: '#3b82f6',
  },
  avatar: String,

  // Permissions for connected users
  permissions: {
    viewMedicines: {
      type: Boolean,
      default: false,
    },
    manageMedicines: {
      type: Boolean,
      default: false,
    },
    markDoses: {
      type: Boolean,
      default: false,
    },
    viewHistory: {
      type: Boolean,
      default: false,
    },
    manageCarePlans: {
      type: Boolean,
      default: false,
    },
  },

  // Notification sharing preferences
  notificationSharing: {
    doseReminders: {
      type: Boolean,
      default: false,
    },
    missedDoses: {
      type: Boolean,
      default: false,
    },
    lowStock: {
      type: Boolean,
      default: true,
    },
    expiry: {
      type: Boolean,
      default: true,
    },
    carePlanReview: {
      type: Boolean,
      default: true,
    },
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
}, {
  timestamps: true,
});

export default mongoose.model('FamilyMember', familyMemberSchema);
