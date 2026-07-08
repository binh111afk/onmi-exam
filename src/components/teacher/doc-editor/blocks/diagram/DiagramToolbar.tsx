import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { BlockToolbarButton } from '../common/BlockToolbarButton';
import type { DiagramSettings } from './DiagramTypes';

interface DiagramToolbarProps {
  isBlockActive: boolean;
  settings: DiagramSettings;
  onAddNode: () => void;
  onUpdateSettings: (settings: Partial<DiagramSettings>) => void;
  onOpenSettings: () => void;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  isBlockActive,
  onAddNode,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5 select-none animate-fadeIn gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onAddNode}
          icon={<Plus size={12} className="stroke-[2.5]" />}
          label="Thêm nút"
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
