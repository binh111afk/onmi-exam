import React from 'react';
import { Plus, Layout, RefreshCw, Settings } from 'lucide-react';
import { BlockToolbarButton } from '../common/BlockToolbarButton';
import type { TimelineSettings } from './TimelineTypes';

interface TimelineToolbarProps {
  isBlockActive: boolean;
  settings: TimelineSettings;
  onAddEvent: () => void;
  onUpdateSettings: (settings: Partial<TimelineSettings>) => void;
  onOpenSettings: () => void;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  isBlockActive,
  settings,
  onAddEvent,
  onUpdateSettings,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5 select-none animate-fadeIn gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onAddEvent}
          icon={<Plus size={12} className="stroke-[2.5]" />}
          label="Thêm mốc"
        />

        <BlockToolbarButton
          onClick={() => onUpdateSettings({ layout: settings.layout === 'vertical' ? 'horizontal' : 'vertical' })}
          icon={<Layout size={12} />}
          label={`Bố cục: ${settings.layout === 'vertical' ? 'Dọc' : 'Ngang'}`}
        />

        <BlockToolbarButton
          onClick={() => onUpdateSettings({ direction: settings.direction === 'normal' ? 'reverse' : 'normal' })}
          icon={<RefreshCw size={12} />}
          label={`Đảo chiều: ${settings.direction === 'reverse' ? 'Bật' : 'Tắt'}`}
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
