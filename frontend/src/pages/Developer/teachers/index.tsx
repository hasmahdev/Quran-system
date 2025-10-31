import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersByRole, createUser, updateUser, deleteUser } from '../../../lib/api';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AdminLayout from '../../../components/layouts/AdminLayout';
import withAuth from '../../../components/withAuth';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';

const TeachersPage = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [formData, setFormData] = useState({ full_name: '', password: '' });
  const [searchQuery, setSearchQuery] = useState('');

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
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenConfirm = (teacher: any) => {
    setSelectedTeacher(teacher);
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
      const userData = { ...formData, role: 'teacher' };
      if (selectedTeacher) {
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

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name && teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) return <AdminLayout><ErrorDisplay message={error} /></AdminLayout>;

  return (
    <AdminLayout loading={loading}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('teacher_management')}</h1>
          <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Plus size={20} className="mr-2" />
            {t('add_teacher')}
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('search_teachers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-card p-4 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <User className="text-primary" />
                </div>
                <span className="font-semibold">{teacher.full_name}</span>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => handleOpenModal(teacher)}><Edit size={20} /></button>
                <button onClick={() => handleOpenConfirm(teacher)}><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
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
    </AdminLayout>
  );
};

export default withAuth(TeachersPage, ['developer']);
