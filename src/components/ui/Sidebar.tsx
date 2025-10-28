import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

const links = [
  { href: '/admin/students', label: 'الطلاب' },
  { href: '/admin/progress', label: 'التقدم في القرآن' },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="h-screen w-64 bg-white border-l border-gray-200 fixed left-0 top-0 flex flex-col">
      <div className="px-4 py-5 border-b">
        <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>لوحة التحكم</div>
        <div className="text-xs text-gray-500 mt-1">إدارة الطلاب والقرآن</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`block px-3 py-2 rounded-lg mb-1 ${router.pathname===l.href? 'bg-[color:var(--primary)]/10 text-[color:var(--primary)]' : 'text-gray-700 hover:bg-gray-50'}`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn btn-outline w-full"
        >تسجيل الخروج</button>
      </div>
    </aside>
  );
}
