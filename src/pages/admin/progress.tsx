import { useEffect, useMemo, useState } from 'react';
import { useAdminGuard } from '../../hooks/useAuthProtected';
import { getSupabase } from '../../lib/supabaseClient';
import { surahNames } from '../../utils/quran';
import AdminLayout from '../../components/layouts/AdminLayout';
import Card from '../../components/ui/Card';

type Student = { id: string; name: string; progress_surah?: number | null; progress_ayah?: number | null };

export default function ProgressPage() {
  useAdminGuard();
  const supabase = useMemo(() => getSupabase(), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [surah, setSurah] = useState<number>(1);
  const [ayah, setAyah] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setSaving(true);
    setSuccess(false);
    await supabase.from('students').update({ progress_surah: surah, progress_ayah: ayah }).eq('id', selected);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-8">Manage Progress</h1>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Student</label>
            <select className="w-full bg-black/30 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Surah</label>
            <select className="w-full bg-black/30 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" value={surah} onChange={(e) => setSurah(parseInt(e.target.value))}>
              {surahNames.map((n, i) => (
                <option key={i} value={i + 1}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ayah</label>
            <input type="number" min={1} value={ayah} onChange={(e) => setAyah(parseInt(e.target.value || '1'))} className="w-full bg-black/30 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex items-end">
            <button onClick={save} disabled={!selected || saving} className="bg-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors w-full">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {success && <div className="text-green-400 text-sm mt-3">Progress saved successfully!</div>}
      </Card>
    </AdminLayout>
  );
}
