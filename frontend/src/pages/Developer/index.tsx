import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DeveloperIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/Developer/classes');
  }, [router]);

  return null; // Render nothing, as the redirect will happen client-side
};

export default DeveloperIndex;
