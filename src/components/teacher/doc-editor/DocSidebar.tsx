import React, { useState, useRef, useEffect } from 'react';
import { FolderOpen, ChevronDown, Folder, File, Edit, Trash2, FolderPlus, FilePlus } from 'lucide-react';
import type { DocBlock } from './DocPreviewSimulator';
import { Tooltip } from './Tooltip';

export interface Lesson {
  id: string;
  title: string;
  blocks: DocBlock[];
}

export interface Chapter {
  id: string;
  title: string;
  isExpanded?: boolean;
  lessons: Lesson[];
}

interface DocSidebarProps {
  chapters: Chapter[];
  activeLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  onToggleChapterExpand: (chapterId: string) => void;
  
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string | null) => void;
  editingItemId: string | null;
  onStartEditing: (id: string | null) => void;
  onSaveEdit: (id: string, newTitle: string) => void;
  onCancelEdit: (id: string) => void;

  onCreateChapter: () => void;
  onCreateLesson: (chapterId: string) => void;

  onDeleteChapter: (chapterId: string) => void;
  onDeleteLesson: (lessonId: string) => void;

  onLessonDragDrop: (sourceLessonId: string, sourceChapterId: string, targetLessonId: string, targetChapterId: string) => void;
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
    if (e.key === 'Enter') {
      onSave(val);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(val);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full bg-slate-50 border border-slate-200 outline-none px-1 rounded text-[10px] font-bold text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary transition"
    />
  );
};

