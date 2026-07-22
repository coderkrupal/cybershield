import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the incident report'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description of the incident'],
  },
  category: {
    type: String,
    required: true,
    enum: ['Phishing Link', 'Malicious File', 'Data Leak / Privacy', 'Identity Theft', 'Typosquatting', 'Other'],
    default: 'Phishing Link',
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  targetUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'Investigating', 'Resolved'],
    default: 'Open',
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Incident', incidentSchema);
