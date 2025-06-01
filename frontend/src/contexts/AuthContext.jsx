// File: frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('userToken') || null);
  const [loading, setLoading] = useState(true); // To handle initial auth state check

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUserInfo = localStorage.getItem('userInfo');

    if (storedToken && storedUserInfo) {
      setToken(storedToken);
      try {
        setCurrentUser(JSON.parse(storedUserInfo));
      } catch (e) {
        console.error("Failed to parse stored user info", e);
        // Clear invalid stored data
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        setToken(null);
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      setToken(data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const data = await authService.register({ name, email, password, role });
      setToken(data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
      return data;
    } catch (error) {
      console.error("Registration failed in AuthContext:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setToken(null);
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token, // Boolean indicating if user is authenticated
    loadingAuth: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};