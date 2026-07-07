import React from 'react';
import { 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify 
} from 'lucide-react';
import type { DocBlock } from '../../../types/doc-editor';
import type { ToolbarAction } from './BlockWrapper';

interface BlockToolbarProps {
  block: DocBlock;
  idx: number;
  customActions: ToolbarAction[];
  onAlign: (align: DocBlock['align']) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  moveBlockUp: (i: number) => void;
  moveBlockDown: (i: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  block,
  idx,
  customActions,
  onAlign,
  onDuplicate,
  onDelete,
  moveBlockUp,
  moveBlockDown,
  canMoveUp,
  canMoveDown,
}) => {
  const currentAlign = block.align || 'left';

  return (
    <div
      onMouseDown={(e) => e.preventDefault()} // Lock focus to prevent blurs when clicking buttons
      className="absolute top-[-36px] left-[24px] bg-white border border-slate-200 rounded-xl shadow-lg flex items-center gap-1.5 p-1 z-30 select-none text-[10px] font-sans font-bold text-slate-700 animate-fadeIn"
    >
      {/* Block Custom Registered Actions */}
      {customActions.map((action) => (
        <button
          key={action.label}
          ref={action.ref}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            action.onTrigger();
          }}
          className="px-2 py-0.5 bg-white hover:bg-slate-50 text-slate-655 border border-slate-100 hover:border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer font-sans text-[9.5px] font-black h-6 shrink-0"
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}

      {customActions.length > 0 && <div className="h-4 w-px bg-slate-200 mx-0.5" />}

      {/* Alignment Presets */}
      <div className="flex items-center gap-0.5 border border-slate-100 rounded-lg p-0.5 bg-slate-50/50">
        <button
          type="button"
          onClick={() => onAlign('left')}
          className={`p-0.5 rounded transition cursor-pointer ${currentAlign === 'left' ? 'bg-white shadow-sm text-primary' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          <AlignLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => onAlign('center')}
          className={`p-0.5 rounded transition cursor-pointer ${currentAlign === 'center' ? 'bg-white shadow-sm text-primary' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          <AlignCenter size={13} />
        </button>
        <button
          type="button"
          onClick={() => onAlign('right')}
          className={`p-0.5 rounded transition cursor-pointer ${currentAlign === 'right' ? 'bg-white shadow-sm text-primary' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          <AlignRight size={13} />
        </button>
        <button
          type="button"
          onClick={() => onAlign('justify')}
          className={`p-0.5 rounded transition cursor-pointer ${currentAlign === 'justify' ? 'bg-white shadow-sm text-primary' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          <AlignJustify size={13} />
        </button>
      </div>

      <div className="h-4 w-px bg-slate-200 mx-0.5" />

      {/* Move Actions */}
      <button
        type="button"
        disabled={!canMoveUp}
        onClick={() => moveBlockUp(idx)}
        className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer h-6 w-6 flex items-center justify-center shrink-0"
      >
        <ChevronUp size={13} />
      </button>
      <button
        type="button"
        disabled={!canMoveDown}
        onClick={() => moveBlockDown(idx)}
        className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer h-6 w-6 flex items-center justify-center shrink-0"
      >
        <ChevronDown size={13} />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-0.5" />

      {/* Duplication & Deletion Actions */}
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1 rounded hover:bg-slate-100 text-slate-500 transition cursor-pointer h-6 w-6 flex items-center justify-center shrink-0"
        title="Nhân bản"
      >
        <Copy size={12} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded hover:bg-slate-100 hover:text-red-500 text-slate-500 transition cursor-pointer h-6 w-6 flex items-center justify-center shrink-0"
        title="Xóa"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};
