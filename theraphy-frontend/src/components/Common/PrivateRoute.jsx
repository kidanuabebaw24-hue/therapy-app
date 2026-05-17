import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../../services/auth';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';

const PrivateRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  // Check if user is authenticated and is admin
  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    // Log out non-admin users
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateRoute;