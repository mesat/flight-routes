import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TransportationsList from './TransportationsList';
import TransportationForm from './TransportationForm';

function TransportationsManagement({ t }) {
  const [transportations, setTransportations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState(null);
  const [formData, setFormData] = useState({
    originLocationId: '',
    destinationLocationId: '',
    transportationType: 'FLIGHT',
    operatingDays: []
  });

  useEffect(() => {
    fetchLocations();
    fetchTransportations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t.errors.loadFailed);
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTransportations = async () => {
    try {
      const response = await fetch('/api/transportations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t.errors.loadFailed);
      const data = await response.json();
      setTransportations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate same location
    if (formData.originLocationId === formData.destinationLocationId) {
      setError(t.transportations.sameLocationError);
      return;
    }

    // Validate operating days
    if (formData.operatingDays.length === 0) {
      setError(t.transportations.selectDays);
      return;
    }

    try {
      const url = editingTransportation 
        ? `/api/transportations/${editingTransportation.id}`
        : '/api/transportations';
        
      const method = editingTransportation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(t.errors.operationFailed);

      await fetchTransportations();
      setIsDialogOpen(false);
      setFormData({
        originLocationId: '',
        destinationLocationId: '',
        transportationType: 'FLIGHT',
        operatingDays: []
      });
      setEditingTransportation(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.transportations.deleteConfirm)) return;
    
    try {
      const response = await fetch(`/api/transportations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t.errors.deleteFailed);
      await fetchTransportations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (transportation) => {
    setEditingTransportation(transportation);
    setFormData({
      originLocationId: transportation.originLocation.id,
      destinationLocationId: transportation.destinationLocation.id,
      transportationType: transportation.transportationType,
      operatingDays: transportation.operatingDays
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{t.transportations.management}</h2>
        <Button 
          onClick={() => {
            setEditingTransportation(null);
            setFormData({
              originLocationId: '',
              destinationLocationId: '',
              transportationType: 'FLIGHT',
              operatingDays: []
            });
            setIsDialogOpen(true);
          }}
        >
          {t.transportations.addTransportation}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TransportationsList 
        transportations={transportations}
        onEdit={handleEdit}
        onDelete={handleDelete}
        t={t}
      />

      <TransportationForm 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingTransportation={editingTransportation}
        locations={locations}
        t={t}
      />
    </div>
  );
}

export default TransportationsManagement;