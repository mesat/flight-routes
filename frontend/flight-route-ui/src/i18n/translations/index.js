const translations = {
    tr: {
        navigation: {
            title: 'Navigasyon',
            locations: 'Lokasyonlar',
            transportations: 'Ulaşımlar',
            routes: 'Rotalar'
        },
        auth: {
            login: 'Giriş',
            username: 'Kullanıcı Adı',
            password: 'Şifre',
            loggingIn: 'Giriş yapılıyor...',
            administrator: 'Yönetici',
            agencyUser: 'Acente Kullanıcısı',
            logout: 'Çıkış'
        },
        locations: {
            management: 'Lokasyon Yönetimi',
            addLocation: 'Lokasyon Ekle',
            editLocation: 'Lokasyon Düzenle',
            name: 'İsim',
            country: 'Ülke',
            city: 'Şehir',
            code: 'Kod',
            actions: 'İşlemler',
            edit: 'Düzenle',
            delete: 'Sil',
            cancel: 'İptal',
            create: 'Oluştur',
            update: 'Güncelle',
            noLocations: 'Lokasyon bulunamadı',
            codeHelp: 'Havaalanları için 3 karakterli IATA kodu (örn: IST) veya şehir merkezleri için CC öneki kullanın (örn: CCIST)',
            deleteConfirm: 'Bu lokasyonu silmek istediğinize emin misiniz?'
        },
        transportations: {
            management: 'Ulaşım Yönetimi',
            addTransportation: 'Ulaşım Ekle',
            editTransportation: 'Ulaşım Düzenle',
            from: 'Nereden',
            to: 'Nereye',
            type: 'Tip',
            operatingDays: 'Çalışma Günleri',
            actions: 'İşlemler',
            edit: 'Düzenle',
            delete: 'Sil',
            cancel: 'İptal',
            create: 'Oluştur',
            update: 'Güncelle',
            noTransportations: 'Ulaşım bulunamadı',
            selectLocation: 'Lokasyon seçin',
            selectDays: 'En az bir gün seçmelisiniz',
            deleteConfirm: 'Bu ulaşımı silmek istediğinize emin misiniz?',
            sameLocationError: 'Başlangıç ve varış noktası aynı olamaz'
        },
        routes: {
            searchTitle: 'Rota Arama',
            from: 'Nereden',
            to: 'Nereye',
            date: 'Tarih',
            search: 'Ara',
            searching: 'Aranıyor...',
            selectLocation: 'Lokasyon seçin',
            noRoutes: 'Uygun rota bulunamadı',
            foundRoutes: 'Bulunan Rotalar',
            directFlight: 'Direkt Uçuş',
            withTransfer: 'Aktarmalı',
            sameLocationError: 'Başlangıç ve varış noktası aynı olamaz',
            transfer: 'Aktarma',
            flight: 'Uçuş',
            operatingDays: 'Sefer Günleri'
        },
        errors: {
            loginFailed: 'Giriş başarısız',
            loadFailed: 'Veri yüklenemedi',
            deleteFailed: 'Silme işlemi başarısız',
            operationFailed: 'İşlem başarısız',
            searchFailed: 'Arama başarısız'
        }
    },
    en: {
        navigation: {
            title: 'Navigation',
            locations: 'Locations',
            transportations: 'Transportations',
            routes: 'Routes'
        },
        auth: {
            login: 'Login',
            username: 'Username',
            password: 'Password',
            loggingIn: 'Logging in...',
            administrator: 'Administrator',
            agencyUser: 'Agency User',
            logout: 'Logout'
        },
        locations: {
            management: 'Locations Management',
            addLocation: 'Add Location',
            editLocation: 'Edit Location',
            name: 'Name',
            country: 'Country',
            city: 'City',
            code: 'Code',
            actions: 'Actions',
            edit: 'Edit',
            delete: 'Delete',
            cancel: 'Cancel',
            create: 'Create',
            update: 'Update',
            noLocations: 'No locations found',
            codeHelp: 'Use 3-letter IATA code for airports (e.g., IST) or CC prefix for city centers (e.g., CCIST)',
            deleteConfirm: 'Are you sure you want to delete this location?'
        },
        transportations: {
            management: 'Transportations Management',
            addTransportation: 'Add Transportation',
            editTransportation: 'Edit Transportation',
            from: 'From',
            to: 'To',
            type: 'Type',
            operatingDays: 'Operating Days',
            actions: 'Actions',
            edit: 'Edit',
            delete: 'Delete',
            cancel: 'Cancel',
            create: 'Create',
            update: 'Update',
            noTransportations: 'No transportations found',
            selectLocation: 'Select location',
            selectDays: 'You must select at least one day',
            deleteConfirm: 'Are you sure you want to delete this transportation?',
            sameLocationError: 'Origin and destination cannot be the same'
        },
        routes: {
            searchTitle: 'Route Search',
            from: 'From',
            to: 'To',
            date: 'Date',
            search: 'Search',
            searching: 'Searching...',
            selectLocation: 'Select location',
            noRoutes: 'No routes found',
            foundRoutes: 'Found Routes',
            directFlight: 'Direct Flight',
            withTransfer: 'With Transfer',
            sameLocationError: 'Origin and destination cannot be the same',
            transfer: 'Transfer',
            flight: 'Flight',
            operatingDays: 'Operating Days'
        },
        errors: {
            loginFailed: 'Login failed',
            loadFailed: 'Failed to load data',
            deleteFailed: 'Failed to delete',
            operationFailed: 'Operation failed',
            searchFailed: 'Search failed'
        }
    }
};

export default translations;