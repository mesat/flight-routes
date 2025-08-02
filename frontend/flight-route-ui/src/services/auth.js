// frontend/flight-route-ui/src/services/auth.js
import api from './api';

// Basit JWT parse helper
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    // atob için URL-safe base64 düzeltmesi
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return {};
  }
}

// Login
export const login = async (username, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const { token } = await response.json();

    // ⬇️ userType'ı JWT payload'ından oku (role claim)
    const { role } = parseJwt(token);
    const userType = role || 'AGENCY'; // default — istersen boş bırak

    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);

    return { token, userType };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Token doğrulama (korunan bir endpointe ping atar)
export const validateToken = async (token) => {
  try {
    const resp = await fetch('/api/locations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return resp.ok;
  } catch (e) {
    console.error('Token validation error:', e);
    return false;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
};

export default { login, logout, validateToken };