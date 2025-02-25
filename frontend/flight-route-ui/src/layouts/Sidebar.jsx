import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Sidebar({ currentPage, setCurrentPage, isAdmin }) {
  const { t, language, setLanguage } = useLanguage();

  return (
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
  );
}

export default Sidebar;