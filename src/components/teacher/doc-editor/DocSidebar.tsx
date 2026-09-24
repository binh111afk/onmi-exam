import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit, Plus } from 'lucide-react';
import { TrashIcon } from '../../AppIcons';
import type { Chapter } from '../../../types/doc-editor';
import { Tooltip } from './Tooltip';

// Legacy-only: icon folder/file chỉ còn render cho dữ liệu cũ (isFolder / subLessons)
// — outline mới render 2 tầng Chương → Bài không dùng icon (user spec mục 12).
const FolderIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`block shrink-0 -translate-y-px text-primary ${className}`}>
    <path opacity="0.5" d="M2 6.94975C2 6.06722 2 5.62595 2.06935 5.25839C2.37464 3.64031 3.64031 2.37464 5.25839 2.06935C5.62595 2 6.06722 2 6.94975 2C7.33642 2 7.52976 2 7.71557 2.01738C8.51665 2.09229 9.27652 2.40704 9.89594 2.92051C10.0396 3.03961 10.1763 3.17633 10.4497 3.44975L11 4C11.8158 4.81578 12.2237 5.22367 12.7121 5.49543C12.9804 5.64471 13.2651 5.7626 13.5604 5.84678C14.0979 6 14.6747 6 15.8284 6H16.2021C18.8345 6 20.1506 6 21.0062 6.76946C21.0849 6.84024 21.1598 6.91514 21.2305 6.99383C22 7.84935 22 9.16554 22 11.7979V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V6.94975Z" fill="currentColor" />
    <path d="M8 9.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FileIcon: React.FC<{ size?: number; className?: string }> = ({ size = 11, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`block shrink-0 -translate-y-px text-primary ${className}`}>
    <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V10C2 6.22876 2 4.34315 3.17157 3.17157C4.34315 2 6.23869 2 10.0298 2C10.6358 2 11.1214 2 11.53 2.01666C11.5166 2.09659 11.5095 2.17813 11.5092 2.26057L11.5 5.09497C11.4999 6.19207 11.4998 7.16164 11.6049 7.94316C11.7188 8.79028 11.9803 9.63726 12.6716 10.3285C13.3628 11.0198 14.2098 11.2813 15.0569 11.3952C15.8385 11.5003 16.808 11.5002 17.9051 11.5001L18 11.5001H21.9574C22 12.0344 22 12.6901 22 13.5629V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22Z" fill="currentColor" />
    <path d="M11.5092 2.2601L11.5 5.0945C11.4999 6.1916 11.4998 7.16117 11.6049 7.94269C11.7188 8.78981 11.9803 9.6368 12.6716 10.3281C13.3629 11.0193 14.2098 11.2808 15.057 11.3947C15.8385 11.4998 16.808 11.4997 17.9051 11.4996L21.9574 11.4996C21.9698 11.6552 21.9786 11.821 21.9848 11.9995H22C22 11.732 22 11.5983 21.9901 11.4408C21.9335 10.5463 21.5617 9.52125 21.0315 8.79853C20.9382 8.6713 20.8743 8.59493 20.7467 8.44218C19.9542 7.49359 18.911 6.31193 18 5.49953C17.1892 4.77645 16.0787 3.98536 15.1101 3.3385C14.2781 2.78275 13.862 2.50487 13.2915 2.29834C13.1403 2.24359 12.9408 2.18311 12.7846 2.14466C12.4006 2.05013 12.0268 2.01725 11.5 2.00586L11.5092 2.2601Z" fill="currentColor" />
  </svg>
);

interface DocSidebarProps {
  chapters: Chapter[];
  activeLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  expandedNodeIds: Record<string, boolean>;
  onToggleNodeExpand: (nodeId: string) => void;
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string | null) => void;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string | null) => void;
  editingItemId: string | null;
  onStartEditing: (id: string | null) => void;
  onSaveEdit: (id: string, newTitle: string) => void;
  onCancelEdit: (id: string) => void;
  onCreateChapter: () => void;
  onCreateLesson: (chapterId: string, title?: string, isFolder?: boolean) => void;
  onDeleteChapter: (chapterId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteSubLesson: (lessonId: string, subLessonId: string) => void;
  onMoveLesson: (sourceLessonId: string, targetParentId: string, targetBeforeId?: string) => void;
  onChapterReorder: (sourceChapterId: string, targetChapterId: string) => void;
}

