import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Tooltip } from './Tooltip';

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

export const GuideIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5 text-primary">
    <path opacity="0.5" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="currentColor" />
    <path d="M12 7.75C11.3787 7.75 10.875 8.25368 10.875 8.875C10.875 9.28921 10.5392 9.625 10.125 9.625C9.71079 9.625 9.375 9.28921 9.375 8.875C9.375 7.42525 10.5503 6.25 12 6.25C13.4497 6.25 14.625 7.42525 14.625 8.875C14.625 9.58584 14.3415 10.232 13.883 10.704C13.7907 10.7989 13.7027 10.8869 13.6187 10.9708C13.4029 11.1864 13.2138 11.3753 13.0479 11.5885C12.8289 11.8699 12.75 12.0768 12.75 12.25V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13V12.25C11.25 11.5948 11.555 11.0644 11.8642 10.6672C12.0929 10.3733 12.3804 10.0863 12.6138 9.85346C12.6842 9.78321 12.7496 9.71789 12.807 9.65877C13.0046 9.45543 13.125 9.18004 13.125 8.875C13.125 8.25368 12.6213 7.75 12 7.75Z" fill="currentColor" />
    <path d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" fill="currentColor" />
  </svg>
);

export const SaveIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5 text-primary">
    <path opacity="0.5" d="M20.5355 20.5355C22 19.0711 22 16.714 22 12C22 11.6585 22 11.4878 21.9848 11.3142C21.9142 10.5049 21.586 9.71257 21.0637 9.09034C20.9516 8.95687 20.828 8.83317 20.5806 8.58578L15.4142 3.41944C15.1668 3.17206 15.0431 3.04835 14.9097 2.93631C14.2874 2.414 13.4951 2.08581 12.6858 2.01515C12.5122 2 12.3415 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355C4.1485 21.2196 5.02727 21.5841 6.25 21.7784L7.75 21.9313C8.9058 22 10.2996 22 12 22C13.7004 22 15.0942 22 16.25 21.9313L17.75 21.7784C18.9727 21.5841 19.8515 21.2196 20.5355 20.5355Z" fill="currentColor" />
    <path d="M7 7.25C6.58579 7.25 6.25 7.58579 6.25 8C6.25 8.41421 6.58579 8.75 7 8.75H13C13.4142 8.75 13.75 8.41421 13.75 8C13.75 7.58579 13.4142 7.25 13 7.25H7Z" fill="currentColor" />
    <path d="M13.052 16.25C13.9505 16.25 14.6997 16.2499 15.2945 16.3299C15.9223 16.4143 16.4891 16.6 16.9445 17.0555C17.4 17.5109 17.5857 18.0777 17.6701 18.7055C17.7501 19.3003 17.75 20.0495 17.75 20.948V20.948L17.75 21.7812L16.25 21.9219V21C16.25 20.036 16.2484 19.3884 16.1835 18.9054C16.1214 18.4439 16.0142 18.2464 15.8839 18.1161C15.7536 17.9858 15.5561 17.8786 15.0946 17.8165C14.6116 17.7516 13.964 17.75 13 17.75H11C10.036 17.75 9.38843 17.7516 8.90539 17.8165C8.44393 17.8786 8.24644 17.9858 8.11612 18.1161C7.9858 18.2464 7.87858 18.4439 7.81654 18.9054C7.7516 19.3884 7.75 20.036 7.75 21V21.9258L6.25 21.7773L6.25 20.948V20.948C6.24997 20.0495 6.24995 19.3003 6.32991 18.7055C6.41432 18.0777 6.59999 17.5109 7.05546 17.0555C7.51093 16.6 8.07773 16.4143 8.70552 16.3299C9.3003 16.2499 10.0495 16.25 10.948 16.25H10.948H13.052H13.052Z" fill="currentColor" />
  </svg>
);

export const NextIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
    <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M2 6.42632L2 17.5737C2 19.4211 3.60065 20.5888 4.90313 19.6916L10.9998 15.2316V8.76844L4.90312 4.30838C3.60064 3.41122 2 4.57895 2 6.42632Z" fill="currentColor" />
    <path d="M11 7.12303L11 8.76844V15.2316V16.877C11 18.4934 12.4673 19.5152 13.6612 18.7302L21.0786 13.8532C22.3071 13.0455 22.3071 10.9545 21.0786 10.1468L13.6612 5.26983C12.4673 4.48482 11 5.50658 11 7.12303Z" fill="currentColor" />
  </svg>
);

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
