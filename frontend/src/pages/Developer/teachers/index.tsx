import { useEffect, useMemo, useState } from 'react';
import { getUsersByRole, createUser, updateUser, deleteUser } from '../../../lib/api';
import { formatProgress } from '../../../utils/quran';
import AdminLayout from '../../../components/layouts/AdminLayout';
import Card from '../../../components/shared/Card';
import Modal from '../../../components/shared/Modal';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import PasswordInput from '../../../components/shared/PasswordInput';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Teacher = { id: string; name: string; };

export default function TeachersPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await getUsersByRole('teacher');
      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const openModal = (teacher: Teacher | null = null) => {
    setEditingTeacher(teacher);
    setFormData({ name: teacher ? teacher.name : '', password: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const openConfirmModal = (id: string) => {
    setDeletingTeacherId(id);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setDeletingTeacherId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const teacherData = {
        full_name: formData.name,
        password: formData.password,
        role: 'teacher',
      };

      if (editingTeacher) {
        await updateUser(editingTeacher.id, { full_name: teacherData.full_name });
      } else {
        await createUser(teacherData);
      }
      await load();
      closeModal();
    } catch (e: any) {
      setError(e.message || 'Failed to save teacher');
    }
  };

  const handleDelete = async () => {
    if (!deletingTeacherId) return;
    try {
      await deleteUser(deletingTeacherId);
      await load();
      closeConfirmModal();
    } catch (e: any) {
      setError(e.message || 'Failed to delete teacher');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text">{t('teachers')}</h1>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('addTeacher')}
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('searchTeacher')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.filter(teacher => teacher.name && teacher.name.toLowerCase().includes(searchQuery.toLowerCase())).map((teacher) => (
            <Card key={teacher.id}>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-text flex-1 min-w-0 break-words">{teacher.name}</h3>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => openModal(teacher)} className="text-muted hover:text-text transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => openConfirmModal(teacher.id)} className="text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTeacher ? t('editTeacher') : t('addTeacher')}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">{t('name')}</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">{t('password')}</label>
            <PasswordInput id="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingTeacher} />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
            <button type="button" onClick={closeModal} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-text font-bold py-2.5 px-5 rounded-lg transition-colors">{t('cancel')}</button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title={t('deleteTeacher')}
        message={t('confirmDelete')}
      />
    </AdminLayout>
  );
}
