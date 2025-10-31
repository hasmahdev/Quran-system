import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getClasses, getUsersByRole, createClass, updateClass, deleteClass } from '../../../lib/api';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AdminLayout from '../../../components/layouts/AdminLayout';
import withAuth from '../../../components/withAuth';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';

const ClassesPage = () => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', teacher_id: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const classData = await getClasses();
      const teacherData = await getUsersByRole('teacher');
      setClasses(classData);
      setTeachers(teacherData);
    } catch (err) {
      setError(t('error_fetching_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  const handleOpenModal = (cls: any | null = null) => {
    setSelectedClass(cls);
    setFormData(cls ? { name: cls.name, teacher_id: cls.teacher_id } : { name: '', teacher_id: '' });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenConfirm = (cls: any) => {
    setSelectedClass(cls);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => setIsConfirmOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, formData);
      } else {
        await createClass(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      setError(t('error_saving_class'));
    }
  };

  const handleDelete = async () => {
    if (selectedClass) {
      try {
        await deleteClass(selectedClass.id);
        fetchData();
        handleCloseConfirm();
      } catch (err) {
        setError(t('error_deleting_class'));
      }
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) return <AdminLayout><ErrorDisplay message={error} /></AdminLayout>;

  return (
    <AdminLayout loading={loading}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('class_management')}</h1>
          <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Plus size={20} className="mr-2" />
            {t('add_class')}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-card p-4 rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <BookOpen className="text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">{cls.name}</h2>
                </div>
                <p className="text-muted text-sm">{t('teacher')}: {cls.teacher?.full_name || t('unassigned')}</p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => handleOpenModal(cls)}><Edit size={20} /></button>
                <button onClick={() => handleOpenConfirm(cls)}><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedClass ? t('edit_class') : t('add_class')}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name">{t('class_name')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="teacher_id">{t('assign_teacher')}</label>
              <select name="teacher_id" value={formData.teacher_id} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required>
                <option value="">{t('select_teacher')}</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                ))}
              </select>
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
        message={t('are_you_sure_delete_class')}
      />
    </AdminLayout>
  );
};

export default withAuth(ClassesPage, ['developer']);
