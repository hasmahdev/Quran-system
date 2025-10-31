import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'developer':
          router.replace('/Developer');
          break;
        case 'teacher':
          router.replace('/Teacher');
          break;
        case 'student':
          router.replace('/student');
          break;
        default:
          router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return null;
}
