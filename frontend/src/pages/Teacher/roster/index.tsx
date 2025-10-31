import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { getStudentsInClass, removeStudentFromClass, createUser, addStudentToClass } from '../../../lib/api';
import { Plus, Trash2, User } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import withAuth from '../../../components/withAuth';
import AdminLayout from '../../../components/layouts/AdminLayout';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenConfirm = (student: any) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => setIsConfirmOpen(false);

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

  const filteredStudents = students.filter(student =>
    student.full_name && student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <AdminLayout><div>{t('loading')}</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-600">{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('student_roster')}</h1>
          <button onClick={handleOpenModal} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Plus size={20} className="mr-2" />
            {t('add_student')}
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('search_students')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-card p-4 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <User className="text-primary" />
                </div>
                <span className="font-semibold">{student.full_name}</span>
              </div>
              <div className="flex justify-end">
                <button onClick={() => handleOpenConfirm(student)}><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={t('add_student')}>
        <form onSubmit={handleSubmit}>
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
    </AdminLayout>
  );
};

export default withAuth(StudentRosterPage, ['teacher']);
