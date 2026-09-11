/**
 * context/AuthContext.jsx — Global auth state provider using React Context.
 *
 * Stores the logged-in user and JWT token. Persists state to localStorage so
 * the user remains logged in across page refreshes. Exposes login(), logout(),
 * and the current user object to any component in the tree.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// AuthProvider wraps the entire app and makes auth state globally accessible
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so state survives a page refresh
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rfq_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('rfq_token') || null);

  // Sync token changes to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('rfq_token', token);
    } else {
      localStorage.removeItem('rfq_token');
    }
  }, [token]);

  // Sync user changes to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('rfq_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rfq_user');
    }
  }, [user]);

  // Called after a successful login or signup API response
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  // Clears all auth state and redirects to login
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = {
    user,       // The full user object (name, email, role, _id)
    token,      // The raw JWT string
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for convenient access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
