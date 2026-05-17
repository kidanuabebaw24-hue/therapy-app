import express from 'express';
import { logMood, getMoodHistory, getSimpleMoodTrend } from '../controllers/moodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, logMood);
router.get('/history', protect, getMoodHistory);
router.get('/trend', protect, getSimpleMoodTrend);

export default router;
