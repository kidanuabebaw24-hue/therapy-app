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
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../../context/SocketContex.jsx';
import { getMyTherapist } from '../../../services/clientApi';
import {
  getConversationMessages,
  markMessagesAsRead,
} from '../../../services/chatApi';
import './ClientChat.css';

const ClientChat = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [therapist, setTherapist] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const conversationId = therapist
    ? `${currentUser.id}_${therapist.id}`
    : null;

  useEffect(() => {
    fetchTherapist();
  }, []);

  useEffect(() => {
    if (conversationId && isConnected && socket) {
      joinConversation();
      loadMessages();
      setupSocketListeners();
    }

    return () => {
      if (socket) {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('messages-read');
        socket.off('conversation-joined');
      }
    };
  }, [conversationId, isConnected, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTherapist = async () => {
    try {
      const data = await getMyTherapist();
      if (!data.hasTherapist) {
        toast.error('No therapist assigned yet');
        navigate('/client/dashboard');
        return;
      }
      setTherapist(data.therapist);
    } catch (error) {
      toast.error('Failed to load therapist information');
      navigate('/client/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = () => {
    socket.emit('join-conversation', { conversationId });
  };

  const loadMessages = async () => {
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data.messages || []);
      
      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const setupSocketListeners = () => {
    socket.on('message-history', (history) => {
      setMessages(history);
    });

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
      
      // Mark as read if we're the receiver
      if (message.receiver.id === currentUser.id) {
        socket.emit('mark-read', { conversationId });
      }
    });

    socket.on('user-typing', ({ isTyping }) => {
      setOtherTyping(isTyping);
    });

    socket.on('messages-read', () => {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          read: true,
        }))
      );
    });

    socket.on('conversation-joined', () => {
      console.log('Joined conversation:', conversationId);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !therapist || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    socket.emit('send-message', {
      receiverId: therapist.id,
      message: messageContent,
      conversationId,
    });

    setSending(false);
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { conversationId, isTyping: false });
    }, 1000);
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

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loader"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="client-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/client/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        
        <div className="header-left">
          <div className="therapist-avatar">
            {therapist?.name?.charAt(0) || 'T'}
          </div>
          <div className="therapist-info">
            <h3>{therapist?.name}</h3>
            <p className="therapist-specialization">
              {therapist?.specialization || 'Therapist'}
            </p>
            <div className="connection-status">
              <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
              <span>{isConnected ? 'Online' : 'Connecting...'}</span>
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
          <button className="icon-btn" title="Info">
            <Info size={18} />
          </button>
          <button className="icon-btn" title="More">
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
                    {therapist?.name?.charAt(0)}
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
            <div className="typing-avatar">{therapist?.name?.charAt(0)}</div>
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

      {/* Connection Lost Overlay */}
      {!isConnected && (
        <div className="connection-overlay">
          <div className="connection-message">
            <div className="loader-small"></div>
            <p>Reconnecting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientChat;
