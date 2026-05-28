import api from "./api";

/**
 * Backend response shape:
 *   { success: true, data: { user: {...}, token: "..." }, message: "..." }
 */

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  // Unwrap the nested data envelope
  const payload = response.data?.data ?? response.data;
  const token = payload.token;
  const user = payload.user ?? payload;

  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify({ ...user, token }));

  return { token, user };
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  const payload = response.data?.data ?? response.data;
  const token = payload.token;
  const user = payload.user ?? payload;

  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify({ ...user, token }));

  return { token, user };
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem("token");

// Dummy provider export kept for compatibility with App.jsx import
export const AuthProvider = ({ children }) => children;
