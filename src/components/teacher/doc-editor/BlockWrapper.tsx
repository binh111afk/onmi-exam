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
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  onDeleteBlock: (i: number) => void;
  onDuplicateBlock: (i: number) => void;
  onConvertBlock: (index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  onInsertAbove: (i: number) => void;
  onInsertBelow: (i: number) => void;
  moveBlockUp: (i: number) => void;
  moveBlockDown: (i: number) => void;
  blocksLength: number;
  onDragStart: (e: React.PointerEvent<HTMLButtonElement>, i: number) => void;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  idx,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onConvertBlock,
  onInsertAbove,
  onInsertBelow,
  moveBlockUp,
  moveBlockDown,
  blocksLength,
  onDragStart,
  children,
}) => {
  const selection = useContext(BlockSelectionContext);
  const isSelected = selection?.isSelected(block.id) ?? false;
  const isActive = selection?.activeBlockId === block.id;

  const [customActions, setCustomActions] = useState<ToolbarAction[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleButtonRef = useRef<HTMLButtonElement>(null);

  // Synchronize custom action updates from block children
  const registerCustomActions = (actions: ToolbarAction[]) => {
    setCustomActions(actions);
  };

  const handleAlign = (align: DocBlock['align']) => {
    onUpdateBlock(idx, { ...block, align });
  };

  return (
    <BlockWrapperContext.Provider value={{ registerCustomActions }}>
      <div
        className={`group/wrapper relative flex items-start gap-2.5 transition rounded-xl w-full p-1.5 min-h-[36px] ${
          isSelected 
            ? 'bg-slate-50/40 ring-2 ring-indigo-500/80 border-transparent shadow-sm' 
            : 'hover:bg-slate-50/20 ring-1 ring-transparent'
        }`}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          // Avoid stealing focus when editing cells/textareas/inputs
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            target.closest('button') ||
            target.closest('a')
          ) {
            selection?.selectBlock(block.id, e.ctrlKey || e.metaKey, e.shiftKey);
            return;
          }
          e.preventDefault();
          selection?.selectBlock(block.id, e.ctrlKey || e.metaKey, e.shiftKey);
        }}
      >
        {/* Floating Block Toolbar */}
        {isActive && !isMenuOpen && (
          <BlockToolbar
            block={block}
            idx={idx}
            customActions={customActions}
            onAlign={handleAlign}
            onDuplicate={() => onDuplicateBlock(idx)}
            onDelete={() => onDeleteBlock(idx)}
            moveBlockUp={moveBlockUp}
            moveBlockDown={moveBlockDown}
            canMoveUp={idx > 0}
            canMoveDown={idx < blocksLength - 1}
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
                onDuplicateBlock(idx);
                setIsMenuOpen(false);
              }}
              onDelete={() => {
                onDeleteBlock(idx);
                setIsMenuOpen(false);
              }}
              onMoveUp={() => {
                moveBlockUp(idx);
                setIsMenuOpen(false);
              }}
              onMoveDown={() => {
                moveBlockDown(idx);
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
              canMoveUp={idx > 0}
              canMoveDown={idx < blocksLength - 1}
              triggerRef={handleButtonRef}
              onAlign={handleAlign}
              currentAlign={block.align || 'left'}
            />
          </div>
        </div>

        {/* Content Render Container */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </BlockWrapperContext.Provider>
  );
};
