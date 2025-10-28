import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { requireRole } from '../utils/auth'; // Using the new requireRole function

export function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    // Redirect if the user does not have the 'developer' role.
    // Assuming 'admin' in the old context is now 'developer'.
    if (!requireRole('developer')) {
      router.replace('/login');
    }
  }, [router]);
}

export function useStudentGuard() {
  const router = useRouter();
  useEffect(() => {
    // Redirect if the user does not have the 'student' role.
    if (!requireRole('student')) {
      router.replace('/login');
    }
  }, [router]);
}
