import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { DocBlock, QuizQuestion, QuizOption } from '../../../../../types/doc-editor';
import { getDeterministicShuffledItems } from './QuizUtils';
import { LatexText } from '../common/LatexText';

interface QuizPreviewProps {
  block: DocBlock;
  indentStyle?: React.CSSProperties;
}

export const QuizPreview: React.FC<QuizPreviewProps> = ({
  block,
  indentStyle,
}) => {
  const quizContent = block.quizContent || {
    questions: [],
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      passingScore: 50,
    },
  };
  const settings = quizContent.settings;
  const questions = settings.shuffleQuestions
    ? getDeterministicShuffledItems(quizContent.questions || [], block.id)
    : quizContent.questions || [];

  if (questions.length === 0) {
    return (
      <div style={indentStyle} className="p-3.5 border border-purple-100 bg-purple-50/30 rounded-xl my-2.5 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-[8px] uppercase tracking-wide">
          <HelpCircle size={10} /> Câu hỏi trắc nghiệm
        </div>
        <div className="text-[10px] text-slate-400 italic">Chưa có câu hỏi. Nhấn 'Thêm câu hỏi' để bắt đầu.</div>
      </div>
    );
  }

  return (
    <div style={indentStyle} className="flex flex-col gap-3 my-2.5 w-full">
      {questions.map((question: QuizQuestion, qIdx: number) => (
        <div 
          key={question.id} 
          className="p-4 border border-purple-100 bg-purple-50/20 rounded-xl flex flex-col gap-2.5 w-full"
        >
          <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-[8px] uppercase tracking-wide">
            <HelpCircle size={10} /> Câu hỏi {qIdx + 1}
          </div>
          <div className="text-[10px] text-slate-800 font-bold leading-normal">
            <LatexText value={question.text || 'Nội dung câu hỏi chưa thiết lập...'} />
          </div>
          {question.description && (
            <div className="text-[9px] text-slate-500 italic mt-0.5">
              <LatexText value={question.description} />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1 text-[9px] font-semibold text-slate-600 w-full">
            {(settings.shuffleOptions
              ? getDeterministicShuffledItems(question.options, question.id)
              : question.options
            ).map((option: QuizOption, oIdx: number) => {
              const letter = String.fromCharCode(65 + oIdx);
              const shouldShowCorrect = settings.showCorrectAnswers && option.isCorrect;
              return (
                <div 
                  key={option.id}
                  className={`border p-2 rounded-lg transition-colors flex items-center gap-2 bg-white ${
                    shouldShowCorrect
                      ? 'border-emerald-200 bg-emerald-50/10 text-emerald-700' 
                      : 'border-slate-100 text-slate-600'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    shouldShowCorrect
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-300'
                  }`}>
                    {shouldShowCorrect && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <span>{letter}. <LatexText value={option.text || 'Phương án chưa nhập...'} /></span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
