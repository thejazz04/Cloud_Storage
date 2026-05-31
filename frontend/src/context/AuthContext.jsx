import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user data are cached in localStorage
    const cachedUser = localStorage.getItem('user');
    const cachedToken = localStorage.getItem('token');
    if (cachedUser && cachedToken) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        console.error('Failed to parse cached user data', err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password, role, departmentId) => {
    try {
      const response = await registerUser(name, email, password, role, departmentId);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped within AuthProvider');
  }
  return context;
};
