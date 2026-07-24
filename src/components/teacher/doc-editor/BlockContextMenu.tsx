import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { CopyIcon, TrashIcon, AltArrowUpIcon, AltArrowDownIcon } from '../../AppIcons';
import { BLOCK_COMMANDS } from './CommandRegistry';
import type { DocBlock } from '../../../types/doc-editor';

interface BlockContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConvert: (type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  onInsertAbove: () => void;
  onInsertBelow: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({
  isOpen,
  onClose,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onConvert,
  onInsertAbove,
  onInsertBelow,
  canMoveUp,
  canMoveDown,
  triggerRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ 
    top: 0, 
    left: 0,
    maxHeight: 'none',
    overflowY: 'visible' as React.CSSProperties['overflowY']
  });
  const [lockedDirection, setLockedDirection] = useState<'bottom' | 'top' | 'right' | 'left' | null>(null);

  const updateCoords = React.useCallback((forceDirectionRecalc = false) => {
    if (triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      const prevTop = menuRef.current.style.top;
      const prevLeft = menuRef.current.style.left;
      const prevMaxHeight = menuRef.current.style.maxHeight;
      const prevOverflowY = menuRef.current.style.overflowY;
      
      menuRef.current.style.top = '0px';
      menuRef.current.style.left = '0px';
      menuRef.current.style.maxHeight = 'none';
      menuRef.current.style.overflowY = 'visible';

      const menuRect = menuRef.current.getBoundingClientRect();

      menuRef.current.style.top = prevTop;
      menuRef.current.style.left = prevLeft;
      menuRef.current.style.maxHeight = prevMaxHeight;
      menuRef.current.style.overflowY = prevOverflowY;

      const menuWidth = menuRect.width > 0 ? menuRect.width : 208;
      const menuHeight = menuRect.height > 0 ? menuRect.height : 310;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceBelow = viewportHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const spaceRight = viewportWidth - rect.right - 12;
      const spaceLeft = rect.left - 12;

      let direction = forceDirectionRecalc ? null : lockedDirection;

      if (!direction) {
        if (spaceBelow >= menuHeight) {
          direction = 'bottom';
        } else if (spaceAbove >= menuHeight) {
          direction = 'top';
        } else if (spaceRight >= menuWidth) {
          direction = 'right';
        } else if (spaceLeft >= menuWidth) {
          direction = 'left';
        } else {
          const maxSpace = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
          if (maxSpace === spaceBelow) direction = 'bottom';
          else if (maxSpace === spaceAbove) direction = 'top';
          else if (maxSpace === spaceRight) direction = 'right';
          else direction = 'left';
        }
        setLockedDirection(direction);
      }

      let top = 0;
      let left = 0;
      let height = menuHeight;
      let constrainHeight = false;

      if (direction === 'bottom') {
        top = rect.bottom + 6;
        left = rect.left;
        left = Math.max(8, Math.min(viewportWidth - menuWidth - 8, left));
        if (spaceBelow < menuHeight) {
          height = spaceBelow;
          constrainHeight = true;
        }
      } else if (direction === 'top') {
        top = rect.top - menuHeight - 6;
        left = rect.left;
        left = Math.max(8, Math.min(viewportWidth - menuWidth - 8, left));
        if (spaceAbove < menuHeight) {
          top = 12;
          height = spaceAbove;
          constrainHeight = true;
        }
      } else if (direction === 'right') {
        top = rect.top;
        left = rect.right + 6;
        top = Math.max(12, Math.min(viewportHeight - menuHeight - 12, top));
        left = Math.max(8, Math.min(viewportWidth - menuWidth - 8, left));
        if (viewportHeight - top - 12 < menuHeight) {
          height = viewportHeight - top - 12;
          constrainHeight = true;
        }
      } else if (direction === 'left') {
        top = rect.top;
        left = rect.left - menuWidth - 6;
        top = Math.max(12, Math.min(viewportHeight - menuHeight - 12, top));
        left = Math.max(8, Math.min(viewportWidth - menuWidth - 8, left));
        if (viewportHeight - top - 12 < menuHeight) {
          height = viewportHeight - top - 12;
          constrainHeight = true;
        }
      }

      setCoords({
        top,
        left,
        maxHeight: constrainHeight ? `${height}px` : 'none',
        overflowY: constrainHeight ? 'auto' : 'visible'
      });
    }
  }, [lockedDirection, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && 
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (isOpen) {
      setLockedDirection(null);
      const raf = requestAnimationFrame(() => {
        updateCoords(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleScrollResize = () => {
        updateCoords(false);
      };
      window.addEventListener('scroll', handleScrollResize, true);
      window.addEventListener('resize', handleScrollResize);
      return () => {
        window.removeEventListener('scroll', handleScrollResize, true);
        window.removeEventListener('resize', handleScrollResize);
      };
    }
  }, [isOpen, updateCoords]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        ref={menuRef}
      className="fixed w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-[9999] p-1.5 flex flex-col gap-0.5 animate-fadeIn select-none text-[10px] font-bold text-slate-700 font-sans"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        maxHeight: coords.maxHeight,
        overflowY: coords.overflowY,
      }}
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onDuplicate(); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer text-slate-655"
      >
        <CopyIcon size={11} className="text-slate-400" />
        <span>Nhân bản (Duplicate)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 hover:text-red-500 rounded-lg flex items-center gap-2 cursor-pointer text-slate-655"
      >
        <TrashIcon size={11} className="text-slate-400 group-hover:text-red-500" />
        <span>Xóa block</span>
      </button>

      <div className="h-px bg-slate-100 my-1" />

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onInsertAbove(); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer text-slate-655"
      >
        <ArrowUp size={11} className="text-slate-400" />
        <span>Chèn phía trên (Insert Above)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onInsertBelow(); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer text-slate-655"
      >
        <ArrowDown size={11} className="text-slate-400" />
        <span>Chèn phía dưới (Insert Below)</span>
      </button>

      <div className="h-px bg-slate-100 my-1" />

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onMoveUp(); onClose(); }}
        disabled={!canMoveUp}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
          canMoveUp ? 'hover:bg-slate-50 cursor-pointer text-slate-655' : 'opacity-40 cursor-not-allowed text-slate-400'
        }`}
      >
        <AltArrowUpIcon size={11} className="text-slate-400" />
        <span>Di chuyển lên</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onMoveDown(); onClose(); }}
        disabled={!canMoveDown}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
          canMoveDown ? 'hover:bg-slate-50 cursor-pointer text-slate-655' : 'opacity-40 cursor-not-allowed text-slate-400'
        }`}
      >
        <AltArrowDownIcon size={11} className="text-slate-400" />
        <span>Di chuyển xuống</span>
      </button>

      <div className="h-px bg-slate-100 my-1" />
      <div className="px-2.5 py-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">Chuyển đổi thành</div>
      
      {/* Scrollable sub-container for 13 conversion options */}
      <div className="max-h-44 overflow-y-auto flex flex-col gap-0.5 pr-0.5 border border-slate-50 rounded-lg bg-slate-50/20 p-1">
        {BLOCK_COMMANDS.map((cmd) => (
          <button
            key={cmd.type}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (cmd.type === 'heading-1') {
                onConvert('heading', 1);
              } else if (cmd.type === 'heading-2') {
                onConvert('heading', 2);
              } else if (cmd.type === 'heading-3') {
                onConvert('heading', 3);
              } else {
                onConvert(cmd.type as DocBlock['type']);
              }
              onClose();
            }}
            className="w-full text-left px-2 py-1.5 hover:bg-white hover:shadow-sm rounded-md flex items-center gap-2 cursor-pointer text-slate-600 transition"
          >
            <span className="shrink-0 scale-90">{cmd.icon}</span>
            <span className="truncate">{cmd.label}</span>
          </button>
        ))}
      </div>
      </div>
    </>,
    document.body
  );
};
