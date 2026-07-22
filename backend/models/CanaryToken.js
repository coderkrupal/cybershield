import mongoose from 'mongoose';

const canaryTokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a label/title for the Canary Token'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  tokenType: {
    type: String,
    required: true,
    enum: ['link', 'pixel'],
    default: 'link',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  hitCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('CanaryToken', canaryTokenSchema);
