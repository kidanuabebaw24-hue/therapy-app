import express from 'express';
import { 
  createPayment, 
  getMyPayments, 
  initializeChapaPayment, 
  verifyChapaPayment, 
  chapaSuccessPage 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mock / legacy routes
router.post('/', protect, createPayment);
router.get('/me', protect, getMyPayments);

// Real Chapa Payment Gateway routes
router.post('/chapa/initialize', protect, initializeChapaPayment);
router.get('/chapa/verify/:tx_ref', protect, verifyChapaPayment);
router.get('/chapa/success', chapaSuccessPage); // Public callback hit by Chapa redirect browser

export default router;
