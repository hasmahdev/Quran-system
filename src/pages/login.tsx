import { FormEvent, useState } from 'react';
import Card from '../components/ui/Card';
import PasswordInput from '../components/ui/PasswordInput';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: username,
        password: password,
      });

      if (result?.error) {
        setError(t('incorrectCredentials'));
      } else if (result?.ok) {
        // On successful sign-in, NextAuth sets the session cookie.
        // We can then redirect to the home page, which will handle the
        // role-based redirect.
        router.push('/');
      }
    } catch (err: any) {
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
              placeholder="developer"
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
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>
      </Card>
    </div>
  );
}
