import React from 'react';
import type { OmlQuestionGroupBlock } from '../../../../types/oml';
import { OmlBlockRouter } from '../OmlBlockRouter';
import { QuestionBlock } from './QuestionBlock';

interface QuestionGroupBlockProps {
  block: OmlQuestionGroupBlock;
  idx: number;
  selectedQuestionId?: string | number;
  setSelectedQuestionId?: (id: number) => void;
}

export const QuestionGroupBlock: React.FC<QuestionGroupBlockProps> = ({
  block,
  idx,
  selectedQuestionId,
  setSelectedQuestionId,
}) => {
  return (
    <section className="my-5 space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-sm">📖</span>
          <span>Ngữ liệu</span>
        </div>
        <div className="space-y-3 text-slate-700">
          {(block.context ?? []).map((contextBlock, contextIdx) => (
            <OmlBlockRouter
              key={contextIdx}
              block={contextBlock}
              idx={Number(`${idx}${contextIdx}`)}
              selectedQuestionId={selectedQuestionId}
              setSelectedQuestionId={setSelectedQuestionId}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {(block.questions ?? []).map((question, questionIdx) => (
          <QuestionBlock
            key={question.id ?? questionIdx}
            block={question}
            idx={Number(`${idx}${questionIdx + 10}`)}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        ))}
      </div>
    </section>
  );
};
