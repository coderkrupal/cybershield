import mongoose from 'mongoose';

const canaryLogSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    index: true,
  },
  ip: {
    type: String,
    default: 'Unknown',
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  referrer: {
    type: String,
    default: 'Unknown',
  },
  headers: {
    type: Map,
    of: String,
  },
  accessedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('CanaryLog', canaryLogSchema);
