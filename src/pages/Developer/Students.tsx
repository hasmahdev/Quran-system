import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import bcrypt from 'bcryptjs';
import { getUsersByRole, getClasses, createUser, updateUser, deleteUser, addStudentToClass, removeStudentFromClass } from '../../lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const StudentsPage = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [formData, setFormData] = useState({ full_name: '', username: '', password: '' });
  const [classIdToAssign, setClassIdToAssign] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentData = await getUsersByRole('student');
      const classData = await getClasses();
      setStudents(studentData);
      setClasses(classData);
    } catch (err) {
      setError(t('error_fetching_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  // CRUD Modal Handlers
  const handleOpenModal = (student: any | null = null) => {
    setSelectedStudent(student);
    setFormData(student ? { full_name: student.full_name, username: student.username, password: '' } : { full_name: '', username: '', password: '' });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Confirmation Modal Handlers
  const handleOpenConfirm = (student: any) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => setIsConfirmOpen(false);

  // Assign Modal Handlers
  const handleOpenAssignModal = (student: any) => {
    setSelectedStudent(student);
    setIsAssignModalOpen(true);
  };
  const handleCloseAssignModal = () => setIsAssignModalOpen(false);

  // Form Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData: any = { ...formData, role: 'student' };
      if (formData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(formData.password, salt);
      }
      delete userData.password;

      if (selectedStudent) {
        await updateUser(selectedStudent.id, userData);
      } else {
        await createUser(userData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      setError(t('error_saving_student'));
    }
  };

  const handleDelete = async () => {
    if (selectedStudent) {
      try {
        await deleteUser(selectedStudent.id);
        fetchData();
        handleCloseConfirm();
      } catch (err) {
        setError(t('error_deleting_student'));
      }
    }
  };

  const handleAssignToClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent && classIdToAssign) {
      try {
        await addStudentToClass(classIdToAssign, selectedStudent.id);
        // We could optionally refetch data here, but for now we just close the modal.
        handleCloseAssignModal();
      } catch (err) {
        setError(t('error_assigning_student'));
      }
    }
  };


  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('student_management')}</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <Plus size={20} className="mr-2" />
          {t('add_student')}
        </button>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-right p-2">{t('full_name')}</th>
              <th className="text-right p-2">{t('username')}</th>
              <th className="text-right p-2">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="p-2">{student.full_name}</td>
                <td className="p-2">{student.username}</td>
                <td className="p-2 flex justify-end space-x-2">
                  <button onClick={() => handleOpenAssignModal(student)} className="text-xs bg-blue-500 text-white py-1 px-2 rounded">{t('assign_to_class')}</button>
                  <button onClick={() => handleOpenModal(student)}><Edit size={20} /></button>
                  <button onClick={() => handleOpenConfirm(student)}><Trash2 size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Student Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedStudent ? t('edit_student') : t('add_student')}>
        <form onSubmit={handleSubmit}>
          {/* Form fields are the same as Teachers page */}
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name">{t('full_name')}</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="username">{t('username')}</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label htmlFor="password">{t('password')} ({selectedStudent ? t('leave_blank_to_keep') : t('required')})</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required={!selectedStudent} />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 py-2 px-4 rounded-lg">{t('cancel')}</button>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded-lg">{t('save')}</button>
          </div>
        </form>
      </Modal>

      {/* Assign to Class Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={handleCloseAssignModal} title={t('assign_to_class')}>
        <form onSubmit={handleAssignToClass}>
          <select onChange={(e) => setClassIdToAssign(e.target.value)} defaultValue="" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>{t('select_a_class')}</option>
            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
          <div className="mt-4 flex justify-end space-x-2">
            <button type="button" onClick={handleCloseAssignModal} className="bg-gray-200 py-2 px-4 rounded-lg">{t('cancel')}</button>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded-lg">{t('assign')}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title={t('confirm_delete')}
        message={t('are_you_sure_delete_student')}
      />
    </div>
  );
};

export default StudentsPage;
