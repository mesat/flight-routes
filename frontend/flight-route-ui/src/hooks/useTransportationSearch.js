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

export const useTransportationSearch = (transportations) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);

    // Mevcut ulaşım tiplerini al
    const availableTypes = useMemo(() => {
        const types = [...new Set(transportations.map(t => t.transportationType))];
        return types.sort();
    }, [transportations]);

    // Tag toggle fonksiyonu
    const toggleTypeFilter = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // Gelişmiş arama fonksiyonu - her kelime tam olarak eşleşmeli
    const matchesAdvancedSearch = (transport, searchWords) => {
        // Transport için tüm arama alanlarını ayrı ayrı tut
        const searchableFields = [
            transport.originLocation?.name || '',
            transport.originLocation?.city || '',
            transport.originLocation?.country || '',
            transport.originLocation?.locationCode || '',
            transport.destinationLocation?.name || '',
            transport.destinationLocation?.city || '',
            transport.destinationLocation?.country || '',
            transport.destinationLocation?.locationCode || '',
            transport.transportationType || ''
        ];

        // Her kelime için kontrol et
        return searchWords.every(searchWord => {
            const normalizedSearchWord = normalizeTurkishText(searchWord);
            
            // Her kelime en az bir alanda tam olarak eşleşmeli
            return searchableFields.some(field => {
                const normalizedField = normalizeTurkishText(field);
                return normalizedField.includes(normalizedSearchWord);
            });
        });
    };

    // Filtrelenmiş ve gruplandırılmış ulaşımlar
    const filteredAndGroupedTransportations = useMemo(() => {
        // Arama terimini boşluk karakteri ile böl ve boş olmayanları al
        const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
        
        let filtered = transportations.filter(transport => {
            // Eğer arama terimi yoksa tüm ulaşımları göster
            if (searchWords.length === 0) {
                return true;
            }

            // Gelişmiş arama kontrolü
            const matchesSearch = matchesAdvancedSearch(transport, searchWords);

            // Tip filtresi
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(transport.transportationType);

            return matchesSearch && matchesType;
        });

        // Ülke bazlı gruplandırma (başlangıç lokasyonunun ülkesine göre)
        const grouped = filtered.reduce((acc, transport) => {
            const country = transport.originLocation?.country || 'Bilinmeyen Ülke';
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(transport);
            return acc;
        }, {});

        // Ülkeleri alfabetik sırala
        return Object.keys(grouped)
            .sort()
            .reduce((acc, country) => {
                acc[country] = grouped[country].sort((a, b) => 
                    (a.originLocation?.name || '').localeCompare(b.originLocation?.name || '')
                );
                return acc;
            }, {});
    }, [transportations, searchTerm, selectedTypes]);

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedTypes([]);
    };

    return {
        searchTerm,
        setSearchTerm,
        selectedTypes,
        availableTypes,
        toggleTypeFilter,
        filteredAndGroupedTransportations,
        clearAllFilters,
        hasActiveFilters: searchTerm.length > 0 || selectedTypes.length > 0
    };
}; 