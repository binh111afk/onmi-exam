import React from 'react';
import { CopyIcon, TrashIcon, AltArrowUpIcon, AltArrowDownIcon } from '../../AppIcons';
import type { DocBlock } from '../../../types/doc-editor';
import type { ToolbarAction } from './BlockWrapper';

interface BlockToolbarProps {
  customActions: ToolbarAction[];
  onAlign: (align: DocBlock['align']) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canExecute: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  customActions,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canExecute,
  canMoveUp,
  canMoveDown,
}) => {
  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute top-[-48px] left-[24px] bg-white border border-slate-200 rounded-xl shadow-lg flex items-center gap-1.5 p-1.5 z-30 select-none text-[10px] font-sans font-bold text-slate-700 animate-fadeIn"
    >
      {/* Block Custom Registered Actions */}
      {customActions.map((action) => (
        <button
          key={action.label}
          ref={action.ref}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            action.onTrigger();
          }}
          className="px-2.5 py-0.5 bg-white hover:bg-slate-50 text-slate-655 border border-slate-100 hover:border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer font-sans text-[11px] font-black h-7 shrink-0"
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}

      {customActions.length > 0 && <div className="h-5 w-px bg-slate-200 mx-0.5" />}

      {/* Move Actions */}
      <button
        type="button"
        disabled={!canMoveUp}
        onClick={onMoveUp}
        className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer h-7 w-7 flex items-center justify-center shrink-0"
      >
        <AltArrowUpIcon size={14} />
      </button>
      <button
        type="button"
        disabled={!canMoveDown}
        onClick={onMoveDown}
        className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer h-7 w-7 flex items-center justify-center shrink-0"
      >
        <AltArrowDownIcon size={14} />
      </button>

      <div className="h-5 w-px bg-slate-200 mx-0.5" />

      {/* Duplication & Deletion Actions */}
      <button
        type="button"
        onClick={onDuplicate}
        disabled={!canExecute}
        className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 transition cursor-pointer h-7 w-7 flex items-center justify-center shrink-0"
        title="Nhân bản"
      >
        <CopyIcon size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={!canExecute}
        className="p-1 rounded hover:bg-slate-100 hover:text-red-500 text-slate-500 disabled:opacity-40 transition cursor-pointer h-7 w-7 flex items-center justify-center shrink-0"
        title="Xóa"
      >
        <TrashIcon size={13} />
      </button>
    </div>
  );
};
