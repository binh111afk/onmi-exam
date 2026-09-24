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
import { CodeBlock } from './code/CodeBlock';
import { LayoutView } from './layout/LayoutView';
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
import { InteractiveBlockShell } from './InteractiveBlockShell';
import { QuizPreview } from './quiz/QuizPreview';
import { FlashcardPreview } from './flashcard/FlashcardPreview';
import { MindmapPreview } from './mindmap/MindmapPreview';
import { TimelinePreview } from './timeline/TimelinePreview';
import { FlowPreview } from './flow/FlowPreview';
import { TabsPreview } from './tabs/TabsPreview';
import { ComparePreview } from './compare/ComparePreview';
import { DiagramPreview } from './diagram/DiagramPreview';
import { MatchingPreview } from './matching/MatchingPreview';
import { Preview as FillBlankPreview } from './fillblank/Preview';
import { Preview as DragDropPreview } from './dragdrop/Preview';
import { Preview as SortOrderPreview } from './sortorder/Preview';
import { CodePreview } from './code/CodePreview';
import type { CodeLanguage } from './code/CodeTypes';
import { SharedTableRenderer } from './table/SharedTableRenderer';

// Node hiển thị khi block tương tác chưa có nội dung — preview mặt student rỗng (bắt buộc khác rỗng để HMR theo dõi)
const emptyInteractiveNode = (
  <div className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3">
    Block trống — bấm "Sửa" để tạo nội dung
  </div>
);

const renderCodePreviewNode = (block: DocBlock) => {
  const cc = block.codeContent;
  const lang = (cc?.language || block.language || 'typescript') as CodeLanguage;
  const code = cc?.code ?? block.text ?? '';
  const showNums = cc?.showLineNumbers ?? true;
  const wrap = cc?.wrapLine ?? false;
  const theme = cc?.theme ?? 'dark';
  return <CodePreview code={code} language={lang} theme={theme} showLineNumbers={showNums} wrapLine={wrap} />;
};


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
  isPreviewMode: boolean;
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
  isPreviewMode,
}) => {
  // Mặt student của block tương tác — bọc qua InteractiveBlockShell (bấm "Sửa" mới vào form)
  const shell = (preview: React.ReactNode, editor: React.ReactNode) => (
    <InteractiveBlockShell
      blockId={block.id}
      isActive={isActive}
      isPreviewMode={isPreviewMode}
      preview={preview}
      editor={editor}
    />
  );
  switch (block.type) {
    case 'heading':
      return (
        <HeadingBlock
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          isPreviewMode={isPreviewMode}
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
          isPreviewMode={isPreviewMode}
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
          isPreviewMode={isPreviewMode}
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
      return shell(
        <div className="my-2.5">
          <SharedTableRenderer block={block} isEditable={false} />
        </div>,
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
      return shell(
        <QuizPreview block={block} indentStyle={{ paddingLeft: `${(block.indent || 0) * 16}px` }} />,
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
      return shell(
        <FlashcardPreview block={block} />,
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
      return shell(
        <MindmapPreview block={block} />,
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
      return shell(
        <TimelinePreview block={block} />,
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
      return shell(
        <FlowPreview block={block} />,
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
      return shell(
        <TabsPreview block={block} />,
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
      return shell(
        block.compareContent ? <ComparePreview content={block.compareContent} /> : emptyInteractiveNode,
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
      return shell(
        block.diagramContent ? <DiagramPreview content={block.diagramContent} /> : emptyInteractiveNode,
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
      return shell(
        block.matchingContent ? <MatchingPreview content={block.matchingContent} /> : emptyInteractiveNode,
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
      return shell(
        block.fillblankContent ? <FillBlankPreview block={block} /> : emptyInteractiveNode,
        <FillBlankBlock
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    case 'dragdrop':
      return shell(
        block.dragdropContent ? <DragDropPreview block={block} /> : emptyInteractiveNode,
        <DragDropBlock
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    case 'sortorder':
      return shell(
        block.sortorderContent ? <SortOrderPreview block={block} /> : emptyInteractiveNode,
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
      return shell(
        renderCodePreviewNode(block),
        <CodeBlock
          block={block}
          idx={idx}
          isActive={isActive}
          setActiveBlockIndex={setActiveBlockIndex}
          onUpdateBlock={onUpdateBlock}
        />
      );
    case 'layout': {
      // R1 — fallback dữ liệu thiếu/hỏng: không crash với legacy
      const lc = block.layoutContent;
      if (!lc || !lc.slots?.length || lc.columns?.length !== lc.slots.length) {
        return (
          <div className="w-full text-[10px] font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-4 text-center">
            Bố cục trống
          </div>
        );
      }
      return (
        <LayoutView
          block={block}
          onUpdateLayout={(next) => onUpdateBlock(idx, { ...block, layoutContent: next })}
        />
      );
    }
    default:
      return (
        <ParagraphBlock
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          listIndex={listIndex}
          isPreviewMode={isPreviewMode}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDown}
          toggleTodoChecked={toggleTodoChecked}
        />
      );
  }
};

export const BlockRenderer = React.memo(BlockRendererComponent);
