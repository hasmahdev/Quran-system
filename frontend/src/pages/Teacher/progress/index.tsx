import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudentsInClass, getClassesByTeacher, getProgressForClass, updateStudentProgress } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import withAuth from '../../../components/withAuth';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { ChevronDown } from 'lucide-react';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';

const MyProgressPage = () => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchClasses = async () => {
        try {
          const classData = await getClassesByTeacher(String(user.id));
          setClasses(classData);
        } catch (err) {
          setError(t('error_fetching_data'));
        }
      };
      fetchClasses();
    }
  }, [user, t]);

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudentsAndProgress = async () => {
        setLoading(true);
        try {
          const studentData = await getStudentsInClass(selectedClassId);
          setStudents(studentData);

          const progressData = await getProgressForClass(selectedClassId);

          const progressMap = progressData.reduce((acc: any, p: any) => {
            if (p) {
              acc[p.student_id] = p;
            }
            return acc;
          }, {});
          setProgress(progressMap);
        } catch (err) {
          setError(t('error_fetching_data'));
        } finally {
          setLoading(false);
        }
      };
      fetchStudentsAndProgress();
    }
  }, [selectedClassId, t]);

  const handleProgressChange = (studentId: string, field: string, value: any) => {
    setProgress((prev: any) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveProgress = async (studentId: string) => {
    const progressToUpdate = progress[studentId];
    if (progressToUpdate) {
      try {
        await updateStudentProgress(progressToUpdate.id, {
          surah: progressToUpdate.surah,
          ayah: progressToUpdate.ayah,
          page: progressToUpdate.page,
        });
        alert('Progress saved!');
      } catch (err) {
        setError(t('error_saving_progress'));
      }
    }
  };

  if (error) return <AdminLayout><ErrorDisplay message={error} /></AdminLayout>;

  return (
    <AdminLayout loading={loading}>
      <div>
        <h1 className="text-2xl font-bold mb-4">{t('student_progress')}</h1>
        <div className="relative mb-6">
          <select
            onChange={(e) => setSelectedClassId(e.target.value)}
            value={selectedClassId}
            className="w-full appearance-none bg-input border border-border rounded-lg px-4 py-2.5 text-sm pr-8"
          >
            <option value="" disabled>{t('select_a_class')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
        </div>

        {selectedClassId && (
          <div className="bg-card p-4 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-semibold text-sm">{t('student_name')}</th>
                    <th className="text-right p-3 font-semibold text-sm">{t('surah')}</th>
                    <th className="text-right p-3 font-semibold text-sm">{t('ayah')}</th>
                    <th className="text-right p-3 font-semibold text-sm">{t('page')}</th>
                    <th className="text-right p-3 font-semibold text-sm">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-3">{student.full_name}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={progress[student.id]?.surah || ''}
                          onChange={(e) => handleProgressChange(student.id, 'surah', e.target.value)}
                          className="w-24 bg-input border rounded p-1.5 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={progress[student.id]?.ayah || ''}
                          onChange={(e) => handleProgressChange(student.id, 'ayah', e.target.value)}
                          className="w-24 bg-input border rounded p-1.5 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={progress[student.id]?.page || ''}
                          onChange={(e) => handleProgressChange(student.id, 'page', e.target.value)}
                          className="w-24 bg-input border rounded p-1.5 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleSaveProgress(student.id)} className="bg-primary text-white py-1.5 px-4 rounded-lg text-sm font-semibold">
                          {t('save')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default withAuth(MyProgressPage, ['teacher']);
