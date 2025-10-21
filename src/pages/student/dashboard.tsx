import { useEffect, useMemo, useState } from 'react';
import { useStudentGuard } from '../../hooks/useAuthProtected';
import { getSupabase } from '../../lib/supabaseClient';
import { formatProgress } from '../../utils/quran';

export default function StudentDashboard() {
  useStudentGuard();
  const supabase = useMemo(() => getSupabase(), []);
  const [name, setName] = useState('');
  const [surah, setSurah] = useState<number | null>(null);
  const [ayah, setAyah] = useState<number | null>(null);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('student_id') : null;
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('students')
        .select('name,progress_surah,progress_ayah')
        .eq('id', id)
        .single();
      if (data) {
        setName(data.name);
        setSurah(data.progress_surah);
        setAyah(data.progress_ayah);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-xl">
        <div className="card-header">
          <h1 className="card-title">لوحة الطالب</h1>
        </div>
        <div className="card-content space-y-2">
          <div><span className="text-gray-600">الاسم: </span><span className="font-semibold">{name}</span></div>
          <div><span className="text-gray-600">الموضع الحالي: </span><span className="badge badge-primary">{formatProgress(surah, ayah)}</span></div>
        </div>
      </div>
    </div>
  );
}
