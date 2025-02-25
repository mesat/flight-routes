import api from './api';

// Login function
export const login = async (username, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const userData = await response.json();
    
    // Store token and user type in localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userType', userData.userType);
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Validate token function
export const validateToken = async (token) => {
  try {
    // Make a simple request to a protected endpoint
    const response = await fetch('/api/locations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
};

export default {
  login,
  logout,
  validateToken
};