import express from 'express';
import { assignTherapist, getMyTherapist, getMyClients } from '../controllers/therapistAssignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/assign', protect, authorize('admin'), assignTherapist);
router.get('/my-therapist', protect, getMyTherapist);
router.get('/my-clients', protect, authorize('therapist'), getMyClients);

export default router;
