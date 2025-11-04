import { useEffect, useMemo, useState } from 'react';
import { getClassesByTeacher, getStudentsInClass, updateStudentProgress, createStudentProgress } from '../../../lib/api';
import { surahNames, formatProgress } from '../../../utils/quran';
import AdminLayout from '../../../components/layouts/AdminLayout';
import Card from '../../../components/shared/Card';
import Modal from '../../../components/shared/Modal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';

type Student = { id: number; full_name: string; progress_id?: number | null; progress_surah?: number | null; progress_ayah?: number | null; progress_page?: number | null };

export default function ProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ surah: 1, ayah: 1, page: 1 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  async function load() {
    setLoading(true);
    try {
      if (user) {
        const classData = await getClassesByTeacher(String(user.id));
        setClasses(classData || []);
      }
      if (selectedClassId) {
        const data = await getStudentsInClass(selectedClassId);
        setStudents(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [selectedClassId, user]);

  const openModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ surah: student.progress_surah || 1, ayah: student.progress_ayah || 1, page: student.progress_page || 1 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setError(null);
    setSuccess(false);
    try {
      const progressData = {
        surah: formData.surah,
        ayah: formData.ayah,
        page: formData.page,
        student_id: editingStudent.id,
        class_id: parseInt(selectedClassId, 10),
      };

      if (typeof editingStudent.progress_id === 'number' && editingStudent.progress_id > 0) {
        await updateStudentProgress(String(editingStudent.progress_id), progressData);
      } else {
        await createStudentProgress(progressData);
      }

      await load();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      closeModal();
    } catch (e: any) {
      console.error("Failed to save progress:", e);
      setError(e.message || 'Failed to save progress');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-text mb-8">{t('manageProgress')}</h1>

      <div className="mb-6">
        <select
          onChange={(e) => setSelectedClassId(e.target.value)}
          value={selectedClassId}
          className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="" disabled>{t('select_a_class')}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('searchStudent')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-6">{t('progressSaved')}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {students.filter(student => student.full_name && student.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
            <Card key={student.id}>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-text flex-1 min-w-0 break-words">{student.full_name}</h3>
                <button onClick={() => openModal(student)} className="text-muted hover:text-text transition-colors">
                  <Edit size={18} />
                </button>
              </div>
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
        title={`${t('editProgressFor')} ${editingStudent?.full_name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="surah" className="block text-sm font-medium text-muted mb-2">{t('surah')}</label>
            <select id="surah" name="surah" value={formData.surah} onChange={handleFormChange} className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              {surahNames.map((n, i) => (
                <option key={i} value={i + 1}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ayah" className="block text-sm font-medium text-muted mb-2">{t('ayah')}</label>
            <input type="number" id="ayah" name="ayah" min={1} value={formData.ayah} onChange={handleFormChange} className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label htmlFor="page" className="block text-sm font-medium text-muted mb-2">{t('page')}</label>
            <input type="number" id="page" name="page" min={1} value={formData.page} onChange={handleFormChange} className="w-full bg-white border border-border text-text p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
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
    </AdminLayout>
  );
}
