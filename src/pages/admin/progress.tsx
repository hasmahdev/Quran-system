import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import UIButton from '../../components/ui/Button';
import UIInput from '../../components/ui/Input';
import UILabel from '../../components/ui/Label';
import { useAdminGuard } from '../../hooks/useAuthProtected';
import { getSupabase } from '../../lib/supabaseClient';
import { surahNames } from '../../utils/quran';

type Student = { id: string; name: string; progress_surah?: number | null; progress_ayah?: number | null };

export default function ProgressPage() {
  useAdminGuard();
  const supabase = useMemo(() => getSupabase(), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [surah, setSurah] = useState<number>(1);
  const [ayah, setAyah] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('students').select('id,name,progress_surah,progress_ayah').order('name');
      setStudents(data || []);
    })();
  }, []);

  useEffect(() => {
    const s = students.find((x) => x.id === selected);
    if (s) {
      setSurah((s.progress_surah as number) || 1);
      setAyah((s.progress_ayah as number) || 1);
    }
  }, [selected, students]);

  async function save() {
    if (!selected) return;
    await supabase.from('students').update({ progress_surah: surah, progress_ayah: ayah }).eq('id', selected);
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="container-rtl" style={{ paddingRight: '17rem' }}>
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>إدارة التقدم في القرآن</h1>

          <div className="card">
            <div className="card-content">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <UILabel>الطالب</UILabel>
                  <select className="input" value={selected} onChange={(e)=>setSelected(e.target.value)}>
                    <option value="">اختر طالبًا</option>
                    {students.map((s)=> (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <UILabel>السورة</UILabel>
                  <select className="input" value={surah} onChange={(e)=>setSurah(parseInt(e.target.value))}>
                    {surahNames.map((n, i)=> (
                      <option key={i} value={i+1}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <UILabel>الآية</UILabel>
                  <UIInput type="number" min={1} value={ayah} onChange={(e)=>setAyah(parseInt(e.target.value||'1'))} />
                </div>
                <div className="flex items-end">
                  <UIButton onClick={save} disabled={!selected}>حفظ</UIButton>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
