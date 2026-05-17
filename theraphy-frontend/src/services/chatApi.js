import api from './api';

// Get all conversations for the user
export const getConversations = () => 
  api.get('/chat/conversations').then(res => res.data);

// Get messages for a specific conversation
export const getConversationMessages = (conversationId, page = 1, limit = 50) => 
  api.get(`/chat/messages/${conversationId}?page=${page}&limit=${limit}`).then(res => res.data);

// Mark messages as read
export const markMessagesAsRead = (conversationId) => 
  api.put(`/chat/messages/read/${conversationId}`).then(res => res.data);

// Get unread message count
export const getUnreadCount = () => 
  api.get('/chat/unread').then(res => res.data);

// Search messages
export const searchMessages = (conversationId, query) => 
  api.get(`/chat/search/${conversationId}?q=${query}`).then(res => res.data);