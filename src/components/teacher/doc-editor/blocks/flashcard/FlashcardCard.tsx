import React from 'react';
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import type { FlashcardCard as FlashcardCardType } from './FlashcardTypes';
import { useCard } from './hooks/useCard';

interface FlashcardCardProps {
  card: FlashcardCardType;
  index: number;
  onUpdateCard: (updated: FlashcardCardType) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const FlashcardCardComponent: React.FC<FlashcardCardProps> = ({
  card,
  index,
  onUpdateCard,
  onDelete,
  onDuplicate,
  onMove,
  canMoveUp,
  canMoveDown,
}) => {
  const { updateFront, updateBack } = useCard(card, onUpdateCard);

  const stopEditorKeyHandling = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
  };

  const stopEditorPointerHandling = (event: React.PointerEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-3 relative group/card hover:border-indigo-200 transition-colors w-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg select-none">
          Thẻ {index + 1}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onMove('up')}
            disabled={!canMoveUp}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Di chuyển lên"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onMove('down')}
            disabled={!canMoveDown}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Di chuyển xuống"
          >
            <ArrowDown size={12} />
          </button>
          <div className="w-px h-3 bg-slate-200 mx-1" />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onDuplicate}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition cursor-pointer"
            title="Nhân bản"
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onDelete}
            className="p-1 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
            title="Xóa thẻ"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider select-none">Mặt trước</span>
          <textarea
            rows={2}
            value={card.front}
            onPointerDown={stopEditorPointerHandling}
            onKeyDown={stopEditorKeyHandling}
            onChange={(event) => updateFront(event.target.value)}
            placeholder="Nhập mặt trước..."
            className="w-full bg-slate-50/60 border border-slate-100 rounded-xl px-3 py-2 outline-none font-bold text-xs text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary resize-y min-h-[52px] placeholder-slate-400"
          />
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider select-none">Mặt sau</span>
          <textarea
            rows={2}
            value={card.back}
            onPointerDown={stopEditorPointerHandling}
            onKeyDown={stopEditorKeyHandling}
            onChange={(event) => updateBack(event.target.value)}
            placeholder="Nhập mặt sau..."
            className="w-full bg-slate-50/60 border border-slate-100 rounded-xl px-3 py-2 outline-none font-bold text-xs text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary resize-y min-h-[52px] placeholder-slate-400"
          />
        </div>
      </div>
    </div>
  );
};

export const FlashcardCard = React.memo(FlashcardCardComponent);
