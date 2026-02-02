/**
 * ResumeAnalysis model - stores resume text and AI analysis
 */
import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    analysis: {
      skills: [{ type: String }],
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      roleSuitability: { type: String },
      summary: { type: String },
      rawResponse: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
