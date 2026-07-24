import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Scissors, 
  Clipboard, 
  Bold, 
  Italic, 
  Underline, 
  Highlighter, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type,
  ChevronRight,
  Check
} from 'lucide-react';
import { CopyIcon, TextColorIcon } from '../../AppIcons';
import type { DocBlock } from '../../../types/doc-editor';
import { useFormattingState } from './FormattingStateProvider';

interface SelectionContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  coords: { x: number; y: number };
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onFormat: (command: string, value?: string) => void;
  onConvertBlock: (type: DocBlock['type'], level?: 1 | 2 | 3) => void;
}

const colors = [
  { name: 'Mặc định', value: '#1F2C3F' },
  { name: 'Đỏ', value: '#EF4444' },
  { name: 'Xanh lá', value: '#10B981' },
  { name: 'Xanh dương', value: '#3B82F6' },
  { name: 'Tím', value: '#6C5DD3' },
  { name: 'Hồng', value: '#FF758F' },
  { name: 'Cam', value: '#F59E0B' },
];

const highlights = [
  { name: 'Không màu', value: 'transparent' },
  { name: 'Vàng', value: '#FEF08A' },
  { name: 'Xanh lá', value: '#BBF7D0' },
  { name: 'Xanh dương', value: '#BFDBFE' },
  { name: 'Tím', value: '#E9D5FF' },
  { name: 'Hồng', value: '#FBCFE8' },
];

export const SelectionContextMenu: React.FC<SelectionContextMenuProps> = ({
  isOpen,
  onClose,
  coords,
  onCopy,
  onCut,
  onPaste,
  onFormat,
  onConvertBlock,
}) => {
  const { formattingState } = useFormattingState();
  const { color: activeColor, highlight: activeHighlight } = formattingState;
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedCoords, setAdjustedCoords] = useState(coords);
  const [activeSubmenu, setActiveSubmenu] = useState<'color' | 'highlight' | null>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = coords.x;
      let y = coords.y;

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8;
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8;
      }
      x = Math.max(8, x);
      y = Math.max(8, y);

      setAdjustedCoords({ x, y });
    }
  }, [isOpen, coords]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleMouseDown);
    }
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (cb: () => void) => {
    cb();
    onClose();
  };

  const normalizedColor = activeColor.toUpperCase();
  const normalizedHighlight = activeHighlight.toLowerCase();

  return createPortal(
    <div 
      ref={menuRef}
      style={{ top: `${adjustedCoords.y}px`, left: `${adjustedCoords.x}px` }}
      className="fixed z-[9999] w-56 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5 animate-fadeIn text-[10px] font-bold text-slate-700 select-none"
    >
      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(onCopy)}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <CopyIcon size={12} className="text-slate-400" />
        <span>Sao chép (Copy)</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(onCut)}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Scissors size={12} className="text-slate-400" />
        <span>Cắt (Cut)</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(onPaste)}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Clipboard size={12} className="text-slate-400" />
        <span>Dán (Paste)</span>
      </button>

      <div className="h-px bg-slate-100 my-1" />

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onFormat('bold'))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Bold size={12} className="text-slate-400" />
        <span>Chữ đậm</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onFormat('italic'))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Italic size={12} className="text-slate-400" />
        <span>Chữ nghiêng</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onFormat('underline'))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Underline size={12} className="text-slate-400" />
        <span>Gạch chân</span>
      </button>

      {/* Colors Submenu */}
      <div 
        className="relative"
        onMouseEnter={() => setActiveSubmenu('color')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button 
          onMouseDown={(e) => e.preventDefault()}
          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer text-slate-700 ${activeSubmenu === 'color' ? 'bg-slate-50' : ''}`}
        >
          <div className="flex items-center gap-2">
            <TextColorIcon size={14} className="text-slate-400" />
            <span>Màu chữ</span>
          </div>
          <ChevronRight size={10} className="text-slate-400" />
        </button>

        {activeSubmenu === 'color' && (
          <div className="absolute left-full top-0 ml-1 w-36 bg-white border border-slate-100 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 animate-fadeIn z-[10000]">
            {colors.map(c => (
              <button
                key={c.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAction(() => onFormat('foreColor', c.value))}
                className={`px-2 py-1 text-left text-[9px] font-bold rounded-lg flex items-center justify-between cursor-pointer ${
                  normalizedColor === c.value.toUpperCase() ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full border border-slate-100" style={{ backgroundColor: c.value }} />
                  <span>{c.name}</span>
                </div>
                {normalizedColor === c.value.toUpperCase() && <Check size={8} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Highlight Submenu */}
      <div 
        className="relative"
        onMouseEnter={() => setActiveSubmenu('highlight')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button 
          onMouseDown={(e) => e.preventDefault()}
          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer text-slate-700 ${activeSubmenu === 'highlight' ? 'bg-slate-50' : ''}`}
        >
          <div className="flex items-center gap-2">
            <Highlighter size={12} className="text-slate-400" />
            <span>Màu nền chữ</span>
          </div>
          <ChevronRight size={10} className="text-slate-400" />
        </button>

        {activeSubmenu === 'highlight' && (
          <div className="absolute left-full top-0 ml-1 w-36 bg-white border border-slate-100 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 animate-fadeIn z-[10000]">
            {highlights.map(h => (
              <button
                key={h.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAction(() => onFormat('backColor', h.value))}
                className={`px-2 py-1 text-left text-[9px] font-bold rounded-lg flex items-center justify-between cursor-pointer ${
                  normalizedHighlight === h.value.toLowerCase() ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded border border-slate-200" style={{ backgroundColor: h.value === 'transparent' ? '#FFFFFF' : h.value }} />
                  <span>{h.name}</span>
                </div>
                {normalizedHighlight === h.value.toLowerCase() && <Check size={8} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 my-1" />

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onConvertBlock('heading', 1))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Heading1 size={12} className="text-slate-400" />
        <span>Heading 1</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onConvertBlock('heading', 2))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Heading2 size={12} className="text-slate-400" />
        <span>Heading 2</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onConvertBlock('heading', 3))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Heading3 size={12} className="text-slate-400" />
        <span>Heading 3</span>
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleAction(() => onConvertBlock('paragraph'))}
        className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-slate-700"
      >
        <Type size={12} className="text-slate-400" />
        <span>Paragraph</span>
      </button>
    </div>,
    document.body
  );
};
