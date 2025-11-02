import { useEffect, useMemo, useState } from 'react';
import { getClasses, getUsersByRole, createClass, updateClass, deleteClass } from '../../../lib/api';
import { formatProgress } from '../../../utils/quran';
import AdminLayout from '../../../components/layouts/AdminLayout';
import Card from '../../../components/shared/Card';
import Modal from '../../../components/shared/Modal';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Class = { id: string; name: string; teacher_id: string; };
type Teacher = { id: string; full_name: string; };

export default function ClassesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', teacher_id: '' });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    setLoading(true);
    try {
      const classData = await getClasses();
      const teacherData = await getUsersByRole('teacher');
      setItems(classData || []);
      setTeachers(teacherData || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const openModal = (cls: Class | null = null) => {
    setEditingClass(cls);
    setFormData({ name: cls ? cls.name : '', teacher_id: cls ? cls.teacher_id : '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const openConfirmModal = (id: string) => {
    setDeletingClassId(id);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setDeletingClassId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const classData = {
        ...formData,
        teacher_id: parseInt(formData.teacher_id, 10),
      };
      if (editingClass) {
        await updateClass(editingClass.id, classData);
      } else {
        await createClass(classData);
      }
      await load();
      closeModal();
    } catch (e: any) {
      setError(e.message || 'Failed to save class');
    }
  };

  const handleDelete = async () => {
    if (!deletingClassId) return;
    try {
      await deleteClass(deletingClassId);
      await load();
      closeConfirmModal();
    } catch (e: any) {
      setError(e.message || 'Failed to delete class');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text">{t('classes')}</h1>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('addClass')}
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('searchClass')}
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
          {items.filter(cls => cls.name && cls.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cls) => (
            <Card key={cls.id}>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-text flex-1 min-w-0 break-words">{cls.name}</h3>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => openModal(cls)} className="text-muted hover:text-text transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => openConfirmModal(cls.id)} className="text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted">
                {t('teacher')}: {teachers.find(t => t.id === cls.teacher_id)?.full_name || 'N/A'}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClass ? t('editClass') : t('addClass')}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">{t('name')}</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label htmlFor="teacher_id" className="block text-sm font-medium text-muted mb-2">{t('teacher')}</label>
            <select id="teacher_id" name="teacher_id" value={formData.teacher_id} onChange={handleFormChange} required className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">{t('selectTeacher')}</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
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
        title={t('deleteClass')}
        message={t('confirmDelete')}
      />
    </AdminLayout>
  );
}
