import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Header({ currentPage, auth, onLogout }) {
  const { t } = useLanguage();

  // Defensive check for auth
  if (!auth) {
    return (
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">
          {t.navigation[currentPage] || 'Navigation'}
        </h1>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">
        {t.navigation[currentPage] || 'Navigation'}
      </h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {auth.userType === 'ADMIN' ? t.auth.administrator : t.auth.agencyUser}
        </span>
        <button
          onClick={onLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          {t.auth.logout}
        </button>
      </div>
    </header>
  );
}

export default Header;