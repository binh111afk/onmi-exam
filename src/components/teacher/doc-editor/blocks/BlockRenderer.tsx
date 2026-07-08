import React from 'react';
import type { DocBlock, LiveTableResizeState, LiveTableActiveCell } from '../../../../types/doc-editor';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { QuoteBlock } from './QuoteBlock';
import { CalloutBlock } from './CalloutBlock';
import { DividerBlock } from './DividerBlock';
import { ImageBlock } from './ImageBlock';
import { TableBlock } from './table/TableBlock';
import { FormulaBlock } from './FormulaBlock';
import { CodeBlock } from './CodeBlock';
import { QuizBlock } from './quiz/QuizBlock';
import { FlashcardBlock } from './flashcard/FlashcardBlock';
import { MindmapBlock } from './mindmap/MindmapBlock';
import { TimelineBlock } from './timeline/TimelineBlock';
import { FlowBlock } from './flow/FlowBlock';
import { TabsBlock } from './tabs/TabsBlock';
import { CompareBlock } from './compare/CompareBlock';
import { DiagramBlock } from './diagram/DiagramBlock';
import { MatchingBlock } from './matching/MatchingBlock';
import { Video } from 'lucide-react';

const MediaBlockComponent: React.FC<{
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
  showUniversalToolbar?: boolean;
}> = ({ block, idx, isActive, setActiveBlockIndex, onUpdateBlock }) => {
  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="aspect-video w-full max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden my-1 flex flex-col items-center justify-center text-center p-4 relative border border-slate-800 select-text"
    >
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/60 font-black text-[8px] uppercase tracking-wider select-none">
        <span className="flex items-center gap-1"><Video size={10} /> Video Bài học</span>
        {isActive && (
          <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded-lg shadow-sm text-[8px] text-white/80 font-bold">
            Media Toolbar
          </div>
        )}
      </div>
      <input
        type="text"
        value={block.text || ''}
        onChange={(e) => onUpdateBlock(idx, { ...block, text: e.target.value })}
        placeholder="Nhập tiêu đề hoặc đường dẫn video..."
        className="w-full bg-transparent border-none outline-none text-center font-bold text-[10px] text-white placeholder-white/30 focus:ring-0"
      />
    </div>
  );
};
const MediaBlock = React.memo(MediaBlockComponent);

interface BlockRendererProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  alignClass: string;
  listIndex?: string;
  setActiveBlockIndex: (i: number) => void;
  updateBlockText: (i: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  toggleTodoChecked: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  onDeleteBlock: (i: number) => void;
  tableNumber?: number;
  /** Routes toolbar alignment actions into table cells when table is active */
  onRegisterCellAlignHandler: (fn: ((align: 'left' | 'center' | 'right' | 'justify') => void) | null) => void;
  liveTableResize: LiveTableResizeState | null;
  setLiveTableResize: (state: LiveTableResizeState | null) => void;
  liveTableActiveCell: LiveTableActiveCell | null;
  setLiveTableActiveCell: (state: LiveTableActiveCell | null) => void;
}

export const BlockRendererComponent: React.FC<BlockRendererProps> = ({
  block,
  idx,
  isActive,
  alignClass,
  listIndex,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
  toggleTodoChecked,
  onUpdateBlock,
  onDeleteBlock,
  tableNumber,
  onRegisterCellAlignHandler,
  liveTableResize,
  setLiveTableResize,
  liveTableActiveCell,
  setLiveTableActiveCell,
}) => {
  switch (block.type) {
    case 'heading':
      return (
        <HeadingBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDown}
        />
      );
    case 'quote':
      return (
        <QuoteBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDown}
        />
      );
    case 'callout':
      return (
        <CalloutBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDown}
        />
      );
    case 'divider':
      return (
        <DividerBlock 
          idx={idx}
          setActiveBlockIndex={setActiveBlockIndex}
        />
      );
    case 'image':
      return (
        <ImageBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    case 'table':
      return (
        <TableBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          _tableNumber={tableNumber || 1}
          onRegisterCellAlignHandler={onRegisterCellAlignHandler}
          liveTableResize={liveTableResize}
          setLiveTableResize={setLiveTableResize}
          liveTableActiveCell={liveTableActiveCell}
          setLiveTableActiveCell={setLiveTableActiveCell}
          showUniversalToolbar={false}
        />
      );
    case 'formula':
      return (
        <FormulaBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          handleKeyDown={handleKeyDown}
          showUniversalToolbar={false}
        />
      );
    case 'quiz':
      return (
        <QuizBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'flashcard':
      return (
        <FlashcardBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'mindmap':
      return (
        <MindmapBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'timeline':
      return (
        <TimelineBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'flow':
      return (
        <FlowBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'tabs':
      return (
        <TabsBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'compare':
      return (
        <CompareBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'diagram':
      return (
        <DiagramBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'matching':
      return (
        <MatchingBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'media':
      return (
        <MediaBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
          showUniversalToolbar={false}
        />
      );
    case 'code':
      return (
        <CodeBlock 
          block={block}
          idx={idx}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    default:
      return (
        <ParagraphBlock 
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          listIndex={listIndex}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDown}
          toggleTodoChecked={toggleTodoChecked}
        />
      );
  }
};

export const BlockRenderer = React.memo(BlockRendererComponent);
