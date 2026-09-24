import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { GuideIcon, SaveIcon, NextIcon } from '../../AppIcons';

export type EditorView = 'compose' | 'split' | 'preview';

interface DocEditorHeaderProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  isDirty: boolean;
  lastSavedTime: string | null;
  editorView: EditorView;
  setEditorView: (view: EditorView) => void;
  courseTitle: string;
  chapterTitle: string;
  lessonTitle: string;
  onOpenGuide: () => void;
  onSave: () => void;
  onNext: () => void;
}

const VIEW_TABS: Array<{ id: EditorView; label: string }> = [
  { id: 'compose', label: 'Soạn thảo' },
  { id: 'split', label: 'Chia đôi' },
  { id: 'preview', label: 'Xem trước' },
];

export const DocEditorHeader: React.FC<DocEditorHeaderProps> = ({
  setMode,
  isDirty,
  lastSavedTime,
  editorView,
  setEditorView,
  courseTitle,
  chapterTitle,
  lessonTitle,
  onOpenGuide,
  onSave,
  onNext,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-100 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 select-none">
      {/* Left: back + breadcrumb (course / chapter / lesson) */}
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip content="Quay lại Dashboard">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setMode('dashboard');
            }}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer shrink-0"
          >
            <ChevronLeft size={18} className="stroke-[2.5]" />
          </button>
        </Tooltip>
        <div className="flex items-center gap-1.5 min-w-0 text-[10px] font-bold">
          {courseTitle && (
            <>
              <span className="hidden md:inline text-slate-400 truncate max-w-[140px]">{courseTitle}</span>
              <span className="hidden md:inline text-slate-300">/</span>
            </>
          )}
          {chapterTitle && (
            <>
              <span className="hidden lg:inline text-slate-400 truncate max-w-[120px]">{chapterTitle}</span>
              <span className="hidden lg:inline text-slate-300">/</span>
            </>
          )}
          <span className="truncate max-w-[130px] sm:max-w-[200px] text-slate-800">{lessonTitle}</span>
        </div>
      </div>

      {/* Center: view switcher (Soạn thảo / Chia đôi / Xem trước) */}
      <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 text-[10px] font-bold text-slate-500 select-none bg-slate-50/50 shrink-0">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setEditorView(tab.id)}
            className={`px-2 sm:px-3 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
              editorView === tab.id
                ? 'bg-white text-primary shadow-sm font-black'
                : 'hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: save state + actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {isDirty ? (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-500 font-bold">
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse" />
            Chưa lưu
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
            {lastSavedTime ? `Đã lưu ${lastSavedTime}` : 'Đã đồng bộ'}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Tooltip content="Hướng dẫn sử dụng">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onOpenGuide}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer"
            >
              <GuideIcon />
            </button>
          </Tooltip>
          <Tooltip content="Lưu nháp">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onSave}
              className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary-light text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <SaveIcon /> <span className="hidden sm:inline text-slate-700">Lưu</span>
            </button>
          </Tooltip>
          <Tooltip content="Tiếp theo">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onNext}
              className="px-3 py-1.5 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100"
            >
              <NextIcon /> <span className="hidden sm:inline">Tiếp theo</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
