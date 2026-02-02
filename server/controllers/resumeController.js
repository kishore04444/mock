/**
 * Resume controller - upload, parse, analyze, list (uses in-memory store)
 */
import * as store from '../store/memoryStore.js';
import { extractTextFromResume } from '../services/resumeParser.js';
import { analyzeResume } from '../services/openaiService.js';

/**
 * POST /api/resume/upload - protected, single file
 */
export async function uploadAndAnalyze(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please choose a PDF or DOCX file.' });
    }
    const { buffer, mimetype, originalname } = req.file;
    let text;
    try {
      text = await extractTextFromResume(buffer, mimetype);
    } catch (parseErr) {
      console.warn('Resume parse error:', parseErr.message);
      return res.status(400).json({
        message: 'Could not read the file. It may be corrupted or not a valid PDF/DOCX. Try a different file.',
      });
    }
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        message: 'Could not extract enough text from the file. Make sure the document contains readable text (not only images).',
      });
    }
    let analysis;
    let rawResponse = '';
    try {
      const result = await analyzeResume(text);
      analysis = result.analysis;
      rawResponse = result.rawResponse || '';
    } catch (analysisErr) {
      console.warn('Resume analysis error:', analysisErr.message);
      return res.status(503).json({
        message: 'Analysis service is temporarily unavailable. Please try again later.',
      });
    }
    const doc = await store.createResumeAnalysis({
      user: req.user._id,
      originalFilename: originalname,
      extractedText: text,
      analysis: { ...analysis, rawResponse },
    });
    res.status(201).json({
      _id: doc._id,
      user: { _id: req.user._id, name: req.user.name, email: req.user.email },
      originalFilename: doc.originalFilename,
      extractedText: doc.extractedText,
      analysis: doc.analysis,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      message: error.message || 'Resume upload failed. Please try again.',
    });
  }
}

/**
 * GET /api/resume/analyses - protected
 */
export async function listAnalyses(req, res) {
  try {
    const list = await store.findResumeAnalysesByUser(req.user._id);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load analyses. Please try again.' });
  }
}

/**
 * GET /api/resume/analyses/:id - protected
 */
export async function getAnalysis(req, res) {
  try {
    const doc = await store.findResumeAnalysisByIdAndUser(req.params.id, req.user._id);
    if (!doc) {
      return res.status(404).json({ message: 'Resume analysis not found. It may have been deleted.' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load analysis. Please try again.' });
  }
}
