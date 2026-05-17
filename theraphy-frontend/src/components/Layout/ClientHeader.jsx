import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import './ClientHeader.css';

const ClientHeader = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="client-header">
      <div className="header-left">
        <h2 className="header-title">Welcome back, {user.name || 'Client'}</h2>
        <p className="header-date">{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div className="header-right">
        <button className="header-icon-btn emergency-btn" onClick={() => navigate('/client/emergency')}>
          <AlertTriangle size={20} />
        </button>

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
              {user.name?.charAt(0) || 'C'}
            </div>
            <span className="profile-name">{user.name || 'Client'}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              <button className="profile-menu-item" onClick={() => navigate('/client/profile')}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="profile-menu-item" onClick={() => navigate('/client/settings')}>
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

export default ClientHeader;