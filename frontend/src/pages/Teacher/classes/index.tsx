import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { getClassesByTeacher, createClass, updateClass, deleteClass } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import Modal from '../../../components/shared/Modal';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import AdminLayout from '../../../components/layouts/AdminLayout';
import ErrorDisplay from '../../../components/shared/ErrorDisplay';

const MyClassesPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getClassesByTeacher(String(user.id));
      setClasses(data || []);
    } catch (err) {
      setError(t('error_fetching_classes'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user, fetchClasses]);

  const handleOpenModal = (cls: any | null = null) => {
    setSelectedClass(cls);
    setFormData(cls ? { name: cls.name } : { name: '' });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenConfirm = (cls: any) => {
    setSelectedClass(cls);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => setIsConfirmOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, formData);
      } else {
        await createClass({ ...formData, teacher_id: user.id });
      }
      fetchClasses();
      handleCloseModal();
    } catch (err) {
      setError(t('error_saving_class'));
    }
  };

  const handleDelete = async () => {
    if (selectedClass) {
      try {
        await deleteClass(selectedClass.id);
        fetchClasses();
        handleCloseConfirm();
      } catch (err) {
        setError(t('error_deleting_class'));
      }
    }
  };

  const navigateToStudents = (classId: string) => {
    router.push(`/Teacher/roster?classId=${classId}`);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name && cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) return <AdminLayout><ErrorDisplay message={error} /></AdminLayout>;

  return (
    <AdminLayout loading={loading}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('my_classes')}</h1>
          <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Plus size={20} className="mr-2" />
            {t('create_class')}
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('search_classes')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-card p-4 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <BookOpen className="text-primary" />
                </div>
                <h2 className="text-xl font-bold">{cls.name}</h2>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => navigateToStudents(cls.id)} className="text-xs bg-blue-500 text-white py-1 px-2 rounded flex items-center"><Users size={16} className="mr-1" />{t('manage_students')}</button>
                <button onClick={() => handleOpenModal(cls)}><Edit size={20} /></button>
                <button onClick={() => handleOpenConfirm(cls)}><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedClass ? t('edit_class') : t('add_class')}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">{t('class_name')}</label>
          <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
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
        message={t('are_you_sure_delete_class')}
      />
    </AdminLayout>
  );
};

export default MyClassesPage;
