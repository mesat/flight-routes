import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

function Header({ title }) {
  const { t } = useLanguage();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Dil Switch */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 hidden sm:block">Dil:</span>
              <div 
                className="relative inline-block w-10 h-5 sm:w-12 sm:h-6 bg-gray-200 rounded-full cursor-pointer group" 
                onClick={toggleLanguage}
                title={language === 'tr' ? 'Türkçe' : 'English'}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center ${language === 'en' ? 'transform translate-x-5 sm:translate-x-6' : ''}`}>
                  <span className="text-xs">
                    {language === 'tr' ? '🇹🇷' : '🇺🇸'}
                  </span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {language === 'tr' ? 'Türkçe' : 'English'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-xs sm:text-sm text-gray-600 w-8 sm:w-12 text-right hidden sm:block">
                    {t.auth.userType}:
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 w-12 sm:w-16 text-center">
                    {user.role === 'ADMIN' ? t.auth.admin : t.auth.agency}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="w-16 sm:w-20 text-xs sm:text-sm">
                  {t.auth.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-600">{t.auth.notLoggedIn}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;