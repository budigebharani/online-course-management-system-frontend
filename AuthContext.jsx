import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ocms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ocms_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify and sync user profile on mount if token is saved
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ocms_token');
      if (savedToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('ocms_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Token verification failed on startup:', err.message);
          // Only clear if 401 error
          if (err.message.includes('Invalid') || err.message.includes('expired')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('ocms_token', receivedToken);
      localStorage.setItem('ocms_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password, role = 'student') => {
    const res = await axiosClient.post('/auth/register', { name, email, password, role });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('ocms_token', receivedToken);
      localStorage.setItem('ocms_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ocms_token');
    localStorage.removeItem('ocms_user');
  };

  // Update user in state and storage
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('ocms_user', JSON.stringify(merged));
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('ocms_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
