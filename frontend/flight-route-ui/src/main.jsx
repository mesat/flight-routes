// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import BaseLayout from './layouts/BaseLayout';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <BaseLayout>
        <App />
      </BaseLayout>
    </LanguageProvider>
  </React.StrictMode>
);