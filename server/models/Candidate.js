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
    role: {
      type: String,
      required: true,
    },
    finalScore: { type: Number, default: 0 },
    summary: { type: String },
    insights: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
    },
    // --- THIS IS THE NEW FIELD ---
    recommendation: {
      verdict: { type: String }, // e.g., "Strong Hire", "Hire", etc.
      justification: { type: String }, // The AI's reasoning.
    },
    interviewHistory: [interviewEntrySchema],
  },
  { timestamps: true }
);

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;

