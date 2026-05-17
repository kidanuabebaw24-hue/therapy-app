import express from 'express';
import { createAssessment, getMyAssessments, getAssessmentStats } from '../controllers/assessmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAssessment);
router.get('/history', protect, getMyAssessments);
router.get('/stats', protect, getAssessmentStats);

export default router;
