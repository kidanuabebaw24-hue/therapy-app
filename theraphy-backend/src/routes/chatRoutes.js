import express from 'express';
import {
  getUserConversations,
  getConversationMessages,
  markMessagesAsRead,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getUserConversations);
router.get('/messages/:conversationId', protect, getConversationMessages);
router.put('/messages/read/:conversationId', protect, markMessagesAsRead);

export default router;
