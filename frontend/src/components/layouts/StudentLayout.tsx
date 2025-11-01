import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const StudentLayout = ({ children, loading }: { children: React.ReactNode, loading?: boolean }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setToken } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    setToken(null);
    router.push('/login');
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-background text-text font-sans">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between">
        <div className="font-bold text-lg">{t('studentDashboard')}</div>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text">
            <Menu size={24} />
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-4">
            <button onClick={handleLogout} className="flex items-center text-sm font-medium text-muted hover:text-primary transition-colors duration-200">
                <LogOut className="h-5 w-5 ml-2" />
                <span>{t('logout')}</span>
            </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border p-4">
            <button onClick={handleLogout} className="flex items-center w-full text-right py-2 text-sm font-medium text-muted hover:text-primary transition-colors duration-200">
                <LogOut className="h-5 w-5 ml-3" />
                <span>{t('logout')}</span>
            </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 animate-fade-in-up w-full">
          {loading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
