import { Router } from 'express';
import {
  getQuestions,
  evaluate,
  getFinalFeedback,
  getHistory,
  getOneInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);
router.post('/questions', getQuestions);
router.post('/evaluate', evaluate);
router.post('/feedback', getFinalFeedback);
router.get('/history', getHistory);
router.get('/history/:id', getOneInterview);

export default router;
