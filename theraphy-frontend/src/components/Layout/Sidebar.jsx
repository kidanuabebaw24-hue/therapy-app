import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  AlertTriangle,
  UserPlus,
  LogOut,
  Calendar,
  List,
  Clock
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuListOpen, setIsMenuListOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
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
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "User & Therapist Management" },
    { path: "/admin/assessments", icon: ClipboardList, label: "Assessments" },
    { path: '/admin/booking-requests', icon: Calendar, label: 'Booking Requests' },
    { path: "/admin/emergency", icon: AlertTriangle, label: "Emergency" },
    { path: "/admin/assign-therapist", icon: UserPlus, label: "Assign Therapist" },
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
      <div className={`admin-sidebar-card ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* User Card */}
        <div className="admin-user-card">
          <div className="card-logo">
            <div className="logo-circle">
              <span className="logo-emoji">🧠</span>
            </div>
            <div className="card-title">
              <h3>TherapyManager</h3>
              <p>Admin Portal</p>
            </div>
          </div>
          
          <div className="card-user-info">
            <div className="user-avatar-circle">
              <span className="avatar-text">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="user-text-info">
              <p className="user-fullname">{user.name || 'Admin User'}</p>
              <span className="user-role-badge">Admin</span>
            </div>
          </div>
        </div>

        {/* Time & Date Section - No funny messages */}
        <div className="time-date-section">
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
          <div className="menu-overlay" onClick={closeMenuList}></div>
          <div className="popup-menu glass-card">
            <div className="popup-menu-header">
              <h3>Navigation Menu</h3>
              <button className="close-menu-btn" onClick={closeMenuList}>×</button>
            </div>
            
            <nav className="popup-nav-items">
              {menuItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `popup-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenuList}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="popup-menu-footer">
              <button onClick={handleLogout} className="popup-logout-btn">
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

export default Sidebar;