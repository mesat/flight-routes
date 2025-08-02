import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  // localStorage'dan dil bilgisini al, yoksa varsayılan olarak 'tr' kullan
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'tr';
  });
  
  const t = translations[language];

  // Dil değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}