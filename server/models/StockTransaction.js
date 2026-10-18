import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema({
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

  // Transaction details
  type: {
    type: String,
    enum: ['dose-taken', 'refill', 'adjustment', 'initial', 'expired', 'discarded'],
    required: true,
  },

  // Quantity change (positive for add, negative for subtract)
  quantityChange: {
    type: Number,
    required: true,
  },

  // Resulting quantity after transaction
  quantityAfter: {
    type: Number,
    required: true,
  },

  // Related records
  doseLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoseLog',
  },

  // Details
  reason: String,
  notes: String,

  // Performed by
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
stockTransactionSchema.index({ medicine: 1, createdAt: -1 });
stockTransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('StockTransaction', stockTransactionSchema);
