import bcrypt from 'bcryptjs';
import { getSupabase } from '../lib/supabaseClient';

export type LoginResult = {
  role: 'developer' | 'teacher' | 'student';
  userId: string;
  fullName: string;
};

export async function loginWithPassword(username: string, password: string): Promise<LoginResult | null> {
  const supabase = getSupabase();

  // Find user by username
  const { data: users, error } = await supabase
    .from('users')
    .select('id, password_hash, role, full_name')
    .eq('username', username)
    .limit(1);

  if (error || !users || users.length === 0) {
    console.error('Error fetching user or user not found:', error);
    return null;
  }

  const user = users[0];
  const ok = await bcrypt.compare(password, user.password_hash);

  if (ok) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_role', user.role);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_name', user.full_name);
    }
    return { role: user.role, userId: user.id, fullName: user.full_name };
  }

  return null;
}

export function requireRole(role: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('auth_role') === role;
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_role');
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_role');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
}
