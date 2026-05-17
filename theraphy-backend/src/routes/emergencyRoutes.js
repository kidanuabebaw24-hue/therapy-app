import express from 'express';
import { triggerEmergency, getEmergencyLog, handleEmergency } from '../controllers/emergencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/trigger', protect, triggerEmergency);
router.get('/logs', protect, authorize('therapist', 'admin'), getEmergencyLog);
router.patch('/:id/handle', protect, authorize('therapist', 'admin'), handleEmergency);

export default router;
