import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RouteSearchForm from './RouteSearchForm';
import RoutesList from './RoutesList';

function RoutesManagement({ t }) {
    const [locations, setLocations] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchData, setSearchData] = useState({
        originLocationCode: '',
        destinationLocationCode: '',
        date: new Date().toISOString().split('T')[0]
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

    const handleSearch = async () => {
        // Validate same location
        if (searchData.originLocationCode === searchData.destinationLocationCode) {
            setError(t.routes.sameLocationError);
            return;
        }

        setLoading(true);
        setError('');
        setRoutes([]);

        try {
            const response = await fetch('/api/routes/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(searchData)
            });

            if (!response.ok) throw new Error(t.errors.searchFailed);

            const data = await response.json();
            // Sort routes by number of segments (direct flights first)
            setRoutes(data.sort((a, b) => {
                const segmentsA = [a.beforeFlight, a.flight, a.afterFlight].filter(Boolean).length;
                const segmentsB = [b.beforeFlight, b.flight, b.afterFlight].filter(Boolean).length;
                return segmentsA - segmentsB;
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">{t.routes.searchTitle}</h2>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <RouteSearchForm
                locations={locations}
                searchData={searchData}
                setSearchData={setSearchData}
                onSearch={handleSearch}
                loading={loading}
                t={t}
            />

            {routes.length > 0 && (
                <div>
                    <h3 className="text-md font-medium mb-4">
                        {t.routes.foundRoutes}: {routes.length}
                    </h3>
                    <RoutesList
                        routes={routes}
                        t={t}
                    />
                </div>
            )}
        </div>
    );
}

export default RoutesManagement;