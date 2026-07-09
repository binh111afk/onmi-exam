import React, { useState, useMemo } from 'react';
import { HelpCircle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { FillBlankContent } from './Types';
import { shuffleArray } from './Utils';

interface PreviewProps {
  block: { fillblankContent?: FillBlankContent };
}

export const Preview: React.FC<PreviewProps> = ({ block }) => {
  const content = block.fillblankContent;
  if (!content) return null;

  const { paragraphs, blanks, settings } = content;
  const themeColor = settings.themeColor || '#8B5CF6';

  // State for student answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Generate word bank of all correct answers
  const wordBank = useMemo(() => {
    const list = Object.values(blanks).map(b => b.answer);
    return settings.shuffleBlanks ? shuffleArray(list) : list;
  }, [blanks, settings.shuffleBlanks]);

  const handleInputChange = (blankId: string, val: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [blankId]: val
    }));
  };

  const checkAnswer = (blankId: string, inputVal: string = ''): boolean => {
    const blank = blanks[blankId];
    if (!blank) return false;

    const trimmedInput = inputVal.trim();
    const possibleAnswers = [blank.answer, ...(blank.alternativeAnswers || [])];

    return possibleAnswers.some(ans => {
      if (blank.caseSensitive || settings.caseSensitive) {
        return ans.trim() === trimmedInput;
      }
      return ans.trim().toLowerCase() === trimmedInput.toLowerCase();
    });
  };

  const handleCheck = () => {
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setAnswers({});
  };

  // Parse a paragraph HTML into text and interactive inputs
  const renderParagraph = (html: string, pId: string) => {
    // Regex matches the blank span
    const parts = html.split(/(<span[^>]+data-blank-id=["']?[^"'\s>]+["']?[^>]*>.*?<\/span>)/g);

    return (
      <p key={pId} className="text-xs text-slate-700 leading-relaxed font-medium mb-3 flex flex-wrap items-center gap-y-2">
        {parts.map((part, index) => {
          if (part.startsWith('<span') && part.includes('data-blank-id')) {
            const idMatch = part.match(/data-blank-id=["']([^"']+)["']/);
            const blankId = idMatch ? idMatch[1] : '';
            const blank = blanks[blankId];

            if (!blank) return null;

            const studentVal = answers[blankId] || '';
            const isCorrect = checkAnswer(blankId, studentVal);

            // Style classes based on style settings
            let borderClass = '';
            if (isSubmitted) {
              borderClass = isCorrect
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-rose-500 bg-rose-50 text-rose-700';
            } else {
              if (settings.blankStyle === 'underline') {
                borderClass = 'border-b-2 border-slate-300 focus:border-purple-500 bg-slate-50/50';
              } else if (settings.blankStyle === 'dashed') {
                borderClass = 'border-2 border-dashed border-slate-300 focus:border-purple-500 bg-slate-50/50 rounded-lg';
              } else {
                borderClass = 'border border-slate-300 focus:border-purple-500 bg-slate-50/50 rounded-lg';
              }
            }

            return (
              <span key={index} className="inline-flex items-center gap-1 mx-1 relative group">
                <input
                  type="text"
                  value={studentVal}
                  disabled={isSubmitted}
                  onChange={(e) => handleInputChange(blankId, e.target.value)}
                  placeholder={blank.placeholder || '...'}
                  style={{ width: blank.width ? `${blank.width}px` : '125px' }}
                  className={`px-2 py-0.5 text-[10px] font-bold text-center outline-none transition-all duration-200 ${borderClass}`}
                />

                {/* Hint Icon & Tooltip */}
                {settings.showHints && blank.hint && !isSubmitted && (
                  <div className="relative cursor-help text-slate-400 hover:text-slate-600">
                    <HelpCircle size={10} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[8px] font-bold rounded px-2 py-1 whitespace-nowrap shadow-md z-50">
                      Gợi ý: {blank.hint}
                    </div>
                  </div>
                )}

                {/* Show Correct Answer Popover on Submit */}
                {isSubmitted && !isCorrect && settings.showAnswerAfterSubmit && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 ml-1 select-none">
                    Đáp án: {blank.answer}
                  </span>
                )}
              </span>
            );
          } else {
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: part }}
              />
            );
          }
        })}
      </p>
    );
  };

  // Calculate score
  const score = Object.keys(blanks).reduce((acc, bId) => {
    return acc + (checkAnswer(bId, answers[bId]) ? (blanks[bId].score || 1) : 0);
  }, 0);
  const totalScore = Object.values(blanks).reduce((acc, b) => acc + (b.score || 1), 0);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm select-none">
      {/* Word bank */}
      {settings.shuffleBlanks && wordBank.length > 0 && (
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-2">Danh sách từ gợi ý</span>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word, wIdx) => (
              <span
                key={wIdx}
                style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
                className="px-2 py-1 rounded-lg text-[9px] font-bold border border-current"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Paragraphs */}
      <div className="space-y-1">
        {paragraphs.map((p) => renderParagraph(p.text, p.id))}
      </div>

      {/* Feedback & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          {isSubmitted ? (
            <div className="flex items-center gap-2">
              {score === totalScore ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                  <CheckCircle2 size={12} /> Chính xác ({score}/{totalScore}đ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                  <XCircle size={12} /> Chưa chính xác ({score}/{totalScore}đ)
                </span>
              )}
            </div>
          ) : (
            <span className="text-[9px] font-bold text-slate-400">
              Lượt thử: {attempts} / {settings.maxAttempts}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            attempts < settings.maxAttempts && (
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
