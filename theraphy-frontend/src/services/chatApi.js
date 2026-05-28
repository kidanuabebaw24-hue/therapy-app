import api from './api';

const unwrap = (body) => body?.data ?? body;

export const getConversations = async () => {
  const res = await api.get('/chat/conversations');
  const list = unwrap(res.data);
  return {
    conversations: Array.isArray(list) ? list : [],
  };
};

export const getConversationMessages = async (conversationId, page = 1, limit = 50) => {
  const res = await api.get(`/chat/messages/${conversationId}`, {
    params: { page, limit },
  });
  const payload = unwrap(res.data);
  return {
    messages: payload?.messages ?? [],
    pagination: payload?.pagination,
  };
};

export const markMessagesAsRead = async (conversationId) => {
  const res = await api.put(`/chat/messages/read/${conversationId}`);
  return unwrap(res.data);
};

export const getUnreadCount = async () => {
  const res = await api.get('/chat/unread');
  return unwrap(res.data);
};
