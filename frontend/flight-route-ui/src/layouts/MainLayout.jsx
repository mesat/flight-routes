import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import Header from './Header';
import Sidebar from './Sidebar';
import LocationsManagement from '../components/locations/LocationsManagement';
import TransportationsManagement from '../components/transportations/TransportationsManagement';
import RoutesManagement from '../components/routes/RoutesManagement';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth.jsx'; // Eksik olan import eklendi

function MainLayout() {
  const { t } = useLanguage();
  const { isAdmin, auth, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('routes');
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col">
        <Header
          currentPage={currentPage}
          auth={auth}
          onLogout={logout}
        />
        <main className="flex-1 p-6">
          <Card className="p-6">
            {currentPage === 'locations' && isAdmin && (
              <LocationsManagement />
            )}
            {currentPage === 'transportations' && isAdmin && (
              <TransportationsManagement />
            )}
            {currentPage === 'routes' && (
              <RoutesManagement />
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;