interface InlineInputProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const InlineInput: React.FC<InlineInputProps> = ({ initialValue, onSave, onCancel }) => {
  const [val, setVal] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSave(val);
    else if (e.key === 'Escape') onCancel();
  };
  return (
    <input
      ref={inputRef}
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(val)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full bg-slate-50 border border-slate-200 outline-none px-1 rounded text-[10px] font-bold text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary transition"
    />
  );
};

const TreeTitle: React.FC<{ title: string }> = ({ title }) => (
  <Tooltip content={title} triggerClassName="flex min-w-0 flex-1 items-center justify-start h-full animate-fadeIn">
    <span className="block w-full truncate">{title}</span>
  </Tooltip>
);

export const DocSidebar: React.FC<DocSidebarProps> = ({
  chapters, activeLessonId, onLessonSelect, expandedNodeIds, onToggleNodeExpand,
  selectedChapterId, onSelectChapter, selectedLessonId, onSelectLesson,
  editingItemId, onStartEditing, onSaveEdit, onCancelEdit,
  onCreateChapter, onCreateLesson,
  onDeleteChapter, onDeleteLesson, onDeleteSubLesson,
  onMoveLesson, onChapterReorder,
}) => {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleLessonDragStart = (e: React.DragEvent, lessonId: string) => {
    e.dataTransfer.setData('lessonId', lessonId);
  };
  const handleLessonDrop = (e: React.DragEvent, targetParentId: string, targetBeforeId?: string) => {
    e.preventDefault(); e.stopPropagation();
    const src = e.dataTransfer.getData('lessonId');
    if (src) onMoveLesson(src, targetParentId, targetBeforeId);
  };
  const handleChapterLessonDrop = (e: React.DragEvent, targetChapterId: string) => {
    e.preventDefault();
    const src = e.dataTransfer.getData('lessonId');
    if (src) onMoveLesson(src, targetChapterId);
  };
  const handleChapterDragStart = (e: React.DragEvent, chapterId: string) => {
    e.dataTransfer.setData('draggedChapterId', chapterId);
  };
  const handleChapterDrop = (e: React.DragEvent, targetChapterId: string) => {
    e.preventDefault();
    const src = e.dataTransfer.getData('draggedChapterId');
    if (src && src !== targetChapterId) onChapterReorder(src, targetChapterId);
  };

  return (
    <aside
      onClick={() => { onSelectChapter(null); onSelectLesson(null); }}
      className="w-[264px] bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto p-4 select-none"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">MỤC LỤC</span>
          <div className="relative">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); setAddMenuOpen(o => !o); }}
              className="flex items-center gap-1 px-2 py-1 bg-primary hover:bg-primary-hover text-white text-[9px] font-black rounded-lg transition cursor-pointer"
            >
              <Plus size={11} /> Thêm
            </button>
            {addMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setAddMenuOpen(false); }} />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 animate-fadeIn">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); onCreateChapter(); setAddMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={11} /> Thêm chương
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!selectedChapterId}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedChapterId) onCreateLesson(selectedChapterId);
                      setAddMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-[10px] font-bold flex items-center gap-1.5 transition ${selectedChapterId ? 'text-slate-700 hover:bg-slate-50 hover:text-primary cursor-pointer' : 'text-slate-300 cursor-default'}`}
                  >
                    <Plus size={11} /> Thêm bài học vào chương đang chọn
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {chapters.length === 0 && (
            <div className="text-[10px] text-slate-400 font-medium italic">Chưa có chương — bấm "+ Thêm" để bắt đầu</div>
          )}
          {chapters.map((ch, chapterIndex) => {
            const isChEditing = ch.id === editingItemId;
            const isChSelected = ch.id === selectedChapterId;
            return (
              <div key={ch.id} className="space-y-0.5" draggable={!isChEditing} onDragStart={(e) => handleChapterDragStart(e, ch.id)} onDragOver={handleDragOver} onDrop={(e) => handleChapterDrop(e, ch.id)}>
                {/* Chapter section header */}
                <div
                  onDragOver={handleDragOver} onDrop={(e) => handleChapterLessonDrop(e, ch.id)}
                  onClick={(e) => { e.stopPropagation(); onSelectChapter(ch.id); onSelectLesson(null); }}
                  onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(ch.id); }}
                  className={`group/ch w-full flex items-start justify-between gap-1 py-1.5 px-1.5 rounded-lg transition cursor-pointer ${isChSelected ? 'bg-slate-100/60 text-text-primary ring-1 ring-slate-200/50' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/30'}`}
                >
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleNodeExpand(ch.id); }} className="p-0.5 mt-0.5 rounded transition cursor-pointer shrink-0">
                      <ChevronDown size={12} className={`transition shrink-0 text-slate-400 ${expandedNodeIds[ch.id] ? '' : '-rotate-90'}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-black text-primary uppercase tracking-wider leading-none mb-0.5">
                        Chương {String(chapterIndex + 1).padStart(2, '0')}
                      </div>
                      {isChEditing ? (
                        <InlineInput initialValue={ch.title} onSave={(v) => onSaveEdit(ch.id, v)} onCancel={() => onCancelEdit(ch.id)} />
                      ) : (
                        <TreeTitle title={ch.title} />
                      )}
                    </div>
                  </div>
                  {!isChEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/ch:opacity-100 transition shrink-0 pt-1">
                      <Tooltip content="Sửa tên chương">
                        <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(ch.id); }} className="p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                      </Tooltip>
                      <Tooltip content="Xóa chương">
                        <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteChapter(ch.id); }} className="p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-red-500 rounded transition"><TrashIcon size={10} /></button>
                      </Tooltip>
                    </div>
                  )}
                </div>

                {/* Lessons inside Chapter — số thứ tự render-derived, không lưu vào title */}
                {expandedNodeIds[ch.id] && (
                  <div onDragOver={handleDragOver} onDrop={(e) => handleChapterLessonDrop(e, ch.id)} className="ml-2.5 pl-3 border-l border-slate-100 space-y-0.5 pt-0.5">
                    {ch.lessons.map((lesson, lessonIndex) => {
                      const isActive = lesson.id === activeLessonId;
                      const isLessonEditing = lesson.id === editingItemId;
                      const isLessonSelected = lesson.id === selectedLessonId;
                      const isLegacyFolder = lesson.isFolder || (lesson.subLessons?.length ?? 0) > 0;

                      return (
                        <div key={lesson.id} className="space-y-0.5">
                          <div
                            className={`group/lesson w-full flex items-center justify-between gap-1 py-1 px-2 rounded-lg text-[10px] transition font-bold cursor-pointer ${isLessonSelected ? 'bg-slate-100/60 text-text-primary ring-1 ring-slate-200/50' : isActive && !isLegacyFolder ? 'bg-primary-light text-primary font-black' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/50'}`}
                            draggable={!isLessonEditing}
                            onDragStart={(e) => handleLessonDragStart(e, lesson.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleLessonDrop(e, isLegacyFolder ? lesson.id : ch.id, isLegacyFolder ? undefined : lesson.id)}
                            onClick={(e) => { e.stopPropagation(); onSelectLesson(lesson.id); onSelectChapter(null); onLessonSelect(lesson.id); }}
                            onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(lesson.id); }}
                          >
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              {isLegacyFolder ? (
                                <button type="button" onClick={(e) => { e.stopPropagation(); onToggleNodeExpand(lesson.id); }} className="p-0.5 -ml-1 rounded transition cursor-pointer shrink-0">
                                  <ChevronDown size={11} className={`transition shrink-0 ${expandedNodeIds[lesson.id] ? '' : '-rotate-90'}`} />
                                </button>
                              ) : (
                                <span className="text-[9px] font-black text-slate-300 shrink-0">{String(lessonIndex + 1).padStart(2, '0')}</span>
                              )}
                              {isLegacyFolder && <FolderIcon size={13} className="shrink-0" />}
                              {isLessonEditing ? (
                                <InlineInput initialValue={lesson.title} onSave={(v) => onSaveEdit(lesson.id, v)} onCancel={() => onCancelEdit(lesson.id)} />
                              ) : (
                                <TreeTitle title={lesson.title} />
                              )}
                            </div>
                            {!isLessonEditing && (
                              <div className="flex items-center gap-1 shrink-0">
                                {!isLegacyFolder && (
                                  <Tooltip content={lesson.blocks.length === 0 ? 'Chưa có nội dung' : 'Đã có nội dung'}>
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${lesson.blocks.length === 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                  </Tooltip>
                                )}
                                <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition pl-1">
                                  <Tooltip content="Đổi tên">
                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(lesson.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                                  </Tooltip>
                                  <Tooltip content="Xóa bài học">
                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"><TrashIcon size={10} /></button>
                                  </Tooltip>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Legacy subLessons — dữ liệu cũ vẫn render đúng như trước */}
                          {isLegacyFolder && expandedNodeIds[lesson.id] && (
                            <div className="pl-3.5 border-l border-slate-100 space-y-0.5 pt-0.5">
                              {(lesson.subLessons ?? []).map(sub => {
                                const isSubActive = sub.id === activeLessonId;
                                const isSubEditing = sub.id === editingItemId;
                                const isSubSelected = sub.id === selectedLessonId;
                                const hasSubChildren = sub.isFolder || (sub.subLessons?.length ?? 0) > 0;
                                return (
                                  <div key={sub.id} className="space-y-0.5">
                                    <div
                                      className={`group/sub w-full flex items-center justify-between py-1 px-2 rounded-lg text-[10px] transition font-bold cursor-pointer ${isSubSelected || isSubActive ? 'bg-primary-light text-primary font-black' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/50'}`}
                                      draggable={!isSubEditing}
                                      onDragStart={(e) => handleLessonDragStart(e, sub.id)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleLessonDrop(e, lesson.id, sub.id)}
                                      onClick={(e) => { e.stopPropagation(); onSelectLesson(sub.id); onSelectChapter(null); onLessonSelect(sub.id); }}
                                      onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(sub.id); }}
                                    >
                                      <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                                        {hasSubChildren ? (
                                          <button type="button" onClick={(e) => { e.stopPropagation(); onToggleNodeExpand(sub.id); }} className="p-0.5 -ml-1 rounded transition cursor-pointer">
                                            <ChevronDown size={10} className={`transition ${expandedNodeIds[sub.id] ? '' : '-rotate-90'}`} />
                                          </button>
                                        ) : <FileIcon size={13} className="shrink-0" />}
                                        {hasSubChildren && <FolderIcon size={13} className="shrink-0" />}
                                        {isSubEditing ? (
                                          <InlineInput initialValue={sub.title} onSave={(v) => onSaveEdit(sub.id, v)} onCancel={() => onCancelEdit(sub.id)} />
                                        ) : (
                                          <TreeTitle title={sub.title} />
                                        )}
                                      </div>
                                      {!isSubEditing && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition shrink-0 pl-1">
                                          <Tooltip content="Đổi tên">
                                            <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(sub.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                                          </Tooltip>
                                          <Tooltip content="Xóa mục">
                                            <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteSubLesson(lesson.id, sub.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"><TrashIcon size={10} /></button>
                                          </Tooltip>
                                        </div>
                                      )}
                                    </div>
                                    {hasSubChildren && expandedNodeIds[sub.id] && (
                                      <div className="pl-3.5 border-l border-slate-100 space-y-0.5 pt-0.5">
                                        {(sub.subLessons ?? []).map(file => {
                                          const isFileActive = file.id === activeLessonId;
                                          const isFileEditing = file.id === editingItemId;
                                          const isFileSelected = file.id === selectedLessonId;
                                          return (
                                            <div
                                              key={file.id}
                                              className={`group/file w-full flex items-center justify-between gap-1.5 py-1 px-2 rounded-lg text-[10px] font-bold text-left transition cursor-pointer ${isFileSelected || isFileActive ? 'bg-primary-light text-primary font-black' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/50'}`}
                                              draggable={!isFileEditing}
                                              onDragStart={(e) => handleLessonDragStart(e, file.id)}
                                              onDragOver={handleDragOver}
                                              onClick={(e) => { e.stopPropagation(); onSelectLesson(file.id); onSelectChapter(null); onLessonSelect(file.id); }}
                                              onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(file.id); }}
                                            >
                                              <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                                                <FileIcon size={13} className="shrink-0" />
                                                {isFileEditing ? (
                                                  <InlineInput initialValue={file.title} onSave={(v) => onSaveEdit(file.id, v)} onCancel={() => onCancelEdit(file.id)} />
                                                ) : (
                                                  <TreeTitle title={file.title} />
                                                )}
                                              </div>
                                              {!isFileEditing && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition shrink-0 pl-1">
                                                  <Tooltip content="Đổi tên">
                                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(file.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                                                  </Tooltip>
                                                  <Tooltip content="Xóa mục">
                                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteSubLesson(sub.id, file.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"><TrashIcon size={10} /></button>
                                                  </Tooltip>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                    {/* Thêm bài học vào chương này — 1 lần cuối danh sách */}
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => { e.stopPropagation(); onCreateLesson(ch.id); }}
                      className="w-full flex items-center gap-1.5 py-1 px-2 text-[10px] font-bold text-slate-400 hover:text-primary hover:bg-slate-50/50 rounded-lg transition cursor-pointer"
                    >
                      <Plus size={11} /> Thêm bài học
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
