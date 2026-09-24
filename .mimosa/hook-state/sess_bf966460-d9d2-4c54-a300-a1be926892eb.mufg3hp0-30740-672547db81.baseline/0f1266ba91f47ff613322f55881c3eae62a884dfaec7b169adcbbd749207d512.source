import React, { useState } from 'react';
import { Type, Trash2, Copy, GripVertical } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { useSortOrder } from './hooks/useSortOrder';
import { Toolbar } from './Toolbar';

interface BlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const SortOrderBlockComponent: React.FC<BlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    items,
    settings,
    addItem,
    removeItem,
    updateItem,
    duplicateItem,
    reorderItems,
    updateSettings,
  } = useSortOrder(block, idx, onUpdateBlock);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const themeColor = settings.themeColor || '#10B981';

  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setActiveBlockIndex(idx);
    setDraggedIndex(index);
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    reorderItems(draggedIndex, targetIndex);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-emerald-100 bg-emerald-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Type size={10} className="stroke-[2.5]" />} label="Bài tập sắp xếp thứ tự" />

      <Toolbar
        onAddItem={() => addItem('text')}
        settings={settings}
        onUpdateSettings={updateSettings}
        isBlockActive={isActive}
      />

      <div className="flex flex-col gap-2.5 mt-1 w-full">
        {items.length === 0 ? (
          <BlockEmptyState
            text="Chưa có mục sắp xếp."
            actionLabel="Thêm mục"
            onAction={() => addItem('text')}
            icon={<Type size={20} />}
          />
        ) : (
          <div className="flex flex-col gap-2.5 w-full">
            {items.map((item, index) => {
              const isDragging = index === draggedIndex;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ opacity: isDragging ? 0.4 : 1 }}
                  className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs hover:shadow-sm transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    {/* Drag indicator & index */}
                    <div className="flex items-center gap-1 shrink-0 select-none">
                      <div className="text-slate-350 cursor-grab active:cursor-grabbing">
                        <GripVertical size={12} />
                      </div>
                      <span
                        style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                        className="text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </span>
                    </div>

                    {/* Edit fields */}
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(item.id, { type: e.target.value as any, content: '' })}
                        className="text-[8px] font-bold text-slate-500 bg-transparent border-none outline-none cursor-pointer"
                      >
                        <option value="text">Văn bản</option>
                        <option value="image">Hình ảnh (URL)</option>
                      </select>

                      <EditableText
                        value={item.content}
                        onChange={(val) => updateItem(item.id, { content: val })}
                        placeholder={item.type === 'text' ? 'Nhập nội dung mục sắp xếp...' : 'Nhập liên kết ảnh URL...'}
                        className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-700 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => duplicateItem(item.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Nhân bản"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const SortOrderBlock = React.memo(SortOrderBlockComponent);
