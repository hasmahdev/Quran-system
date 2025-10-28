import { getSupabase } from '../lib/supabaseClient';

export type LoginResult = {
  role: 'developer' | 'teacher' | 'student';
  id: string;
  full_name: string;
};

export async function loginWithPassword(password: string): Promise<LoginResult | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase.functions.invoke('login', {
    body: { password },
  });

  if (error) {
    console.error('Error calling login function:', error);
    return null;
  }

  if (data) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_role', data.role);
      localStorage.setItem('user_id', data.id);
      localStorage.setItem('user_name', data.full_name);
    }
    return data;
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
