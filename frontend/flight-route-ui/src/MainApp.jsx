import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import MainLayout from './layouts/MainLayout';
import LocationsManagement from './components/locations/LocationsManagement';
import TransportationsManagement from './components/transportations/TransportationsManagement';
import RoutesManagement from './components/routes/RoutesManagement';
import LoginForm from './features/auth/LoginForm';
import Loading from './components/ui/loading';
import { useAuth } from './hooks/useAuth';

function MainApp() {
  const { auth, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('routes');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'locations':
        return isAdmin ? <LocationsManagement /> : <div>Access Denied</div>;
      case 'transportations':
        return isAdmin ? <TransportationsManagement /> : <div>Access Denied</div>;
      case 'routes':
        return <RoutesManagement />;
      default:
        return <RoutesManagement />;
    }
  };

  // Loading durumunda spinner göster
  if (loading) {
    return <Loading />;
  }

  // Kullanıcı giriş yapmamışsa login ekranını göster
  if (!auth) {
    return <LoginForm />;
  }

  // Kullanıcı giriş yapmışsa ana uygulamayı göster
  return (
    <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
      <Card className="p-6">
        {renderContent()}
      </Card>
    </MainLayout>
  );
}

export default MainApp;