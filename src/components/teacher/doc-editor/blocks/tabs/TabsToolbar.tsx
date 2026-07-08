import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { BlockToolbarButton } from '../common/BlockToolbarButton';
import type { TabsSettings } from './TabsTypes';

interface TabsToolbarProps {
  isBlockActive: boolean;
  settings: TabsSettings;
  onAddTab: () => void;
  onOpenSettings: () => void;
}

export const TabsToolbar: React.FC<TabsToolbarProps> = ({
  isBlockActive,
  onAddTab,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5 select-none animate-fadeIn gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onAddTab}
          icon={<Plus size={12} className="stroke-[2.5]" />}
          label="Thêm tab"
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
