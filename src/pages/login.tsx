import { FormEvent, useState } from 'react';
import UIButton from '../components/ui/Button';
import UIInput from '../components/ui/Input';
import UILabel from '../components/ui/Label';
import { loginWithPassword } from '../utils/auth';

export default function LoginPage() {
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
        setError('كلمة المرور غير صحيحة');
      } else if (res.role === 'admin') {
        window.location.href = '/admin/students';
      } else {
        window.location.href = '/student/dashboard';
      }
    } catch (err: any) {
      if (err?.message?.includes('Supabase env')) {
        setError('يرجى إعداد مفاتيح Supabase (NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY).');
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="card-header">
          <h1 className="card-title">تسجيل الدخول</h1>
          <p className="text-sm text-gray-500 mt-1">أدخل كلمة المرور للدخول كمسؤول أو كطالب</p>
        </div>
        <div className="card-content">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <UILabel htmlFor="password">كلمة المرور</UILabel>
              <UIInput id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <UIButton type="submit" disabled={loading} className="w-full">{loading? 'جاري الدخول...' : 'دخول'}</UIButton>
            <div className="text-xs text-gray-500">
              اللون الرئيسي: <span className="badge badge-primary">#1E9F93</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
