import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  
  // Filtreleme state'leri
  const [filters, setFilters] = useState({
    originTransportTypes: [],
    destinationTransportTypes: [],
    originAirports: [],
    destinationAirports: []
  });
  
  const [searchData, setSearchData] = useState({
    originLocationCode: '',
    destinationLocationCode: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Mevcut filtreleri hesapla
  const availableFilters = useMemo(() => {
    if (!routes || routes.length === 0) return { 
      originTypes: [], 
      destinationTypes: [], 
      originAirports: [],
      destinationAirports: []
    };

    const originTypes = new Set();
    const destinationTypes = new Set();
    const originAirports = new Set();
    const destinationAirports = new Set();

    routes.forEach(route => {
      // Origin transport types (flight hariç)
      if (route.beforeFlight) {
        if (route.beforeFlight.transportationType !== 'FLIGHT') {
          originTypes.add(route.beforeFlight.transportationType);
        }
        // Origin airport'ları
        if (route.beforeFlight.destinationLocation?.locationCode) {
          originAirports.add(route.beforeFlight.destinationLocation.locationCode);
        }
      }
      if (route.flight && route.flight.originLocation.locationCode !== searchData.originLocationCode) {
        if (route.flight.transportationType !== 'FLIGHT') {
          originTypes.add(route.flight.transportationType);
        }
        // Origin airport'ları
        if (route.flight.originLocation?.locationCode) {
          originAirports.add(route.flight.originLocation.locationCode);
        }
      }

      // Destination transport types (flight hariç)
      if (route.afterFlight) {
        if (route.afterFlight.transportationType !== 'FLIGHT') {
          destinationTypes.add(route.afterFlight.transportationType);
        }
        // Destination airport'ları
        if (route.afterFlight.originLocation?.locationCode) {
          destinationAirports.add(route.afterFlight.originLocation.locationCode);
        }
      }
      if (route.flight && route.flight.destinationLocation.locationCode !== searchData.destinationLocationCode) {
        if (route.flight.transportationType !== 'FLIGHT') {
          destinationTypes.add(route.flight.transportationType);
        }
        // Destination airport'ları
        if (route.flight.destinationLocation?.locationCode) {
          destinationAirports.add(route.flight.destinationLocation.locationCode);
        }
      }
    });

    return {
      originTypes: Array.from(originTypes),
      destinationTypes: Array.from(destinationTypes),
      originAirports: Array.from(originAirports),
      destinationAirports: Array.from(destinationAirports)
    };
  }, [routes, searchData]);

  // Filtrelenmiş rotaları hesapla
  const filteredRoutes = useMemo(() => {
    if (!routes || routes.length === 0) return [];

    return routes.filter(route => {
      // Origin transport type filter (flight hariç)
      if (filters.originTransportTypes.length > 0) {
        const hasMatchingOriginType = filters.originTransportTypes.some(type => {
          return (route.beforeFlight && route.beforeFlight.transportationType === type) ||
                 (route.flight && route.flight.transportationType === type);
        });
        if (!hasMatchingOriginType) return false;
      }

      // Destination transport type filter (flight hariç)
      if (filters.destinationTransportTypes.length > 0) {
        const hasMatchingDestinationType = filters.destinationTransportTypes.some(type => {
          return (route.afterFlight && route.afterFlight.transportationType === type) ||
                 (route.flight && route.flight.transportationType === type);
        });
        if (!hasMatchingDestinationType) return false;
      }

      // Origin airport filter
      if (filters.originAirports.length > 0) {
        const hasMatchingOriginAirport = filters.originAirports.some(airport => {
          return (route.beforeFlight && route.beforeFlight.destinationLocation?.locationCode === airport) ||
                 (route.flight && route.flight.originLocation?.locationCode === airport);
        });
        if (!hasMatchingOriginAirport) return false;
      }

      // Destination airport filter
      if (filters.destinationAirports.length > 0) {
        const hasMatchingDestinationAirport = filters.destinationAirports.some(airport => {
          return (route.afterFlight && route.afterFlight.originLocation?.locationCode === airport) ||
                 (route.flight && route.flight.destinationLocation?.locationCode === airport);
        });
        if (!hasMatchingDestinationAirport) return false;
      }

      return true;
    });
  }, [routes, filters]);

  // Filtre toggle fonksiyonları
  const toggleOriginTransportType = (type) => {
    setFilters(prev => ({
      ...prev,
      originTransportTypes: prev.originTransportTypes.includes(type)
        ? prev.originTransportTypes.filter(t => t !== type)
        : [...prev.originTransportTypes, type]
    }));
  };

  const toggleDestinationTransportType = (type) => {
    setFilters(prev => ({
      ...prev,
      destinationTransportTypes: prev.destinationTransportTypes.includes(type)
        ? prev.destinationTransportTypes.filter(t => t !== type)
        : [...prev.destinationTransportTypes, type]
    }));
  };

  const toggleOriginAirport = (airport) => {
    setFilters(prev => ({
      ...prev,
      originAirports: prev.originAirports.includes(airport)
        ? prev.originAirports.filter(a => a !== airport)
        : [...prev.originAirports, airport]
    }));
  };

  const toggleDestinationAirport = (airport) => {
    setFilters(prev => ({
      ...prev,
      destinationAirports: prev.destinationAirports.includes(airport)
        ? prev.destinationAirports.filter(a => a !== airport)
        : [...prev.destinationAirports, airport]
    }));
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      originTransportTypes: [],
      destinationTransportTypes: [],
      originAirports: [],
      destinationAirports: []
    });
  };

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
    // Arama yapıldığında filtreleri temizle
    clearFilters();

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

  // Transport type için stil helper
  const getTypeStyle = (type) => {
    const styles = {
      FLIGHT: 'bg-blue-100 text-blue-800',
      BUS: 'bg-green-100 text-green-800',
      SUBWAY: 'bg-purple-100 text-purple-800',
      UBER: 'bg-yellow-100 text-yellow-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
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
            {filteredRoutes.length > 0 ? t.routes.foundRoutes : t.routes.noRoutes}
          </h3>
          
          {/* Filtreleme UI'ı */}
          {routes.length > 0 && (
            <div className="mb-6">
              {/* Filtreler Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                {/* Origin Transport Types (Flight hariç) */}
                {availableFilters.originTypes.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 text-gray-700">{t.routes.originTransportTypes}</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.originTypes.map(type => (
                        <Badge
                          key={type}
                          variant={filters.originTransportTypes.includes(type) ? "outline" : "default"}
                          className={`cursor-pointer text-xs ${getTypeStyle(type)}`}
                          onClick={() => toggleOriginTransportType(type)}
                        >
                          {t.transportationTypes[type] || type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Destination Transport Types (Flight hariç) */}
                {availableFilters.destinationTypes.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 text-gray-700">{t.routes.destinationTransportTypes}</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.destinationTypes.map(type => (
                        <Badge
                          key={type}
                          variant={filters.destinationTransportTypes.includes(type) ? "outline" : "default"}
                          className={`cursor-pointer text-xs ${getTypeStyle(type)}`}
                          onClick={() => toggleDestinationTransportType(type)}
                        >
                          {t.transportationTypes[type] || type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Origin Airports */}
                {availableFilters.originAirports.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 text-blue-700">{t.routes.originAirports}</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.originAirports.map(airport => (
                        <Badge
                          key={airport}
                          variant={filters.originAirports.includes(airport) ? "outline" : "default"}
                          className="cursor-pointer text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                          onClick={() => toggleOriginAirport(airport)}
                        >
                          {t.locations[airport] || airport}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Destination Airports */}
                {availableFilters.destinationAirports.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 text-blue-700">{t.routes.destinationAirports}</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.destinationAirports.map(airport => (
                        <Badge
                          key={airport}
                          variant={filters.destinationAirports.includes(airport) ? "outline" : "default"}
                          className="cursor-pointer text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                          onClick={() => toggleDestinationAirport(airport)}
                        >
                          {t.locations[airport] || airport}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(filters.originTransportTypes.length > 0 || 
                filters.destinationTransportTypes.length > 0 || 
                filters.originAirports.length > 0 ||
                filters.destinationAirports.length > 0) && (
                <div className="flex justify-center">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t.routes.clearFilters}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {filteredRoutes.length > 0 && (
            <RoutesList routes={filteredRoutes} />
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