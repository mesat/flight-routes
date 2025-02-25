import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

function LoginForm() {
  const { t } = useLanguage();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || t.errors.loginFailed);
      }
    } catch (err) {
      setError(err.message || t.errors.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-[600px] min-h-screen flex items-center justify-center ">
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
            <div>
              <label className="text-sm font-medium">{t.auth.username}</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t.auth.password}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? t.auth.loggingIn : t.auth.login}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default LoginForm;