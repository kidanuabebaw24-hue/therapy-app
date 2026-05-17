import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Changed from '../api/axios' to '../services/api'
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requiresCBT, setRequiresCBT] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setRequiresCBT(userData.requiresCBT || false);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setRequiresCBT(userData.requiresCBT || false);

            toast.success('Login successful!');

            // Check if client needs to complete CBT exercises
            if (userData.role === 'client' && userData.requiresCBT) {
                navigate('/cbt-exercises');
            } else if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (userData.role === 'therapist') {
                navigate('/therapist/dashboard');
            } else {
                navigate('/client/dashboard');
            }

            return true;
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
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

    const completeCBT = async () => {
        setRequiresCBT(false);
        if (user) {
            const updatedUser = { ...user, requiresCBT: false, hasCompletedInitialCBT: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        loading,
        requiresCBT,
        login,
        logout,
        completeCBT,
        setUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;