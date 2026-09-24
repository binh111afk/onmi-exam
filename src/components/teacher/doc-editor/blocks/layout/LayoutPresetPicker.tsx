import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Picker bố cục (pattern TableInsertModal) — block 'layout' CHỈ được tạo sau onPick
// (R1 — Gatekeeper: đóng picker không chọn thì không để block mồ côi).
interface LayoutPresetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (columns: number[]) => void;
}

const PRESETS: Array<{ label: string; cols: number[] }> = [
  { label: '1 cột', cols: [1] },
  { label: '2 cột · 50/50', cols: [1, 1] },
  { label: '2 cột · 8/4', cols: [2, 1] },
  { label: '2 cột · 4/8', cols: [1, 2] },
  { label: '3 cột đều', cols: [1, 1, 1] },
];

export const LayoutPresetPicker: React.FC<LayoutPresetPickerProps> = ({ isOpen, onClose, onPick }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-5 font-sans">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800">Chọn bố cục</h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Mỗi ô chứa nhiều block xếp dọc — có thể thay đổi tư duy trình bày bài học</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPick(preset.cols)}
              className="group border border-slate-200 hover:border-primary hover:bg-primary-light/30 rounded-xl p-3 flex flex-col items-center gap-2.5 transition cursor-pointer"
            >
              <div
                className="w-full h-14 grid gap-1"
                style={{ gridTemplateColumns: preset.cols.map(c => `${c}fr`).join(' ') }}
              >
                {preset.cols.map((_, i) => (
                  <div key={i} className="rounded-md border border-slate-200 bg-slate-50 group-hover:border-primary/40 group-hover:bg-white transition" />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-600 group-hover:text-primary transition">{preset.label}</span>
            </button>
          ))}
        </div>

        <p className="text-[9px] font-medium text-slate-400 mt-3.5">
          Mẹo: mỗi ô là một trình soạn nhỏ — bấm “+ Thêm nội dung” trong ô để chèn văn bản, ảnh, công thức…
        </p>
      </div>
    </div>,
    document.body
  );
};
