import prisma from '../config/prisma.js';
import { generateAIResponse, generateConversationTitle } from '../services/groqService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const startConversation = async (req, res) => {
  try {
    const { initialMessage } = req.body;
    if (!initialMessage) return sendError(res, 'Initial message is required', 400);

    const aiResponse = await generateAIResponse(initialMessage);
    const title = await generateConversationTitle(initialMessage) || 'New Conversation';

    const conversation = await prisma.aIConversation.create({
      data: {
        userId: req.user.id,
        title,
        messages: [
          { role: 'user', content: initialMessage },
          { role: 'assistant', content: aiResponse },
        ],
      },
    });

    return sendSuccess(res, conversation, 'Conversation started', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const conversation = await prisma.aIConversation.findUnique({
      where: { id, userId: req.user.id, isActive: true },
    });

    if (!conversation) return sendError(res, 'Conversation not found', 404);

    const messages = conversation.messages;
    messages.push({ role: 'user', content: message });

    const aiResponse = await generateAIResponse(message, messages);
    messages.push({ role: 'assistant', content: aiResponse });

    const updatedConversation = await prisma.aIConversation.update({
      where: { id },
      data: { messages },
    });

    return sendSuccess(res, { role: 'assistant', content: aiResponse }, 'Message sent');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: req.user.id, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = conversations.map(c => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      lastMessage: c.messages[c.messages.length - 1]?.content.substring(0, 100) + '...',
      messageCount: c.messages.length,
    }));

    return sendSuccess(res, formatted, 'Conversations retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.aIConversation.findUnique({
      where: { id, userId: req.user.id, isActive: true },
    });

    if (!conversation) return sendError(res, 'Conversation not found', 404);

    return sendSuccess(res, conversation, 'Conversation retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.aIConversation.update({
      where: { id, userId: req.user.id },
      data: { isActive: false },
    });
    return sendSuccess(res, null, 'Conversation deleted');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
