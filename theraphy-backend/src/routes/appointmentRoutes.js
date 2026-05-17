import express from 'express';
import { createAppointment, getMyAppointments, completeAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/me', protect, getMyAppointments);
router.patch('/:id/complete', protect, completeAppointment);

export default router;
