import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }) {
  const { t } = useLanguage();
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Card className="p-6">
            {children}
          </Card>
        </main>
      </div>
    </div>
  );
}