export const DocSidebar: React.FC<DocSidebarProps> = ({
  chapters,
  activeLessonId,
  onLessonSelect,
  onToggleChapterExpand,
  selectedChapterId,
  onSelectChapter,
  editingItemId,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onCreateChapter,
  onCreateLesson,
  onDeleteChapter,
  onDeleteLesson,
  onLessonDragDrop,
  onChapterReorder,
}) => {
  const handleLessonDragStart = (e: React.DragEvent, lessonId: string, chapterId: string) => {
    e.dataTransfer.setData('lessonId', lessonId);
    e.dataTransfer.setData('chapterId', chapterId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleLessonDrop = (e: React.DragEvent, targetLessonId: string, targetChapterId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceLessonId = e.dataTransfer.getData('lessonId');
    const sourceChapterId = e.dataTransfer.getData('chapterId');
    if (sourceLessonId && sourceChapterId) {
      onLessonDragDrop(sourceLessonId, sourceChapterId, targetLessonId, targetChapterId);
    }
  };

  const handleChapterLessonDrop = (e: React.DragEvent, targetChapterId: string) => {
    e.preventDefault();
    const sourceLessonId = e.dataTransfer.getData('lessonId');
    const sourceChapterId = e.dataTransfer.getData('chapterId');
    if (sourceLessonId && sourceChapterId) {
      onLessonDragDrop(sourceLessonId, sourceChapterId, '', targetChapterId);
    }
  };

  const handleChapterDragStart = (e: React.DragEvent, chapterId: string) => {
    e.dataTransfer.setData('draggedChapterId', chapterId);
  };

  const handleChapterDrop = (e: React.DragEvent, targetChapterId: string) => {
    e.preventDefault();
    const sourceChapterId = e.dataTransfer.getData('draggedChapterId');
    if (sourceChapterId && sourceChapterId !== targetChapterId) {
      onChapterReorder(sourceChapterId, targetChapterId);
    }
  };

  return (
    <aside 
      onClick={() => onSelectChapter(null)}
      className="w-56 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto p-4 select-none"
    >
      <div className="space-y-4">
        {/* Explorer Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Explorer</span>
          <div className="flex items-center gap-1">
            <Tooltip content="Thêm chương mới">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateChapter();
                }}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-655 rounded transition cursor-pointer"
              >
                <FolderPlus size={12} />
              </button>
            </Tooltip>
            <Tooltip content="Thêm bài học mới">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateLesson(selectedChapterId || '');
                }}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-655 rounded transition cursor-pointer"
              >
                <FilePlus size={12} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Folder explorer tree */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-text-primary">
            <FolderOpen size={14} className="text-primary" />
            <span>Sinh học 10</span>
          </div>

          <div className="pl-2 space-y-1.5">
            {chapters.map(ch => {
              const isEditing = ch.id === editingItemId;
              const isSelected = ch.id === selectedChapterId;

              return (
                <div 
                  key={ch.id} 
                  className="space-y-1"
                  draggable={!isEditing}
                  onDragStart={(e) => handleChapterDragStart(e, ch.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleChapterDrop(e, ch.id)}
                >
                  {/* Chapter Row */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleChapterLessonDrop(e, ch.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChapter(ch.id);
                      onToggleChapterExpand(ch.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onStartEditing(ch.id);
                    }}
                    className={`group w-full flex items-center justify-between text-[11px] font-bold py-1 px-1.5 rounded-lg transition cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-100/60 text-text-primary ring-1 ring-slate-200/50' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      {ch.isExpanded ? (
                        <FolderOpen size={12} className="text-primary shrink-0" />
                      ) : (
                        <Folder size={12} className="text-slate-400 shrink-0" />
                      )}
                      {isEditing ? (
                        <InlineInput 
                          initialValue={ch.title}
                          onSave={(newVal) => onSaveEdit(ch.id, newVal)}
                          onCancel={() => onCancelEdit(ch.id)}
                        />
                      ) : (
                        <span className="truncate">{ch.title}</span>
                      )}
                      <ChevronDown size={11} className={`transition shrink-0 ml-auto ${ch.isExpanded ? '' : '-rotate-90'}`} />
                    </div>

                    {/* Chapter Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 pl-1">
                        <Tooltip content="Sửa tên chương">
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartEditing(ch.id);
                            }}
                            className="p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-slate-700 rounded transition"
                          >
                            <Edit size={10} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Xóa chương">
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChapter(ch.id);
                            }}
                            className="p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-red-500 rounded transition"
                          >
                            <Trash2 size={10} />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* Lessons list inside Chapter */}
                  {ch.isExpanded && (
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleChapterLessonDrop(e, ch.id)}
                      className="pl-3.5 border-l border-slate-100 space-y-1 pt-0.5 min-h-[8px]"
                    >
                      {ch.lessons.length === 0 && (
                        <div className="text-[9px] text-slate-400 font-medium pl-2 italic">Trống</div>
                      )}
                      {ch.lessons.map(lesson => {
                        const isActive = lesson.id === activeLessonId;
                        const isLessonEditing = lesson.id === editingItemId;

                        return (
                          <div
                            key={lesson.id}
                            draggable={!isLessonEditing}
                            onDragStart={(e) => handleLessonDragStart(e, lesson.id, ch.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleLessonDrop(e, lesson.id, ch.id)}
                            className={`group/lesson w-full flex items-center justify-between py-1 px-2 rounded-lg text-[10px] transition font-bold cursor-pointer ${
                              isActive 
                                ? 'bg-primary-light text-primary font-black' 
                                : 'text-text-secondary hover:text-text-primary hover:bg-slate-50/50'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onLessonSelect(lesson.id);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              onStartEditing(lesson.id);
                            }}
                          >
                            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                              <File size={11} className={isActive ? 'text-primary' : 'text-slate-400'} />
                              {isLessonEditing ? (
                                <InlineInput 
                                  initialValue={lesson.title}
                                  onSave={(newVal) => onSaveEdit(lesson.id, newVal)}
                                  onCancel={() => onCancelEdit(lesson.id)}
                                />
                              ) : (
                                <span className="truncate">{lesson.title}</span>
                              )}
                            </div>

                            {/* Lesson Actions */}
                            {!isLessonEditing && (
                              <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition shrink-0 pl-1">
                                <Tooltip content="Đổi tên">
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStartEditing(lesson.id);
                                    }}
                                    className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 rounded transition"
                                  >
                                    <Edit size={10} />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Xóa bài học">
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteLesson(lesson.id);
                                    }}
                                    className="p-0.5 hover:bg-slate-200/50 text-slate-400 hover:text-red-500 rounded transition"
                                  >
                                    <Trash2 size={10} />
                                  </button>
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
        </div>
      </div>
    </aside>
  );
};
