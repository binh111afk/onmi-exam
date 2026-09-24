import React from 'react';
import { createPortal } from 'react-dom';

interface BlockDragPreviewProps {
  text: string;
  type: string;
  coords: { x: number; y: number };
  visible: boolean;
}

export const BlockDragPreview: React.FC<BlockDragPreviewProps> = ({
  text,
  type,
  coords,
  visible,
}) => {
  if (!visible) return null;

  const rawText = text.replace(/<[^>]*>/g, '').trim();
  const displayText = rawText || `Trống (${type})`;

  return createPortal(
    <div 
      className="fixed z-[10000] pointer-events-none bg-slate-900/90 text-white rounded-lg shadow-xl px-3 py-2 text-[9px] font-bold max-w-xs truncate border border-slate-700/50 flex items-center gap-2 backdrop-blur-sm"
      style={{
        left: `${coords.x + 12}px`,
        top: `${coords.y + 12}px`,
      }}
    >
      <span className="w-1.5 h-1.5 bg-primary-light rounded-full shrink-0" />
      <span className="truncate">{displayText}</span>
    </div>,
    document.body
  );
};
