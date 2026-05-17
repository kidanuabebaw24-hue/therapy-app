import api from "./api";
import * as mockData from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const login = async (credentials) => {
  try {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = { user: mockData.mockUser, token: "mock_token_123" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    }
    const response = await api.post(`/auth/login`, credentials);
    const data = response.data;

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    const userData = data.user || data;
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  
    return data;
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = { user: mockData.mockUser, token: "mock_token_123" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    }
    const response = await api.post(`/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration service error:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const AuthProvider = ({ children }) => {
  return children;
};
