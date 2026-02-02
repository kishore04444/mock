/**
 * Interview controller - questions, evaluate, feedback, history (uses in-memory store)
 */
import * as store from '../store/memoryStore.js';
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateFinalFeedback,
} from '../services/openaiService.js';

/**
 * POST /api/interview/questions - protected
 * Body: { mode: 'hr'|'technical'|'behavioral', resumeAnalysisId?: string }
 */
export async function getQuestions(req, res) {
  try {
    const { mode, resumeAnalysisId } = req.body;
    if (!['hr', 'technical', 'behavioral'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Use hr, technical, or behavioral.' });
    }
    let resumeText = '';
    let analysis = null;
    let resumeAnalysisDoc = null;
    if (resumeAnalysisId) {
      const doc = await store.findResumeAnalysisByIdAndUser(resumeAnalysisId, req.user._id);
      if (doc) {
        resumeText = doc.extractedText || '';
        analysis = doc.analysis;
        resumeAnalysisDoc = doc._id;
      }
    }
    let questions;
    try {
      questions = await generateInterviewQuestions(resumeText, analysis, mode);
    } catch (err) {
      console.warn('Interview questions error:', err.message);
      return res.status(503).json({
        message: 'Could not generate questions right now. Please try again in a moment.',
      });
    }
    const interview = await store.createInterview({
      user: req.user._id,
      resumeAnalysis: resumeAnalysisDoc || undefined,
      mode,
      questions,
    });
    res.status(201).json({ interviewId: interview._id, questions });
  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({
      message: 'Failed to start interview. Please try again.',
    });
  }
}

/**
 * POST /api/interview/evaluate - protected
 * Body: { interviewId, questionIndex, question, userAnswer }
 */
export async function evaluate(req, res) {
  try {
    const { interviewId, questionIndex, question, userAnswer } = req.body;
    const interview = await store.findInterviewByIdAndUser(interviewId, req.user._id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found. Please start a new interview.' });
    }
    let feedback;
    let score;
    try {
      const result = await evaluateAnswer(question, userAnswer || '', interview.mode);
      feedback = result.feedback;
      score = result.score ?? 0;
    } catch (err) {
      console.warn('Evaluate error:', err.message);
      return res.status(503).json({
        message: 'Could not evaluate your answer right now. Please try again.',
      });
    }
    const qa = interview.qa || [];
    while (qa.length <= questionIndex) {
      qa.push({ question: '', userAnswer: '', aiFeedback: '', score: 0 });
    }
    qa[questionIndex] = {
      question,
      userAnswer: userAnswer || '',
      aiFeedback: feedback,
      score,
    };
    await store.updateInterview(interviewId, req.user._id, { qa });
    res.json({ feedback, score });
  } catch (error) {
    console.error('Evaluate error:', error);
    res.status(500).json({
      message: 'Failed to save your answer. Please try again.',
    });
  }
}

/**
 * POST /api/interview/feedback - protected
 * Body: { interviewId }
 */
export async function getFinalFeedback(req, res) {
  try {
    const { interviewId } = req.body;
    const interview = await store.findInterviewByIdAndUser(interviewId, req.user._id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found. Please start a new interview.' });
    }
    const qaList = (interview.qa || []).map((q) => ({
      question: q.question,
      userAnswer: q.userAnswer,
      aiFeedback: q.aiFeedback,
      score: q.score,
    }));
    let result;
    try {
      result = await generateFinalFeedback(qaList, interview.mode);
    } catch (err) {
      console.warn('Final feedback error:', err.message);
      return res.status(503).json({
        message: 'Could not generate feedback right now. Please try again in a moment.',
      });
    }
    await store.updateInterview(interviewId, req.user._id, {
      scores: {
        communication: result.communication,
        confidence: result.confidence,
        technicalDepth: result.technicalDepth,
      },
      overallFeedback: result.overallFeedback,
      improvementSuggestions: result.improvementSuggestions || [],
      status: 'completed',
    });
    const updated = await store.findInterviewByIdAndUser(interviewId, req.user._id);
    res.json({
      scores: updated.scores,
      overallFeedback: updated.overallFeedback,
      improvementSuggestions: updated.improvementSuggestions,
    });
  } catch (error) {
    console.error('Final feedback error:', error);
    res.status(500).json({
      message: 'Failed to generate feedback. Please try again.',
    });
  }
}

/**
 * GET /api/interview/history - protected
 */
export async function getHistory(req, res) {
  try {
    const list = await store.findInterviewsByUser(req.user._id);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load interview history. Please try again.' });
  }
}

/**
 * GET /api/interview/history/:id - protected
 */
export async function getOneInterview(req, res) {
  try {
    const doc = await store.findInterviewByIdAndUser(req.params.id, req.user._id);
    if (!doc) {
      return res.status(404).json({ message: 'Interview not found. It may have been deleted.' });
    }
    let resumeAnalysis = null;
    if (doc.resumeAnalysis) {
      const ra = await store.findResumeAnalysisByIdAndUser(doc.resumeAnalysis, req.user._id);
      if (ra) resumeAnalysis = { _id: ra._id, originalFilename: ra.originalFilename, createdAt: ra.createdAt };
    }
    res.json({ ...doc, resumeAnalysis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load interview. Please try again.' });
  }
}
