import { Navigate } from "react-router-dom";
import TherapistSidebar from "../Layout/TherapistSidebar";
import { isAuthenticated, getCurrentUser } from "../../services/auth";
import "./TherapistPrivateRoute.css";

const TherapistPrivateRoute = ({ children }) => {
  // Accept children prop
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "therapist") {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/register" />;
  }

  // Check if therapist is verified
  if (!user?.isVerified) {
    return (
      <div className="unverified-container">
        <div className="unverified-card">
          <h2>Account Pending Verification</h2>
          <p>Your therapist account is waiting for admin approval.</p>
          <p>You'll be notified once your account is verified.</p>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // If verified, show the therapist layout with sidebar and children
  return (
    <div className="main-content">
      <TherapistSidebar />
      <div className="content-area">
        {children} {/* Render children directly instead of Outlet */}
      </div>
    </div>
  );
};

export default TherapistPrivateRoute;
