import React from 'react';
import type { DocBlock, LiveTableResizeState, LiveTableActiveCell } from '../../../../types/doc-editor';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { QuoteBlock } from './QuoteBlock';
import { CalloutBlock } from './CalloutBlock';
import { DividerBlock } from './DividerBlock';
import { ImageBlock } from './ImageBlock';
import { TableBlock } from './TableBlock';
import { FormulaBlock } from './FormulaBlock';
import { CodeBlock } from './CodeBlock';

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
