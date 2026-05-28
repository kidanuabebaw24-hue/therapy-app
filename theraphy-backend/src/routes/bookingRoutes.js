import express from 'express';
import {
  createBookingRequest,
  getAllBookingRequests,
  getPendingBookingRequests,
  getMyBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Client
router.post('/', protect, createBookingRequest);
router.get('/my', protect, getMyBookingRequests);

// Admin
router.get('/', protect, authorize('admin'), getAllBookingRequests);
router.get('/pending', protect, authorize('admin'), getPendingBookingRequests);
router.patch('/:id/approve', protect, authorize('admin'), approveBookingRequest);
router.patch('/:id/reject', protect, authorize('admin'), rejectBookingRequest);

export default router;
