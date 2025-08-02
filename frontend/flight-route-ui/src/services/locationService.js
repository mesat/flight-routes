import api from './api';

export const locationService = {
  // Tüm lokasyonları getir (pagination ile)
  getAllLocations: async (page = 0, size = 10) => {
    const response = await api.get(`/api/locations?page=${page}&size=${size}`);
    return response;
  },

  // Lokasyon oluştur
  createLocation: async (locationData) => {
    const response = await api.post('/api/locations', locationData);
    return response;
  },

  // Lokasyon güncelle
  updateLocation: async (id, locationData) => {
    const response = await api.put(`/api/locations/${id}`, locationData);
    return response;
  },

  // Lokasyon sil
  deleteLocation: async (id) => {
    await api.delete(`/api/locations/${id}`);
  },

  // Koda göre lokasyon getir
  getLocationByCode: async (code) => {
    const response = await api.get(`/api/locations/${code}`);
    return response;
  }
};