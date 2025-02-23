import React from 'react';

function TransportationsList({ transportations, onEdit, onDelete, t }) {
    // Helper to format operating days
    const formatOperatingDays = (days) => {
        const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        return days.sort().map(day => dayNames[day - 1]).join(', ');
    };

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

    return (
        <div className="relative overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="text-xs bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 font-medium">{t.transportations.from}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.transportations.to}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.transportations.type}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t.transportations.operatingDays}</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">{t.transportations.actions}</th>
                </tr>
                </thead>
                <tbody>
                {transportations.map(transport => (
                    <tr key={transport.id} className="bg-white border-t hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div className="font-medium">{transport.originLocation.name}</div>
                            <div className="text-xs text-gray-500">{transport.originLocation.locationCode}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-medium">{transport.destinationLocation.name}</div>
                            <div className="text-xs text-gray-500">{transport.destinationLocation.locationCode}</div>
                        </td>
                        <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getTypeStyle(transport.transportationType)}`}>
                  {transport.transportationType}
                </span>
                        </td>
                        <td className="px-6 py-4">
                            {formatOperatingDays(transport.operatingDays)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(transport)}
                            >
                                {t.transportations.edit}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm(t.transportations.deleteConfirm)) {
                                        onDelete(transport.id);
                                    }
                                }}
                            >
                                {t.transportations.delete}
                            </Button>
                        </td>
                    </tr>
                ))}
                {transportations.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {t.transportations.noTransportations}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default TransportationsList;