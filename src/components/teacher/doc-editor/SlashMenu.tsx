import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { DocCommand } from './CommandRegistry';

interface SlashMenuProps {
  isOpen: boolean;
  commands: DocCommand[];
  selectedIndex: number;
  coords: { top: number; left: number };
  onSelect: (type: DocCommand['type']) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  isOpen,
  commands,
  selectedIndex,
  coords,
  onSelect,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const activeEl = containerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen || commands.length === 0) return null;

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1.5 flex flex-col gap-0.5 max-h-60 overflow-y-auto w-64 animate-fadeIn text-[10px] font-bold text-slate-700 select-none font-sans"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      <div className="px-2.5 py-1 text-[8px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
        Định dạng Block
      </div>
      {commands.map((cmd, idx) => {
        const isActive = idx === selectedIndex;
        return (
          <button
            key={cmd.type}
            data-active={isActive ? "true" : "false"}
            onMouseDown={(e) => {
              // Prevent losing focus from the contentEditable element
              e.preventDefault();
            }}
            onClick={() => onSelect(cmd.type)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition ${
              isActive 
                ? 'bg-primary-light text-primary font-black shadow-sm' 
                : 'hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded bg-slate-50 transition shrink-0 ${isActive ? 'text-primary bg-white' : ''}`}>
              {cmd.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black truncate">{cmd.label}</div>
              <div className="text-[8px] font-normal text-slate-450 truncate mt-0.5">{cmd.desc}</div>
            </div>
          </button>
        );
      })}
    </div>,
    document.body
  );
};
