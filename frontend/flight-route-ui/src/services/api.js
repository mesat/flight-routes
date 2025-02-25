import { logout } from './auth';

// Base fetch function with auth token
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const fetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication error:', response.status);
      logout();
      // Optionally redirect to login
      // window.location.reload();
      throw new Error('Authentication failed. Please login again.');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
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

export default {
  fetchWithAuth,
  get,
  post,
  put,
  delete: del
};