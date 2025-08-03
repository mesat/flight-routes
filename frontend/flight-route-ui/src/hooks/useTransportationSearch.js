import { useState, useMemo } from 'react';

// Türkçe karakterleri normalize eden fonksiyon - iyileştirildi
const normalizeTurkishText = (text) => {
    if (!text) return '';
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
        .replace(/Ç/g, 'c')
        .replace(/i̇/g, 'i') // İ harfinin küçük hali için
        .replace(/I/g, 'i') // Büyük I harfi için
        .replace(/ı/g, 'i'); // Küçük ı harfi için
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

    // Gelişmiş arama fonksiyonu - hem origin hem destination'da arama yapacak şekilde güncellendi
    const matchesAdvancedSearch = (transport, searchWords) => {
        // Origin ve destination için ayrı ayrı arama alanları
        const originFields = [
            transport.originLocation?.name || '',
            transport.originLocation?.city || '',
            transport.originLocation?.country || '',
            transport.originLocation?.locationCode || ''
        ];

        const destinationFields = [
            transport.destinationLocation?.name || '',
            transport.destinationLocation?.city || '',
            transport.destinationLocation?.country || '',
            transport.destinationLocation?.locationCode || ''
        ];

        const transportationType = transport.transportationType || '';

        // Origin ve destination için ayrı ayrı metin oluştur
        const originText = originFields.join(' ').toLowerCase();
        const destinationText = destinationFields.join(' ').toLowerCase();
        const normalizedOriginText = normalizeTurkishText(originText);
        const normalizedDestinationText = normalizeTurkishText(destinationText);
        const normalizedTransportationType = normalizeTurkishText(transportationType);

        // Arama terimini normalize et
        const normalizedSearchTerm = normalizeTurkishText(searchWords.join(' '));

        // Her kelime için hem origin hem destination'da arama yap
        // Kullanıcı "İstanbul" yazdığında hem origin hem destination'da İstanbul olan ulaşımları görmek istiyor
        return searchWords.some(searchWord => {
            const normalizedSearchWord = normalizeTurkishText(searchWord);
            
            // Origin'de veya destination'da veya transportation type'da eşleşme var mı?
            return normalizedOriginText.includes(normalizedSearchWord) ||
                   normalizedDestinationText.includes(normalizedSearchWord) ||
                   normalizedTransportationType.includes(normalizedSearchWord);
        });
    };

    // Filtrelenmiş ve gruplandırılmış ulaşımlar
    const filteredAndGroupedTransportations = useMemo(() => {
        // Arama terimini boşluk karakteri ile böl ve boş olmayanları al
        const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
        
        let filtered = transportations.filter(transport => {
            // Tip filtresi kontrolü
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(transport.transportationType);
            
            // Eğer tip filtresi yoksa ve arama terimi de yoksa tüm ulaşımları göster
            if (searchWords.length === 0) {
                return matchesType;
            }

            // Arama kontrolü
            const matchesSearch = matchesAdvancedSearch(transport, searchWords);

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
        setSelectedTypes,
        availableTypes,
        toggleTypeFilter,
        filteredAndGroupedTransportations,
        clearAllFilters,
        hasActiveFilters: searchTerm.length > 0 || selectedTypes.length > 0
    };
}; 