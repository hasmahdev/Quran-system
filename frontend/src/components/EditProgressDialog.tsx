import React from 'react';
import { useTranslation } from 'react-i18next';
import { surahs } from '../utils/surah';
import { X } from 'lucide-react';

interface EditProgressDialogProps {
  student: any;
  onClose: () => void;
  onSave: (updatedProgress: any) => void;
}

const EditProgressDialog: React.FC<EditProgressDialogProps> = ({ student, onClose, onSave }) => {
  const { t } = useTranslation();
  const [surah, setSurah] = React.useState(student.surah || 1);
  const [ayah, setAyah] = React.useState(student.ayah || 1);
  const [page, setPage] = React.useState(student.page || 1);

  const handleSave = () => {
    onSave({
      progressId: student.progress_id,
      surah,
      ayah,
      page,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('edit_progress_for')} {student.full_name}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('surah')}</label>
            <select
              value={surah}
              onChange={(e) => setSurah(Number(e.target.value))}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm"
            >
              {surahs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('ayah')}</label>
            <input
              type="number"
              value={ayah}
              onChange={(e) => setAyah(Number(e.target.value))}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('page')}</label>
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-border">
            {t('cancel')}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white">
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProgressDialog;
