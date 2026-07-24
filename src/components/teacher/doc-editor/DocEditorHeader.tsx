import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { GuideIcon, SaveIcon, NextIcon } from '../../AppIcons';

interface DocEditorHeaderProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  isDirty: boolean;
  lastSavedTime: string | null;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  onOpenGuide: () => void;
  onSave: () => void;
  onNext: () => void;
}

export const DocEditorHeader: React.FC<DocEditorHeaderProps> = ({
  setMode,
  isDirty,
  lastSavedTime,
  showPreview,
  setShowPreview,
  onOpenGuide,
  onSave,
  onNext,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3.5">
        <Tooltip content="Quay lại Dashboard">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setMode('dashboard');
            }}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
          >
            <ChevronLeft size={18} className="stroke-[2.5]" />
          </button>
        </Tooltip>

        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={onOpenGuide}
          className="px-2.5 py-1.5 text-primary hover:bg-primary-light rounded-xl transition cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
        >
          <GuideIcon />
          <span className="text-slate-700">Hướng dẫn sử dụng</span>
        </button>
      </div>

      {/* Mode Tab List (Soạn thảo | Xem trước) */}
      <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-0.5 text-[10px] font-bold text-slate-500 select-none bg-slate-50/50">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1 rounded-lg transition cursor-pointer ${
            !showPreview
              ? 'bg-white text-primary shadow-sm font-black'
              : 'hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          Soạn thảo
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1 rounded-lg transition cursor-pointer ${
            showPreview
              ? 'bg-white text-primary shadow-sm font-black'
              : 'hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          Xem trước
        </button>
      </div>

      <div className="flex items-center gap-4">
        {isDirty ? (
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-amber-500 font-bold">
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse" />
            Có thay đổi chưa lưu
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            {lastSavedTime ? `Đã lưu ${lastSavedTime}` : 'Đã đồng bộ'}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Tooltip content="Lưu nháp">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onSave}
              className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary-light text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <SaveIcon /> <span className="text-slate-700">Lưu</span>
            </button>
          </Tooltip>
          <Tooltip content="Tiếp theo">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onNext}
              className="px-3 py-1.5 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100"
            >
              <NextIcon /> Tiếp theo
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
