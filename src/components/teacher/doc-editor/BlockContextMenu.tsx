import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  MessageSquare 
} from 'lucide-react';

interface BlockContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConvert: (type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'todo-list' | 'callout' | 'quote', level?: 1 | 2 | 3) => void;
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
  canMoveUp,
  canMoveDown,
  triggerRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updateCoords = () => {
    if (triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      let left = rect.left;
      let top = rect.bottom + 6; // 6px space below

      // Boundary check left/right
      if (left + menuRect.width > window.innerWidth - 8) {
        left = window.innerWidth - menuRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }

      // Boundary check bottom
      if (top + menuRect.height > window.innerHeight - 8) {
        top = rect.top - menuRect.height - 6; // Display above trigger
      }

      setCoords({ top, left });
    }
  };

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
      updateCoords();
      // Listen to scroll events on any parent scroll viewport (capture: true) and window resize
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-40 p-1.5 flex flex-col gap-0.5 animate-fadeIn select-none text-[10px] font-bold text-slate-700 font-sans"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onDuplicate(); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Copy size={12} className="text-slate-400" />
        <span>Nhân bản (Duplicate)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 hover:text-red-500 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Trash2 size={12} className="text-slate-400 group-hover:text-red-500" />
        <span>Xóa block</span>
      </button>

      <div className="h-px bg-slate-100 my-1" />

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onMoveUp(); onClose(); }}
        disabled={!canMoveUp}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
          canMoveUp ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
        }`}
      >
        <ChevronUp size={12} className="text-slate-400" />
        <span>Di chuyển lên</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onMoveDown(); onClose(); }}
        disabled={!canMoveDown}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
          canMoveDown ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
        }`}
      >
        <ChevronDown size={12} className="text-slate-400" />
        <span>Di chuyển xuống</span>
      </button>

      <div className="h-px bg-slate-100 my-1" />
      <div className="px-2.5 py-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">Chuyển đổi thành</div>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onConvert('paragraph'); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Type size={12} className="text-slate-400" />
        <span>Văn bản thường</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onConvert('heading', 1); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Heading1 size={12} className="text-slate-400" />
        <span>Tiêu đề 1 (Heading 1)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onConvert('heading', 2); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Heading2 size={12} className="text-slate-400" />
        <span>Tiêu đề 2 (Heading 2)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onConvert('heading', 3); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Heading3 size={12} className="text-slate-400" />
        <span>Tiêu đề 3 (Heading 3)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onConvert('quote'); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Quote size={12} className="text-slate-400" />
        <span>Trích dẫn (Quote)</span>
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onConvert('callout'); onClose(); }}
        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <MessageSquare size={12} className="text-slate-400" />
        <span>💧 Hộp lưu ý (Callout)</span>
      </button>
    </div>,
    document.body
  );
};
