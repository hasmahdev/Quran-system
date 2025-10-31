import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const withAuth = (WrappedComponent: React.ComponentType, allowedRoles: string[]) => {
  const AuthComponent = (props: any) => {
    const { user, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!token) {
        router.replace('/login');
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        router.replace('/unauthorized'); // Or some other appropriate page
        return;
      }
    }, [user, token, router]);

    if (!user || !allowedRoles.includes(user.role)) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
