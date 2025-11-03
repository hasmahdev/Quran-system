import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatProgress } from '../../utils/quran';
import { Edit2 } from 'lucide-react';
import Card from './Card';

interface ProgressCardProps {
  student: any;
  onEdit: (student: any) => void;
  disabled?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ student, onEdit, disabled }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div className="font-bold">{student.full_name}</div>
        <button onClick={() => onEdit(student)} className={`text-muted hover:text-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabled}>
          <Edit2 size={18} />
        </button>
      </div>
      <div className="text-sm text-muted mt-2">
        {student.surah && student.ayah && student.page
          ? formatProgress(student.surah, student.ayah, student.page)
          : t('unassigned')}
      </div>
    </Card>
  );
};

export default ProgressCard;
