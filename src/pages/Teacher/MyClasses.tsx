import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { getClassesByTeacher, createClass, updateClass, deleteClass } from '../../lib/api';
import { getUserId } from '../../utils/auth';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

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
  const teacherId = getUserId();

  const fetchClasses = async () => {
    if (!teacherId) {
      setError("Teacher ID not found. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getClassesByTeacher(teacherId);
      setClasses(data);
    } catch (err) {
      setError(t('error_fetching_classes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [t, teacherId]);

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
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, formData);
      } else {
        await createClass({ ...formData, teacher_id: teacherId });
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
    router.push(`/Teacher/StudentRoster?classId=${classId}`);
  };

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('my_classes')}</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <Plus size={20} className="mr-2" />
          {t('create_class')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-card p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold">{cls.name}</h2>
              {/* Student count can be added later */}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => navigateToStudents(cls.id)} className="bg-blue-500 text-white py-1 px-3 rounded text-sm flex items-center"><Users size={16} className="mr-1"/>{t('manage_students')}</button>
              <button onClick={() => handleOpenModal(cls)}><Edit size={20} /></button>
              <button onClick={() => handleOpenConfirm(cls)}><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default MyClassesPage;
