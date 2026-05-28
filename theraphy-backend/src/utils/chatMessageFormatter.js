/** Normalize ChatMessage for REST + Socket.io clients. */
export const formatChatMessage = (msg) => ({
  id: msg.id,
  conversationId: msg.conversationId,
  message: msg.content,
  content: msg.content,
  createdAt: msg.createdAt,
  read: msg.isRead,
  isRead: msg.isRead,
  readAt: msg.readAt,
  sender: {
    id: msg.senderId,
    name: msg.sender?.name ?? '',
    role: msg.sender?.role ?? '',
  },
  receiver: {
    id: msg.receiverId,
    name: msg.receiver?.name ?? '',
    role: msg.receiver?.role ?? '',
  },
});

export const buildConversationId = (clientUserId, therapistUserId) =>
  `${clientUserId}_${therapistUserId}`;
