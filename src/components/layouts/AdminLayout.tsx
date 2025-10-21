import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Users, BarChart, LogOut, PanelLeft, Menu, Home } from 'lucide-react';
import { logout } from '../../utils/auth';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { to: '/admin/students', text: t('students'), icon: Users },
    { to: '/admin/progress', text: t('progress'), icon: BarChart },
  ];

  const getNavLinkClasses = (isOpen: boolean) => (to: string) => {
    const isActive = router.pathname === to;
    return `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-primary/5 hover:text-primary'
    } ${!isOpen ? 'justify-center' : ''}`;
  };

  const SidebarContent = ({ isOpen }: { isOpen: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center p-4 mb-4 ${isOpen ? 'justify-end' : 'justify-center'}`}>
        <button onClick={() => {
          if (isMobileSidebarOpen) {
            setIsMobileSidebarOpen(false);
          } else {
            setIsDesktopSidebarOpen(!isOpen);
          }
        }} className="text-muted hover:text-primary">
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-grow px-2">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link href={link.to} className={getNavLinkClasses(isOpen)(link.to)} title={isOpen ? '' : link.text}>
                  <link.icon className={`h-5 w-5 ${isOpen ? 'ml-3' : ''}`} />
                  <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>{link.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-2 py-4 mt-auto">
        <div className="border-t border-border pt-4 space-y-2">
          <button onClick={handleLogout} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium text-muted hover:bg-primary/5 hover:text-primary rounded-lg transition-colors duration-200 ${!isOpen ? 'justify-center' : ''}`}>
            <LogOut className={`h-5 w-5 ${isOpen ? 'ml-3' : ''}`} />
            <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="flex h-screen bg-background text-text font-sans">
      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 flex transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <aside className={`w-64 bg-card border-l border-border rounded-l-2xl transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <SidebarContent isOpen={true} />
        </aside>
        <div onClick={() => setIsMobileSidebarOpen(false)} className="flex-1 bg-black/30 backdrop-blur-sm"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-shrink-0 bg-card border-l border-border transition-all duration-300 ${isDesktopSidebarOpen ? 'w-64' : 'w-20'}`}>
        <SidebarContent isOpen={isDesktopSidebarOpen} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center md:hidden">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="text-text">
            <Menu size={24} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
