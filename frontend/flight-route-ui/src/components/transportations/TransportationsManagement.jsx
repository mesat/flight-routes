// frontend/flight-route-ui/src/components/transportations/TransportationsManagement.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { transportationService } from '../../services/transportationService';
import { locationService } from '../../services/locationService';
import TransportationsList from './TransportationsList';
import TransportationForm from './TransportationForm';
import Pagination from '../ui/pagination';

function TransportationsManagement() {
  const { t } = useLanguage();
  const [transportations, setTransportations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState(null);
  const [formData, setFormData] = useState({
    originLocationId: '',
    destinationLocationId: '',
    transportationType: '',
    operatingDays: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadLocations = async () => {
    try {
      const response = await locationService.getAllLocations(0, 1000);
      setLocations(response.content || []);
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  };

  const loadTransportations = async (page = 0, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportationService.getAllTransportations(page, size);
      setTransportations(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
    loadTransportations();
  }, []);

  const handleCreate = async (transportationData) => {
    try {
      await transportationService.createTransportation(transportationData);
      setIsDialogOpen(false);
      setFormData({ originLocationId: '', destinationLocationId: '', transportationType: '', operatingDays: [] });
      loadTransportations(currentPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.createFailed);
    }
  };

  const handleUpdate = async (transportationData) => {
    try {
      await transportationService.updateTransportation(editingTransportation.id, transportationData);
      setIsDialogOpen(false);
      setEditingTransportation(null);
      setFormData({ originLocationId: '', destinationLocationId: '', transportationType: '', operatingDays: [] });
      loadTransportations(currentPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.updateFailed);
    }
  };

  const handleDelete = async (id) => {
    try {
      await transportationService.deleteTransportation(id);
      loadTransportations(currentPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.deleteFailed);
    }
  };

  const handleEdit = (transportation) => {
    setEditingTransportation(transportation);
    setFormData({
      originLocationId: transportation.originLocation?.id || '',
      destinationLocationId: transportation.destinationLocation?.id || '',
      transportationType: transportation.transportationType || '',
      operatingDays: transportation.operatingDays || []
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransportation(null);
    setFormData({ originLocationId: '', destinationLocationId: '', transportationType: '', operatingDays: [] });
    setIsDialogOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTransportations(page, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    loadTransportations(0, newSize);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t.transportations.title}</h2>
        <Button onClick={handleAddNew} className="w-32">
          {t.transportations.add}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <TransportationsList
            transportations={transportations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
          />
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              totalElements={totalElements}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}

      <TransportationForm
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTransportation(null);
          setFormData({ originLocationId: '', destinationLocationId: '', transportationType: '', operatingDays: [] });
        }}
        onSubmit={editingTransportation ? handleUpdate : handleCreate}
        formData={formData}
        setFormData={setFormData}
        locations={locations}
        editingTransportation={editingTransportation}
        t={t}
      />
    </div>
  );
}

export default TransportationsManagement;