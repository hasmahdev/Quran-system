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
    const fetchData = async () => {
      try {
        const [teacherData, classData, studentData] = await Promise.all([
          getUsersByRole('teacher'),
          getClasses(),
          getUsersByRole('student'),
        ]);
        setTeachers(teacherData || []);
        setClasses(classData || []);
        setStudents(studentData || []);
        setFilteredStudents(studentData || []);
      } catch (err) {
        setError(t('error_fetching_data'));
      }
    };
    fetchData();
  }, [t]);

  useEffect(() => {
    let filtered = students;
    if (selectedTeacher) {
      const teacherClasses = classes.filter((c) => c.teacher_id === selectedTeacher.id);
      const studentIds = teacherClasses.flatMap((c) => getStudentsInClass(c.id));
      Promise.all(studentIds).then((res) => {
        const ids = res.flat().map((s: any) => s.id);
        filtered = filtered.filter((student) => ids.includes(student.id));
        setFilteredStudents(filtered);
      });
    }
    if (selectedClass) {
      getStudentsInClass(selectedClass.id).then((res) => {
        const ids = res.map((s: any) => s.id);
        filtered = filtered.filter((student) => ids.includes(student.id));
        setFilteredStudents(filtered);
      });
    }
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  }, [selectedTeacher, selectedClass, searchTerm, students]);

  const handleSaveProgress = async (updatedProgress: any) => {
    if (!selectedClass) {
      setError(t('error_no_class_selected'));
      return;
    }
    try {
      const progressData = {
        surah: updatedProgress.surah,
        ayah: updatedProgress.ayah,
        page: updatedProgress.page,
        student_id: updatedProgress.studentId,
        class_id: selectedClass.id,
      };

      if (typeof updatedProgress.progressId === 'number' && updatedProgress.progressId > 0) {
        await updateStudentProgress(String(updatedProgress.progressId), progressData);
      } else {
        await createStudentProgress(progressData);
      }
      setEditingStudent(null);
      // Refetch students to get updated progress
      const studentData = await getStudentsInClass(selectedClass.id);
      setStudents(studentData || []);
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
        {!selectedClass && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">{t('notice')}</p>
            <p>{t('select_class_to_edit_progress')}</p>
          </div>
        )}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <ProgressCard
              key={student.id}
              student={student}
              onEdit={() => setEditingStudent(student)}
              disabled={!selectedClass}
            />
          ))}
        </div>

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
