import { useLanguage } from '../contexts/LanguageContext';

export default function Sidebar({ currentPage, setCurrentPage, isAdmin }) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="w-64 bg-white shadow-sm">
      <div className="p-4">
        {/* Language selector and navigation */}
      </div>
    </div>
  );
}