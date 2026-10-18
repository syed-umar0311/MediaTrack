import mongoose from 'mongoose';

const carePlanSchema = new mongoose.Schema({
  // Ownership
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true,
  },

  // Plan details
  title: {
    type: String,
    required: true,
  },
  purpose: String,

  // Timeline
  startDate: {
    type: Date,
    default: Date.now,
  },
  reviewDate: Date,
  endDate: Date,
  actualEndDate: Date,

  // Linked medicines
  medicines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'under-review', 'completed', 'extended', 'discontinued'],
    default: 'active',
  },

  // Notes
  notes: String,
  reviewNotes: String,

  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
carePlanSchema.index({ user: 1, status: 1 });
carePlanSchema.index({ familyMember: 1, status: 1 });
carePlanSchema.index({ reviewDate: 1, status: 1 });

export default mongoose.model('CarePlan', carePlanSchema);
