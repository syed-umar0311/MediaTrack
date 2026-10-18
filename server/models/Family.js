import mongoose from 'mongoose';

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'My Family',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  }],
}, {
  timestamps: true,
});

export default mongoose.model('Family', familySchema);
