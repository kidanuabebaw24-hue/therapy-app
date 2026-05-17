import express from 'express';
import { getUserConversations, getConversationMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getUserConversations);
router.get('/messages/:conversationId', protect, getConversationMessages);

export default router;
