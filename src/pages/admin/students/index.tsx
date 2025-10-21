import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../../components/ui/Sidebar';
import UIButton from '../../../components/ui/Button';
import UIInput from '../../../components/ui/Input';
import UILabel from '../../../components/ui/Label';
import { useAdminGuard } from '../../../hooks/useAuthProtected';
import { getSupabase } from '../../../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { formatProgress } from '../../../utils/quran';

type Student = { id: string; name: string; password_hash: string; progress_surah?: number | null; progress_ayah?: number | null };

export default function StudentsPage() {
  useAdminGuard();
  const supabase = useMemo(() => getSupabase(), []);
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('id,name,password_hash,progress_surah,progress_ayah')
      .order('name');
    if (error) setError(error.message);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addStudent() {
    setSaving(true);
    setError(null);
    try {
      const hash = await bcrypt.hash(password, 10);
      const { error } = await supabase
        .from('students')
        .insert({ name, password_hash: hash });
      if (error) throw error;
      setName('');
      setPassword('');
      await load();
    } catch (e: any) {
      setError(e.message || 'فشل الإضافة');
    } finally {
      setSaving(false);
    }
  }

  async function removeStudent(id: string) {
    if (!confirm('حذف الطالب؟')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((s) => s.id !== id));
  }

  async function updateName(id: string, newName: string) {
    const { error } = await supabase.from('students').update({ name: newName }).eq('id', id);
    if (!error) setItems((prev) => prev.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  }

  async function updatePassword(id: string, newPass: string) {
    const hash = await bcrypt.hash(newPass, 10);
    await supabase.from('students').update({ password_hash: hash }).eq('id', id);
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="container-rtl" style={{ paddingRight: '17rem' }}>
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>إدارة الطلاب</h1>

          <div className="card mb-6">
            <div className="card-header"><h2 className="card-title">إضافة طالب</h2></div>
            <div className="card-content">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <UILabel>الاسم</UILabel>
                  <UIInput value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الطالب" />
                </div>
                <div>
                  <UILabel>كلمة المرور</UILabel>
                  <UIInput type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="flex items-end">
                  <UIButton onClick={addStudent} disabled={!name || !password || saving}>إضافة</UIButton>
                </div>
              </div>
              {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title">الطلاب</h2></div>
            <div className="card-content overflow-x-auto">
              {loading ? (
                <div>جاري التحميل...</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th className="th">الاسم</th>
                      <th className="th">الموضع</th>
                      <th className="th">تعديل</th>
                      <th className="th">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((s) => (
                      <tr key={s.id}>
                        <td className="td">
                          <EditableText text={s.name} onSave={(v)=>updateName(s.id, v)} />
                        </td>
                        <td className="td">
                          <span className="badge badge-primary">{formatProgress(s.progress_surah, s.progress_ayah)}</span>
                        </td>
                        <td className="td">
                          <InlinePasswordChanger onSave={(v)=>updatePassword(s.id, v)} />
                        </td>
                        <td className="td">
                          <UIButton variant="outline" onClick={()=>removeStudent(s.id)}>حذف</UIButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EditableText({ text, onSave }: { text: string; onSave: (v: string)=>void }) {
  const [val, setVal] = useState(text);
  const [editing, setEditing] = useState(false);
  return editing ? (
    <div className="flex items-center gap-2">
      <UIInput value={val} onChange={(e)=>setVal(e.target.value)} />
      <UIButton onClick={()=>{ onSave(val); setEditing(false); }}>حفظ</UIButton>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <span>{text}</span>
      <button className="text-sm text-[color:var(--primary)]" onClick={()=>setEditing(true)}>تعديل</button>
    </div>
  );
}

function InlinePasswordChanger({ onSave }: { onSave: (v: string)=>void }) {
  const [val, setVal] = useState('');
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="flex items-center gap-2">
      <UIInput type="password" value={val} onChange={(e)=>setVal(e.target.value)} placeholder="كلمة مرور جديدة" />
      <UIButton onClick={()=>{ if(val){ onSave(val); setVal(''); setOpen(false);} }}>حفظ</UIButton>
    </div>
  ) : (
    <button className="text-sm text-[color:var(--primary)]" onClick={()=>setOpen(true)}>تغيير كلمة الم��ور</button>
  );
}
