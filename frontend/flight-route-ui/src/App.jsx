// App.jsx
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './contexts/LanguageContext';
import MainApp from './MainApp';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;