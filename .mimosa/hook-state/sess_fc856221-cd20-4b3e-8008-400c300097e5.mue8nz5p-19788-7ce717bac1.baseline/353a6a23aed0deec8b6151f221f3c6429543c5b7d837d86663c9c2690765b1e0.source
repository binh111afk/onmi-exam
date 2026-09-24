import React, { useState, useEffect } from 'react';
import { Columns, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { CompareToolbar } from './CompareToolbar';
import { CompareSettings } from './CompareSettings';
import { useCompare } from './hooks/useCompare';
import { createNewCompareContent } from './CompareUtils';

interface CompareBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const CompareBlockComponent: React.FC<CompareBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    columns,
    settings,
    addColumn,
    deleteColumn,
    updateColumn,
    updateSettings,
    moveColumn,
  } = useCompare(block, idx, onUpdateBlock);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!block.compareContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        compareContent: createNewCompareContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);

  const themeColor = settings.themeColor || '#6366f1';

  // Layout grid for editor columns
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  }[Math.min(4, Math.max(1, columns.length))] || 'grid-cols-1';

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Columns size={10} className="stroke-[2.5]" />} label="Bảng so sánh" />

      <CompareToolbar
        isBlockActive={isActive}
        columnCount={columns.length}
        onAddColumn={addColumn}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col gap-3 mt-1 w-full">
        {columns.length === 0 ? (
          <BlockEmptyState
            text="Chưa có nội dung để so sánh."
            actionLabel="Thêm cột"
            onAction={addColumn}
            icon={<Columns size={20} />}
          />
        ) : (
          <div className={`grid ${gridClass} gap-3 items-stretch w-full animate-fadeIn`}>
            {columns.map((col, index) => (
              <div
                key={col.id}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:shadow-sm transition flex flex-col gap-3 group relative"
              >
                {/* Actions row inside each column card */}
                <div className="flex items-center justify-between gap-3 select-none">
                  <span
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                    className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  >
                    Đối tượng {index + 1}
                  </span>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveColumn(col.id, 'left');
                      }}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Di chuyển sang trái"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveColumn(col.id, 'right');
                      }}
                      disabled={index === columns.length - 1}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Di chuyển sang phải"
                    >
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteColumn(col.id);
                      }}
                      disabled={columns.length <= 2}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-655 disabled:opacity-30 cursor-pointer"
                      title="Xóa cột"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Edit inputs using EditableText */}
                <div className="flex flex-col gap-2 flex-1">
                  <EditableText
                    mode="input"
                    value={col.title}
                    onChange={(val) => updateColumn(col.id, { ...col, title: val })}
                    placeholder="Tên đối tượng (VD: Động vật)..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-black text-slate-800 outline-none transition"
                  />
                  <EditableText
                    mode="textarea"
                    rows={4}
                    value={col.content}
                    onChange={(val) => updateColumn(col.id, { ...col, content: val })}
                    placeholder="Mô tả hoặc đặc điểm chi tiết để so sánh..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-650 outline-none transition resize-none leading-relaxed flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CompareSettings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export const CompareBlock = React.memo(CompareBlockComponent);
