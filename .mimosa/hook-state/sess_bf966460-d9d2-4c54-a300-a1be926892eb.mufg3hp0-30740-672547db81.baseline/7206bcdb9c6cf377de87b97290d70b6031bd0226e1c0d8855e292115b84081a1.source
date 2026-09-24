import React from 'react';
import { Plus, Shuffle, Settings } from 'lucide-react';
import { BlockToolbarButton } from '../common/BlockToolbarButton';

interface MatchingToolbarProps {
  isBlockActive: boolean;
  onAddPair: () => void;
  onShufflePairs: () => void;
  onOpenSettings: () => void;
}

export const MatchingToolbar: React.FC<MatchingToolbarProps> = ({
  isBlockActive,
  onAddPair,
  onShufflePairs,
  onOpenSettings,
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5 select-none animate-fadeIn gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <BlockToolbarButton
          onClick={onAddPair}
          icon={<Plus size={12} className="stroke-[2.5]" />}
          label="Thêm cặp"
        />

        <BlockToolbarButton
          onClick={onShufflePairs}
          icon={<Shuffle size={12} />}
          label="Trộn đáp án"
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
