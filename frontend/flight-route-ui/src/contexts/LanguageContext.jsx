import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  // localStorage'dan dil bilgisini al, yoksa varsayılan olarak 'tr' kullan
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      // Kaydedilen dil geçerli mi kontrol et
      return (savedLanguage && translations[savedLanguage]) ? savedLanguage : 'tr';
    } catch (error) {
      console.warn('localStorage error:', error);
      return 'tr';
    }
  });
  
  // Dil geçerli değilse varsayılan dili kullan
  const currentLanguage = translations[language] ? language : 'tr';
  const t = translations[currentLanguage];

  // Debug için
  if (!t) {
    console.error('Translation object is undefined:', { language, currentLanguage, translations });
  }

  // Dil değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('selectedLanguage', currentLanguage);
    } catch (error) {
      console.warn('localStorage save error:', error);
    }
  }, [currentLanguage]);

  const value = {
    language: currentLanguage,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}