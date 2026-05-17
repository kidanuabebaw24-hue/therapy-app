import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Common/Modal';
import {
  startAIConversation,
  sendAIMessage,
  getUserAIConversations,
  getAIConversation,
  deleteAIConversation,
  updateAIConversationTitle
} from '../../../services/aiApi';
import './AIChat.css';

const AIChat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [tempConversationId, setTempConversationId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getUserAIConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const response = await getAIConversation(conversationId);
      setCurrentConversation(response.conversation);
      setMessages(response.conversation.messages || []);
      setIsNewChat(false);
      setTempConversationId(null);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setLoading(true);
      
      // Try to create a conversation with a minimal message or empty
      let response;
      try {
        // First attempt: Try with a generic message
        response = await startAIConversation("Hello");
      } catch (error) {
        console.log('First attempt failed, trying empty message...');
        // Second attempt: Try with empty string
        response = await startAIConversation("");
      }
      
      console.log('New conversation created:', response);
      
      // Set the current conversation
      setCurrentConversation(response.conversation);
      setMessages([]); // Start with empty messages
      setIsNewChat(true);
      setTempConversationId(response.conversation.id);
      setInputMessage('');
      
      // Focus on input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Error starting new chat:', error);
      
      // If all attempts fail, create a local temporary conversation
      // This will be saved to backend when first message is sent
      const tempId = 'temp-' + Date.now();
      const tempConversation = {
        id: tempId,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCurrentConversation(tempConversation);
      setMessages([]);
      setIsNewChat(true);
      setTempConversationId(tempId);
      setInputMessage('');
      
      toast.success('Ready to start a new conversation!');
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to UI immediately
    const tempUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    setSending(true);

    try {
      // If this is a temporary conversation (created locally), we need to create it on backend first
      if (tempConversationId && tempConversationId.startsWith('temp-')) {
        // Create the conversation on backend with the first message
        const response = await startAIConversation(userMessage);
        
        // Update with real conversation data
        setCurrentConversation(response.conversation);
        setMessages(response.conversation.messages || []);
        setTempConversationId(null);
        setIsNewChat(false);
        
        // Refresh conversations list
        await fetchConversations();
      } else {
        // Normal flow - send message to existing conversation
        const response = await sendAIMessage(currentConversation.id, userMessage);
        
        // Add assistant response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message.content,
          timestamp: response.message.timestamp
        }]);
        
        // Refresh conversations list to update title/timestamp
        await fetchConversations();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg !== tempUserMessage));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    // If it's a temporary conversation, just remove it locally
    if (conversationToDelete.startsWith('temp-')) {
      setShowDeleteModal(false);
      setConversationToDelete(null);
      
      if (currentConversation?.id === conversationToDelete) {
        setCurrentConversation(null);
        setMessages([]);
        setIsNewChat(false);
        setTempConversationId(null);
      }
      
      toast.success('Conversation removed');
      return;
    }
    
    try {
      await deleteAIConversation(conversationToDelete);
      toast.success('Conversation deleted');
      setShowDeleteModal(false);
      setConversationToDelete(null);
      
      if (currentConversation?.id === conversationToDelete) {
        setCurrentConversation(null);
        setMessages([]);
        setIsNewChat(false);
        setTempConversationId(null);
      }
      
      await fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleUpdateTitle = async (conversationId) => {
    if (!newTitle.trim()) {
      setEditingTitle(null);
      return;
    }

    // If it's a temporary conversation, just update locally
    if (conversationId.startsWith('temp-')) {
      setCurrentConversation(prev => ({ ...prev, title: newTitle }));
      setEditingTitle(null);
      toast.success('Title updated');
      return;
    }

    try {
      await updateAIConversationTitle(conversationId, newTitle);
      toast.success('Title updated');
      setEditingTitle(null);
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => ({ ...prev, title: newTitle }));
      }
      
      await fetchConversations();
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="ai-chat-container">
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat} disabled={loading}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <div className="conversations-list">
          {loading && conversations.length === 0 ? (
            <div className="loading-conversations">
              <Loader2 size={24} className="spin" />
              <p>Loading...</p>
            </div>
          ) : conversations.length === 0 && !tempConversationId ? (
            <div className="no-conversations">
              <MessageSquare size={32} />
              <p>No conversations yet</p>
              <button onClick={handleNewChat}>Start a new chat</button>
            </div>
          ) : (
            <>
              {/* Show temporary conversation if it exists */}
              {tempConversationId && (
                <div
                  className={`conversation-item active temporary`}
                >
                  <div className="conversation-content">
                    <MessageSquare size={16} className="conv-icon" />
                    <div className="conv-details">
                      <span className="conv-title">New Conversation</span>
                      <span className="conv-time">Just now</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show actual conversations */}
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${currentConversation?.id === conv.id && !tempConversationId ? 'active' : ''}`}
                >
                  {editingTitle === conv.id ? (
                    <div className="edit-title-container">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle(conv.id)}
                      />
                      <button onClick={() => handleUpdateTitle(conv.id)} className="icon-btn">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingTitle(null)} className="icon-btn">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="conversation-content"
                        onClick={() => loadConversation(conv.id)}
                      >
                        <MessageSquare size={16} className="conv-icon" />
                        <div className="conv-details">
                          <span className="conv-title">{conv.title || 'Untitled'}</span>
                          <span className="conv-time">{formatTime(conv.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="conversation-actions">
                        <button
                          onClick={() => {
                            setEditingTitle(conv.id);
                            setNewTitle(conv.title || '');
                          }}
                          className="icon-btn"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setConversationToDelete(conv.id);
                            setShowDeleteModal(true);
                          }}
                          className="icon-btn delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${sidebarOpen ? '' : 'expanded'}`}>
        {!currentConversation ? (
          <div className="welcome-screen">
            <Bot size={64} className="welcome-icon" />
            <h1>AI Assistant</h1>
            <p>Your personal mental health companion. Start a conversation to get support, ask questions, or just talk.</p>
            <button className="start-chat-btn" onClick={handleNewChat} disabled={loading}>
              {loading ? <Loader2 size={20} className="spin" /> : <MessageSquare size={20} />}
              Start a new chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="header-info">
                <Bot size={24} className="bot-icon" />
                <div>
                  <h2>{currentConversation.title || 'New Conversation'}</h2>
                  <span className="chat-status">
                    {isNewChat ? 'Type your first message to start' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              {isNewChat && messages.length === 0 ? (
                <div className="new-chat-prompt">
                  <Bot size={48} className="prompt-icon" />
                  <p>Start the conversation by typing a message below.</p>
                  <p className="prompt-hint">What would you like to talk about today?</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message-wrapper ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                      <div className="message-avatar">
                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>
                      <div className="message-content">
                        <div className="message-bubble">
                          <p>{msg.content}</p>
                        </div>
                        <span className="message-time">
                          {msg.timestamp ? formatTime(msg.timestamp) : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {sending && (
                <div className="message-wrapper assistant-message">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble typing">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chat-input-container" onSubmit={handleSendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isNewChat ? "Type your first message to start..." : "Type your message here..."}
                disabled={sending || loading}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || sending || loading}
                className="send-btn"
              >
                {sending ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setConversationToDelete(null);
        }}
        title="Delete Conversation"
        size="sm"
      >
        <div className="delete-modal">
          <Trash2 size={48} className="delete-icon" />
          <p>Are you sure you want to delete this conversation?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setConversationToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={handleDeleteConversation}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIChat;
