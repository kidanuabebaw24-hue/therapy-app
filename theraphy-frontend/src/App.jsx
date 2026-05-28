import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement/UserManagement";
import Assessments from "./pages/Admin/Assessments/Assessments";
import PostAssessment from "./pages/Admin/Assessments/PostAssessments";
import Emergency from "./pages/Admin/Emergency/Emergency";
import AssignTherapist from "./pages/Admin/AssignTherapist/AssignTherapist";
import BookingRequests from "./pages/Admin/BookingRequests.jsx";

// Therapist Pages
import TherapistDashboard from "./pages/Therapist/TherapistDashboard/TherapistDashboard";
import ClientManagement from "./pages/Therapist/ClientManagement/ClientManagement";
import SessionManagement from "./pages/Therapist/SessionManagement/SessionManagement";
import ClinicalDocumentation from "./pages/Therapist/ClinicalDocumentation/ClinicalDocumentation";
import ProgressTracking from "./pages/Therapist/ProgressTracking/ProgressTracking";
import DataVisualization from "./pages/Therapist/DataVisualization/DataVisualization";
import TherapeuticModules from "./pages/Therapist/TherapeuticModules/TherapeuticModules";
import CBTInterventions from "./pages/Therapist/CBTInterventions/CBTInterventions";
import ClinicalAssessment from "./pages/Therapist/ClinicalAssessment/ClinicalAssessment";
import Profile from "./pages/Therapist/Profile/Profile";
import TherapistChat from "./pages/Therapist/Chat/TherapistChat";

// Client Pages
import ClientDashboard from "./pages/Client/ClientDashboard/ClientDashboard";
import SelfAssessment from "./pages/Client/SelfAssessment/SelfAssessment";
import TakeAssessment from "./pages/Client/SelfAssessment/TakeAssessment";
import HealthTracking from "./pages/Client/HealthTracking/HealthTracking";
import Scheduling from "./pages/Client/Scheduling/Scheduling";
import Payments from "./pages/Client/Payments/Payments";
import CBTExercises from "./pages/Client/Therapy/CBTExercises";
import ExposureTherapy from "./pages/Client/Therapy/ExposureTherapy";
import Progress from "./pages/Client/Progress/Progress";
import EmergencyPage from "./pages/Client/Emergency/Emergency";
import ClientProfile from "./pages/Client/Profile/Profile";
import ClientChat from "./pages/Client/Chat/ClientChat";
import AIChat from "./pages/Client/AIChat/AIChat";
import Therapists from "./pages/Client/Theraphists/Therapists.jsx";

// Context and Services
import { getCurrentUser, isAuthenticated } from "./services/auth";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContex.jsx";

// Route Protection Components
import PrivateRoute from "./components/Common/PrivateRoute";
import TherapistPrivateRoute from "./components/Common/TherapistPrivateRoute";
import ClientPrivateRoute from "./components/Common/ClientPrivateRoute";

import "./App.css";

