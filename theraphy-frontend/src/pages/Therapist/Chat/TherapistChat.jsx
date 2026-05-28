import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Paperclip,
  Smile,
  CheckCheck,
  Clock,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Search,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../../context/SocketContex.jsx';
//import { getMyClients } from '../../../services/therapistApi';
import {
  getConversationMessages,
  getConversations,
  markMessagesAsRead,
} from '../../../services/chatApi';
import './TherapistChat.css';

const TherapistChat = () => {
  const navigate = useNavigate();
  const { socket, isConnected, connectionError } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('🔄 TherapistChat rendered');
  console.log('📡 Socket connected?', isConnected);
  console.log('❌ Connection error?', connectionError);
  console.log('👤 Current user:', currentUser);

  useEffect(() => {
    console.log('🔄 Fetching conversations...');
    fetchConversations();
  }, []);

  useEffect(() => {
    console.log('🔄 Active conversation changed:', activeConversation);
    console.log('📡 Socket status:', { isConnected, hasSocket: !!socket });
    
    if (activeConversation && isConnected && socket) {
      console.log('✅ All conditions met, setting up conversation:', activeConversation.id);
      joinConversation();
      loadMessages(activeConversation.id);
      setupSocketListeners();
    } else {
      console.log('❌ Cannot join conversation - missing requirements:', {
        hasActiveConversation: !!activeConversation,
        isConnected,
        hasSocket: !!socket
      });
    }

    return () => {
      console.log('🧹 Cleaning up chat component');
      if (socket) {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('messages-read');
      }
    };
  }, [activeConversation, isConnected, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      console.log('📞 Calling getConversations API...');
      const data = await getConversations();
      console.log('📞 Conversations received:', data);
      setConversations(data.conversations || []);
      
      // Set first conversation as active if exists
      if (data.conversations?.length > 0) {
        console.log('✅ Setting active conversation:', data.conversations[0]);
        setActiveConversation(data.conversations[0]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    if (activeConversation && socket) {
      console.log('📞 Emitting join-conversation:', activeConversation.id);
      socket.emit('join-conversation', { conversationId: activeConversation.id });
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      console.log('📞 Loading messages for:', conversationId);
      const data = await getConversationMessages(conversationId);
      console.log('📞 Messages loaded:', data.messages?.length);
      setMessages(data.messages || []);
      
      // Mark messages as read
      await markMessagesAsRead(conversationId);
      
      // Update unread count in conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
    }
  };

  const setupSocketListeners = () => {
    console.log('📡 Setting up socket listeners');
    
    socket.on('conversation-joined', (data) => {
      console.log('✅ Conversation joined:', data);
    });

    socket.on('new-message', (message) => {
      console.log('📨 New message received:', message);

      if (message.conversationId === activeConversation?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        socket.emit('mark-read', { conversationId: activeConversation.id });
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: conv.id === activeConversation?.id ? 0 : (conv.unreadCount || 0) + 1,
              updatedAt: message.createdAt,
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on('user-typing', ({ isTyping }) => {
      console.log('✏️ User typing:', isTyping);
      setOtherTyping(isTyping);
    });

    socket.on('messages-read', ({ conversationId, readerId }) => {
      console.log('👁️ Messages read in:', conversationId);
      if (conversationId === activeConversation?.id) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            read: true,
          }))
        );
      }
    });

    socket.on('message-sent', (message) => {
      if (message.conversationId === activeConversation?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error event:', error);
      toast.error(typeof error === 'string' ? error : 'Chat error');
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conversation) => {
    console.log('👉 Selected conversation:', conversation);
    setActiveConversation(conversation);
    setMessages([]);
    if (conversation.unreadCount > 0) {
      markMessagesAsRead(conversation.id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending || !isConnected) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    console.log('📤 Sending message to:', activeConversation.participant.id);
    socket.emit('send-message', {
      receiverId: activeConversation.participant.id,
      message: messageContent,
      conversationId: activeConversation.id,
    });

    setSending(false);
  };

  const handleTyping = () => {
    if (!isTyping && activeConversation && socket) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: activeConversation.id, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeConversation && socket) {
        socket.emit('typing', { conversationId: activeConversation.id, isTyping: false });
      }
    }, 1000);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchConversations();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="therapist-chat-loading">
        <div className="loader"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="therapist-chat-loading">
        <div className="connection-error">
          <MessageCircle size={48} />
          <h3>Connection Error</h3>
          <p>{connectionError || 'Unable to connect to chat server'}</p>
          <button className="retry-btn" onClick={handleRetry}>
            <RefreshCw size={16} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="therapist-chat">
      {/* Sidebar Toggle for Mobile */}
      <button
        className={`sidebar-toggle ${!sidebarOpen ? 'closed' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Conversations Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>
            <MessageCircle size={20} />
            Conversations
          </h2>
          <div className="online-indicator">
            <span className={`dot ${isConnected ? 'online' : 'offline'}`} />
            <span>{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <Users size={48} />
              <p>No conversations yet</p>
              <p className="sub-text">Your clients will appear here</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${
                  activeConversation?.id === conv.id ? 'active' : ''
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="client-avatar">
                  {conv.participant.name?.charAt(0)}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conv.participant.name}</h4>
                    {conv.lastMessage && (
                      <span className="time">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="conversation-preview">
                    <p className="last-message">
                      {conv.lastMessage
                        ? (() => {
                            const text =
                              conv.lastMessage.message ||
                              conv.lastMessage.content ||
                              '';
                            return text.length > 30
                              ? `${text.substring(0, 30)}...`
                              : text;
                          })()
                        : 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                  <div className="client-meta">
                    <span className="primary-phobia">
                      {conv.participant.primaryPhobia || 'No phobia specified'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${sidebarOpen ? '' : 'expanded'}`}>
        {!activeConversation ? (
          <div className="no-chat-selected">
            <MessageCircle size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a client from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="header-left">
                <div className="client-avatar large">
                  {activeConversation.participant.name?.charAt(0)}
                </div>
                <div className="client-info">
                  <h3>{activeConversation.participant.name}</h3>
                  <p className="client-email">{activeConversation.participant.email}</p>
                  <div className="client-status">
                    <span className={`dot ${isConnected ? 'online' : 'offline'}`} />
                    <span>{isConnected ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              <div className="header-actions">
                <button className="icon-btn" title="Voice call">
                  <Phone size={18} />
                </button>
                <button className="icon-btn" title="Video call">
                  <Video size={18} />
                </button>
                <button className="icon-btn" title="View client profile">
                  <Users size={18} />
                </button>
                <button className="icon-btn" title="More options">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender.id === currentUser.id;
                const showDate =
                  index === 0 ||
                  formatDate(msg.createdAt) !== formatDate(messages[index - 1].createdAt);

                return (
                  <div key={msg.id || index}>
                    {showDate && (
                      <div className="date-divider">
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                    )}
                    <div
                      className={`message-wrapper ${isCurrentUser ? 'sent' : 'received'}`}
                    >
                      {!isCurrentUser && (
                        <div className="message-sender-avatar">
                          {activeConversation.participant.name?.charAt(0)}
                        </div>
                      )}
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <div className="message-meta">
                          <span className="message-time">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isCurrentUser && (
                            <span className="message-status">
                              {msg.read ? (
                                <CheckCheck size={14} className="read" />
                              ) : (
                                <CheckCheck size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {otherTyping && (
                <div className="typing-indicator">
                  <div className="typing-avatar">
                    {activeConversation.participant.name?.charAt(0)}
                  </div>
                  <div className="typing-bubbles">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <button type="button" className="attach-btn">
                <Paperclip size={20} />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyUp={handleTyping}
                placeholder="Type your message..."
                className="message-input"
                disabled={!isConnected}
              />
              
              <button type="button" className="emoji-btn">
                <Smile size={20} />
              </button>
              
              <button
                type="submit"
                className={`send-btn ${sending ? 'sending' : ''}`}
                disabled={!newMessage.trim() || !isConnected || sending}
              >
                {sending ? <Clock size={20} /> : <Send size={20} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TherapistChat;
