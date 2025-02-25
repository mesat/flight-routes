import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { login as apiLogin, validateToken, logout as apiLogout } from '../services/auth';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (token && userType) {
        try {
          const isValid = await validateToken(token);
          if (isValid) {
            setAuth({ token, userType });
          } else {
            // Token invalid
            apiLogout();
          }
        } catch (error) {
          console.error('Auth validation error', error);
          apiLogout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const userData = await apiLogin(username, password);
      setAuth(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    apiLogout();
    setAuth(null);
  }, []);

  // Check if user is admin
  const isAdmin = auth?.userType === 'ADMIN';

  const value = {
    auth,
    loading,
    login,
    logout,
    isAdmin
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;