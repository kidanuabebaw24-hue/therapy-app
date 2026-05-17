import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../../services/auth";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      console.log("Login response:", response); // Debug log

      // Store token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Store user data - IMPORTANT: Use the response directly
      const userData = response.user || response;
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("Stored user data:", userData); // Debug log
      console.log("Role:", userData.role);
      console.log("Requires CBT:", userData.requiresCBT);
      console.log("Has completed initial CBT:", userData.hasCompletedInitialCBT);

      toast.success("Login successful!");

      // Determine redirect path based on role and CBT status
      let redirectPath = "/register"; // Default fallback

      if (userData.role === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (userData.role === "therapist") {
        redirectPath = "/therapist/dashboard";
      } else if (userData.role === "client") {
        // Check if client needs to complete CBT
        if (userData.requiresCBT === true && !userData.hasCompletedInitialCBT) {
          redirectPath = "/cbt-exercises";
          console.log("Redirecting to CBT exercises");
        } else {
          redirectPath = "/client/dashboard";
          console.log("Redirecting to client dashboard");
        }
      }

      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>TherapyManager</h2>
          <p>Welcome Back</p>
          <small className="age-notice">⚠️ You must be 18+ to use this platform</small>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              "Logging in..."
            ) : (
              <>
                <LogIn size={18} /> Login
              </>
            )}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <p className="terms-note">
          By registering, you confirm you are 18 years or older
        </p>
      </div>
    </div>
  );
};

export default Login;