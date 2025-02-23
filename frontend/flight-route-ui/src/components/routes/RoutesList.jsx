import React from 'react';
import { Card } from '@mui/material';

function RoutesList({ routes, t }) {
    // Helper function to get icon for transportation type
    const getTransportIcon = (type) => {
        switch (type) {
            case 'FLIGHT':
                return '✈️';
            case 'BUS':
                return '🚌';
            case 'SUBWAY':
                return '🚇';
            case 'UBER':
                return '🚗';
            default:
                return '🚊';
        }
    };

    if (routes.length === 0) {
        return (
            <Card className="p-6 text-center text-gray-500">
                {t.routes.noRoutes}
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {routes.map((route, index) => (
                <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-medium">
                            {route.originLocationName} → {route.destinationLocationName}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Before Flight Transfer */}
                        {route.beforeFlight && (
                            <div className="flex items-center space-x-2">
                                <span>{getTransportIcon(route.beforeFlight.transportationType)}</span>
                                <div className="text-sm">
                                    <div className="font-medium">
                                        {route.beforeFlight.originLocation.name} → {route.beforeFlight.destinationLocation.name}
                                    </div>
                                    <div className="text-gray-500">
                                        {route.beforeFlight.transportationType}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Flight */}
                        {route.flight && (
                            <div className="flex items-center space-x-2">
                                {route.beforeFlight && <div className="text-gray-300">→</div>}
                                <span>{getTransportIcon('FLIGHT')}</span>
                                <div className="text-sm">
                                    <div className="font-medium">
                                        {route.flight.originLocation.name} → {route.flight.destinationLocation.name}
                                    </div>
                                    <div className="text-gray-500">
                                        FLIGHT
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* After Flight Transfer */}
                        {route.afterFlight && (
                            <div className="flex items-center space-x-2">
                                <div className="text-gray-300">→</div>
                                <span>{getTransportIcon(route.afterFlight.transportationType)}</span>
                                <div className="text-sm">
                                    <div className="font-medium">
                                        {route.afterFlight.originLocation.name} → {route.afterFlight.destinationLocation.name}
                                    </div>
                                    <div className="text-gray-500">
                                        {route.afterFlight.transportationType}
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