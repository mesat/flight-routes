import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { locationService } from '../../services/locationService';
import LocationsList from './LocationsList';
import LocationForm from './LocationForm';
import Pagination from '../ui/pagination';

function LocationsManagement() {
  const { t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    locationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadLocations = async (page = 0, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const response = await locationService.getAllLocations(page, size);
      setLocations(response.content);
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
  }, []);

  const handleCreate = async (locationData) => {
    try {
      await locationService.createLocation(locationData);
      setIsDialogOpen(false);
      setFormData({ name: '', country: '', city: '', locationCode: '' });
      loadLocations(currentPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.createFailed);
    }
  };

  const handleUpdate = async (locationData) => {
    try {
      await locationService.updateLocation(editingLocation.id, locationData);
      setIsDialogOpen(false);
      setEditingLocation(null);
      setFormData({ name: '', country: '', city: '', locationCode: '' });
      loadLocations(currentPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.updateFailed);
    }
  };

  const handleDelete = async (id) => {
    try {
      await locationService.deleteLocation(id);
      loadLocations(currentPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || t.errors.deleteFailed);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      country: location.country,
      city: location.city,
      locationCode: location.locationCode
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({ name: '', country: '', city: '', locationCode: '' });
    setIsDialogOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadLocations(page, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    loadLocations(0, newSize);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t.locations.title}</h2>
        <Button onClick={handleAddNew} className="w-32">
          {t.locations.add}
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
          <LocationsList
            locations={locations}
            onEdit={handleEdit}
            onDelete={handleDelete}
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

      <LocationForm
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingLocation(null);
          setFormData({ name: '', country: '', city: '', locationCode: '' });
        }}
        onSubmit={editingLocation ? handleUpdate : handleCreate}
        formData={formData}
        setFormData={setFormData}
        editingLocation={editingLocation}
      />
    </div>
  );
}

export default LocationsManagement;