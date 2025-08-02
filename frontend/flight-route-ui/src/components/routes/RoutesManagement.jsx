import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RouteSearchForm from './RouteSearchForm';
import RoutesList from './RoutesList';
import { useLanguage } from '../../contexts/LanguageContext';
import { locationService } from '../../services/locationService';
import api, { getAlternativeDays } from '../../services/api';

function RoutesManagement() {
  const { t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [alternativeDays, setAlternativeDays] = useState([]);
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
      setLoading(true);
      setError('');
      
      // Tüm lokasyonları al (pagination olmadan)
      const response = await locationService.getAllLocations(0, 1000);
      
      // Response kontrolü
      if (!response) {
        throw new Error('API response is empty');
      }
      
      // content property kontrolü
      const locationsData = response.content || response || [];
      
      if (!Array.isArray(locationsData)) {
        throw new Error('Locations data is not an array');
      }
      
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err.message || t.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  // Gün numarasını gün adına çevir
  const getDayName = (dayNumber) => {
    const dayNames = {
      1: t.common.monday,
      2: t.common.tuesday,
      3: t.common.wednesday,
      4: t.common.thursday,
      5: t.common.friday,
      6: t.common.saturday,
      7: t.common.sunday
    };
    return dayNames[dayNumber] || `Day ${dayNumber}`;
  };

  // Alternatif günleri formatla
  const formatAlternativeDays = (days) => {
    if (!days || days.length === 0) return '';
    
    const dayNames = days.map(day => getDayName(day));
    
    if (dayNames.length === 1) {
      return dayNames[0];
    } else if (dayNames.length === 2) {
      return `${dayNames[0]} ${t.common.and} ${dayNames[1]}`;
    } else {
      const lastDay = dayNames.pop();
      return `${dayNames.join(', ')} ${t.common.and} ${lastDay}`;
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
    setAlternativeDays([]);

    try {
      const response = await api.post('/api/routes/search', searchData);
      setRoutes(response);
      
      // Eğer rota bulunamadıysa alternatif günleri kontrol et
      if (!response || response.length === 0) {
        const alternativeDaysResponse = await getAlternativeDays(searchData);
        setAlternativeDays(alternativeDaysResponse);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">{t.routes.title}</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{t.common.error}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <RouteSearchForm 
          locations={locations}
          searchData={searchData}
          setSearchData={setSearchData}
          onSearch={handleSearch}
          loading={loading}
        />
      )}

      {hasSearched && !loading && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-4">
            {routes.length > 0 ? t.routes.foundRoutes : t.routes.noRoutes}
          </h3>
          
          {routes.length > 0 && (
            <RoutesList routes={routes} />
          )}
          
          {routes.length === 0 && alternativeDays.length > 0 && (
            <Alert className="mb-4">
              <AlertTitle>{t.routes.alternativeDaysTitle}</AlertTitle>
              <AlertDescription>
                {t.routes.alternativeDaysMessage.replace('{days}', formatAlternativeDays(alternativeDays))}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

export default RoutesManagement;