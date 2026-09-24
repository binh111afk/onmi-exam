import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import type { SortOrderContent, SortOrderItem } from './Types';
import { shuffleArray } from './Utils';
import { LatexText } from '../common/LatexText';

interface PreviewProps {
  block: { sortorderContent?: SortOrderContent };
}

export const Preview: React.FC<PreviewProps> = ({ block }) => {
  const content = block.sortorderContent;
  if (!content) return null;

  const { items, settings } = content;
  const themeColor = settings.themeColor || '#10B981';

  const [studentItems, setStudentItems] = useState<SortOrderItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Initialize/reset items
  const initializeItems = () => {
    const list = settings.shuffleInitialOrder ? shuffleArray(items) : [...items];
    setStudentItems(list);
  };

  useEffect(() => {
    initializeItems();
  }, [items, settings.shuffleInitialOrder]);

  // Determine correct sequence of item IDs based on ascending/descending setting
  const correctSequence = useMemo(() => {
    const ids = items.map(item => item.id);
    return settings.order === 'descending' ? [...ids].reverse() : ids;
  }, [items, settings.order]);

  // Check if item is in the correct slot
  const isItemInCorrectPosition = (itemId: string, index: number): boolean => {
    return correctSequence[index] === itemId;
  };

  const handleDragStart = (index: number) => {
    if (isSubmitted) return;
    setDraggedIndex(index);
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || isSubmitted) return;
    const nextItems = [...studentItems];
    const [moved] = nextItems.splice(draggedIndex, 1);
    nextItems.splice(targetIndex, 0, moved);
    setStudentItems(nextItems);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleCheck = () => {
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    initializeItems();
  };

  // Score checking
  const correctCount = studentItems.reduce((acc, item, idx) => {
    return acc + (isItemInCorrectPosition(item.id, idx) ? 1 : 0);
  }, 0);
  
  const isAllCorrect = correctCount === items.length;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm select-none">
      {/* Items list */}
      <div className="flex flex-col gap-2.5">
        {studentItems.map((item, idx) => {
          const isDragging = idx === draggedIndex;
          const isCorrect = isItemInCorrectPosition(item.id, idx);
          
          let borderClass = 'border-slate-200 bg-white hover:border-slate-300';
          if (isDragging) {
            borderClass = 'border-emerald-300 bg-emerald-50/20 opacity-50';
          } else if (isSubmitted) {
            borderClass = isCorrect
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
              : 'border-rose-500 bg-rose-50 text-rose-700 font-bold';
          }

          return (
            <div
              key={item.id}
              draggable={!isSubmitted}
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 ${borderClass}`}
              style={{ cursor: isSubmitted ? 'default' : 'grab' }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 select-none">
                  {idx + 1}
                </span>
                
                {item.type === 'text' && (
                  <span className="text-[10px] text-slate-700 font-bold leading-normal">
                    <LatexText value={item.content} />
                  </span>
                )}
                {item.type === 'image' && (
                  <img src={item.content} className="max-h-12 w-auto rounded object-contain" alt="sort" />
                )}
              </div>

              {!isSubmitted && (
                <div className="text-slate-350 cursor-grab">
                  <GripVertical size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isSubmitted && settings.showExplanation && settings.explanationText && (
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[9px] leading-relaxed text-slate-600 font-bold">
          <span className="text-primary font-black uppercase block mb-1">Giải thích:</span>
          <LatexText value={settings.explanationText} />
        </div>
      )}

      {/* Feedback & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          {isSubmitted ? (
            <div className="flex items-center gap-2">
              {isAllCorrect ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                  <CheckCircle2 size={12} /> Chính xác (+{settings.score || 1}đ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                  <XCircle size={12} /> Chưa đúng ({correctCount}/{items.length} mục đúng vị trí)
                </span>
              )}
            </div>
          ) : (
            <span className="text-[9px] font-bold text-slate-400">
              Lượt thử: {attempts} / {settings.allowRetry ? 'Vô hạn' : '1'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            (settings.allowRetry || attempts < 1) && (
              <button
                type="button"
                onClick={handleRetry}
                style={{ borderColor: themeColor, color: themeColor }}
                className="px-3 py-1.5 border hover:bg-slate-50 font-black text-[9px] rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw size={10} /> Làm lại
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleCheck}
              style={{ backgroundColor: themeColor }}
              className="px-3 py-1.5 text-white hover:opacity-95 font-black text-[9px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
