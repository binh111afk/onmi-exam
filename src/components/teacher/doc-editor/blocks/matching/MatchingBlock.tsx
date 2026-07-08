import React, { useState, useEffect } from 'react';
import { Layers, Trash2 } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { MatchingToolbar } from './MatchingToolbar';
import { MatchingSettings } from './MatchingSettings';
import { useMatching } from './hooks/useMatching';
import { createNewMatchingContent } from './MatchingUtils';

interface MatchingBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const MatchingBlockComponent: React.FC<MatchingBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    pairs,
    settings,
    addPair,
    deletePair,
    updatePair,
    shufflePairs,
    updateSettings,
  } = useMatching(block, idx, onUpdateBlock);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!block.matchingContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        matchingContent: createNewMatchingContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);

  const themeColor = settings.themeColor || '#6366f1';

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Layers size={10} className="stroke-[2.5]" />} label="Bài tập ghép nối" />

      <MatchingToolbar
        isBlockActive={isActive}
        onAddPair={addPair}
        onShufflePairs={shufflePairs}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col gap-3 mt-1 w-full">
        {pairs.length === 0 ? (
          <BlockEmptyState
            text="Chưa có cặp ghép."
            actionLabel="Thêm cặp"
            onAction={addPair}
            icon={<Layers size={20} />}
          />
        ) : (
          <div className="flex flex-col gap-2.5 w-full animate-fadeIn">
            {pairs.map((pair, index) => (
              <div
                key={pair.id}
                className="bg-white rounded-xl border border-slate-150 p-3 shadow-2xs hover:shadow-sm transition flex items-center justify-between gap-3 group"
              >
                {/* Number indicator */}
                <span
                  style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                  className="text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center select-none"
                >
                  {index + 1}
                </span>

                {/* Edit columns side by side */}
                <div className="grid grid-cols-2 gap-3.5 flex-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider select-none">Vế trái</label>
                    <EditableText
                      mode="input"
                      value={pair.leftText}
                      onChange={(val) => updatePair(pair.id, { ...pair, leftText: val })}
                      placeholder="VD: Thủ đô Hà Nội..."
                      className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-700 outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider select-none">Vế phải</label>
                    <EditableText
                      mode="input"
                      value={pair.rightText}
                      onChange={(val) => updatePair(pair.id, { ...pair, rightText: val })}
                      placeholder="VD: Việt Nam..."
                      className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-700 outline-none transition"
                    />
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePair(pair.id);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-655 opacity-60 group-hover:opacity-100 transition duration-150 cursor-pointer"
                  title="Xóa cặp"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <MatchingSettings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export const MatchingBlock = React.memo(MatchingBlockComponent);
