import { Card } from '@mui/material';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LoginForm({ onLogin, error, loading }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-center mb-6">{t.auth.login}</h1>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {/* Form fields */}
          </div>
        </form>
      </Card>
    </div>
  );
}