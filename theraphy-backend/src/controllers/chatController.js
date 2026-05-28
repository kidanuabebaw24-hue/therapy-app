import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { formatChatMessage, buildConversationId } from '../utils/chatMessageFormatter.js';

const formatLastMessage = (msg) =>
  msg
    ? {
        ...formatChatMessage(msg),
        message: msg.content,
      }
    : null;

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let conversations = [];

    if (userRole === 'client') {
      const patientProfile = req.user.patientProfile;
      if (!patientProfile) {
        return sendSuccess(res, [], 'Conversations retrieved');
      }

      const assignments = await prisma.therapistAssignment.findMany({
        where: { patientId: patientProfile.id, status: 'active' },
        include: { therapist: { include: { user: { select: { id: true, name: true, email: true } } } } },
      });

      for (const assignment of assignments) {
        const therapist = assignment.therapist;
        const therapistUserId = therapist.userId;
        const conversationId = buildConversationId(userId, therapistUserId);

        const lastMessage = await prisma.chatMessage.findFirst({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, name: true, role: true } } },
        });

        const unreadCount = await prisma.chatMessage.count({
          where: { conversationId, receiverId: userId, isRead: false },
        });

        conversations.push({
          id: conversationId,
          participant: {
            id: therapistUserId,
            profileId: therapist.id,
            name: therapist.user.name,
            email: therapist.user.email,
            role: 'therapist',
            specialization: therapist.specialization,
          },
          lastMessage: formatLastMessage(lastMessage),
          unreadCount,
          updatedAt: lastMessage?.createdAt || assignment.assignedAt,
        });
      }
    } else if (userRole === 'therapist') {
      const therapistProfile = req.user.therapistProfile;
      if (!therapistProfile) {
        return sendSuccess(res, [], 'Conversations retrieved');
      }

      const assignments = await prisma.therapistAssignment.findMany({
        where: { therapistId: therapistProfile.id, status: 'active' },
        include: {
          patient: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      for (const assignment of assignments) {
        const patient = assignment.patient;
        const patientUserId = patient.userId;
        const conversationId = buildConversationId(patientUserId, userId);

        const lastMessage = await prisma.chatMessage.findFirst({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, name: true, role: true } } },
        });

        const unreadCount = await prisma.chatMessage.count({
          where: { conversationId, receiverId: userId, isRead: false },
        });

        conversations.push({
          id: conversationId,
          participant: {
            id: patientUserId,
            profileId: patient.id,
            name: patient.user.name,
            email: patient.user.email,
            role: 'client',
            primaryPhobia: patient.primaryPhobia,
          },
          lastMessage: formatLastMessage(lastMessage),
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

    if (!conversationId.includes(userId)) {
      return sendError(res, 'Not allowed to view this conversation', 403);
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      take: parseInt(limit, 10),
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    const total = await prisma.chatMessage.count({ where: { conversationId } });

    await prisma.chatMessage.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return sendSuccess(
      res,
      {
        messages: messages.reverse().map(formatChatMessage),
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
      'Messages retrieved',
    );
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId.includes(userId)) {
      return sendError(res, 'Not allowed', 403);
    }

    await prisma.chatMessage.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return sendSuccess(res, null, 'Messages marked as read');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
