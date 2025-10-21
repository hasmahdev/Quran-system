import { useEffect, useMemo, useState } from 'react';
import { useStudentGuard } from '../../hooks/useAuthProtected';
import { getSupabase } from '../../lib/supabaseClient';
import { formatProgress } from '../../utils/quran';
import Card from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';

export default function StudentDashboard() {
  const { t } = useTranslation();
  useStudentGuard();
  const supabase = useMemo(() => getSupabase(), []);
  const [name, setName] = useState('');
  const [surah, setSurah] = useState<number | null>(null);
  const [ayah, setAyah] = useState<number | null>(null);
  const [page, setPage] = useState<number | null>(null);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('student_id') : null;
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('students')
        .select('name,progress_surah,progress_ayah,progress_page')
        .eq('id', id)
        .single();
      if (data) {
        setName(data.name);
        setSurah(data.progress_surah);
        setAyah(data.progress_ayah);
        setPage(data.progress_page);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-text mb-6">{t('studentDashboard')}</h1>
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
      </Card>
    </div>
  );
}
