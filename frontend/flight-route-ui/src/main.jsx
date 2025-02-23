// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import MainLayout from './layouts/MainLayout';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <MainLayout>
        <App />
      </MainLayout>
    </LanguageProvider>
  </React.StrictMode>
);