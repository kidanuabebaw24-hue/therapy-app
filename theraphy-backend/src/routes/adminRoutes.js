import express from 'express';
import { getSystemStats, getAllUsers, verifyTherapist, getAllBookings, approveBooking, rejectBooking } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getSystemStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/verify-therapist/:id', protect, authorize('admin'), verifyTherapist);

// Booking approval flows
router.get('/bookings', protect, authorize('admin'), getAllBookings);
router.put('/bookings/:id/approve', protect, authorize('admin'), approveBooking);
router.put('/bookings/:id/reject', protect, authorize('admin'), rejectBooking);

export default router;
