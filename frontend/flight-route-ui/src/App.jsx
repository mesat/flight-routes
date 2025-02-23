import { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginForm from './features/auth/LoginForm';
import MainLayout from './layouts/MainLayout';
import LocationsManagement from './components/locations/LocationsManagement';
import TransportationsManagement from './components/transportations/TransportationsManagement';
import RoutesManagement from './components/routes/RoutesManagement';
import './App.css'
function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('routes');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token && userType) {
      setAuth({ token, userType });
    }
    setLoading(false);
  }, []);

  const handleLogin = async (username, password) => {
    // Login logic burada olacak.
  };

  const handleLogout = () => {
    // Logout logic burada olacak.
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <LanguageProvider>
      {!auth ? (
        <LoginForm 
          onLogin={handleLogin} 
          error={loginError} 
          loading={loginLoading} 
        />
      ) : (
        <MainLayout onLogout={handleLogout}>
          {currentPage === 'locations' && auth.userType === 'ADMIN' && <LocationsManagement />}
          {currentPage === 'transportations' && auth.userType === 'ADMIN' && <TransportationsManagement />}
          {currentPage === 'routes' && <RoutesManagement />}
        </MainLayout>
      )}
    </LanguageProvider>
  );
}

export default App;