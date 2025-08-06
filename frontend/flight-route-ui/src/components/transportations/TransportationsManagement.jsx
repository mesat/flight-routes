// frontend/flight-route-ui/src/components/transportations/TransportationsManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

  // Arama ve filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false); // Arama modu aktif mi?

  const loadLocations = async () => {
    try {
      const response = await locationService.getAllLocations(0, 1000);
      setLocations(response.content || []);
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  };

  const loadTransportationTypes = async () => {
    try {
      const response = await transportationService.getAllTransportationTypes();
      setAvailableTypes(response || []);
    } catch (err) {
      console.error('Error loading transportation types:', err);
    }
  };

  const loadTransportations = async (page = 0, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isSearchMode && (searchTerm.trim() || selectedTypes.length > 0)) {
        // Arama/filtreleme modu
        response = await transportationService.filterTransportations(searchTerm, selectedTypes, page, size);
      } else {
        // Normal mod
        response = await transportationService.getAllTransportations(page, size);
      }
      
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
    loadTransportationTypes();
    loadTransportations();
  }, []);

  // Arama modu değiştiğinde veya sayfa değiştiğinde yeniden yükle
  useEffect(() => {
    loadTransportations(currentPage, pageSize);
  }, [isSearchMode, currentPage, pageSize]);

  const handleCreate = async (transportationData) => {
    try {
      await transportationService.createTransportation(transportationData);
      setIsDialogOpen(false);
      setFormData({ originLocationId: '', destinationLocationId: '', transportationType: '', operatingDays: [] });
      loadTransportations(currentPage, pageSize);
    } catch (err) {
      console.error('Error creating transportation:', err);
      if (err?.message?.includes('Data Integrity Violation')){
        alert(t.transportations.already_exists) 
        setError(t.transportations.already_exists)
      }
      else
      setError(mess!==undefined ? mess : err.response?.data?.message || t.errors.createFailed);
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

  // Arama butonuna tıklandığında
  const handleSearch = () => {
    setIsSearchMode(true);
    setCurrentPage(0);
    loadTransportations(0, pageSize);
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setIsSearchMode(false);
    setCurrentPage(0);
  };

  // Ulaşım tipi seçimi
  const toggleTypeFilter = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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

      {/* Arama ve Filtreleme UI'ı */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-700">{t.transportations.searchAndFilter}</h3>
        
        {/* Arama Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={t.transportations.searchTransportations}
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
            {t.transportations.search}
          </Button>
          {(isSearchMode && (searchTerm || selectedTypes.length > 0)) && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="px-4 py-2"
            >
              {t.transportations.clearSearch}
            </Button>
          )}
        </div>

        {/* Ulaşım Tipi Filtreleri */}
        {availableTypes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">{t.transportations.filterByType}</h4>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedTypes.includes(type)
                      ? 'bg-blue-600 text-white border-2 border-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-transparent'
                  }`}
                >
                  {t.transportationTypes[type] || type}
                </button>
              ))}
            </div>
            {selectedTypes.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                {t.transportations.filteredBy}: <span className="font-medium">
                  {selectedTypes.map(type => t.transportationTypes[type] || type).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Arama yardımı */}
        {searchTerm && (
          <div className="text-sm text-gray-600">
            <p>{t.transportations.searchHelp}</p>
          </div>
        )}
      </div>

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