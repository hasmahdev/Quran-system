import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { requireAdmin, requireStudent } from '../utils/auth';

export function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!requireAdmin()) router.replace('/login');
  }, [router]);
}

export function useStudentGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!requireStudent()) router.replace('/login');
  }, [router]);
}
