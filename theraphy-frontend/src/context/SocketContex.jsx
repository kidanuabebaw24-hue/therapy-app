import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getCurrentUser } from '../services/auth';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

const resolveSocketUrl = () => {
  const configured = import.meta.env.VITE_SOCKET_URL;
  if (configured) return configured.replace(/\/$/, '');

  const api = import.meta.env.VITE_API_URL || '';
  if (api.endsWith('/api')) return api.slice(0, -4);
  return 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectAttempt, setConnectAttempt] = useState(0);

  const reconnect = useCallback(() => {
    setConnectAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    const token = localStorage.getItem('token') || user?.token;

    if (!token) {
      setConnectionError('Not signed in');
      return undefined;
    }

    const SOCKET_URL = resolveSocketUrl();

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 20000,
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      const uid = getCurrentUser()?.id;
      if (uid) {
        newSocket.emit('join', uid);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connect_error:', error.message);
      setIsConnected(false);
      setConnectionError(error.message);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [connectAttempt]);

  const value = {
    socket,
    isConnected,
    connectionError,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
