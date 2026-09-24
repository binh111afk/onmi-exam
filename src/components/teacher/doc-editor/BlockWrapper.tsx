import React, { useState, useContext, useRef, createContext, useCallback, useMemo } from 'react';
import { GripVertical, Plus } from 'lucide-react';
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
  /** Block nội bộ (vd gallery ImageBlock) cần biết để ẩn control soạn thảo ở Xem như học sinh */
  isPreviewMode: boolean;
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
  isPreviewMode?: boolean;
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
  isPreviewMode,
  children,
}) => {
  const selection = useContext(BlockSelectionContext);
  const shouldShowToolbar = (showUniversalToolbar ?? true) && selection?.editorMode === 'block';
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
  const registerCustomActions = useCallback((actions: ToolbarAction[]) => {
    setCustomActions((prev) => {
      const isSame =
        prev.length === actions.length &&
        prev.every((action, index) =>
          action.label === actions[index]?.label &&
          action.icon === actions[index]?.icon &&
          action.onTrigger === actions[index]?.onTrigger &&
          action.ref === actions[index]?.ref
        );
      return isSame ? prev : actions;
    });
  }, []);

  const wrapperContextValue = useMemo(() => ({ registerCustomActions, isPreviewMode: !!isPreviewMode }), [registerCustomActions, isPreviewMode]);

  const handleAlign = (align: DocBlock['align']) => {
    if (!canExecuteCommand || !applyBlockAlignment) return;
    applyBlockAlignment(commandBlockIds, align);
  };

  return (
    <BlockWrapperContext.Provider value={wrapperContextValue}>
      <div
        className={`group/wrapper relative flex items-start gap-2.5 transition rounded-xl ${block.type === 'table' ? 'w-fit min-w-full' : 'w-full'} p-1.5 min-h-[36px] ${
          isSelected && !isPreviewMode
            ? 'bg-primary-light/40 ring-1 ring-primary/50 border-transparent'
            : isPreviewMode
              ? 'ring-1 ring-transparent'
              : 'hover:bg-slate-50/20 ring-1 ring-transparent'
        }`}
        onPointerDown={(e) => {
          // Xem như học sinh: không chọn block, không highlight viền editor
          if (isPreviewMode) return;
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
        {isActive && !isMenuOpen && !isPreviewMode && shouldShowToolbar && (
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

        {/* Centralized Drag & Context Menu Handle — ẩn hoàn toàn ở chế độ Xem như học sinh */}
        <div className="w-5 h-6 flex items-center justify-center shrink-0 select-none text-slate-350">
          {!isPreviewMode && (
          <div className="relative opacity-0 group-hover/wrapper:opacity-100 transition-all duration-[150ms] ease-in-out transform translate-x-[-2px] group-hover/wrapper:translate-x-0 flex items-center gap-0.5">
            <Tooltip content="Thêm block bên dưới">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertBelow(idx)}
                className="p-0.5 hover:bg-slate-100 hover:text-primary rounded cursor-pointer text-slate-400 touch-none"
              >
                <Plus size={14} />
              </button>
            </Tooltip>

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
          )}
        </div>

        {/* Content Render Container — table cho phép lớn theo tổng width đã resize */}
        <div className={`flex-1 ${block.type === 'table' ? 'min-w-fit' : 'min-w-0'} ${alignClass} ${flexAlignClass}`}>
          {children}
        </div>
      </div>
    </BlockWrapperContext.Provider>
  );
};
