import express from 'express';
import { 
  startConversation, 
  sendMessage, 
  getUserConversations, 
  getConversation, 
  deleteConversation 
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Compatibility routes for /api/ai
router.post('/', protect, startConversation);
router.post('/:id/messages', protect, sendMessage);
router.get('/', protect, getUserConversations);
router.get('/:id', protect, getConversation);
router.delete('/:id', protect, deleteConversation);

// Original /conversations routes (for complete backup support)
router.post('/conversations', protect, startConversation);
router.post('/conversations/:id/messages', protect, sendMessage);
router.get('/conversations', protect, getUserConversations);
router.get('/conversations/:id', protect, getConversation);
router.delete('/conversations/:id', protect, deleteConversation);

export default router;
