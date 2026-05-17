import express from 'express';
import { generateProgressReport, getClientReports } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, authorize('therapist', 'admin'), generateProgressReport);
router.get('/', protect, getClientReports);

export default router;
