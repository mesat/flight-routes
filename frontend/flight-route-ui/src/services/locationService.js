import api from './api';

// Get all locations
export const getAllLocations = async () => {
  return api.get('/api/locations');
};

// Get location by ID
export const getLocationById = async (id) => {
  return api.get(`/api/locations/${id}`);
};

// Create a new location
export const createLocation = async (locationData) => {
  return api.post('/api/locations', locationData);
};

// Update a location
export const updateLocation = async (id, locationData) => {
  return api.put(`/api/locations/${id}`, locationData);
};

// Delete a location
export const deleteLocation = async (id) => {
  return api.delete(`/api/locations/${id}`);
};

export default {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
};