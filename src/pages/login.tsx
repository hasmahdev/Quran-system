import { FormEvent, useState } from 'react';
import { loginWithPassword } from '../utils/auth';
import Card from '../components/ui/Card';
import PasswordInput from '../components/ui/PasswordInput';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithPassword(password);
      if (!res) {
        setError(t('incorrectPassword'));
      } else if (res.role === 'admin') {
        window.location.href = '/admin/students';
      } else {
        window.location.href = '/student/dashboard';
      }
    } catch (err: any) {
      if (err?.message?.includes('Supabase env')) {
        setError(t('supabaseError'));
      } else {
        setError(t('unexpectedError'));
      }
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
