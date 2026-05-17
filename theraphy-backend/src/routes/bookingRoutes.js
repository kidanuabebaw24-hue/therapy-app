import express from 'express';
import { createBookingRequest, getAllBookingRequests, approveBookingRequest } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBookingRequest);
router.get('/', protect, authorize('admin'), getAllBookingRequests);
router.patch('/:id/approve', protect, authorize('admin'), approveBookingRequest);

export default router;
