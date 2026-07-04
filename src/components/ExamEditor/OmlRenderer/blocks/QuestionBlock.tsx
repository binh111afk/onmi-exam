import React from 'react';
import type { OmlQuestionBlock } from '../../../../types/oml';
import { renderInlineMarkdown, getImageSizeClass, getFillBlankUnits, getBlankCount } from '../utils';

interface QuestionBlockProps {
  block: OmlQuestionBlock;
  idx: number;
  selectedQuestionId?: string | number;
  setSelectedQuestionId?: (id: number) => void;
}

export const QuestionBlock: React.FC<QuestionBlockProps> = ({
  block,
  idx,
  selectedQuestionId,
  setSelectedQuestionId,
}) => {
  const subType = block.subType ?? 'choice';
  
  // Validate required fields
  const missingFields: string[] = [];
  if (!block.question) missingFields.push('question (string)');
  if (subType !== 'fill-blank' && !Array.isArray(block.options)) missingFields.push('options (array)');
  if (!Array.isArray(block.answer)) missingFields.push('answer (array)');

  if (missingFields.length > 0) {
    return (
      <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-3 text-[10px] text-amber-700 font-bold">
        ⚠️ <strong>Câu {block.id ?? idx + 1}</strong> — Thiếu field bắt buộc:
        <ul className="list-disc pl-4 mt-1 font-medium">
          {missingFields.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    );
  }

  const numericQuestionId = Number(block.id);
  const isActive = selectedQuestionId !== undefined && String(selectedQuestionId) === String(block.id);
  const hasOptions = Array.isArray(block.options) && block.options.length > 0;
  const subTypeLabel: Record<string, string> = {
    choice: 'Trắc nghiệm',
    'true-false': 'Đúng/Sai',
    'fill-blank': 'Điền khuyết',
  };
  const questionText = subType === 'fill-blank'
    ? String(block.question).replace(/\[blank-\d+\]/g, '______________')
    : block.question;
  const diffLabel: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  const blankUnits = getFillBlankUnits(block);
  const blankCount = getBlankCount(block);
  const showFillBlankAnswer = subType === 'fill-blank' && block.showAnswer !== false && Array.isArray(block.answer) && block.answer.length > 0;
  const metaTags = [
    subTypeLabel[subType] ?? subType,
    block.points !== undefined ? `${block.points}đ` : null,
    block.difficulty ? (diffLabel[block.difficulty] ?? block.difficulty) : null,
  ].filter(Boolean) as string[];

  return (
    <div
      onClick={() => {
        if (setSelectedQuestionId && Number.isFinite(numericQuestionId)) {
          setSelectedQuestionId(numericQuestionId);
        }
      }}
      className={`p-4 border rounded-xl transition duration-150 cursor-pointer ${
        isActive ? 'border-primary/30 bg-primary-light/5 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'
      }`}
    >
      {/* Question metadata tags */}
      {metaTags.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {metaTags.map((tag) => (
            <span key={tag} className="rounded-lg border border-primary/10 bg-indigo-50 px-2 py-1 text-[8px] font-black text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Question text */}
      <div className="mb-2 text-[11px] leading-relaxed font-bold">
        <span className="font-black text-primary">Câu {block.id}.</span>{' '}
        {renderInlineMarkdown(questionText)}
      </div>

      {/* Image (if present) */}
      {block.image?.src && (
        <figure className="mb-3 flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-2 shadow-sm">
          <img
            src={block.image.src}
            alt={block.image.alt ?? block.image.caption ?? ''}
            className={`rounded-t-2xl rounded-b-none object-cover ${getImageSizeClass(block.image.size)}`}
            style={block.image.size ? { maxHeight: 220 } : { maxHeight: 220, maxWidth: 420 }}
          />
          {block.image.caption && <figcaption className="text-[9px] text-slate-400 italic">{block.image.caption}</figcaption>}
        </figure>
      )}

      {/* Options (multiple-choice / true-false) */}
      {hasOptions && (
        <div className="mt-3 space-y-2 font-sans">
          {block.options.map((opt) => {
            const isCorrect = Array.isArray(block.answer) && block.answer.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-3 p-3 pr-6 border rounded-2xl text-xs transition ${
                  isCorrect
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                    isCorrect ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {opt.id}
                </span>
                <span className="font-semibold text-slate-700 leading-relaxed flex-1">
                  {renderInlineMarkdown(opt.content)}
                </span>
                {isCorrect && (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-primary shrink-0 self-center"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fill-blank preview / review */}
      {subType === 'fill-blank' &&
        (showFillBlankAnswer ? (
          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-[10px] leading-relaxed">
            <div className="font-black text-slate-500">Đáp án:</div>
            <div className="mt-1 space-y-1 font-bold text-primary">
              {(block.answer as string[]).map((answer, answerIdx) => {
                const unit = blankUnits[answerIdx] ?? blankUnits[0];
                return (
                  <div key={`${answer}-${answerIdx}`}>
                    {blankCount > 1 && <span className="text-slate-500">Ô {answerIdx + 1}: </span>}
                    {renderInlineMarkdown(unit ? `${answer} ${unit}` : answer)}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {Array.from({ length: blankCount }).map((_, blankIdx) => {
              const unit = blankUnits[blankIdx] ?? blankUnits[0];
              return (
                <div key={blankIdx} className="flex max-w-md items-center gap-3">
                  {blankCount > 1 && (
                    <span className="w-8 shrink-0 text-[10px] font-black text-slate-500">Ô {blankIdx + 1}</span>
                  )}
                  <input
                    readOnly
                    aria-label={`Nhập đáp án ô ${blankIdx + 1}`}
                    placeholder="Nhập đáp án..."
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  {unit && <span className="shrink-0 text-[11px] font-bold text-slate-700">{unit}</span>}
                </div>
              );
            })}
          </div>
        ))}

      {/* Essay placeholder (no options) */}
      {!hasOptions && subType !== 'fill-blank' && (
        <div className="mt-2 px-3 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          <span className="text-[9px] text-slate-400 font-bold">[ Câu tự luận — Học sinh trả lời trực tiếp ]</span>
        </div>
      )}

      {/* Answer tags */}
      {Array.isArray(block.tags) && block.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {block.tags.map((tag) => (
            <span
              key={tag}
              className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Explanation */}
      {block.explanation && (
        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[9px] font-black text-primary mb-0.5">Giải thích:</div>
          <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
            {renderInlineMarkdown(block.explanation)}
          </p>
        </div>
      )}
    </div>
  );
};
