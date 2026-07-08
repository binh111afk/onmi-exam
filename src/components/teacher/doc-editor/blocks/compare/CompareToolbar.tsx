import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { BlockToolbarButton } from '../common/BlockToolbarButton';

interface CompareToolbarProps {
  isBlockActive: boolean;
  columnCount: number;
  onAddColumn: () => void;
  onOpenSettings: () => void;
}

export const CompareToolbar: React.FC<CompareToolbarProps> = ({
  isBlockActive,
  columnCount,
  onAddColumn,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5 select-none animate-fadeIn gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onAddColumn}
          disabled={columnCount >= 4}
          icon={<Plus size={12} className="stroke-[2.5]" />}
          label="Thêm cột"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onOpenSettings}
          icon={<Settings size={12} />}
          label="Cấu hình"
        />
      </div>
    </div>
  );
};
