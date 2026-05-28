import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { UserRepository } from '../repositories/userRepository.js';
import { sendChatMessage } from '../services/chatMessageService.js';

export const registerChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
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
      console.error('Socket auth failed:', err.message);
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
        const formatted = await sendChatMessage({
          senderId: socket.userId,
          receiverId,
          conversationId,
          content: message,
        });
        socket.emit('message-sent', formatted);
      } catch (err) {
        console.error('send-message error:', err);
        socket.emit('error', err.message || 'Failed to send message');
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
