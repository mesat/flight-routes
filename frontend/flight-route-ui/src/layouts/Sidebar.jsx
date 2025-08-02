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
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                } group w-full flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors`}
              >
                <item.icon
                  className={`${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;