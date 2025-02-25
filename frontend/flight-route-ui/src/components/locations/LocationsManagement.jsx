import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LocationsList from './LocationsList';
import LocationForm from './LocationForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllLocations, createLocation, updateLocation, deleteLocation } from '../../services/locationService';

function LocationsManagement() {
  const { t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    locationCode: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await getAllLocations();
      setLocations(data);
    } catch (err) {
      setError(err.message || t.errors.loadFailed);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
      } else {
        await createLocation(formData);
      }

      await fetchLocations();
      setIsDialogOpen(false);
      setFormData({
        name: '',
        country: '',
        city: '',
        locationCode: ''
      });
      setEditingLocation(null);
    } catch (err) {
      setError(err.message || t.errors.operationFailed);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLocation(id);
      await fetchLocations();
    } catch (err) {
      setError(err.message || t.errors.deleteFailed);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData(location);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{t.locations.management}</h2>
        <Button 
          onClick={() => {
            setEditingLocation(null);
            setFormData({
              name: '',
              country: '',
              city: '',
              locationCode: ''
            });
            setIsDialogOpen(true);
          }}
        >
          {t.locations.addLocation}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <LocationsList 
        locations={locations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <LocationForm 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingLocation={editingLocation}
      />
    </div>
  );
}

export default LocationsManagement;