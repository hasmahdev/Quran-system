import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import { formatProgress } from '../../utils/quran';
import Card from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function StudentDashboard() {
  const { t } = useTranslation();
  const supabase = useMemo(() => getSupabase(), []);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [surah, setSurah] = useState<number | null>(null);
  const [ayah, setAyah] = useState<number | null>(null);
  const [page, setPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      const id = (session.user as any)?.id;
      if (!id) return;
      (async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('username,progress_surah,progress_ayah,progress_page')
            .eq('id', id)
            .single();
          if (data) {
            setName(data.username);
            setSurah(data.progress_surah);
            setAyah(data.progress_ayah);
            setPage(data.progress_page);
          }
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [status, session]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-text mb-6">{t('studentDashboard')}</h1>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted">{t('name')}:</span>
              <span className="font-semibold text-text">{name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">{t('currentProgress')}:</span>
              <span className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">{formatProgress(surah, ayah, page)}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
