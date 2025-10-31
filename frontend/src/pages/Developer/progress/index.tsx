import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersByRole, getClassesByTeacher, getStudentsInClass, getProgressForClass, updateStudentProgress } from '../../../lib/api';
import AdminLayout from '../../../components/layouts/AdminLayout';
import withAuth from '../../../components/withAuth';
import { ChevronDown } from 'lucide-react';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';

const ProgressPage = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teacherData = await getUsersByRole('teacher');
        setTeachers(teacherData);
      } catch (err) {
        setError(t('error_fetching_data'));
      }
    };
    fetchTeachers();
  }, [t]);

  useEffect(() => {
    if (selectedTeacherId) {
      const fetchClasses = async () => {
        try {
          const classData = await getClassesByTeacher(selectedTeacherId);
          setClasses(classData);
          setSelectedClassId('');
          setStudents([]);
        } catch (err) {
          setError(t('error_fetching_data'));
        }
      };
      fetchClasses();
    }
  }, [selectedTeacherId, t]);

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
        <h1 className="text-2xl font-bold mb-4">{t('progress_overview')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <select
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              value={selectedTeacherId}
              className="w-full appearance-none bg-input border border-border rounded-lg px-4 py-2.5 text-sm pr-8"
            >
              <option value="" disabled>{t('select_teacher')}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              onChange={(e) => setSelectedClassId(e.target.value)}
              value={selectedClassId}
              disabled={!selectedTeacherId}
              className="w-full appearance-none bg-input border border-border rounded-lg px-4 py-2.5 text-sm pr-8"
            >
              <option value="" disabled>{t('select_class')}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
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

export default withAuth(ProgressPage, ['developer']);
