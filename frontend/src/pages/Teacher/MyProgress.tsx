import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getClassesByTeacher, getStudentsInClass, getProgressForClass, updateStudentProgress } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

const MyProgressPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        setTeacherId(decodedToken.id);
      } catch (error) {
        console.error('Invalid token:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (teacherId) {
      const fetchClasses = async () => {
        const classData = await getClassesByTeacher(teacherId);
        setClasses(classData);
      };
      fetchClasses();
    }
  }, [teacherId]);

  useEffect(() => {
    if (selectedClassId) {
      const fetchStudentsAndProgress = async () => {
        setLoading(true);
        const studentData = await getStudentsInClass(selectedClassId);
        setStudents(studentData);
        // This is a simplified approach. A full implementation would need to
        // fetch or create progress records for each student.
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
    // Simplified save logic.
    console.log("Saving progress for", studentId, progress[studentId]);
    alert("Progress saved (simulated)!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('student_progress')}</h1>
      <select onChange={(e) => setSelectedClassId(e.target.value)} defaultValue="" className="bg-input border border-border rounded-lg px-3 py-2 text-sm mb-4">
        <option value="" disabled>{t('select_a_class')}</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

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

export default MyProgressPage;
