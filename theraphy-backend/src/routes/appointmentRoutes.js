import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  completeAppointment,
  bookAppointment,
  checkAppointmentAvailability,
  getAvailableAppointmentSlots,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/available-slots', protect, getAvailableAppointmentSlots);
router.post('/check-availability', protect, checkAppointmentAvailability);
router.post('/book', protect, bookAppointment);
router.get('/me', protect, getMyAppointments);
router.patch('/:id/complete', protect, completeAppointment);

export default router;
