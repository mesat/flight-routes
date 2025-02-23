import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import translations from './i18n/translations';

// Import components
import LocationsManagement from './components/locations/LocationsManagement';
import TransportationsManagement from './components/transportations/TransportationsManagement';
import RoutesManagement from './components/routes/RoutesManagement';

// Translations object
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
        errors: {
            loginFailed: 'Giriş başarısız',
            loadFailed: 'Veri yüklenemedi',
            deleteFailed: 'Silme işlemi başarısız',
            operationFailed: 'İşlem başarısız'
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
        errors: {
            loginFailed: 'Login failed',
            loadFailed: 'Failed to load data',
            deleteFailed: 'Failed to delete',
            operationFailed: 'Operation failed'
        }
    }
};

function App() {
    // States
    const [language, setLanguage] = useState('tr');
    const [currentPage, setCurrentPage] = useState('routes');
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Get translations for current language
    const t = translations[language];

    // Check for existing auth on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (token && userType) {
            setAuth({ token, userType });
        }
        setLoading(false);
    }, []);

    // Login handler
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || t.errors.loginFailed);

            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', data.userType);
            setAuth(data);
        } catch (err) {
            setLoginError(err.message);
        } finally {
            setLoginLoading(false);
        }
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setAuth(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    // Login form
    if (!auth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Card className="w-full max-w-md p-6">
                    <form onSubmit={handleLogin}>
                        <h1 className="text-2xl font-bold text-center mb-6">{t.auth.login}</h1>

                        {loginError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{loginError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">{t.auth.username}</label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">{t.auth.password}</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loginLoading}
                            >
                                {loginLoading ? t.auth.loggingIn : t.auth.login}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    const isAdmin = auth.userType === 'ADMIN';

    // Main application layout
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-sm">
                <div className="p-4">
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">{t.navigation.title}</h2>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                        >
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <nav className="space-y-2">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setCurrentPage('locations')}
                                    className={`w-full text-left px-4 py-2 rounded ${
                                        currentPage === 'locations' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {t.navigation.locations}
                                </button>
                                <button
                                    onClick={() => setCurrentPage('transportations')}
                                    className={`w-full text-left px-4 py-2 rounded ${
                                        currentPage === 'transportations' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {t.navigation.transportations}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setCurrentPage('routes')}
                            className={`w-full text-left px-4 py-2 rounded ${
                                currentPage === 'routes' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                            }`}
                        >
                            {t.navigation.routes}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <h1 className="text-xl font-semibold">
                        {t.navigation[currentPage]}
                    </h1>
                    <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {auth.userType === 'ADMIN' ? t.auth.administrator : t.auth.agencyUser}
            </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            {t.auth.logout}
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    <Card className="p-6">
                        {currentPage === 'locations' && isAdmin && (
                            <LocationsManagement t={t} />
                        )}

                        {currentPage === 'transportations' && isAdmin && (
                            <TransportationsManagement t={t} />
                        )}

                        {currentPage === 'routes' && (
                            <RoutesManagement t={t} />
                        )}
                    </Card>
                </main>
            </div>
        </div>
    );
}

export default App;