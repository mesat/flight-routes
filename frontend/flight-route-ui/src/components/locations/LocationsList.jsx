import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocationSearch } from '../../hooks/useLocationSearch';

function LocationsList({ locations, onEdit, onDelete }) {
  const { t } = useLanguage();
  const {
    searchTerm,
    setSearchTerm,
    filteredAndGroupedLocations,
    clearSearch,
    hasActiveFilters
  } = useLocationSearch(locations);

  return (
    <div className="space-y-4">
      {/* Arama Input */}
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder={t.locations.searchLocations}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearSearch}
          >
            {t.locations.clearSearch}
          </Button>
        )}
      </div>

      {/* Gruplandırılmış Lokasyonlar */}
      {Object.keys(filteredAndGroupedLocations).length > 0 ? (
        Object.entries(filteredAndGroupedLocations).map(([country, countryLocations]) => (
          <div key={country} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-semibold text-gray-800">{country}</h3>
              <p className="text-sm text-gray-600">{countryLocations.length} lokasyon</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.name}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.city}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.code}</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">{t.locations.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {countryLocations.map(location => (
                    <tr key={location.id} className="bg-white border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{location.name}</td>
                      <td className="px-6 py-4">{location.city}</td>
                      <td className="px-6 py-4 font-mono">{location.locationCode}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(location)}
                          className="w-16"
                        >
                          {t.locations.edit}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (window.confirm(t.locations.deleteConfirm)) {
                              onDelete(location.id);
                            }
                          }}
                          className="w-16"
                        >
                          {t.locations.delete}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          {hasActiveFilters ? t.locations.noLocationsFound : t.locations.noLocations}
        </div>
      )}
    </div>
  );
}

export default LocationsList;