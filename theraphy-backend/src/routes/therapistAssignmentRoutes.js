import express from 'express';
import {
  assignTherapist,
  getMyTherapist,
  getMyClients,
  getAllAssignments,
  endAssignment,
} from '../controllers/therapistAssignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllAssignments);
router.post('/assign', protect, authorize('admin'), assignTherapist);
router.post('/', protect, authorize('admin'), assignTherapist);
router.put('/:id/end', protect, authorize('admin'), endAssignment);
router.get('/my-therapist', protect, getMyTherapist);
router.get('/my-clients', protect, authorize('therapist'), getMyClients);

export default router;
