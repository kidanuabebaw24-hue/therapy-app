import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  Calendar,
  CreditCard,
  Brain,
  Video,
  TrendingUp,
  AlertTriangle,
  User,
  MessageSquare,
  LogOut,
  MessageCircle,
  Users,
  List,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './ClientSidebar.css';

const ClientSidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [funnyMessage, setFunnyMessage] = useState('');
  const [user, setUser] = useState({});

  // Funny messages for clients
  const funnyMessages = [
    "Time to check your mental health! 🧠",
    "Your therapist is waiting... or are they? 👀",
    "Clock says: You're doing great! ✨",
    "Don't forget to breathe! 🌬️",
    "Coffee time? ☕",
    "Tick tock... therapy rocks! 🎸",
    "Time flies when you're healing! 🦋",
    "Another minute, another victory! 🏆",
    "You've got this! 💪",
    "Progress over perfection! 🌟",
    "Your future self thanks you! 🙏",
    "Small steps, big changes! 🚶",
    "Almost snack time! 🍪",
    "Therapist approved! ✅",
    "You're not late... you're on your own time! ⏰",
    "Healing is not linear, but you're moving forward! 📈",
    "Every day is a fresh start! 🌱",
    "You are stronger than you know! 💪",
    "Breathe in peace, breathe out stress! 🧘",
    "Celebrate small wins today! 🎉"
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Random funny message on mount
    setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    
    // Change funny message every 30 seconds
    const messageInterval = setInterval(() => {
      setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    }, 30000);
    
    return () => {
      clearInterval(timer);
      clearInterval(messageInterval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleMenuList = () => {
    setIsMenuListOpen(!isMenuListOpen);
  };

  const closeMenuList = () => {
    setIsMenuListOpen(false);
  };

  // Format time
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format date
  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get time-based emoji
  const getTimeEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 20) return '🌤️';
    return '🌙';
  };

  const menuItems = [
    { path: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
     { path: '/client/therapists', icon: Users, label: 'Find Therapists' },
    { path: '/client/assessments', icon: ClipboardList, label: 'Self Assessment' },
    { path: '/client/mood', icon: Activity, label: 'Health Tracking' },
    { path: '/client/sessions', icon: Calendar, label: 'My Sessions' },
    { path: '/client/payments', icon: CreditCard, label: 'Payments' },
    { path: '/client/ai-chat', icon: MessageSquare, label: 'AI Assistant' },
    { path: '/client/therapy/cbt', icon: Brain, label: 'CBT Exercises' },
    { path: '/client/therapy/exposure', icon: Video, label: 'Exposure Therapy' },
    { path: '/client/progress', icon: TrendingUp, label: 'My Progress' },
    { path: "/client/chat", icon: MessageCircle, label: "Chat with Therapist" },
    { path: '/client/emergency', icon: AlertTriangle, label: 'Emergency' },
    { path: '/client/profile', icon: User, label: 'My Profile' },
  ];

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <button className="mobile-hamburger-btn" onClick={toggleMobileMenu}>
        <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Sidebar Card - Visible on desktop, slides in on mobile */}
      <div className={`client-sidebar-card ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* User Card */}
        <div className="client-user-card">
          <div className="card-logo">
            <div className="logo-circle">
              <span className="logo-emoji">🧠</span>
            </div>
            <div className="card-title">
              <h3>TherapyManager</h3>
              <p>Client Portal</p>
            </div>
          </div>
          
          <div className="card-user-info">
            <div className="user-avatar-circle">
              <span className="avatar-text">
                {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            <div className="user-text-info">
              <p className="user-fullname">{user.name || 'Client User'}</p>
              <span className="user-role-badge">Client</span>
            </div>
          </div>
        </div>

        {/* Funny Clock & Date Section */}
        <div className="funny-clock-section">
          <div className="time-emoji">{getTimeEmoji()}</div>
          <div className="time-display">
            <div className="clock-icon">
              <Clock size={18} />
            </div>
            <span className="time">{formatTime()}</span>
          </div>
          <div className="date-display">
            <div className="calendar-icon">
              <Calendar size={14} />
            </div>
            <span className="date">{formatDate()}</span>
          </div>
          <div className="funny-message">
            <span className="message-icon">💬</span>
            <span className="message-text">{funnyMessage}</span>
          </div>
        </div>

        {/* Show Menu List Button */}
        <button className="show-menu-list-btn" onClick={toggleMenuList}>
          <List size={22} />
          <span>Show Menu</span>
        </button>
      </div>

      {/* Overlay Menu List - Pops up when List icon is clicked */}
      {isMenuListOpen && (
        <>
          <div className="client-menu-overlay" onClick={closeMenuList}></div>
          <div className="client-popup-menu glass-card">
            <div className="popup-menu-header">
              <h3>Navigation Menu</h3>
              <button className="close-menu-btn" onClick={closeMenuList}>×</button>
            </div>
            
            <nav className="client-popup-nav-items">
              {menuItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `client-popup-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenuList}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="popup-menu-footer">
              <button onClick={handleLogout} className="client-popup-logout-btn">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export default ClientSidebar;