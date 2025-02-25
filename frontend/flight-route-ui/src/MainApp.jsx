import React from 'react';
import LoginForm from './features/auth/LoginForm';
import MainLayout from './layouts/MainLayout';
import Loading from './components/ui/loading';
import { useAuth } from './hooks/useAuth.jsx'; // .jsx uzantısını ekleyin

function MainApp() {
  const { auth, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  return auth ? <MainLayout /> : <LoginForm />;
}

export default MainApp;