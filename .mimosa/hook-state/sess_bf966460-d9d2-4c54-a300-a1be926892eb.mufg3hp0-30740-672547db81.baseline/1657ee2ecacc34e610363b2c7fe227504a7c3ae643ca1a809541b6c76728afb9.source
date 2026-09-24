import React from 'react';
import { Plus, Settings } from 'lucide-react';
import type { SortOrderSettings } from './Types';
import { SettingsDialog } from './SettingsDialog';

interface ToolbarProps {
  onAddItem: () => void;
  settings: SortOrderSettings;
  onUpdateSettings: (settings: Partial<SortOrderSettings>) => void;
  isBlockActive: boolean;
}

const SEP = () => <div className="w-px h-3.5 bg-slate-200 mx-0.5" />;

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddItem,
  settings,
  onUpdateSettings,
  isBlockActive
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  if (!isBlockActive) return null;

  const themeColor = settings.themeColor || '#10B981';

  return (
    <div className="mb-2 animate-fadeIn select-none">
      <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={onAddItem}
          style={{ color: themeColor }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition cursor-pointer"
        >
          <Plus size={12} className="stroke-[2.5]" /> Thêm mục sắp xếp
        </button>

        <SEP />

        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
          title="Cấu hình"
        >
          <Settings size={11} /> Cấu hình
        </button>
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={onUpdateSettings}
      />
    </div>
  );
};
