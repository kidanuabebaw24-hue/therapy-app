import express from 'express';
import { addSessionProgress, getClientProgressTimeline } from '../controllers/progressController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/session', protect, authorize('therapist', 'admin'), addSessionProgress);
router.get('/timeline', protect, getClientProgressTimeline);

export default router;
