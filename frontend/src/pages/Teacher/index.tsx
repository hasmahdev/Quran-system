import { useEffect } from 'react';
import { useRouter } from 'next/router';

const TeacherIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/Teacher/classes');
  }, [router]);

  return null; // Render nothing, as the redirect will happen client-side
};

export default TeacherIndex;
