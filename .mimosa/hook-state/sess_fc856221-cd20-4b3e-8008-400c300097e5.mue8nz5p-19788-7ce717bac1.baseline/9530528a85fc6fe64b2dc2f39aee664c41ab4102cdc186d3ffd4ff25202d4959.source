import React from 'react';
import type { OmlContentBlock } from '../../../types/oml';

// Block imports
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { ListBlock } from './blocks/ListBlock';
import { FormulaBlock } from './blocks/FormulaBlock';
import { ImageBlock, ImageGroupBlock } from './blocks/ImageBlocks';
import { TableBlock } from './blocks/TableBlock';
import { QuestionBlock } from './blocks/QuestionBlock';
import { QuestionGroupBlock } from './blocks/QuestionGroupBlock';

interface OmlBlockRouterProps {
  block: OmlContentBlock;
  idx: number;
  selectedQuestionId?: string | number;
  setSelectedQuestionId?: (id: number) => void;
}

export const OmlBlockRouter: React.FC<OmlBlockRouterProps> = ({
  block,
  idx,
  selectedQuestionId,
  setSelectedQuestionId,
}) => {
  if (!block || !block.type) return null;

  switch (block.type) {
    case 'heading':
      return <HeadingBlock block={block} />;

    case 'paragraph':
      return <ParagraphBlock block={block} />;

    case 'divider':
      return <DividerBlock block={block} />;

    case 'quote':
      return <QuoteBlock block={block} />;

    case 'callout':
      return <CalloutBlock block={block} />;

    case 'image':
      return <ImageBlock block={block} />;

    case 'image-group':
      return <ImageGroupBlock block={block} />;

    case 'formula':
      return <FormulaBlock block={block} />;

    case 'table':
      return <TableBlock block={block} />;

    case 'list':
      return <ListBlock block={block} />;

    case 'question':
      return (
        <QuestionBlock
          block={block}
          idx={idx}
          selectedQuestionId={selectedQuestionId}
          setSelectedQuestionId={setSelectedQuestionId}
        />
      );

    case 'question-group':
      return (
        <QuestionGroupBlock
          block={block}
          idx={idx}
          selectedQuestionId={selectedQuestionId}
          setSelectedQuestionId={setSelectedQuestionId}
        />
      );

    default:
      return (
        <div className="border border-dashed border-slate-300 rounded-xl p-3 text-[10px] text-slate-400 font-bold">
          🔷 <strong>Unknown Block:</strong> "{block.type}"
          <div className="text-[9px] font-medium mt-0.5 text-slate-300">
            Block chưa được renderer hiện tại hỗ trợ; đang dùng fallback an toàn
          </div>
        </div>
      );
  }
};
