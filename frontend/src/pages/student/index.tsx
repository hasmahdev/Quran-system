import { useEffect } from 'react';
import { useRouter } from 'next/router';

const StudentIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/progress');
  }, [router]);

  return null;
};

export default StudentIndex;
