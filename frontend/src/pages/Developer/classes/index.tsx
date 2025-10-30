import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getClasses, getUsersByRole, createClass, updateClass, deleteClass } from '../../../lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AdminLayout from '../../../components/layouts/AdminLayout';

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenConfirm = (cls: any) => {
    setSelectedClass(cls);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedClass(null);
  };

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

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('class_management')}</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <Plus size={20} className="mr-2" />
          {t('add_class')}
        </button>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-right p-2">{t('class_name')}</th>
              <th className="text-right p-2">{t('teacher')}</th>
              <th className="text-right p-2">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-b">
                <td className="p-2">{cls.name}</td>
                <td className="p-2">{cls.teacher?.full_name || t('unassigned')}</td>
                <td className="p-2 flex justify-end space-x-2">
                  <button onClick={() => handleOpenModal(cls)}><Edit size={20} /></button>
                  <button onClick={() => handleOpenConfirm(cls)}><Trash2 size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
    </AdminLayout>
  );
};

export default ClassesPage;
