import React, { useState, useContext, useRef, createContext } from 'react';
import { GripVertical } from 'lucide-react';
import { BlockSelectionContext } from './BlockSelectionProvider';
import { BlockToolbar } from './BlockToolbar';
import { BlockContextMenu } from './BlockContextMenu';
import { Tooltip } from './Tooltip';
import type { DocBlock } from '../../../types/doc-editor';

export interface ToolbarAction {
  label: string;
  icon?: React.ReactNode;
  onTrigger: () => void;
  ref?: React.RefObject<HTMLButtonElement | null>;
}

interface BlockWrapperContextType {
  registerCustomActions: (actions: ToolbarAction[]) => void;
}

export const BlockWrapperContext = createContext<BlockWrapperContextType | null>(null);

interface BlockWrapperProps {
  block: DocBlock;
  idx: number;
  onDeleteBlocks: (ids: string[]) => void;
  onDuplicateBlocks: (ids: string[]) => void;
  onConvertBlock: (index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  onInsertAbove: (i: number) => void;
  onInsertBelow: (i: number) => void;
  moveBlocks: (ids: string[], direction: 'up' | 'down') => void;
  onDragStart: (e: React.PointerEvent<HTMLButtonElement>, i: number) => void;
  showUniversalToolbar?: boolean;
  applyBlockAlignment?: (blockIds: string[], align: DocBlock['align']) => void;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  idx,
  onDeleteBlocks,
  onDuplicateBlocks,
  onConvertBlock,
  onInsertAbove,
  onInsertBelow,
  moveBlocks,
  onDragStart,
  showUniversalToolbar,
  applyBlockAlignment,
  children,
}) => {
  const STANDARD_BLOCKS = ['paragraph', 'heading', 'quote', 'callout', 'divider', 'image', 'bullet-list', 'numbered-list', 'todo-list'];
  const selection = useContext(BlockSelectionContext);
  const shouldShowToolbar = (showUniversalToolbar ?? STANDARD_BLOCKS.includes(block.type)) && selection?.editorMode === 'block';
  const isSelected = (selection?.isSelected(block.id) ?? false) && selection?.editorMode === 'block';
  const isActive = selection?.activeBlockId === block.id;
  const commandBlockIds = selection?.getCommandBlockIds(block.id) ?? [];
  const canExecuteCommand = commandBlockIds.length > 0;
  const canMoveCommandUp = selection?.canMoveCommandBlocks(commandBlockIds, 'up') ?? false;
  const canMoveCommandDown = selection?.canMoveCommandBlocks(commandBlockIds, 'down') ?? false;

  const alignClass = block.align === 'center'
    ? 'text-center'
    : block.align === 'right'
      ? 'text-right'
      : block.align === 'justify'
        ? 'text-justify'
        : 'text-left';

  const flexAlignClass = block.align === 'center'
    ? 'flex flex-col items-center'
    : block.align === 'right'
      ? 'flex flex-col items-end'
      : '';

  const [customActions, setCustomActions] = useState<ToolbarAction[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleButtonRef = useRef<HTMLButtonElement>(null);

  // Synchronize custom action updates from block children
  const registerCustomActions = (actions: ToolbarAction[]) => {
    setCustomActions(actions);
  };

  const handleAlign = (align: DocBlock['align']) => {
    if (!canExecuteCommand || !applyBlockAlignment) return;
    applyBlockAlignment(commandBlockIds, align);
  };

  return (
    <BlockWrapperContext.Provider value={{ registerCustomActions }}>
      <div
        className={`group/wrapper relative flex items-start gap-2.5 transition rounded-xl w-full p-1.5 min-h-[36px] ${
          isSelected
            ? 'bg-slate-50/40 ring-2 ring-indigo-500/80 border-transparent shadow-sm'
            : 'hover:bg-slate-50/20 ring-1 ring-transparent'
        }`}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          const isInteractive =
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            target.closest('button') ||
            target.closest('a');

          const isBlockActive = selection?.activeBlockId === block.id;

          // First click on inactive block -> activate block and switch to Block Selection Mode
          if (!isBlockActive) {
            if (isInteractive && !target.closest('button') && !target.closest('a')) {
              e.preventDefault();
              e.stopPropagation();
            }
            selection?.selectBlock(block.id, e.ctrlKey || e.metaKey, e.shiftKey);
            selection?.setEditorMode('block');
            return;
          }

          // Second click on interactive element inside active block -> switch to Text Editing Mode
          if (isInteractive) {
            selection?.setEditorMode('text');
            return;
          }

          // Clicking on non-interactive area of active block -> keep Block Selection Mode
          e.preventDefault();
          selection?.setEditorMode('block');
        }}
      >
        {/* Floating Block Toolbar */}
        {isActive && !isMenuOpen && shouldShowToolbar && (
          <BlockToolbar
            customActions={customActions}
            onAlign={handleAlign}
            onDuplicate={() => onDuplicateBlocks(commandBlockIds)}
            onDelete={() => onDeleteBlocks(commandBlockIds)}
            onMoveUp={() => moveBlocks(commandBlockIds, 'up')}
            onMoveDown={() => moveBlocks(commandBlockIds, 'down')}
            canExecute={canExecuteCommand}
            canMoveUp={canMoveCommandUp}
            canMoveDown={canMoveCommandDown}
          />
        )}

        {/* Centralized Drag & Context Menu Handle */}
        <div className="w-5 h-6 flex items-center justify-center shrink-0 select-none text-slate-350">
          <div className="relative opacity-0 group-hover/wrapper:opacity-100 transition-all duration-[150ms] ease-in-out transform translate-x-[-2px] group-hover/wrapper:translate-x-0 flex items-center justify-center">
            <Tooltip content="Lựa chọn Block">
              <button
                ref={handleButtonRef}
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => onDragStart(e, idx)}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-0.5 hover:bg-slate-100 hover:text-slate-700 rounded cursor-pointer text-slate-400 touch-none"
              >
                <GripVertical size={14} />
              </button>
            </Tooltip>

            <BlockContextMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onDuplicate={() => {
                onDuplicateBlocks(commandBlockIds);
                setIsMenuOpen(false);
              }}
              onDelete={() => {
                onDeleteBlocks(commandBlockIds);
                setIsMenuOpen(false);
              }}
              onMoveUp={() => {
                moveBlocks(commandBlockIds, 'up');
                setIsMenuOpen(false);
              }}
              onMoveDown={() => {
                moveBlocks(commandBlockIds, 'down');
                setIsMenuOpen(false);
              }}
              onConvert={(type, level) => {
                onConvertBlock(idx, type, level);
                setIsMenuOpen(false);
              }}
              onInsertAbove={() => {
                onInsertAbove(idx);
                setIsMenuOpen(false);
              }}
              onInsertBelow={() => {
                onInsertBelow(idx);
                setIsMenuOpen(false);
              }}
              canMoveUp={canMoveCommandUp}
              canMoveDown={canMoveCommandDown}
              triggerRef={handleButtonRef}
            />
          </div>
        </div>

        {/* Content Render Container */}
        <div className={`flex-1 min-w-0 ${alignClass} ${flexAlignClass}`}>
          {children}
        </div>
      </div>
    </BlockWrapperContext.Provider>
  );
};
