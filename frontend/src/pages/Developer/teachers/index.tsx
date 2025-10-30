import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersByRole, createUser, updateUser, deleteUser } from '../../../lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const TeachersPage = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [formData, setFormData] = useState({ full_name: '', password: '' });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole('teacher');
      setTeachers(data);
    } catch (err) {
      setError(t('error_fetching_teachers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [t]);

  const handleOpenModal = (teacher: any | null = null) => {
    setSelectedTeacher(teacher);
    setFormData(teacher ? { full_name: teacher.full_name, password: '' } : { full_name: '', password: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleOpenConfirm = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedTeacher(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { ...formData, role: 'teacher' };

      if (selectedTeacher) {
        // Hashing on update is not handled in this simplified example.
        // A full implementation would require a separate Edge Function.
        await updateUser(selectedTeacher.id, { full_name: userData.full_name });
      } else {
        await createUser(userData);
      }
      fetchTeachers();
      handleCloseModal();
    } catch (err) {
      setError(t('error_saving_teacher'));
    }
  };

  const handleDelete = async () => {
    if (selectedTeacher) {
      try {
        await deleteUser(selectedTeacher.id);
        fetchTeachers();
        handleCloseConfirm();
      } catch (err) {
        setError(t('error_deleting_teacher'));
      }
    }
  };

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('teacher_management')}</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <Plus size={20} className="mr-2" />
          {t('add_teacher')}
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
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b">
                <td className="p-2">{teacher.full_name}</td>
                <td className="p-2 flex justify-end space-x-2">
                  <button onClick={() => handleOpenModal(teacher)}><Edit size={20} /></button>
                  <button onClick={() => handleOpenConfirm(teacher)}><Trash2 size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedTeacher ? t('edit_teacher') : t('add_teacher')}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name">{t('full_name')}</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="password">{t('password')} ({selectedTeacher ? t('leave_blank_to_keep') : t('required')})</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required={!selectedTeacher} />
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
        onConfirm={handleDelete}
        title={t('confirm_delete')}
        message={t('are_you_sure_delete_teacher')}
      />
    </div>
  );
};

export default TeachersPage;
