import { useEffect, useMemo, useState } from 'react';
import { getUsersByRole, createUser, updateUser, deleteUser } from '../../../lib/api';
import { formatProgress } from '../../../utils/quran';
import AdminLayout from '../../../components/layouts/AdminLayout';
import Card from '../../../components/shared/Card';
import Modal from '../../../components/shared/Modal';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import PasswordInput from '../../../components/shared/PasswordInput';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { Plus, Edit, Trash2, X, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getClasses, getStudentsInClass, addStudentToClass } from '../../../lib/api';
import FilterableDropdown from '../../../components/shared/FilterableDropdown';

type Student = { id: string; full_name: string; phone: string | null; password_hash: string; progress_surah?: number | null; progress_ayah?: number | null; progress_page?: number | null };
type Teacher = { id: string; full_name: string; };
type Class = { id: string; name: string; teacher_id: string; };

export default function StudentsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ full_name: '', password: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [filteredItems, setFilteredItems] = useState<Student[]>([]);
  const [selectedClassToAssign, setSelectedClassToAssign] = useState<Class | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [studentData, teacherData, classData] = await Promise.all([
        getUsersByRole('student'),
        getUsersByRole('teacher'),
        getClasses(),
      ]);
      setItems(studentData || []);
      setTeachers(teacherData || []);
      setClasses(classData || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = items;
    if (selectedTeacher) {
      const teacherClasses = classes.filter((c) => c.teacher_id === selectedTeacher.id);
      const studentIds = teacherClasses.flatMap((c) => getStudentsInClass(c.id));
      Promise.all(studentIds).then((res) => {
        const ids = res.flat().map((s: any) => s.id);
        filtered = filtered.filter((student) => ids.includes(student.id));
        setFilteredItems(filtered);
      });
    }
    if (selectedClass) {
      getStudentsInClass(selectedClass.id).then((res) => {
        const ids = res.map((s: any) => s.id);
        filtered = filtered.filter((student) => ids.includes(student.id));
        setFilteredItems(filtered);
      });
    }
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  }, [selectedTeacher, selectedClass, searchQuery, items]);

  const openModal = (student: Student | null = null) => {
    setEditingStudent(student);
    setFormData({ full_name: student ? student.full_name : '', password: '', phone: student ? student.phone || '' : '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const openConfirmModal = (id: string) => {
    setDeletingStudentId(id);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setDeletingStudentId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const studentData = {
        ...formData,
        role: 'student',
      };

      if (editingStudent) {
        await updateUser(editingStudent.id, { full_name: studentData.full_name, phone: studentData.phone });
        if (selectedClassToAssign) {
          await addStudentToClass(selectedClassToAssign.id, editingStudent.id);
        }
      } else {
        const newUser = await createUser(studentData);
        if (selectedClassToAssign) {
          await addStudentToClass(selectedClassToAssign.id, newUser.id);
        }
      }
      await load();
      closeModal();
    } catch (e: any) {
      setError(e.message || 'Failed to save student');
    }
  };

  const handleDelete = async () => {
    if (!deletingStudentId) return;
    try {
      await deleteUser(deletingStudentId);
      await load();
      closeConfirmModal();
    } catch (e: any) {
      setError(e.message || 'Failed to delete student');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text">{t('students')}</h1>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> {t('addStudent')}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder={t('searchStudent')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-2">
          <FilterableDropdown
            items={teachers}
            selectedItem={selectedTeacher}
            onSelectItem={setSelectedTeacher}
            placeholder={t('selectTeacher')}
            label="full_name"
          />
          {selectedTeacher && (
            <button onClick={() => setSelectedTeacher(null)} className="p-2 bg-gray-200 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FilterableDropdown
            items={classes}
            selectedItem={selectedClass}
            onSelectItem={setSelectedClass}
            placeholder={t('selectClass')}
            label="name"
          />
          {selectedClass && (
            <button onClick={() => setSelectedClass(null)} className="p-2 bg-gray-200 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((student) => (
            <Card key={student.id}>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-text flex-1 min-w-0 break-words">{student.full_name}</h3>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => openModal(student)} className="text-muted hover:text-text transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => openConfirmModal(student.id)} className="text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
               {student.phone && (
                <div className="mt-2 text-sm text-muted">
                  {t('phone')}: {student.phone}
                </div>
              )}
              <div className="mt-2 text-sm text-muted">
                {formatProgress(student.progress_surah, student.progress_ayah, student.progress_page)}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStudent ? t('editStudent') : t('addStudent')}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-muted mb-2">{t('name')}</label>
            <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleFormChange} required className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
             <label htmlFor="phone" className="block text-sm font-medium text-muted mb-2">{t('phone')}</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">{t('password')}</label>
            <PasswordInput id="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingStudent} />
          </div>
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-muted mb-2">{t('class')}</label>
            <FilterableDropdown
              items={classes}
              selectedItem={selectedClassToAssign}
              onSelectItem={setSelectedClassToAssign}
              placeholder={t('selectClass')}
              label="name"
            />
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
        title={t('deleteStudent')}
        message={t('confirmDelete')}
      />
    </AdminLayout>
  );
}
