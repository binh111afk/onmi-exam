import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Table, AlertCircle, Plus, Minus } from 'lucide-react';
import { Checkbox } from '../../Checkbox';

interface TableInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rows: number, cols: number, hasHeaderRow: boolean, hasHeaderCol: boolean) => void;
}

export const TableInsertModal: React.FC<TableInsertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeaderRow, setHasHeaderRow] = useState(false);
  const [hasHeaderCol, setHasHeaderCol] = useState(false);

  if (!isOpen) return null;

  const isValid = rows >= 1 && rows <= 20 && cols >= 1 && cols <= 20;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(rows, cols, hasHeaderRow, hasHeaderCol);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/15 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Surface Container */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn select-none">
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
              <Table className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5 w-full">
              <h3 className="text-sm font-black text-slate-800 leading-tight">
                Thiết lập kích thước bảng
              </h3>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                Nhập số lượng hàng và cột cho bảng mới của bạn (Giới hạn từ 1 đến 20).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-655 uppercase tracking-wider">Số hàng</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRows(prev => Math.max(1, prev - 1))}
                  disabled={rows <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <Minus size={11} className="stroke-[2.5]" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value, 10) || 0)}
                  className="w-12 text-center py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setRows(prev => Math.min(20, prev + 1))}
                  disabled={rows >= 20}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <Plus size={11} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-655 uppercase tracking-wider">Số cột</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCols(prev => Math.max(1, prev - 1))}
                  disabled={cols <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <Minus size={11} className="stroke-[2.5]" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value, 10) || 0)}
                  className="w-12 text-center py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setCols(prev => Math.min(20, prev + 1))}
                  disabled={cols >= 20}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <Plus size={11} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-1" />

            <div className="flex flex-col gap-2.5 pt-1">
              <Checkbox
                checked={hasHeaderRow}
                onChange={setHasHeaderRow}
                label={<span className="text-[10px] font-black text-slate-600">Dòng đầu là Tiêu đề (Header Row)</span>}
              />
              <Checkbox
                checked={hasHeaderCol}
                onChange={setHasHeaderCol}
                label={<span className="text-[10px] font-black text-slate-600">Cột đầu là Tiêu đề (Header Column)</span>}
              />
            </div>
            
            {!isValid && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500 bg-red-50/50 border border-red-100 rounded-lg p-2 mt-2">
                <AlertCircle size={12} className="stroke-[2.5]" />
                <span>Số lượng hàng và cột phải nằm trong khoảng từ 1 đến 20</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[10px] font-bold rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`px-4 py-2 text-[10px] font-black rounded-xl shadow-sm transition ${
                isValid
                  ? 'hover:shadow cursor-pointer bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white shadow-indigo-50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
              }`}
            >
              Tạo bảng
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
