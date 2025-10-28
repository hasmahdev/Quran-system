import bcrypt from 'bcryptjs';
import { getSupabase } from '../lib/supabaseClient';

export type LoginResult =
  | { role: 'admin' }
  | { role: 'student'; studentId: string; name: string };

export async function loginWithPassword(password: string): Promise<LoginResult | null> {
  const supabase = getSupabase();
  // Check admin
  const { data: adminRows, error: adminErr } = await supabase
    .from('admin_settings')
    .select('password_hash')
    .limit(1);
  if (!adminErr && adminRows && adminRows.length > 0) {
    const ok = await bcrypt.compare(password, adminRows[0].password_hash);
    if (ok) {
      if (typeof window !== 'undefined') localStorage.setItem('auth_role', 'admin');
      return { role: 'admin' };
    }
  }
  // Check students
  const { data: students, error: studErr } = await supabase
    .from('students')
    .select('id,name,password_hash')
    .order('name');
  if (!studErr && students) {
    for (const s of students) {
      const ok = await bcrypt.compare(password, s.password_hash);
      if (ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_role', 'student');
          localStorage.setItem('student_id', s.id);
        }
        return { role: 'student', studentId: s.id, name: s.name };
      }
    }
  }
  return null;
}

export function requireAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('auth_role') === 'admin';
}

export function requireStudent(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('student_id');
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_role');
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_role');
  localStorage.removeItem('student_id');
}
