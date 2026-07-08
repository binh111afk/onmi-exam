import React from 'react';
import { ArrowLeft, ArrowRight, Award, RotateCcw } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { createNewFlashcardContent, getPreviewCards } from './FlashcardUtils';

interface FlashcardPreviewProps {
  block: DocBlock;
  indentClassName?: string;
}

export const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({
  block,
  indentClassName = '',
}) => {
  const content = block.flashcardContent || createNewFlashcardContent();
  const cards = React.useMemo(() => getPreviewCards(content, block.id), [block.id, content]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  React.useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, Math.max(cards.length - 1, 0)));
    setIsFlipped(false);
  }, [cards.length]);

  if (cards.length === 0) {
    return (
      <div className={`p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl my-2.5 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm ${indentClassName}`}>
        <div className="text-indigo-500 font-extrabold text-[8px] uppercase tracking-wide flex items-center gap-1">
          <Award size={9} /> Flashcard
        </div>
        <div className="text-[10px] text-slate-400 italic">Bộ thẻ chưa có nội dung.</div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / cards.length) * 100);
  const cardRotationClass = content.settings.flipAnimation && isFlipped
    ? '[transform:rotateY(180deg)]'
    : '[transform:rotateY(0deg)]';
  const frontFaceClass = content.settings.flipAnimation
    ? '[backface-visibility:hidden] [transform:rotateY(0deg)]'
    : isFlipped ? 'opacity-0' : 'opacity-100';
  const backFaceClass = content.settings.flipAnimation
    ? '[backface-visibility:hidden] [transform:rotateY(180deg)]'
    : isFlipped ? 'opacity-100' : 'opacity-0';

  const goPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsFlipped(false);
  };

  const goNext = () => {
    setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
    setIsFlipped(false);
  };

  return (
    <div className={`p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl my-2.5 flex flex-col gap-3 shadow-sm ${indentClassName}`}>
      <div className="flex items-center justify-between gap-3 text-indigo-500 font-extrabold text-[8px] uppercase tracking-wide">
        <span className="flex items-center gap-1">
          <Award size={9} /> Flashcard
        </span>
        <span className="text-slate-400">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped(prev => !prev)}
        className="group w-full min-h-[148px] rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer [perspective:1000px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div
          className={`relative min-h-[148px] [transform-style:preserve-3d] transition-[transform] duration-[480ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${cardRotationClass}`}
        >
          <div
            className={`absolute inset-0 rounded-2xl border border-indigo-100 bg-white px-4 py-5 shadow-sm flex items-center justify-center text-center transition-all duration-[480ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${frontFaceClass}`}
          >
            <div className="text-[11px] text-indigo-900 font-black leading-relaxed">
              {currentCard.front || 'Mặt trước chưa có nội dung'}
            </div>
          </div>
          <div
            className={`absolute inset-0 rounded-2xl border border-indigo-100 bg-white px-4 py-5 shadow-sm flex items-center justify-center text-center transition-all duration-[480ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${backFaceClass}`}
          >
            <div className="text-[11px] text-slate-700 font-bold leading-relaxed">
              {currentCard.back || 'Mặt sau chưa có nội dung'}
            </div>
          </div>
        </div>
      </button>

      {content.settings.showProgress && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wide text-slate-400">
            <span>Tiến độ</span>
            <span>{progress}%</span>
          </div>
          <progress
            value={progress}
            max={100}
            className="h-2 w-full overflow-hidden rounded-full border border-emerald-100 bg-white accent-primary transition-all duration-300 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-emerald-400 [&::-webkit-progress-value]:to-primary [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-300 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"
            aria-label="Tiến độ flashcard"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrevious}
          disabled={currentIndex === 0}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Thẻ trước"
        >
          <ArrowLeft size={12} />
        </button>
        <button
          type="button"
          onClick={() => setIsFlipped(prev => !prev)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-100 bg-white text-indigo-600 text-[9px] font-black hover:bg-indigo-50 transition cursor-pointer"
        >
          <RotateCcw size={11} /> Lật thẻ
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Thẻ tiếp theo"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
