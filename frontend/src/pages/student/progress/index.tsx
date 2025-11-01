import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatProgress } from '../../../utils/quran';
import Card from '../../../components/ui/Card';
import { useTranslation } from 'react-i18next';
import { getMyData } from '../../../lib/api';
import withAuth from '../../../components/withAuth';
import StudentLayout from '../../../components/layouts/StudentLayout';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';

function StudentDashboard() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [surah, setSurah] = useState<number | null>(null);
  const [ayah, setAyah] = useState<number | null>(null);
  const [page, setPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const data = await getMyData();
          setName(data.username);
          setSurah(data.progress_surah);
          setAyah(data.progress_ayah);
          setPage(data.progress_page);
        } catch (error) {
          setError(t('error_fetching_data'));
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, t]);

  if (error) return <StudentLayout><ErrorDisplay message={error} /></StudentLayout>;

  return (
    <StudentLayout loading={loading}>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-text mb-6">{t('welcome_student', { name })}</h1>
        <Card className="w-full max-w-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted">{t('name')}:</span>
              <span className="font-semibold text-text">{name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">{t('currentProgress')}:</span>
              <span className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                {formatProgress(surah, ayah, page)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default withAuth(StudentDashboard, ['student']);
