/**
 * Interview model - stores interview session and feedback
 */
import mongoose from 'mongoose';

const feedbackScoreSchema = new mongoose.Schema(
  {
    communication: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, min: 0, max: 100 },
    technicalDepth: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const qaSchema = new mongoose.Schema(
  {
    question: String,
    userAnswer: String,
    aiFeedback: String,
    score: Number,
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeAnalysis',
      default: null,
    },
    mode: {
      type: String,
      enum: ['hr', 'technical', 'behavioral'],
      required: true,
    },
    questions: [String],
    qa: [qaSchema],
    scores: feedbackScoreSchema,
    overallFeedback: String,
    improvementSuggestions: [String],
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
