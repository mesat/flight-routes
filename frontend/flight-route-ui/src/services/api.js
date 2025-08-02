import { logout } from './auth';

// Base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Base fetch function with auth token
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Ensure URL starts with http/https or is relative
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  const fetchOptions = {
    ...options,
    credentials: 'include', // Include cookies for CORS
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  try {
    console.log('Making request to:', fullUrl);
    const response = await fetch(fullUrl, fetchOptions);
    
    // Handle CORS errors
    if (response.type === 'opaque' || response.status === 0) {
      throw new Error('CORS error: Unable to access the API. Please check if the backend is running and CORS is configured.');
    }
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication error:', response.status);
      logout();
      throw new Error('Authentication failed. Please login again.');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

// GET request
export const get = async (url) => {
  const response = await fetchWithAuth(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `GET request failed: ${response.status}`);
  }
  
  return response.json();
};

// POST request
export const post = async (url, data) => {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `POST request failed: ${response.status}`);
  }
  
  return response.json();
};

// PUT request
export const put = async (url, data) => {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `PUT request failed: ${response.status}`);
  }
  
  return response.json();
};

// DELETE request
export const del = async (url) => {
  const response = await fetchWithAuth(url, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `DELETE request failed: ${response.status}`);
  }
  
  return response.ok;
};

// Helper function to get alternative days
export const getAlternativeDays = async (searchData) => {
  try {
    const response = await post('/api/routes/alternative-days', searchData);
    return response;
  } catch (error) {
    console.error('Error getting alternative days:', error);
    return [];
  }
};

export default {
  fetchWithAuth,
  get,
  post,
  put,
  delete: del,
  getAlternativeDays
};