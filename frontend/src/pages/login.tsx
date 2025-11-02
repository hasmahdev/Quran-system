import { FormEvent, useState } from 'react';
import Card from '../components/ui/Card';
import PasswordInput from '../components/ui/PasswordInput';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { setToken } = useAuth();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('https://qu.ghars.site/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setSuccess(true);

        try {
          const decoded: { role: string } = jwtDecode(data.token);

          switch (decoded.role) {
            case 'developer':
              router.push('/Developer');
              break;
            case 'teacher':
              router.push('/Teacher');
              break;
            case 'student':
              router.push('/student');
              break;
            default:
              router.push('/');
          }
        } catch (e) {
          console.error("Failed to decode token for redirect", e);
          router.push('/');
        }

      } else {
        const errorData = await response.json().catch(() => response.text());
        console.error('Login failed with status:', response.status, 'Response:', errorData);
        setError(t('incorrectCredentials'));
      }
    } catch (err: any) {
      console.error('An unexpected error occurred during login:', err);
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-text mb-2">{t('login')}</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-muted mb-2">{t('username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">{t('password')}</label>
            <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 bg-primary hover:bg-opacity-90`}
          >
            {loading || success ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              t('login')
            )}
          </button>
        </form>
      </Card>
    </div>
  );
}
