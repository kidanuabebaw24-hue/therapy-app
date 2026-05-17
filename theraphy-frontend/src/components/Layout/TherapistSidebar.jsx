import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Brain,
  ClipboardList,
  UserCircle,
  LogOut,
  MessageCircle,
  List,
  Clock
} from "lucide-react";
import "./TherapistSidebar.css";

const TherapistSidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [funnyMessage, setFunnyMessage] = useState("");
  const [user, setUser] = useState({});

  // Funny messages for therapists
  const funnyMessages = [
    "Helping minds heal, one session at a time! 🧠",
    "You're making a difference today! 🌟",
    "Time to change some lives! 💫",
    "Your patients are lucky to have you! 💙",
    "Coffee first, therapy second! ☕",
    "Another day, another breakthrough! 🎯",
    "You've got this, doc! 👨‍⚕️",
    "Making the world mentally healthier! 🌍",
    "Patience + Empathy = Great Therapist! 💪",
    "Your calm mind helps calm others! 🧘",
    "Every session matters! 📝",
    "You're not just a therapist, you're a hope giver! 🦋",
    "Time flies when you're healing! ⏰",
    "Remember to take care of yourself too! ❤️",
    "Small progress is still progress! 📈"
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);

    const messageInterval = setInterval(() => {
      setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(messageInterval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
    { path: "/therapist/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/therapist/clients", icon: Users, label: "Client Management" },
    { path: "/therapist/sessions", icon: Calendar, label: "Session Handling" },
    { path: "/therapist/documentation", icon: FileText, label: "Clinical Documentation" },
    { path: "/therapist/progress", icon: TrendingUp, label: "Progress Tracking" },
    { path: "/therapist/visualization", icon: BarChart3, label: "Data Visualization" },
    { path: "/therapist/modules", icon: Activity, label: "Therapeutic Modules" },
    { path: "/therapist/cbt", icon: Brain, label: "CBT Interventions" },
    { path: "/therapist/assessments", icon: ClipboardList, label: "Clinical Assessment" },
    { path: "/therapist/chat", icon: MessageCircle, label: "Chat with Clients" },
    { path: "/therapist/profile", icon: UserCircle, label: "Profile Management" },
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
      <div className={`therapist-sidebar-card ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* User Card */}
        <div className="therapist-user-card">
          <div className="card-logo">
            <div className="logo-circle">
              <span className="logo-emoji">🧠</span>
            </div>
            <div className="card-title">
              <h3>TherapyManager</h3>
              <p>Therapist Portal</p>
            </div>
          </div>

          <div className="card-user-info">
            <div className="user-avatar-circle">
              <span className="avatar-text">
                {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
              </span>
            </div>
            <div className="user-text-info">
              <p className="user-fullname">{user.name || 'Therapist User'}</p>
              <span className="user-role-badge">Therapist</span>
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
          <div className="therapist-menu-overlay" onClick={closeMenuList}></div>
          <div className="therapist-popup-menu glass-card">
            <div className="popup-menu-header">
              <h3>Navigation Menu</h3>
              <button className="close-menu-btn" onClick={closeMenuList}>×</button>
            </div>

            <nav className="therapist-popup-nav-items">
              {menuItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `therapist-popup-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenuList}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="popup-menu-footer">
              <button onClick={handleLogout} className="therapist-popup-logout-btn">
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

export default TherapistSidebar;