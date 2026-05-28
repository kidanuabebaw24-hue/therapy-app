import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresCBT, setRequiresCBT] = useState(false);
  const navigate = useNavigate();

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setRequiresCBT(userData.requiresCBT || false);
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Backend: { success, data: { user, token }, message }
      const payload = response.data?.data ?? response.data;
      const token = payload.token;
      const userData = payload.user ?? payload;

      if (!token) throw new Error('No token received');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...userData, token }));
      setUser({ ...userData, token });
      setRequiresCBT(userData.requiresCBT || false);

      toast.success('Login successful!');

      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else if (userData.role === 'client') {
        if (userData.requiresCBT && !userData.hasCompletedInitialCBT) {
          navigate('/cbt-exercises');
        } else {
          navigate('/client/dashboard');
        }
      } else {
        navigate('/client/dashboard');
      }

      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRequiresCBT(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const completeCBT = () => {
    setRequiresCBT(false);
    if (user) {
      const updated = { ...user, requiresCBT: false, hasCompletedInitialCBT: true };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, requiresCBT, login, logout, completeCBT, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
