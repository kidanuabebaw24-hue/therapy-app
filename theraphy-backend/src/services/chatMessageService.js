import prisma from '../config/prisma.js';
import { formatChatMessage } from '../utils/chatMessageFormatter.js';
import { getIO } from '../socket/ioInstance.js';

export const sendChatMessage = async ({
  senderId,
  receiverId,
  conversationId,
  content,
}) => {
  const text = String(content || '').trim();
  if (!text || !receiverId || !conversationId) {
    throw new Error('Invalid message payload');
  }

  if (!conversationId.includes(senderId)) {
    throw new Error('Invalid conversation');
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });

  if (!receiver) {
    throw new Error('Receiver not found');
  }

  const saved = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderId,
      receiverId,
      content: text,
      type: 'text',
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  const formatted = formatChatMessage(saved);
  const io = getIO();

  if (io) {
    io.to(conversationId).emit('new-message', formatted);
    io.to(receiverId).emit('new-message', formatted);
  }

  return formatted;
};
