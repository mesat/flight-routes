import React, { useState, useEffect } from 'react';
import LocationsList from './LocationsList';
import LocationForm from './LocationForm';

function LocationsManagement({ t }) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const url = editingLocation
                ? `/api/locations/${editingLocation.id}`
                : '/api/locations';

            const method = editingLocation ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error(t.errors.operationFailed);

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
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/locations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error(t.errors.deleteFailed);
            await fetchLocations();
        } catch (err) {
            setError(err.message);
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
                t={t}
            />

            <LocationForm
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                editingLocation={editingLocation}
                t={t}
            />
        </div>
    );
}

export default LocationsManagement;