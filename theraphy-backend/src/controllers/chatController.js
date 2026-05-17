import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let conversations = [];

    if (userRole === 'client') {
      const patientProfile = req.user.patientProfile;
      const assignments = await prisma.therapistAssignment.findMany({
        where: { patientId: patientProfile.id, status: 'active' },
        include: { therapist: { include: { user: { select: { name: true, email: true } } } } },
      });

      for (const assignment of assignments) {
        const therapist = assignment.therapist;
        const conversationId = `${userId}_${therapist.userId}`;
        
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { name: true, role: true } } },
        });

        const unreadCount = await prisma.chatMessage.count({
          where: { conversationId, receiverId: userId, isRead: false },
        });

        conversations.push({
          id: conversationId,
          participant: {
            id: therapist.id,
            name: therapist.user.name,
            email: therapist.user.email,
            role: 'therapist',
          },
          lastMessage,
          unreadCount,
          updatedAt: lastMessage?.createdAt || assignment.assignedAt,
        });
      }
    } else if (userRole === 'therapist') {
      const therapistProfile = req.user.therapistProfile;
      const assignments = await prisma.therapistAssignment.findMany({
        where: { therapistId: therapistProfile.id, status: 'active' },
        include: { patient: { include: { user: { select: { name: true, email: true } } } } },
      });

      for (const assignment of assignments) {
        const patient = assignment.patient;
        const conversationId = `${patient.userId}_${userId}`;
        
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { name: true, role: true } } },
        });

        const unreadCount = await prisma.chatMessage.count({
          where: { conversationId, receiverId: userId, isRead: false },
        });

        conversations.push({
          id: conversationId,
          participant: {
            id: patient.id,
            name: patient.user.name,
            email: patient.user.email,
            role: 'client',
          },
          lastMessage,
          unreadCount,
          updatedAt: lastMessage?.createdAt || assignment.assignedAt,
        });
      }
    }

    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return sendSuccess(res, conversations, 'Conversations retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: { sender: { select: { name: true, role: true } } },
    });

    const total = await prisma.chatMessage.count({ where: { conversationId } });

    // Mark as read
    await prisma.chatMessage.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return sendSuccess(res, {
      messages: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      }
    }, 'Messages retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
