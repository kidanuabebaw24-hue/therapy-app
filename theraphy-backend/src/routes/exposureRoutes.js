import express from 'express';
import { createExposurePlan, updateExposureSession, getExposureSessions } from '../controllers/exposureController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/plan', protect, createExposurePlan);
router.patch('/:id', protect, updateExposureSession);
router.get('/sessions', protect, getExposureSessions);

export default router;
