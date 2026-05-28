import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  completeAppointment,
  bookAppointment,
  checkAppointmentAvailability,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.post('/check-availability', protect, checkAppointmentAvailability);
router.post('/book', protect, bookAppointment);
router.get('/me', protect, getMyAppointments);
router.patch('/:id/complete', protect, completeAppointment);

export default router;
