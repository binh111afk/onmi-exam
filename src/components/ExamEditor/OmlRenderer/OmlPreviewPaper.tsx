import React from 'react';
import type { OmlContentBlock, OmlInfo } from '../../../types/oml';
import { OmlBlockRouter } from './OmlBlockRouter';

interface OmlPreviewPaperProps {
  omlBlocks: OmlContentBlock[];
  infoMeta: OmlInfo;
  selectedQuestionId?: string | number;
  setSelectedQuestionId?: (id: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const collectQuestionBlocks = (blocks: OmlContentBlock[]): OmlContentBlock[] => {
  return blocks.flatMap((block) => {
    if (block?.type === 'question') return [block];
    if (block?.type === 'question-group') return (block as any).questions ?? [];
    return [];
  });
};

export const OmlPreviewPaper: React.FC<OmlPreviewPaperProps> = ({
  omlBlocks,
  infoMeta,
  selectedQuestionId,
  setSelectedQuestionId,
  className = 'w-full',
  style,
}) => {
  const previewQuestions = collectQuestionBlocks(omlBlocks);
  const questionCount = previewQuestions.length;

  return (
    <div
      className={`${className} bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 shrink-0 text-left`}
      style={style}
    >
      {/* Paper Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-sm font-black text-text-primary uppercase tracking-wide">
          {infoMeta.title || 'Đề thi chưa có tiêu đề'}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold mt-2 font-sans">
          <span>
            {infoMeta.subject || 'Không rõ'} • Khối {infoMeta.grade ?? '10'}
          </span>
          <span>{infoMeta.time ?? 45} phút</span>
          <span>{questionCount} câu hỏi</span>
          {infoMeta.author && <span>GV: {infoMeta.author}</span>}
        </div>
      </div>
      
      {/* Render OML blocks */}
      {omlBlocks.length > 0 ? (
        omlBlocks.map((block, blockIdx) => (
          <OmlBlockRouter
            key={blockIdx}
            block={block}
            idx={blockIdx}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        ))
      ) : (
        <div className="text-center text-slate-400 text-xs py-10 font-bold">
          Không có nội dung để hiển thị
        </div>
      )}
    </div>
  );
};
