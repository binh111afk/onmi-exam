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
import { FillBlankBlock } from './fillblank/Block';
import { DragDropBlock } from './dragdrop/Block';
import { SortOrderBlock } from './sortorder/Block';
import { MediaBlock } from './MediaBlock';
import { containsLatexDelimiter, LatexText } from './common/LatexText';

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
    case 'fillblank':
      return (
        <FillBlankBlock
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    case 'dragdrop':
      return (
        <DragDropBlock
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    case 'sortorder':
      return (
        <SortOrderBlock
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
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
