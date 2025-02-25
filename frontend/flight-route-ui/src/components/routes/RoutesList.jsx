import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '../../contexts/LanguageContext';

function RoutesList({ routes }) {
  const { t } = useLanguage();

  // Helper for transport type styling
  const getTypeStyle = (type) => {
    const styles = {
      FLIGHT: 'bg-blue-100 text-blue-800',
      BUS: 'bg-green-100 text-green-800',
      SUBWAY: 'bg-purple-100 text-purple-800',
      UBER: 'bg-yellow-100 text-yellow-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  // Helper to format operating days
  const formatOperatingDays = (days) => {
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return days.sort().map(day => dayNames[day - 1]).join(', ');
  };

  return (
    <div className="space-y-4">
      {routes.map((route, index) => (
        <Card key={index} className="p-4">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{route.originLocationName} → {route.destinationLocationName}</h3>
              <p className="text-sm text-gray-500">
                {route.beforeFlight || route.afterFlight ? t.routes.withTransfer : t.routes.directFlight}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Before Flight (optional) */}
            {route.beforeFlight && (
              <div className="border-b pb-3">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getTypeStyle(route.beforeFlight.transportationType)}`}>
                    {t.routes.transfer}: {route.beforeFlight.transportationType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {t.routes.operatingDays}: {formatOperatingDays(route.beforeFlight.operatingDays)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{route.beforeFlight.originLocation.name}</div>
                    <div className="text-xs text-gray-500">{route.beforeFlight.originLocation.locationCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{route.beforeFlight.destinationLocation.name}</div>
                    <div className="text-xs text-gray-500">{route.beforeFlight.destinationLocation.locationCode}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Flight */}
            <div className={route.afterFlight ? "border-b pb-3" : ""}>
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getTypeStyle(route.flight.transportationType)}`}>
                  {t.routes.flight}: {route.flight.transportationType}
                </span>
                <span className="text-sm text-gray-600">
                  {t.routes.operatingDays}: {formatOperatingDays(route.flight.operatingDays)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">{route.flight.originLocation.name}</div>
                  <div className="text-xs text-gray-500">{route.flight.originLocation.locationCode}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{route.flight.destinationLocation.name}</div>
                  <div className="text-xs text-gray-500">{route.flight.destinationLocation.locationCode}</div>
                </div>
              </div>
            </div>

            {/* After Flight (optional) */}
            {route.afterFlight && (
              <div>
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getTypeStyle(route.afterFlight.transportationType)}`}>
                    {t.routes.transfer}: {route.afterFlight.transportationType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {t.routes.operatingDays}: {formatOperatingDays(route.afterFlight.operatingDays)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{route.afterFlight.originLocation.name}</div>
                    <div className="text-xs text-gray-500">{route.afterFlight.originLocation.locationCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{route.afterFlight.destinationLocation.name}</div>
                    <div className="text-xs text-gray-500">{route.afterFlight.destinationLocation.locationCode}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default RoutesList;