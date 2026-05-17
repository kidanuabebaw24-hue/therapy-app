import { Navigate } from 'react-router-dom';
import ClientSidebar from '../Layout/ClientSidebar';
import { isAuthenticated, getCurrentUser } from '../../services/auth';

const ClientPrivateRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'client') {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user?.role === 'therapist') {
      return <Navigate to="/therapist/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-layout">
      <ClientSidebar />
      <div className="main-wrapper">
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientPrivateRoute;