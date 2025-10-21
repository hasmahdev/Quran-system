import { useEffect, useMemo, useState } from 'react';
import { useAdminGuard } from '../../../hooks/useAuthProtected';
import { getSupabase } from '../../../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { formatProgress } from '../../../utils/quran';
import AdminLayout from '../../../components/layouts/AdminLayout';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import PasswordInput from '../../../components/ui/PasswordInput';
import { Plus, Edit, Trash2 } from 'lucide-react';

type Student = { id: string; name: string; password_hash: string; progress_surah?: number | null; progress_ayah?: number | null };

export default function StudentsPage() {
  useAdminGuard();
  const supabase = useMemo(() => getSupabase(), []);
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('id,name,password_hash,progress_surah,progress_ayah')
      .order('name');
    if (error) setError(error.message);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const openModal = (student: Student | null = null) => {
    setEditingStudent(student);
    setFormData({ name: student ? student.name : '', password: '' });
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
      if (editingStudent) {
        // Update student
        const { error } = await supabase.from('students').update({ name: formData.name }).eq('id', editingStudent.id);
        if (error) throw error;
        if (formData.password) {
          const hash = await bcrypt.hash(formData.password, 10);
          const { error: passwordError } = await supabase.from('students').update({ password_hash: hash }).eq('id', editingStudent.id);
          if (passwordError) throw passwordError;
        }
      } else {
        // Add new student
        const hash = await bcrypt.hash(formData.password, 10);
        const { error } = await supabase.from('students').insert({ name: formData.name, password_hash: hash });
        if (error) throw error;
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
      const { error } = await supabase.from('students').delete().eq('id', deletingStudentId);
      if (error) throw error;
      await load();
      closeConfirmModal();
    } catch (e: any) {
      setError(e.message || 'Failed to delete student');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Students</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform active:scale-95"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      {error && <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((student) => (
          <Card key={student.id}>
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-lg font-bold text-white flex-1 min-w-0 break-words">{student.name}</h3>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => openModal(student)} className="text-gray-400 hover:text-white transition-colors">
                  <Edit size={18} />
                </button>
                <button onClick={() => openConfirmModal(student.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {formatProgress(student.progress_surah, student.progress_ayah)}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full bg-black/30 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <PasswordInput id="password" name="password" value={formData.password} onChange={handleFormChange} required={!editingStudent} />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeModal} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-5 rounded-lg transition-colors">Cancel</button>
            <button
              type="submit"
              className="bg-primary hover:bg-opacity-90 text-white font-bold py-2.5 px-5 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student?"
      />
    </AdminLayout>
  );
}
