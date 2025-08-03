import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { Route, MapPin, Truck } from 'lucide-react';

function Sidebar({ currentPage, onPageChange }) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const navigation = [
    {
      name: t.navigation.routes,
      href: 'routes',
      icon: Route,
      current: currentPage === 'routes',
      accessible: true
    },
    {
      name: t.navigation.locations,
      href: 'locations',
      icon: MapPin,
      current: currentPage === 'locations',
      accessible: isAdmin
    },
    {
      name: t.navigation.transportations,
      href: 'transportations',
      icon: Truck,
      current: currentPage === 'transportations',
      accessible: isAdmin
    }
  ];

  return (
    <div className="w-12 md:w-48 lg:w-64 bg-white shadow-sm border-r border-gray-200 transition-all duration-300">
      <div className="p-1 md:p-3 lg:p-4">
        <h2 className="text-xs md:text-sm lg:text-lg font-semibold text-gray-900 mb-2 md:mb-3 lg:mb-4 hidden md:block truncate">
          {t.navigation.menu}
        </h2>
        <nav className="space-y-1">
          {navigation.map((item) => {
            if (!item.accessible) return null;
            
            return (
              <button
                key={item.name}
                onClick={() => onPageChange(item.href)}
                className={`${
                  item.current
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group w-full flex items-center justify-center md:justify-start px-1 md:px-2 lg:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium border-l-4 transition-colors`}
                title={item.name}
              >
                <item.icon
                  className={`${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } flex-shrink-0 h-3.5 w-3.5 md:h-4 md:w-4 lg:h-6 lg:w-6 md:mr-2 lg:mr-3`}
                  aria-hidden="true"
                />
                <span className="hidden md:block truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;