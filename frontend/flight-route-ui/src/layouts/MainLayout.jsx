import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from './Header';
import Sidebar from './Sidebar';

function MainLayout({ children, currentPage, onPageChange }) {
  const { t } = useLanguage();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'routes':
        return t.navigation.routes;
      case 'locations':
        return t.navigation.locations;
      case 'transportations':
        return t.navigation.transportations;
      default:
        return t.navigation.routes;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={getPageTitle()} />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;