// server\models\Candidate.js
import mongoose from 'mongoose';

const interviewEntrySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  score: { type: Number },
  feedback: { type: String },
  skillTags: { type: [String], default: [] },
});

const candidateSchema = new mongoose.Schema(
  {
    // --- THIS IS THE CRITICAL FIELD ---
    // This links the interview session to a specific user (either an individual or a recruiter)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This creates a reference to our User model
    },
    name: { type: String },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    phone: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    role: { type: String, required: true },
    finalScore: { type: Number, default: 0 },
    summary: { type: String },
    insights: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
    },
    recommendation: {
      verdict: { type: String },
      justification: { type: String },
    },
    interviewHistory: [interviewEntrySchema],
  },
  { timestamps: true }
);

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;

