import React from 'react';
import { useTranslation } from 'react-i18next';
import { surahs } from '../../utils/surah';
import { X } from 'lucide-react';
import FilterableDropdown from './FilterableDropdown';

interface EditProgressDialogProps {
  student: any;
  onClose: () => void;
  onSave: (updatedProgress: any) => void;
}

const EditProgressDialog: React.FC<EditProgressDialogProps> = ({ student, onClose, onSave }) => {
  const { t } = useTranslation();
  const [surah, setSurah] = React.useState(surahs.find((s) => s.id === (student.surah || 1)));
  const [ayah, setAyah] = React.useState(student.ayah || 1);
  const [page, setPage] = React.useState(student.page || 1);

  const handleSave = () => {
    if (surah) {
      onSave({
        studentId: student.id,
        progressId: student.progress_id,
        surah: surah.id,
        ayah,
        page,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
      <div className="bg-white rounded-20 p-8 w-full max-w-sm shadow-card relative">
        <div className="relative text-center mb-6">
          <h2 className="text-xl font-bold">{`تعديل التقدم لـ ${student.progress_id}`}</h2>
          <button onClick={onClose} className="absolute top-0 left-0 text-muted hover:text-primary">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-right mb-2">السورة</label>
            <FilterableDropdown
              items={surahs}
              selectedItem={surah}
              onSelectItem={setSurah}
              placeholder={t('select_surah')}
              label="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-right mb-2">الآية</label>
            <input
              type="number"
              value={ayah}
              onChange={(e) => setAyah(Number(e.target.value))}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-right"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-right mb-2">الصفحة</label>
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-right"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white">{t('save')}</button>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700">{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default EditProgressDialog;
