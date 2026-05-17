import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Header.css';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="hamburger-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="header-title-wrapper">
          <h2 className="header-title">Welcome back, {user.name || 'Admin'}</h2>
          <p className="header-date">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="profile-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {user.name?.charAt(0) || 'A'}
            </div>
            <span className="profile-name">{user.name || 'Admin'}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              <button className="profile-menu-item" onClick={() => navigate('/admin/profile')}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="profile-menu-item" onClick={() => navigate('/admin/settings')}>
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="profile-divider"></div>
              <button className="profile-menu-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;