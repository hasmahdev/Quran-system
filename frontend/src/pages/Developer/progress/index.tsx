import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersByRole, getClassesByTeacher, getStudentsInClass, updateStudentProgress } from '../../../lib/api';
import AdminLayout from '../../../components/layouts/AdminLayout';
import withAuth from '../../../components/withAuth';
import { Search } from 'lucide-react';
import ErrorDisplay from '../../../components/shared/ErrorDisplay';
import ProgressCard from '../../../components/shared/ProgressCard';
import EditProgressDialog from '../../../components/shared/EditProgressDialog';
import FilterableDropdown from '../../../components/shared/FilterableDropdown';

const ProgressPage = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teacherData = await getUsersByRole('teacher');
        setTeachers(teacherData || []);
      } catch (err) {
        setError(t('error_fetching_data'));
      }
    };
    fetchTeachers();
  }, [t]);

  useEffect(() => {
    if (selectedTeacher) {
      const fetchClasses = async () => {
        try {
          const classData = await getClassesByTeacher(selectedTeacher.id);
          setClasses(classData || []);
          setSelectedClass(null);
          setStudents([]);
        } catch (err) {
          setError(t('error_fetching_data'));
        }
      };
      fetchClasses();
    }
  }, [selectedTeacher, t]);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const studentData = await getStudentsInClass(selectedClass.id);
          setStudents(studentData || []);
        } catch (err) {
          setError(t('error_fetching_data'));
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    }
  }, [selectedClass, t]);

  useEffect(() => {
    setFilteredStudents(
      students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, students]);

  const handleSaveProgress = async (updatedProgress: any) => {
    try {
      await updateStudentProgress(updatedProgress.progressId, {
        surah: updatedProgress.surah,
        ayah: updatedProgress.ayah,
        page: updatedProgress.page,
      });
      setEditingStudent(null);
      // Refetch students to get updated progress
      const studentData = await getStudentsInClass(selectedClass.id);
      setStudents(studentData || []);
    } catch (err) {
      setError(t('error_saving_progress'));
    }
  };

  if (error) return <AdminLayout><ErrorDisplay message={error} /></AdminLayout>;

  return (
    <AdminLayout loading={loading}>
      <div>
        <h1 className="text-2xl font-bold mb-4">{t('manage_progress')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <FilterableDropdown
            items={teachers}
            selectedItem={selectedTeacher}
            onSelectItem={setSelectedTeacher}
            placeholder={t('select_teacher')}
            label="full_name"
          />
          <FilterableDropdown
            items={classes}
            selectedItem={selectedClass}
            onSelectItem={setSelectedClass}
            placeholder={t('select_class')}
            label="name"
            disabled={!selectedTeacher}
          />
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

        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <ProgressCard
                key={student.id}
                student={student}
                onEdit={() => setEditingStudent(student)}
              />
            ))}
          </div>
        )}

        {editingStudent && (
          <EditProgressDialog
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onSave={handleSaveProgress}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default withAuth(ProgressPage, ['developer']);
