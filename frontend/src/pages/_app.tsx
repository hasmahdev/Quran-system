import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect } from 'react';
import '../lib/i18n';
import { AuthProvider } from '../context/AuthContext';
import LogRocket from 'logrocket';
import ErrorBoundary from '../components/debug/ErrorBoundary';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      LogRocket.init('qk7sda/had');
    }
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </AuthProvider>
  );
}
