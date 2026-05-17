import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import './PrivateRoute.css';

const PrivateRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const { requiresCBT } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (!authenticated) return <Navigate to="/login" />;

  // Check if client needs to complete CBT exercises
  if (user?.role === 'client' && requiresCBT) {
    // Allow access to CBT exercises page only
    if (window.location.pathname !== '/cbt-exercises') {
      return <Navigate to="/cbt-exercises" />;
    }
  }

  if (user?.role !== "admin") {
    if (user?.role === "therapist") return <Navigate to="/therapist/dashboard" />;
    if (user?.role === "client" && !requiresCBT) return <Navigate to="/client/dashboard" />;
    if (user?.role === "client" && requiresCBT) return <Navigate to="/cbt-exercises" />;
    localStorage.clear();
    return <Navigate to="/register" />;
  }

  return (
    <div className="app-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className="main-wrapper">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateRoute;