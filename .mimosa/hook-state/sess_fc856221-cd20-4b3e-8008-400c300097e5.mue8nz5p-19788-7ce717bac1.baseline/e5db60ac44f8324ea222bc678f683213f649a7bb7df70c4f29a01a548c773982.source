import React from 'react';
import type { DocBlock, LiveTableResizeState, LiveTableActiveCell } from '../../../types/doc-editor';
import { BlockWrapper } from './BlockWrapper';
import { BlockRenderer } from './blocks/BlockRenderer';
import { DragIndicator } from './DragIndicator';
import { BlockDragPreview } from './BlockDragPreview';
import { SlashMenu } from './SlashMenu';
import { SelectionContextMenu } from './SelectionContextMenu';
import { TableInsertModal } from './TableInsertModal';
import { OtherBlocksPopup } from './other-blocks/OtherBlocksPopup';

interface BlockRowProps {
  block: DocBlock;
  idx: number;
  alignClass: string;
  indent: number;
  isActive: boolean;
  listIndex?: string;
  setActiveBlockIndex: (index: number | ((prev: number) => number)) => void;
  updateBlockText: (index: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, index: number) => void;
  toggleTodoChecked: (index: number) => void;
  onDeleteBlock: (index: number) => void;
  onDeleteBlocks: (ids: string[]) => void;
  onDuplicateBlocks: (ids: string[]) => void;
  onConvertBlock: (index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  onUpdateBlock: (index: number, updated: DocBlock, isDebounced?: boolean) => void;
  onInsertAbove: (index: number) => void;
  onInsertBelow: (index: number) => void;
  onDragStart: (e: React.PointerEvent<HTMLButtonElement>, index: number) => void;
  moveBlocks: (ids: string[], direction: 'up' | 'down') => void;
  tableNumber?: number;
  onRegisterCellAlignHandler: (fn: ((align: 'left' | 'center' | 'right' | 'justify') => void) | null) => void;
  liveTableResize: LiveTableResizeState | null;
  setLiveTableResize: (state: LiveTableResizeState | null) => void;
  liveTableActiveCell: LiveTableActiveCell | null;
  setLiveTableActiveCell: (state: LiveTableActiveCell | null) => void;
  applyBlockAlignment?: (blockIds: string[], align: DocBlock['align']) => void;
}

const BlockRowComponent: React.FC<BlockRowProps> = ({
  block,
  idx,
  alignClass,
  indent,
  isActive,
  listIndex,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
  toggleTodoChecked,
  onDeleteBlock,
  onDeleteBlocks,
  onDuplicateBlocks,
  onConvertBlock,
  onUpdateBlock,
  onInsertAbove,
  onInsertBelow,
  onDragStart,
  moveBlocks,
  tableNumber,
  onRegisterCellAlignHandler,
  liveTableResize,
  setLiveTableResize,
  liveTableActiveCell,
  setLiveTableActiveCell,
  applyBlockAlignment,
}) => {
  const indentStyle = { paddingLeft: `${indent * 24}px` };

  const handleKeyDownLocal = (e: React.KeyboardEvent<HTMLDivElement>) => {
    handleKeyDown(e, idx);
  };

  return (
    <div style={indentStyle} className="w-full block-row-item">
      <BlockWrapper
        block={block}
        idx={idx}
        onDeleteBlocks={onDeleteBlocks}
        onDuplicateBlocks={onDuplicateBlocks}
        onConvertBlock={onConvertBlock}
        onInsertAbove={onInsertAbove}
        onInsertBelow={onInsertBelow}
        moveBlocks={moveBlocks}
        onDragStart={onDragStart}
        applyBlockAlignment={applyBlockAlignment}
      >
        <BlockRenderer
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          listIndex={listIndex}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDownLocal}
          toggleTodoChecked={toggleTodoChecked}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          tableNumber={tableNumber}
          onRegisterCellAlignHandler={onRegisterCellAlignHandler}
          liveTableResize={liveTableResize}
          setLiveTableResize={setLiveTableResize}
          liveTableActiveCell={liveTableActiveCell}
          setLiveTableActiveCell={setLiveTableActiveCell}
        />
      </BlockWrapper>
    </div>
  );
};

const MemoizedBlockRow = React.memo(BlockRowComponent);

interface DocEditorBlockListProps {
  currentBlocks: DocBlock[];
  activeBlockIndex: number;
  setActiveBlockIndex: (index: number | ((prev: number) => number)) => void;
  updateBlockText: (index: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, index: number) => void;
  toggleTodoChecked: (index: number) => void;
  handleDeleteBlockWithConfirm: (index: number) => void;
  deleteBlocks: (ids: string[]) => void;
  duplicateBlocks: (ids: string[]) => void;
  convertBlockType: (index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  handleUpdateBlock: (index: number, updated: DocBlock, isDebounced?: boolean) => void;
  insertBlockAbove: (index: number) => void;
  insertBlockBelow: (index: number) => void;
  handleBlockDragStart: (e: React.PointerEvent<HTMLButtonElement>, index: number) => void;
  moveBlocks: (ids: string[], direction: 'up' | 'down') => void;
  tableCellAlignRef: React.MutableRefObject<((align: 'left' | 'center' | 'right' | 'justify') => void) | null>;
  liveTableResize: LiveTableResizeState | null;
  setLiveTableResize: (state: LiveTableResizeState | null) => void;
  liveTableActiveCell: LiveTableActiveCell | null;
  setLiveTableActiveCell: (state: LiveTableActiveCell | null) => void;
  applyBlockAlignment: (blockIds: string[], align: DocBlock['align']) => void;

  // Drag indicators
  dragIndicatorTop: number;
  dragIndicatorVisible: boolean;
  draggingIndex: number | null;
  dragPointerCoords: { x: number; y: number };

  // Slash menu
  showSlashMenu: boolean;
  setShowSlashMenu: (show: boolean) => void;
  filteredCommands: any[];
  slashMenuIndex: number;
  slashMenuCoords: { top: number; left: number };
  handleSelectSlashCommand: (cmdType: string) => void;

  // Selection context menu
  showSelectionMenu: boolean;
  setShowSelectionMenu: (show: boolean) => void;
  selectionMenuCoords: { x: number; y: number };
  setSelectionMenuCoords: (coords: { x: number; y: number }) => void;
  handlePasteSelection: () => void;
  executeFormat: (command: string, value?: string) => void;

  // Table modal
  showTableModal: boolean;
  setShowTableModal: (show: boolean) => void;
  setTableInsertIndex: (i: number | null) => void;
  setTableInsertMode: (mode: 'replace' | 'insert' | null) => void;
  createTableWithDimensions: (rowsCount: number, colsCount: number, hasHeaderRow: boolean, hasHeaderCol: boolean) => void;

  // Other blocks popup
  showOtherBlocksPopup: boolean;
  setShowOtherBlocksPopup: (show: boolean) => void;
  handleSelectOtherBlock: (type: any) => void;

  // Outer click Drop handlers
  handleScrollWrapperClick: (e: React.MouseEvent) => void;
  handleBodyDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const DocEditorBlockList: React.FC<DocEditorBlockListProps> = ({
  currentBlocks,
  activeBlockIndex,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
  toggleTodoChecked,
  handleDeleteBlockWithConfirm,
  deleteBlocks,
  duplicateBlocks,
  convertBlockType,
  handleUpdateBlock,
  insertBlockAbove,
  insertBlockBelow,
  handleBlockDragStart,
  moveBlocks,
  tableCellAlignRef,
  liveTableResize,
  setLiveTableResize,
  liveTableActiveCell,
  setLiveTableActiveCell,
  applyBlockAlignment,

  dragIndicatorTop,
  dragIndicatorVisible,
  draggingIndex,
  dragPointerCoords,

  showSlashMenu,
  setShowSlashMenu,
  filteredCommands,
  slashMenuIndex,
  slashMenuCoords,
  handleSelectSlashCommand,

  showSelectionMenu,
  setShowSelectionMenu,
  selectionMenuCoords,
  setSelectionMenuCoords,
  handlePasteSelection,
  executeFormat,

  showTableModal,
  setShowTableModal,
  setTableInsertIndex,
  setTableInsertMode,
  createTableWithDimensions,

  showOtherBlocksPopup,
  setShowOtherBlocksPopup,
  handleSelectOtherBlock,

  handleScrollWrapperClick,
  handleBodyDrop,
}) => {
  const getNumberedIndex = (blocks: DocBlock[], index: number): string => {
    const currentBlock = blocks[index];
    if (!currentBlock || currentBlock.type !== 'numbered-list') return '1.';

    let count = 1;
    const currentIndent = currentBlock.indent || 0;

    for (let i = index - 1; i >= 0; i--) {
      const prev = blocks[i];
      if (prev.type !== 'numbered-list') {
        if (prev.type !== 'bullet-list' && prev.type !== 'todo-list') {
          break;
        }
        continue;
      }
      const prevIndent = prev.indent || 0;
      if (prevIndent === currentIndent) {
        count++;
      } else if (prevIndent < currentIndent) {
        break;
      }
    }
    return `${count}.`;
  };

  const getTableNumber = (blocks: DocBlock[], index: number): number => {
    let count = 0;
    for (let i = 0; i <= index; i++) {
      if (blocks[i]?.type === 'table') {
        count++;
      }
    }
    return count;
  };

  return (
    <div
      id="editor-blocks-container"
      onKeyDown={(e) => handleKeyDown(e, activeBlockIndex)}
      onClick={handleScrollWrapperClick}
      onContextMenu={(e) => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const container = e.currentTarget;
          if (container.contains(sel.anchorNode)) {
            e.preventDefault();
            setSelectionMenuCoords({ x: e.clientX, y: e.clientY });
            setShowSelectionMenu(true);
          }
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleBodyDrop}
      className="flex-1 p-8 overflow-auto space-y-4 select-text relative"
    >
      {currentBlocks.map((block, idx) => {
        const alignClass =
          block.align === 'center'
            ? 'text-center'
            : block.align === 'right'
            ? 'text-right'
            : block.align === 'justify'
            ? 'text-justify'
            : 'text-left';

        const listIndex =
          block.type === 'numbered-list' ? getNumberedIndex(currentBlocks, idx) : undefined;
        const tableNumber = block.type === 'table' ? getTableNumber(currentBlocks, idx) : undefined;

        return (
          <MemoizedBlockRow
            key={block.id}
            block={block}
            idx={idx}
            alignClass={alignClass}
            indent={block.indent || 0}
            isActive={activeBlockIndex === idx}
            listIndex={listIndex}
            tableNumber={tableNumber}
            setActiveBlockIndex={setActiveBlockIndex}
            updateBlockText={updateBlockText}
            handleKeyDown={handleKeyDown}
            toggleTodoChecked={toggleTodoChecked}
            onDeleteBlock={handleDeleteBlockWithConfirm}
            onDeleteBlocks={deleteBlocks}
            onDuplicateBlocks={duplicateBlocks}
            onConvertBlock={convertBlockType}
            onUpdateBlock={handleUpdateBlock}
            onInsertAbove={insertBlockAbove}
            onInsertBelow={insertBlockBelow}
            onDragStart={handleBlockDragStart}
            moveBlocks={moveBlocks}
            onRegisterCellAlignHandler={(fn) => {
              tableCellAlignRef.current = fn;
            }}
            liveTableResize={liveTableResize}
            setLiveTableResize={setLiveTableResize}
            liveTableActiveCell={liveTableActiveCell}
            setLiveTableActiveCell={setLiveTableActiveCell}
            applyBlockAlignment={applyBlockAlignment}
          />
        );
      })}

      {/* Visual insertion indicator for block dragging */}
      <DragIndicator top={dragIndicatorTop} visible={dragIndicatorVisible} />

      {/* Floating visual preview of the block being dragged */}
      <BlockDragPreview
        text={draggingIndex !== null ? currentBlocks[draggingIndex]?.text || '' : ''}
        type={draggingIndex !== null ? currentBlocks[draggingIndex]?.type || '' : ''}
        coords={dragPointerCoords}
        visible={draggingIndex !== null}
      />

      {/* Presentation-only floating Slash Command Menu */}
      <SlashMenu
        isOpen={showSlashMenu}
        commands={filteredCommands}
        selectedIndex={slashMenuIndex}
        coords={slashMenuCoords}
        onSelect={handleSelectSlashCommand}
        onClose={() => setShowSlashMenu(false)}
      />

      {/* Custom selection right click context menu */}
      <SelectionContextMenu
        isOpen={showSelectionMenu}
        onClose={() => setShowSelectionMenu(false)}
        coords={selectionMenuCoords}
        onCopy={() => document.execCommand('copy')}
        onCut={() => document.execCommand('cut')}
        onPaste={handlePasteSelection}
        onFormat={executeFormat}
        onConvertBlock={(type, lvl) => convertBlockType(activeBlockIndex, type, lvl)}
      />

      {/* Custom table dimension creation modal */}
      <TableInsertModal
        isOpen={showTableModal}
        onClose={() => {
          setShowTableModal(false);
          setTableInsertIndex(null);
          setTableInsertMode(null);
        }}
        onConfirm={createTableWithDimensions}
      />

      {showOtherBlocksPopup && (
        <OtherBlocksPopup
          onClose={() => setShowOtherBlocksPopup(false)}
          onSelectBlock={handleSelectOtherBlock}
        />
      )}
    </div>
  );
};
