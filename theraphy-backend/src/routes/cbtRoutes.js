import express from 'express';
import { 
  getCBTExercises, 
  getCBTExerciseById, 
  getMyCBTProgress, 
  createExercise, 
  submitProgress,
  getClientProgressForTracking 
} from '../controllers/cbtController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/exercises', protect, getCBTExercises);
router.get('/exercises/:id', protect, getCBTExerciseById);
router.get('/progress/me', protect, getMyCBTProgress);
router.post('/exercises', protect, authorize('therapist', 'admin'), createExercise);
router.post('/progress', protect, submitProgress);
router.get('/progress/:clientId', protect, authorize('therapist', 'admin'), getClientProgressForTracking);

export default router;
