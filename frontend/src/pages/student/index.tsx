import { useEffect } from 'react';
import { useRouter } from 'next/router';

const StudentIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/progress');
  }, [router]);

  return null; // Render nothing, as the redirect will happen client-side
};

export default StudentIndex;