// Root redirect component with CBT check
const RootRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState("/register");

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const user = getCurrentUser();

      console.log("RootRedirect - Authenticated:", authenticated);
      console.log("RootRedirect - User:", user);

      if (authenticated && user) {
        if (user.role === "admin") {
          setRedirectPath("/admin/dashboard");
        } else if (user.role === "therapist") {
          setRedirectPath("/therapist/dashboard");
        } else if (user.role === "client") {
          // Check if client needs to complete initial CBT exercises
          const requiresCBT = user.requiresCBT === true;
          const hasCompletedCBT = user.hasCompletedInitialCBT === true;

          console.log("Client CBT Status - Requires:", requiresCBT, "Completed:", hasCompletedCBT);

          if (requiresCBT && !hasCompletedCBT) {
            setRedirectPath("/cbt-exercises");
          } else {
            setRedirectPath("/client/dashboard");
          }
        } else {
          setRedirectPath("/register");
        }
      } else {
        setRedirectPath("/register");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: "Outfit, sans-serif",
              },
            }}
          />
          <Routes>
            {/* ========== PUBLIC ROUTES ========== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ========== CBT EXERCISES ROUTE (Accessible after login) ========== */}
            <Route
              path="/cbt-exercises"
              element={
                <ClientPrivateRoute>
                  <CBTExercises />
                </ClientPrivateRoute>
              }
            />

            {/* ========== ADMIN ROUTES ========== */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/booking-requests"
              element={
                <PrivateRoute>
                  <BookingRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/assessments"
              element={
                <PrivateRoute>
                  <Assessments />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/assessments/new"
              element={
                <PrivateRoute>
                  <PostAssessment />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/emergency"
              element={
                <PrivateRoute>
                  <Emergency />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/assign-therapist"
              element={
                <PrivateRoute>
                  <AssignTherapist />
                </PrivateRoute>
              }
            />

            {/* ========== THERAPIST ROUTES ========== */}
            <Route
              path="/therapist"
              element={
                <TherapistPrivateRoute>
                  <TherapistDashboard />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/dashboard"
              element={
                <TherapistPrivateRoute>
                  <TherapistDashboard />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/clients"
              element={
                <TherapistPrivateRoute>
                  <ClientManagement />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/sessions"
              element={
                <TherapistPrivateRoute>
                  <SessionManagement />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/documentation"
              element={
                <TherapistPrivateRoute>
                  <ClinicalDocumentation />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/progress"
              element={
                <TherapistPrivateRoute>
                  <ProgressTracking />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/visualization"
              element={
                <TherapistPrivateRoute>
                  <DataVisualization />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/modules"
              element={
                <TherapistPrivateRoute>
                  <TherapeuticModules />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/cbt"
              element={
                <TherapistPrivateRoute>
                  <CBTInterventions />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/assessments"
              element={
                <TherapistPrivateRoute>
                  <ClinicalAssessment />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/profile"
              element={
                <TherapistPrivateRoute>
                  <Profile />
                </TherapistPrivateRoute>
              }
            />
            <Route
              path="/therapist/chat"
              element={
                <TherapistPrivateRoute>
                  <TherapistChat />
                </TherapistPrivateRoute>
              }
            />

            {/* ========== CLIENT ROUTES ========== */}
            <Route
              path="/client"
              element={
                <ClientPrivateRoute>
                  <ClientDashboard />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/dashboard"
              element={
                <ClientPrivateRoute>
                  <ClientDashboard />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/assessments"
              element={
                <ClientPrivateRoute>
                  <SelfAssessment />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/assessments/take"
              element={
                <ClientPrivateRoute>
                  <TakeAssessment />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/mood"
              element={
                <ClientPrivateRoute>
                  <HealthTracking />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/sessions"
              element={
                <ClientPrivateRoute>
                  <Scheduling />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/payments"
              element={
                <ClientPrivateRoute>
                  <Payments />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/therapy/cbt"
              element={
                <ClientPrivateRoute>
                  <CBTExercises />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/therapy/exposure"
              element={
                <ClientPrivateRoute>
                  <ExposureTherapy />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/progress"
              element={
                <ClientPrivateRoute>
                  <Progress />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/emergency"
              element={
                <ClientPrivateRoute>
                  <EmergencyPage />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/profile"
              element={
                <ClientPrivateRoute>
                  <ClientProfile />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/chat"
              element={
                <ClientPrivateRoute>
                  <ClientChat />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/ai-chat"
              element={
                <ClientPrivateRoute>
                  <AIChat />
                </ClientPrivateRoute>
              }
            />
            <Route
              path="/client/therapists"
              element={
                <ClientPrivateRoute>
                  <Therapists />
                </ClientPrivateRoute>
              }
            />

            {/* ========== ROOT ROUTE ========== */}
            <Route path="/" element={<RootRedirect />} />

            {/* ========== CATCH ALL - REDIRECT TO REGISTER ========== */}
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;