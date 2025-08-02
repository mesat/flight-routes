import { useState, useMemo } from 'react';

// Türkçe karakterleri normalize eden fonksiyon
const normalizeTurkishText = (text) => {
    return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ğ/g, 'g')
        .replace(/Ü/g, 'u')
        .replace(/Ş/g, 's')
        .replace(/İ/g, 'i')
        .replace(/Ö/g, 'o')
        .replace(/Ç/g, 'c');
};

export const useLocationSearch = (locations) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrelenmiş ve gruplandırılmış lokasyonlar
    const filteredAndGroupedLocations = useMemo(() => {
        const normalizedSearchTerm = normalizeTurkishText(searchTerm);
        
        const filtered = locations.filter(location => 
            normalizeTurkishText(location.name).includes(normalizedSearchTerm) ||
            normalizeTurkishText(location.country).includes(normalizedSearchTerm) ||
            normalizeTurkishText(location.city).includes(normalizedSearchTerm) ||
            normalizeTurkishText(location.locationCode).includes(normalizedSearchTerm)
        );

        // Ülke bazlı gruplandırma
        const grouped = filtered.reduce((acc, location) => {
            const country = location.country;
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(location);
            return acc;
        }, {});

        // Ülkeleri alfabetik sırala
        return Object.keys(grouped)
            .sort()
            .reduce((acc, country) => {
                acc[country] = grouped[country].sort((a, b) => a.name.localeCompare(b.name));
                return acc;
            }, {});
    }, [locations, searchTerm]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    return {
        searchTerm,
        setSearchTerm,
        filteredAndGroupedLocations,
        clearSearch,
        hasActiveFilters: searchTerm.length > 0
    };
}; 