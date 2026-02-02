import { Router } from 'express';
import multer from 'multer';
import { uploadAndAnalyze, listAnalyses, getAnalysis } from '../controllers/resumeController.js';
import { protect } from '../middlewares/auth.js';
import { uploadResume } from '../middlewares/upload.js';

const router = Router();

router.use(protect);
router.post('/upload', (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'Invalid file.' });
    }
    next();
  });
}, uploadAndAnalyze);
router.get('/analyses', listAnalyses);
router.get('/analyses/:id', getAnalysis);

export default router;
