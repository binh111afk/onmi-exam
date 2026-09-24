import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface TableToolbarProps {
  onAddRow:      () => void;
  onAddColumn:   () => void;
  onDeleteRow:   () => void;
  onDeleteColumn:() => void;
  onDeleteTable: () => void;
  isTableActive: boolean;
}

const SEP = () => <div className="w-px h-3.5 bg-slate-200 mx-0.5" />;

export const TableToolbar: React.FC<TableToolbarProps> = ({
  onAddRow, onAddColumn,
  onDeleteRow, onDeleteColumn, onDeleteTable,
  isTableActive,
}) => {
  if (!isTableActive) return null;

  const add = 'flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer';
  const del = 'flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-rose-500 hover:bg-rose-50 transition cursor-pointer';

  return (
    <div className="mb-2 animate-fadeIn select-none">
      <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* + Row / + Col */}
        <button onMouseDown={e => e.preventDefault()} onClick={onAddRow}    className={add} title="Thêm hàng">
          <Plus size={9} />Hàng
        </button>
        <button onMouseDown={e => e.preventDefault()} onClick={onAddColumn} className={add} title="Thêm cột">
          <Plus size={9} />Cột
        </button>

        <SEP />

        {/* - Row / - Col */}
        <button onMouseDown={e => e.preventDefault()} onClick={onDeleteRow}    className={del} title="Xoá hàng">
          <Trash2 size={9} />Hàng
        </button>
        <button onMouseDown={e => e.preventDefault()} onClick={onDeleteColumn} className={del} title="Xoá cột">
          <Trash2 size={9} />Cột
        </button>

        <SEP />

        {/* Delete table */}
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={onDeleteTable}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
          title="Xoá bảng"
        >
          <Trash2 size={9} />Xóa bảng
        </button>
      </div>
    </div>
  );
};
