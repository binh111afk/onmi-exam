import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import type { PublishedDocument } from '../../types/published';
import { lessonProgressService } from '../../services/lessonProgressService';

// Drawer "Mục lục" cho luồng student — danh sách chương/bài của tài liệu đã xuất bản,
// tick bài đã hoàn thành từ lessonProgressService (một nguồn duy nhất). KHÔNG phải cây sidebar teacher.
interface StudentDocDrawerProps {
  doc: PublishedDocument;
  open: boolean;
  onClose: () => void;
  currentLesson?: { chapterIdx: number; lessonIdx: number };
}

export const StudentDocDrawer: React.FC<StudentDocDrawerProps> = ({ doc, open, onClose, currentLesson }) => {
  const navigate = useNavigate();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Escape đóng + scroll-lock body — cleanup đầy đủ kể cả unmount giữa chừng khi đang mở
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Focus ban đầu vào nút X để Tab không rơi ra background
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const goChapter = (chapterIdx: number) => {
    onClose();
    navigate(`/library/${doc.id}/chapter/${chapterIdx}`);
  };
  const goLesson = (chapterIdx: number, lessonIdx: number) => {
    onClose();
    navigate(`/library/${doc.id}/chapter/${chapterIdx}/lesson/${lessonIdx}`);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mục lục tài liệu"
        className="absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-white shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <p className="text-[10px] font-black text-primary uppercase tracking-wider">Mục lục</p>
            <p className="text-sm font-bold text-text-primary truncate">{doc.title}</p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Đóng mục lục"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {doc.chapters.length === 0 && (
            <p className="text-xs text-slate-400 font-medium italic px-2">Chưa có chương</p>
          )}
          <div className="space-y-4">
            {doc.chapters.map((chapter, chapterIdx) => (
              <div key={chapter.id}>
                <button
                  onClick={() => goChapter(chapterIdx)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                >
                  <span className="block text-[10px] font-black text-primary uppercase tracking-wider leading-none">
                    {`Chương ${String(chapterIdx + 1).padStart(2, '0')}`}
                  </span>
                  <span className="block text-xs font-bold text-text-primary group-hover:text-primary truncate mt-0.5">
                    {chapter.title}
                  </span>
                </button>
                <div className="mt-1 space-y-0.5">
                  {chapter.lessons.map((lesson, lessonIdx) => {
                    const isCurrent = currentLesson?.chapterIdx === chapterIdx && currentLesson?.lessonIdx === lessonIdx;
                    const completed = lessonProgressService.isCompleted(doc.id, chapterIdx, lessonIdx);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goLesson(chapterIdx, lessonIdx)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition cursor-pointer ${isCurrent ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'}`}
                      >
                        <span className={`text-[10px] font-black shrink-0 ${isCurrent ? 'text-primary' : 'text-slate-300'}`}>
                          {String(lessonIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 min-w-0 text-xs font-bold truncate">{lesson.title}</span>
                        {completed && <CheckCircle2 size={14} className="text-success shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
