// server\models\InterviewSession.js
import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  // Link to the recruiter who created this session
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // The specific job role for this interview session
  role: {
    type: String,
    required: true,
  },
  // An array to keep track of candidates who have completed an interview via this link
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  }
}, {
  timestamps: true,
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
