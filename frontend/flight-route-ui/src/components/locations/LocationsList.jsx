import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';

function LocationsList({ locations, onEdit, onDelete }) {
  const { t } = useLanguage();

  // Ülke bazlı gruplandırma
  const groupedLocations = locations.reduce((acc, location) => {
    const country = location.country;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(location);
    return acc;
  }, {});

  // Ülkeleri alfabetik sırala
  const sortedCountries = Object.keys(groupedLocations).sort();

  return (
    <div className="space-y-4">
      {/* Gruplandırılmış Lokasyonlar */}
      {sortedCountries.length > 0 ? (
        sortedCountries.map((country) => (
          <div key={country} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-semibold text-gray-800">{country}</h3>
              <p className="text-sm text-gray-600">{groupedLocations[country].length} lokasyon</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-full">
                <thead className="text-xs bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.locations.name}</th>
                    <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.locations.city}</th>
                    <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.locations.code}</th>
                    <th scope="col" className="px-3 lg:px-6 py-3 font-medium text-right">{t.locations.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedLocations[country].map(location => (
                    <tr key={location.id} className="bg-white border-t hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4">{location.name}</td>
                      <td className="px-3 lg:px-6 py-4">{location.city}</td>
                      <td className="px-3 lg:px-6 py-4 font-mono">{location.locationCode}</td>
                      <td className="px-3 lg:px-6 py-4 text-right space-x-1 lg:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(location)}
                          className="w-14 lg:w-16 xl:w-20 text-xs lg:text-sm"
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
                          className="w-14 lg:w-16 xl:w-20 text-xs lg:text-sm bg-red-600 hover:bg-red-700 text-white"
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
          {t.locations.noLocations}
        </div>
      )}
    </div>
  );
}

export default LocationsList;