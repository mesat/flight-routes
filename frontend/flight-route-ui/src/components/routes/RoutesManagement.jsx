import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RouteSearchForm from './RouteSearchForm';
import RoutesList from './RoutesList';
import { useLanguage } from '../../contexts/LanguageContext';

function RoutesManagement() {
  const { t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
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
    setHasSearched(true);

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
      setRoutes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">{t.routes.searchTitle}</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
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
      />

      {hasSearched && !loading && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-4">
            {routes.length > 0 ? t.routes.foundRoutes : t.routes.noRoutes}
          </h3>
          
          {routes.length > 0 && (
            <RoutesList routes={routes} />
          )}
        </div>
      )}
    </div>
  );
}

export default RoutesManagement;