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
    const response = await api.post('/api/auth/login', { username, password });

    // ⬇️ userType'ı JWT payload'ından oku (role claim)
    const { role } = parseJwt(response.token);
    const userType = role || 'AGENCY'; // default — istersen boş bırak

    localStorage.setItem('token', response.token);
    localStorage.setItem('userType', userType);

    return { token: response.token, userType };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Token doğrulama (basit kontrol)
export const validateToken = async (token) => {
  try {
    // Token'ın varlığını kontrol et
    if (!token) {
      return false;
    }
    
    // JWT token'ın süresini kontrol et
    const payload = parseJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token expired');
      return false;
    }
    
    return true;
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