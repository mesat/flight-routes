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
    locationCode: '',
    isAirport: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Arama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const loadLocations = async (page = 0, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isSearchMode && searchTerm.trim()) {
        // Arama modu
        console.log('Arama yapılıyor:', { searchTerm, page, size, isSearchMode });
        response = await locationService.searchLocations(searchTerm, page, size);
        console.log('Arama sonucu:', response);
      } else {
        // Normal mod
        console.log('Normal mod:', { page, size, isSearchMode });
        response = await locationService.getAllLocations(page, size);
        console.log('Normal sonuç:', response);
      }
      
      setLocations(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      console.error('Load locations error:', err);
      setError(err.response?.data?.message || t.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Arama modu değiştiğinde yeniden yükle
  useEffect(() => {
    loadLocations(currentPage, pageSize);
  }, [isSearchMode]);

  // Arama butonuna tıklandığında
  const handleSearch = () => {
    setIsSearchMode(true);
    setCurrentPage(0);
    loadLocations(0, pageSize);
  };

  // Aramayı temizle
  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setCurrentPage(0);
  };

  const handleCreate = async (locationData) => {
    try {
      await locationService.createLocation(locationData);
      setIsDialogOpen(false);
      setFormData({ name: '', country: '', city: '', locationCode: '', isAirport: false });
      loadLocations(currentPage, pageSize);
    } catch (err) {
      console.error('Create error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = t.errors.createFailed;
      
      // Validation hatalarını özel olarak işle
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.join('\n');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Alert olarak göster
      alert(errorMessage);
      
      // Eski hata state'ini de temizle
      setError(null);
    }
  };

  const handleUpdate = async (locationData) => {
    try {
      console.log('Updating location:', { id: editingLocation.id, locationData });
      await locationService.updateLocation(editingLocation.id, locationData);
      setIsDialogOpen(false);
      setEditingLocation(null);
      setFormData({ name: '', country: '', city: '', locationCode: '', isAirport: false });
      loadLocations(currentPage, pageSize);
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = t.errors.updateFailed;
      
      // Validation hatalarını özel olarak işle
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.join('\n');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Alert olarak göster
      alert(errorMessage);
      
      // Eski hata state'ini de temizle
      setError(null);
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
      locationCode: location.locationCode,
      isAirport: location.isAirport || false
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({ name: '', country: '', city: '', locationCode: '', isAirport: false });
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

      {/* Arama UI */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-700">{t.locations.searchAndFilter}</h3>
        
        {/* Arama Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={t.locations.searchLocations}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button 
            onClick={handleSearch}
            className="px-6 py-2"
            disabled={loading}
          >
            {t.locations.search}
          </Button>
          {(isSearchMode && searchTerm) && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="px-4 py-2"
            >
              {t.locations.clearSearch}
            </Button>
          )}
        </div>

        {/* Arama yardımı */}
        {searchTerm && (
          <div className="text-sm text-gray-600">
            <p>{t.locations.searchHelp}</p>
          </div>
        )}
      </div>

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
          setFormData({ name: '', country: '', city: '', locationCode: '', isAirport: false });
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