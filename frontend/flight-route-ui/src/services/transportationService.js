// frontend/flight-route-ui/src/services/transportationService.js
import api from './api';

/* ============================================================
   1) Listeleme
   ============================================================ */
export const getAllTransportations = async () => {
  return api.get('/api/transportations');
};

/* İsteğe bağlı filtre (originId & destId) */
export const getTransportationsByLocations = async (originId, destinationId) => {
  return api.get('/api/transportations', {
    params: { originId, destinationId }
  });
};

/* ============================================================
   2) Tekil sorgu
   ============================================================ */
export const getTransportationById = async (id) =>
  api.get(`/api/transportations/${id}`);

/* ============================================================
   3) Oluşturma
   ============================================================ */
export const createTransportation = async (transportationData) =>
  api.post('/api/transportations', transportationData);

/* ============================================================
   4) Güncelleme
   ============================================================ */
export const updateTransportation = async (id, transportationData) =>
  api.put(`/api/transportations/${id}`, transportationData);

/* ============================================================
   5) Silme
   ============================================================ */
export const deleteTransportation = async (id) =>
  api.delete(`/api/transportations/${id}`);

/* ============================================================
   Varsayılan toplu export
   ============================================================ */
export default {
  getAllTransportations,
  getTransportationsByLocations,
  getTransportationById,
  createTransportation,
  updateTransportation,
  deleteTransportation
};