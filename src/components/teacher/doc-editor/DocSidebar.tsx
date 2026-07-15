import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit, Trash2, FolderPlus, FilePlus } from 'lucide-react';
import type { Chapter, Lesson } from '../../../types/doc-editor';
import { Tooltip } from './Tooltip';

// Custom SVGs for folder and file
const FolderIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M0 2.5C0 1.67157 0.671573 1 1.5 1H6.2C6.55 1 6.88 1.16 7.1 1.44L8.9 3.56C9.12 3.84 9.45 4 9.8 4H14.5C15.3284 4 16 4.67157 16 5.5V13.5C16 14.3284 15.3284 15 14.5 15H1.5C0.671571 15 0 14.3284 0 13.5V2.5Z" fill="#4F46E5"></path> 
  </svg>
);

const FileIcon: React.FC<{ size?: number; className?: string }> = ({ size = 11, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="-1.2 -1.2 26.4 26.4" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
  >
    <path d="M4 12.5C4 8.0217 4 5.78258 5.3913 4.3913C6.78258 3 9.0217 3 13.5 3C17.9783 3 20.2174 3 21.6087 4.3913C23 5.78258 23 8.0217 23 12.5V13.5C23 17.9783 23 20.2174 21.6087 21.6087C20.2174 23 17.9783 23 13.5 23C9.0217 23 6.78258 23 5.3913 21.6087C4 20.2174 4 17.9783 4 13.5V12.5Z" fill="#818CF8" fillOpacity="0.05"/>
    <path d="M3 6.5C3 4.567 4.567 3 6.5 3H13.5L21 10.5V20.5C21 22.433 19.433 24 17.5 24H6.5C4.567 24 3 22.433 3 20.5V6.5Z" fill="#F5F3FF" stroke="#4F46E5" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M13.5 3V6.5C13.5 8.70914 15.2909 10.5 17.5 10.5H21L13.5 3Z" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.8" strokeLinejoin="round"/>
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
  onCreateSubLesson: (chapterId: string, lessonId: string) => void;
  onCreateDocumentInFolder: (folderId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteSubLesson: (lessonId: string, subLessonId: string) => void;
  onMoveLesson: (sourceLessonId: string, targetParentId: string, targetBeforeId?: string) => void;
  onChapterReorder: (sourceChapterId: string, targetChapterId: string) => void;
  onDepthExceeded: () => void;
  metadata?: {
    name: string;
    subject: string;
    grade: string;
    docType: string;
    description?: string;
    coverImage?: string;
  };
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

type LessonLocation = {
  node: Lesson;
  parentType: 'chapter' | 'lesson';
  parentId: string;
};

export const DocSidebar: React.FC<DocSidebarProps> = ({
  chapters, activeLessonId, onLessonSelect, expandedNodeIds, onToggleNodeExpand,
  selectedChapterId, onSelectChapter, selectedLessonId, onSelectLesson,
  editingItemId, onStartEditing, onSaveEdit, onCancelEdit,
  onCreateChapter, onCreateLesson, onCreateSubLesson, onCreateDocumentInFolder,
  onDeleteChapter, onDeleteLesson, onDeleteSubLesson,
  onMoveLesson, onChapterReorder, onDepthExceeded, metadata,
}) => {
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

  const findLessonLocation = (lessonId: string): LessonLocation | null => {
    const findInLessons = (lessons: Lesson[], parentType: 'chapter' | 'lesson', parentId: string): LessonLocation | null => {
      for (const lesson of lessons) {
        if (lesson.id === lessonId) {
          return { node: lesson, parentType, parentId };
        }

        const found = findInLessons(lesson.subLessons ?? [], 'lesson', lesson.id);
        if (found) return found;
      }

      return null;
    };

    for (const chapter of chapters) {
      const found = findInLessons(chapter.lessons, 'chapter', chapter.id);
      if (found) return found;
    }

    return null;
  };

  const handleAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedLessonId) {
      const location = findLessonLocation(selectedLessonId);
      if (location) {
        const selectedIsFolder = location.node.isFolder || (location.node.subLessons?.length ?? 0) > 0;

        if (selectedIsFolder) {
          onCreateDocumentInFolder(location.node.id);
          return;
        }

        if (location.parentType === 'chapter') {
          onCreateLesson(location.parentId);
          return;
        }

        onCreateDocumentInFolder(location.parentId);
        return;
      }
    }

    onCreateLesson(selectedChapterId || '');
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLessonId) {
      for (const ch of chapters) {
        // Check if selectedLessonId is a sub-lesson (depth 3)
        for (const lesson of ch.lessons) {
          if (lesson.subLessons?.some(sl => sl.id === selectedLessonId)) {
            onDepthExceeded();
            return;
          }
        }
        // Check if selectedLessonId is a lesson (depth 2)
        const lesson = ch.lessons.find(l => l.id === selectedLessonId);
        if (lesson) {
          onCreateSubLesson(ch.id, selectedLessonId);
          return;
        }
      }
    }
    if (selectedChapterId) {
      onCreateLesson(selectedChapterId, 'Thư mục mới', true);
      return;
    }
    onCreateChapter();
  };

  return (
    <aside
      onClick={() => { onSelectChapter(null); onSelectLesson(null); }}
      className="w-56 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto p-4 select-none"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Explorer</span>
          <div className="flex items-center gap-1">
            <Tooltip content="Thêm thư mục con">
              <button onMouseDown={(e) => e.preventDefault()} onClick={handleAddFolder} className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer">
                <FolderPlus size={12} />
              </button>
            </Tooltip>
            <Tooltip content="Thêm bài học mới">
              <button onMouseDown={(e) => e.preventDefault()} onClick={handleAddFile} className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer">
                <FilePlus size={12} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelectChapter(null); onSelectLesson(null); }}
            className="flex items-center gap-2 text-xs font-black text-text-primary cursor-pointer"
          >
            <FolderIcon size={16} className="shrink-0" />
            <span>{metadata ? `${metadata.subject} ${metadata.grade.replace(/Lop\s+/i, '').replace(/L\u1edbp\s+/i, '')}` : ''}</span>
          </button>
          <div className="pl-2 space-y-1.5">
            {chapters.map(ch => {
              const isChEditing = ch.id === editingItemId;
              const isChSelected = ch.id === selectedChapterId;
              return (
                <div key={ch.id} className="space-y-1" draggable={!isChEditing} onDragStart={(e) => handleChapterDragStart(e, ch.id)} onDragOver={handleDragOver} onDrop={(e) => handleChapterDrop(e, ch.id)}>
                  {/* Chapter Row — Depth 1 */}
                  <div
                    onDragOver={handleDragOver} onDrop={(e) => handleChapterLessonDrop(e, ch.id)}
                    onClick={(e) => { e.stopPropagation(); onSelectChapter(ch.id); onSelectLesson(null); }}
                    onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(ch.id); }}
                    className={`group w-full flex items-center justify-between text-[11px] font-bold py-1 px-1.5 rounded-lg transition cursor-pointer ${isChSelected ? 'bg-slate-100/60 text-text-primary ring-1 ring-slate-200/50' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/30'}`}
                  >
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <FolderIcon size={15} className="shrink-0" />
                      {isChEditing ? (
                        <InlineInput initialValue={ch.title} onSave={(v) => onSaveEdit(ch.id, v)} onCancel={() => onCancelEdit(ch.id)} />
                      ) : (
                        <TreeTitle title={ch.title} />
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); onToggleNodeExpand(ch.id); }} className="p-0.5 -mr-0.5 rounded transition cursor-pointer">
                        <ChevronDown size={11} className={`transition shrink-0 ${expandedNodeIds[ch.id] ? '' : '-rotate-90'}`} />
                      </button>
                    </div>
                    {!isChEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 pl-1">
                        <Tooltip content="S\u1eeda t\u00ean ch\u01b0\u01a1ng">
                          <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(ch.id); }} className="p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                        </Tooltip>
                        <Tooltip content="X\u00f3a ch\u01b0\u01a1ng">
                          <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteChapter(ch.id); }} className="p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-red-500 rounded transition"><Trash2 size={10} /></button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* Lessons inside Chapter — Depth 2 */}
                  {expandedNodeIds[ch.id] && (
                    <div onDragOver={handleDragOver} onDrop={(e) => handleChapterLessonDrop(e, ch.id)} className="pl-3.5 border-l border-slate-100 space-y-1 pt-0.5 min-h-[8px]">
                      {ch.lessons.length === 0 && <div className="text-[9px] text-slate-400 font-medium pl-2 italic">Tr\u1ed1ng</div>}
                      {ch.lessons.map(lesson => {
                        const isActive = lesson.id === activeLessonId;
                        const isLessonEditing = lesson.id === editingItemId;
                        const isLessonSelected = lesson.id === selectedLessonId;
                        const hasSubLessons = lesson.isFolder || (lesson.subLessons?.length ?? 0) > 0;

                        return (
                          <div key={lesson.id} draggable={!isLessonEditing} onDragStart={(e) => handleLessonDragStart(e, lesson.id)} onDragOver={handleDragOver} className="space-y-0.5">
                            <div
                              className={`group/lesson w-full flex items-center justify-between py-1 px-2 rounded-lg text-[10px] transition font-bold cursor-pointer ${isLessonSelected ? 'bg-slate-100/60 text-text-primary ring-1 ring-slate-200/50' : isActive && !hasSubLessons ? 'bg-primary-light text-primary font-black' : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/50'}`}
                              onDrop={(e) => handleLessonDrop(e, hasSubLessons ? lesson.id : ch.id, hasSubLessons ? undefined : lesson.id)}
                              onClick={(e) => { e.stopPropagation(); onSelectLesson(lesson.id); onSelectChapter(null); onLessonSelect(lesson.id); }}
                              onDoubleClick={(e) => { e.stopPropagation(); onStartEditing(lesson.id); }}
                            >
                              <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                                {hasSubLessons ? (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); onToggleNodeExpand(lesson.id); }} className="p-0.5 -ml-1 rounded transition cursor-pointer">
                                    <ChevronDown size={11} className={`transition ${expandedNodeIds[lesson.id] ? '' : '-rotate-90'}`} />
                                  </button>
                                ) : <FileIcon size={14} className="shrink-0" />}
                                {hasSubLessons && <FolderIcon size={14} className="shrink-0" />}
                                {isLessonEditing ? (
                                  <InlineInput initialValue={lesson.title} onSave={(v) => onSaveEdit(lesson.id, v)} onCancel={() => onCancelEdit(lesson.id)} />
                                ) : (
                                  <TreeTitle title={lesson.title} />
                                )}
                              </div>
                              {!isLessonEditing && (
                                <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition shrink-0 pl-1">
                                  <Tooltip content="\u0110\u1ed5i t\u00ean">
                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(lesson.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                                  </Tooltip>
                                  <Tooltip content="X\u00f3a b\u00e0i h\u1ecdc">
                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"><Trash2 size={10} /></button>
                                  </Tooltip>
                                </div>
                              )}
                            </div>

                            {/* SubLessons — Depth 3 */}
                            {hasSubLessons && expandedNodeIds[lesson.id] && (
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
                                            <Tooltip content="\u0110\u1ed5i t\u00ean">
                                              <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(sub.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                                            </Tooltip>
                                            <Tooltip content="X\u00f3a m\u1ee5c">
                                              <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteSubLesson(lesson.id, sub.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"><Trash2 size={10} /></button>
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
                                                    <Tooltip content="\u0110\u1ed5i t\u00ean">
                                                      <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onStartEditing(file.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"><Edit size={10} /></button>
                                                    </Tooltip>
                                                    <Tooltip content="X\u00f3a m\u1ee5c">
                                                      <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteSubLesson(sub.id, file.id); }} className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"><Trash2 size={10} /></button>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
