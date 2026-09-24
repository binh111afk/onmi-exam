import React from 'react';
import { Plus, Layout, Settings, GitCommit } from 'lucide-react';
import { BlockToolbarButton } from '../common/BlockToolbarButton';
import type { FlowSettings } from './FlowTypes';

interface FlowToolbarProps {
  isBlockActive: boolean;
  settings: FlowSettings;
  onAddStep: () => void;
  onUpdateSettings: (settings: Partial<FlowSettings>) => void;
  onOpenSettings: () => void;
}

export const FlowToolbar: React.FC<FlowToolbarProps> = ({
  isBlockActive,
  settings,
  onAddStep,
  onUpdateSettings,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5 select-none animate-fadeIn gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onAddStep}
          icon={<Plus size={12} className="stroke-[2.5]" />}
          label="Thêm bước"
        />

        <BlockToolbarButton
          onClick={() => {
            const layouts: Array<FlowSettings['layout']> = ['horizontal', 'vertical', 'zigzag'];
            const idx = layouts.indexOf(settings.layout);
            const nextLayout = layouts[(idx + 1) % layouts.length];
            onUpdateSettings({ layout: nextLayout });
          }}
          icon={<Layout size={12} />}
          label={`Bố cục: ${settings.layout === 'horizontal' ? 'Ngang' : settings.layout === 'vertical' ? 'Dọc' : 'Zigzag'}`}
        />

        <BlockToolbarButton
          onClick={() => {
            const styles: Array<FlowSettings['arrowStyle']> = ['straight', 'dashed', 'curved'];
            const idx = styles.indexOf(settings.arrowStyle);
            const nextStyle = styles[(idx + 1) % styles.length];
            onUpdateSettings({ arrowStyle: nextStyle });
          }}
          icon={<GitCommit size={12} />}
          label={`Mũi tên: ${settings.arrowStyle === 'straight' ? 'Thẳng' : settings.arrowStyle === 'dashed' ? 'Đứt nét' : 'Cong'}`}
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
