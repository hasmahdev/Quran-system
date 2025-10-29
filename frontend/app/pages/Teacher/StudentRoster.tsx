import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { getStudentsInClass, removeStudentFromClass, createUser, addStudentToClass } from '../../lib/api';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const StudentRosterPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { classId } = router.query;
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [formData, setFormData] = useState({ full_name: '', password: '' });

  const fetchStudents = async () => {
    if (classId) {
      setLoading(true);
      try {
        const data = await getStudentsInClass(classId as string);
        setStudents(data);
      } catch (err) {
        setError(t('error_fetching_students'));
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId, t]);

  // Modal Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Confirmation Modal Handlers
  const handleOpenConfirm = (student: any) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => setIsConfirmOpen(false);

  // Form Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { ...formData, role: 'student' };
      const newUser = await createUser(userData);

      if (newUser && newUser.length > 0) {
        await addStudentToClass(classId as string, newUser[0].id);
      }

      fetchStudents();
      handleCloseModal();
    } catch (err) {
      setError(t('error_saving_student'));
    }
  };

  const handleRemove = async () => {
    if (selectedStudent && classId) {
      try {
        await removeStudentFromClass(classId as string, selectedStudent.id);
        fetchStudents();
        handleCloseConfirm();
      } catch (err) {
        setError(t('error_removing_student'));
      }
    }
  };


  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('student_roster')}</h1>
        <button onClick={handleOpenModal} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <Plus size={20} className="mr-2" />
          {t('add_student')}
        </button>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-right p-2">{t('full_name')}</th>
              <th className="text-right p-2">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="p-2">{student.full_name}</td>
                <td className="p-2 flex justify-end">
                  <button onClick={() => handleOpenConfirm(student)}><Trash2 size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={t('add_student')}>
        <form onSubmit={handleSubmit}>
          {/* Form fields for creating a new student */}
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name">{t('full_name')}</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="password">{t('password')}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 py-2 px-4 rounded-lg">{t('cancel')}</button>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded-lg">{t('save')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleRemove}
        title={t('confirm_removal')}
        message={t('are_you_sure_remove_student')}
      />
    </div>
  );
};

export default StudentRosterPage;
