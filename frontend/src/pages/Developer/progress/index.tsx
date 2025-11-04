import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersByRole, getClassesByTeacher, getStudentsInClass, updateStudentProgress, getClasses, createStudentProgress } from '../../../lib/api';
import AdminLayout from '../../../components/layouts/AdminLayout';
import withAuth from '../../../components/withAuth';
import { ChevronDown, Search } from 'lucide-react';
import ErrorDisplay from '../../../components/shared/ErrorDisplay';
import ProgressCard from '../../../components/shared/ProgressCard';
import EditProgressDialog from '../../../components/shared/EditProgressDialog';
import FilterableDropdown from '../../../components/shared/FilterableDropdown';

const ProgressPage = () => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classData, studentData] = await Promise.all([
          getClasses(),
          getUsersByRole('student'),
        ]);
        const studentsWithClasses = await Promise.all(
          studentData.map(async (student: any) => {
            const studentClasses = await Promise.all(
              classData.map(async (c: any) => {
                const studentsInClass = await getStudentsInClass(c.id);
                return studentsInClass.some((s: any) => s.id === student.id) ? c : null;
              })
            );
            return { ...student, classes: studentClasses.filter(Boolean) };
          })
        );
        setClasses(classData || []);
        setStudents(studentsWithClasses || []);
        setFilteredStudents(studentsWithClasses || []);
      } catch (err) {
        setError(t('error_fetching_data'));
      }
      setLoading(false);
    };
    fetchData();
  }, [t]);

  useEffect(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleSaveProgress = async (updatedProgress: any) => {
    try {
      if (updatedProgress.classId) {
        const progressData = {
          surah: updatedProgress.surah,
          ayah: updatedProgress.ayah,
          page: updatedProgress.page,
          student_id: updatedProgress.studentId,
          class_id: updatedProgress.classId,
        };

        if (typeof updatedProgress.progressId === 'number' && updatedProgress.progressId > 0) {
          await updateStudentProgress(String(updatedProgress.progressId), progressData);
        } else {
          await createStudentProgress(progressData);
        }
      }
      setEditingStudent(null);
      // Refetch all data to get updated progress
      const [classData, studentData] = await Promise.all([
        getClasses(),
        getUsersByRole('student'),
      ]);
      const studentsWithClasses = await Promise.all(
        studentData.map(async (student: any) => {
          const studentClasses = await Promise.all(
            classData.map(async (c: any) => {
              const studentsInClass = await getStudentsInClass(c.id);
              return studentsInClass.some((s: any) => s.id === student.id) ? c : null;
            })
          );
          return { ...student, classes: studentClasses.filter(Boolean) };
        })
      );
      setClasses(classData || []);
      setStudents(studentsWithClasses || []);
      setFilteredStudents(studentsWithClasses || []);
    } catch (err) {
      console.error("Failed to save progress:", err);
      setError(t('error_saving_progress'));
    }
  };

  if (error) return <AdminLayout><ErrorDisplay message={error} /></AdminLayout>;

  return (
    <AdminLayout loading={loading}>
      <div>
        <h1 className="text-2xl font-bold mb-4">{t('manage_progress')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search_student')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <ProgressCard
              key={student.id}
              student={student}
              onEdit={() => {
                if (student.classes.length === 0) {
                  setError(t('error_student_not_in_class'));
                } else if (student.classes.length === 1) {
                  setEditingStudent({ ...student, classId: student.classes[0].id });
                } else {
                  // Let the user choose which class to edit
                  setEditingStudent(student);
                }
              }}
            />
          ))}
        </div>

        {editingStudent && (
          <EditProgressDialog
            student={editingStudent}
            classes={editingStudent.classes}
            onClose={() => setEditingStudent(null)}
            onSave={handleSaveProgress}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default withAuth(ProgressPage, ['developer']);
