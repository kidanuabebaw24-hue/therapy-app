import api from './api';

// Start a new conversation
export const startAIConversation = (initialMessage) => 
  api.post('/ai/conversations', { initialMessage }).then(res => res.data);

// Send a message in a conversation
export const sendAIMessage = (conversationId, message) => 
  api.post(`/ai/conversations/${conversationId}/messages`, { message }).then(res => res.data);

// Get all user conversations
export const getUserAIConversations = () => 
  api.get('/ai/conversations').then(res => res.data);

// Get a single conversation
export const getAIConversation = (conversationId) => 
  api.get(`/ai/conversations/${conversationId}`).then(res => res.data);

// Delete a conversation
export const deleteAIConversation = (conversationId) => 
  api.delete(`/ai/conversations/${conversationId}`).then(res => res.data);

// Update conversation title
export const updateAIConversationTitle = (conversationId, title) => 
  api.put(`/ai/conversations/${conversationId}`, { title }).then(res => res.data);