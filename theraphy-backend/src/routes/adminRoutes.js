import express from 'express';
import { getSystemStats, getAllUsers, verifyTherapist } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getSystemStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/verify-therapist/:id', protect, authorize('admin'), verifyTherapist);

export default router;
