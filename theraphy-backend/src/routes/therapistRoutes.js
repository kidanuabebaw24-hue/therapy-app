import express from 'express';
import { getAvailableTherapists, getTherapistDetails, getSpecializations } from '../controllers/therapistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAvailableTherapists);
router.get('/specializations', protect, getSpecializations);
router.get('/:id', protect, getTherapistDetails);

export default router;
