import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { UserRepository } from '../repositories/userRepository.js';
import { formatChatMessage, buildConversationId } from '../utils/chatMessageFormatter.js';

export const registerChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserRepository.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`💬 Chat connected: ${socket.userId}`);

    socket.join(socket.userId);

    socket.on('join', (userId) => {
      if (userId && userId === socket.userId) {
        socket.join(userId);
      }
    });

    socket.on('join-conversation', ({ conversationId }) => {
      if (!conversationId) return;
      if (!conversationId.includes(socket.userId)) {
        socket.emit('error', 'Not allowed to join this conversation');
        return;
      }
      socket.join(conversationId);
      socket.emit('conversation-joined', { conversationId });
    });

    socket.on('send-message', async ({ receiverId, message, conversationId }) => {
      try {
        const content = String(message || '').trim();
        if (!content || !receiverId || !conversationId) {
          socket.emit('error', 'Invalid message payload');
          return;
        }

        if (!conversationId.includes(socket.userId)) {
          socket.emit('error', 'Invalid conversation');
          return;
        }

        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: { id: true, role: true },
        });

        if (!receiver) {
          socket.emit('error', 'Receiver not found');
          return;
        }

        const saved = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: socket.userId,
            receiverId,
            content,
            type: 'text',
          },
          include: {
            sender: { select: { id: true, name: true, role: true } },
            receiver: { select: { id: true, name: true, role: true } },
          },
        });

        const formatted = formatChatMessage(saved);

        io.to(conversationId).emit('new-message', formatted);
        io.to(receiverId).emit('new-message', formatted);

        socket.emit('message-sent', formatted);
      } catch (err) {
        console.error('send-message error:', err);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('user-typing', {
        conversationId,
        isTyping: Boolean(isTyping),
        userId: socket.userId,
      });
    });

    socket.on('mark-read', async ({ conversationId }) => {
      if (!conversationId || !conversationId.includes(socket.userId)) return;

      await prisma.chatMessage.updateMany({
        where: {
          conversationId,
          receiverId: socket.userId,
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      });

      socket.to(conversationId).emit('messages-read', {
        conversationId,
        readerId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`💬 Chat disconnected: ${socket.userId}`);
    });
  });
};

export { buildConversationId };
