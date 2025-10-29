import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersByRole, getClassesByTeacher, getProgressForClass, updateStudentProgress, getStudentsInClass } from '../../lib/api';

const ProgressPage = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      const teacherData = await getUsersByRole('teacher');
      setTeachers(teacherData);
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      const fetchClasses = async () => {
        const classData = await getClassesByTeacher(selectedTeacherId);
        setClasses(classData);
        setSelectedClassId('');
        setStudents([]);
      };
      fetchClasses();
    }
  }, [selectedTeacherId]);

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudentsAndProgress = async () => {
        setLoading(true);
        const studentData = await getStudentsInClass(selectedClassId);
        // We will need to create progress entries if they don't exist.
        // For now, this assumes they exist. A full implementation would handle this.
        setStudents(studentData);
        setLoading(false);
      };
      fetchStudentsAndProgress();
    }
  }, [selectedClassId]);

  const handleProgressChange = (studentId: string, field: string, value: any) => {
    setProgress((prev: any) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveProgress = async (studentId: string) => {
    // This is a simplified save. A real implementation would need to find the correct progress ID.
    // For now, we are just showing the UI flow.
    console.log("Saving progress for", studentId, progress[studentId]);
    alert("Progress saved (simulated)!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('progress_overview')}</h1>
      <div className="flex space-x-4 mb-4">
        <select onChange={(e) => setSelectedTeacherId(e.target.value)} defaultValue="" className="bg-input border border-border rounded-lg px-3 py-2 text-sm">
          <option value="" disabled>{t('select_teacher')}</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
        </select>
        <select onChange={(e) => setSelectedClassId(e.target.value)} defaultValue="" disabled={!selectedTeacherId} className="bg-input border border-border rounded-lg px-3 py-2 text-sm">
          <option value="" disabled>{t('select_class')}</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {loading && <div>{t('loading')}</div>}
      {selectedClassId && !loading && (
        <div className="bg-card p-4 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">{t('student_name')}</th>
                <th className="text-right p-2">{t('surah')}</th>
                <th className="text-right p-2">{t('ayah')}</th>
                <th className="text-right p-2">{t('page')}</th>
                <th className="text-right p-2">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b">
                  <td className="p-2">{student.full_name}</td>
                  <td className="p-2"><input type="number" value={progress[student.id]?.surah || ''} onChange={e => handleProgressChange(student.id, 'surah', e.target.value)} className="w-20 bg-input border rounded p-1"/></td>
                  <td className="p-2"><input type="number" value={progress[student.id]?.ayah || ''} onChange={e => handleProgressChange(student.id, 'ayah', e.target.value)} className="w-20 bg-input border rounded p-1"/></td>
                  <td className="p-2"><input type="number" value={progress[student.id]?.page || ''} onChange={e => handleProgressChange(student.id, 'page', e.target.value)} className="w-20 bg-input border rounded p-1"/></td>
                  <td className="p-2"><button onClick={() => handleSaveProgress(student.id)} className="bg-primary text-white py-1 px-3 rounded">{t('save')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
