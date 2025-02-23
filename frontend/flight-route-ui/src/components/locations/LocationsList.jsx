import React from 'react';
import { Button } from '@mui/material'

function LocationsList({ locations, onEdit, onDelete, t }) {
    return (
        <div className="relative overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="text-xs bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.name}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.country}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.city}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.locations.code}</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">{t.locations.actions}</th>
                </tr>
                </thead>
                <tbody>
                {locations.map(location => (
                    <tr key={location.id} className="bg-white border-t hover:bg-gray-50">
                        <td className="px-6 py-4">{location.name}</td>
                        <td className="px-6 py-4">{location.country}</td>
                        <td className="px-6 py-4">{location.city}</td>
                        <td className="px-6 py-4">{location.locationCode}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(location)}
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
                            >
                                {t.locations.delete}
                            </Button>
                        </td>
                    </tr>
                ))}
                {locations.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {t.locations.noLocations}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default LocationsList;