import { Router } from 'express';
import { getProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);
router.get('/profile', getProfile);

export default router;
