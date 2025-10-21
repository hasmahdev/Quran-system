import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Users, BarChart, LogOut, PanelLeft, Menu, Home } from 'lucide-react';
import { logout } from '../../utils/auth';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
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
    { to: '/admin/students', text: 'Students', icon: Users },
    { to: '/admin/progress', text: 'Progress', icon: BarChart },
  ];

  const getNavLinkClasses = (isOpen: boolean) => (to: string) => {
    const isActive = router.pathname === to;
    return `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-primary/5 hover:text-primary'
    } ${!isOpen ? 'justify-center' : ''}`;
  };

  const SidebarContent = ({ isOpen }: { isOpen: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between p-4 mb-4 border-b border-gray-700/50`}>
        <div className={`flex items-center gap-3 transition-all duration-300 ${!isOpen ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>
          <span className="text-lg font-bold whitespace-nowrap">Admin Panel</span>
        </div>
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
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <button onClick={() => setIsDesktopSidebarOpen(!isOpen)} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors duration-200 ${!isOpen ? 'justify-center' : ''}`}>
            <PanelLeft className={`h-5 w-5 ${isOpen ? 'ml-3' : ''}`} />
            <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>Toggle Sidebar</span>
          </button>
          <button onClick={handleLogout} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors duration-200 ${!isOpen ? 'justify-center' : ''}`}>
            <LogOut className={`h-5 w-5 ${isOpen ? 'ml-3' : ''}`} />
            <span className={`transition-opacity duration-200 whitespace-nowrap ${!isOpen ? 'hidden' : 'delay-200'}`}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-shrink-0 bg-black/20 border-l border-gray-700 transition-all duration-300 ${isDesktopSidebarOpen ? 'w-64' : 'w-20'}`}>
        <SidebarContent isOpen={isDesktopSidebarOpen} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 p-4 flex items-center md:hidden">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="text-white">
            <Menu size={24} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
