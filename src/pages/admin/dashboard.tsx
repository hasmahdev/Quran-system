import Sidebar from '../../components/ui/Sidebar';
import { useAdminGuard } from '../../hooks/useAuthProtected';

export default function AdminDashboard() {
  useAdminGuard();
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="container-rtl" style={{ paddingRight: '17rem' }}>
        <div className="py-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">اختر قسمًا من القائمة.</p>
        </div>
      </main>
    </div>
  );
}
