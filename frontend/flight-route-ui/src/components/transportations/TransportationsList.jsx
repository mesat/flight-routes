import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTransportationSearch } from '../../hooks/useTransportationSearch';

function TransportationsList({ transportations, allTransportations, onEdit, onDelete, t, onFilterChange }) {
    const {
        searchTerm,
        setSearchTerm,
        selectedTypes,
        setSelectedTypes,
        availableTypes,
        toggleTypeFilter,
        filteredAndGroupedTransportations,
        clearAllFilters,
        hasActiveFilters
    } = useTransportationSearch(allTransportations); // Tüm verileri kullan

    // Filtrelenmiş sonuçları parent'a bildir
    useEffect(() => {
        const allFiltered = Object.values(filteredAndGroupedTransportations).flat();
        onFilterChange?.(allFiltered, hasActiveFilters);
    }, [filteredAndGroupedTransportations, hasActiveFilters]); // onFilterChange dependency'sini kaldırdık

    // Helper to format operating days
    const formatOperatingDays = (days) => {
        if (!days || days.length === 0) return '-';
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
        <div className="space-y-4">
            {/* Arama ve Filtreleme */}
            <div className="space-y-3">
                {/* Arama Input */}
                <div className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder={t.transportations.searchTransportations}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                        >
                            {t.transportations.clearSearch}
                        </Button>
                    )}
                </div>

                {/* Arama Yardımı */}
                {searchTerm && (
                    <div className="text-sm text-gray-600">
                        <p>{t.transportations.searchHelp}</p>
                        <p className="mt-1 text-xs text-gray-500">
                            {t.transportations.searchExample}
                        </p>
                    </div>
                )}

                {/* Ulaşım Tipi Filtreleri - Arama butonunun üstünde, aynı style */}
                {availableTypes.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-3 text-gray-700">{t.transportations.filterByType}</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    setSelectedTypes([]);
                                    setSearchTerm('');
                                }}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    selectedTypes.length === 0 && searchTerm === ''
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {t.transportations.allTypes}
                            </button>
                            {availableTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleTypeFilter(type)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        selectedTypes.includes(type)
                                            ? `${getTypeStyle(type)} border-2 border-current`
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {t.transportationTypes[type] || type}
                                </button>
                            ))}
                        </div>
                        {selectedTypes.length > 0 && (
                            <div className="text-sm text-gray-600 mt-2">
                                {t.transportations.filteredBy}: <span className="font-medium">{selectedTypes.map(type => t.transportationTypes[type] || type).join(', ')}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Gruplandırılmış Ulaşımlar */}
            {Object.keys(filteredAndGroupedTransportations).length > 0 ? (
                Object.entries(filteredAndGroupedTransportations).map(([country, countryTransportations]) => (
                    <div key={country} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                            <h3 className="font-semibold text-gray-800">{country}</h3>
                            <p className="text-sm text-gray-600">{countryTransportations.length} ulaşım</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-full">
                                <thead className="text-xs bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.transportations.from}</th>
                                        <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.transportations.to}</th>
                                        <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.transportations.type}</th>
                                        <th scope="col" className="px-3 lg:px-6 py-3 font-medium">{t.transportations.operatingDays}</th>
                                        <th scope="col" className="px-3 lg:px-6 py-3 font-medium text-right">{t.transportations.actions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {countryTransportations.map(transport => (
                                        <tr key={transport.id} className="bg-white border-t hover:bg-gray-50">
                                            <td className="px-3 lg:px-6 py-4">
                                                <div className="font-medium">
                                                    {transport.originLocation?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {transport.originLocation?.city}, {transport.originLocation?.country} ({transport.originLocation?.locationCode})
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-6 py-4">
                                                <div className="font-medium">
                                                    {transport.destinationLocation?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {transport.destinationLocation?.city}, {transport.destinationLocation?.country} ({transport.destinationLocation?.locationCode})
                                                </div>
                                            </td>
                                            <td className="px-3 lg:px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(transport.transportationType)}`}>
                                                    {t.transportationTypes[transport.transportationType]}
                                                </span>
                                            </td>
                                            <td className="px-3 lg:px-6 py-4">
                                                {formatOperatingDays(transport.operatingDays)}
                                            </td>
                                            <td className="px-3 lg:px-6 py-4 text-right space-x-1 lg:space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(transport)}
                                                    className="w-14 lg:w-16 xl:w-20 text-xs lg:text-sm"
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
                                                    className="w-14 lg:w-16 xl:w-20 text-xs lg:text-sm bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    {t.transportations.delete}
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
                    {hasActiveFilters ? t.transportations.noTransportationsFound : t.transportations.noTransportations}
                </div>
            )}
        </div>
    );
}

export default TransportationsList;