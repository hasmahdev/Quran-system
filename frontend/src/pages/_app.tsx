import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect } from 'react';
import '../lib/i18n';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/debug/ErrorBoundary';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
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
