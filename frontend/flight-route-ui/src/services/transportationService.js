// frontend/flight-route-ui/src/services/transportationService.js
import api from './api';

export const transportationService = {
  // Tüm ulaşımları getir (pagination ile)
  getAllTransportations: async (page = 0, size = 10) => {
    const response = await api.get(`/api/transportations?page=${page}&size=${size}`);
    return response;
  },

  // Tüm ulaşımları getir (arama için - pagination olmadan)
  getAllTransportationsForSearch: async () => {
    const response = await api.get('/api/transportations/all');
    return response;
  },

  // Ulaşım oluştur
  createTransportation: async (transportationData) => {
    const response = await api.post('/api/transportations', transportationData);
    return response;
  },

  // Ulaşım güncelle
  updateTransportation: async (id, transportationData) => {
    const response = await api.put(`/api/transportations/${id}`, transportationData);
    return response;
  },

  // Ulaşım sil
  deleteTransportation: async (id) => {
    await api.delete(`/api/transportations/${id}`);
  },

  // Lokasyonlara göre ulaşım ara (pagination ile)
  searchTransportations: async (originId, destinationId, page = 0, size = 10) => {
    const response = await api.get(`/api/transportations/search?originId=${originId}&destinationId=${destinationId}&page=${page}&size=${size}`);
    return response;
  },

  // Cache temizle
  clearCache: async () => {
    const response = await api.post('/api/transportations/cache/clear');
    return response;
  },

  // Tüm ulaşım tiplerini getir
  getAllTransportationTypes: async () => {
    const response = await api.get('/api/transportations/types');
    return response;
  }
};