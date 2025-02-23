import { useState, useEffect } from 'react';

export function useAuth() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token && userType) {
      setAuth({ token, userType });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Login logic
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setAuth(null);
  };

  return { auth, loading, login, logout };
}