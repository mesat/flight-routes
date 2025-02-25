// src/layouts/BaseLayout.jsx
import ErrorBoundary from '../components/ErrorBoundary';
import { useLanguage } from '../contexts/LanguageContext';

export default function BaseLayout({ children }) {
  const { t } = useLanguage();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ErrorBoundary>
  );
}