import React from 'react';
import type { FlashcardCard as FlashcardCardType, FlashcardSettings } from './FlashcardTypes';
import { FlashcardCard } from './FlashcardCard';
import { FlashcardToolbar } from './FlashcardToolbar';

interface FlashcardEditorProps {
  cards: FlashcardCardType[];
  settings: FlashcardSettings;
  isBlockActive: boolean;
  onAddCard: () => void;
  onShuffleCards: () => void;
  onUpdateSettings: (settings: Partial<FlashcardSettings>) => void;
  onDeleteCard: (id: string) => void;
  onDuplicateCard: (id: string) => void;
  onMoveCard: (id: string, direction: 'up' | 'down') => void;
  onUpdateCard: (id: string, updated: FlashcardCardType) => void;
}

export const FlashcardEditorComponent: React.FC<FlashcardEditorProps> = ({
  cards,
  settings,
  isBlockActive,
  onAddCard,
  onShuffleCards,
  onUpdateSettings,
  onDeleteCard,
  onDuplicateCard,
  onMoveCard,
  onUpdateCard,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <FlashcardToolbar
        isBlockActive={isBlockActive}
        settings={settings}
        onAddCard={onAddCard}
        onShuffleCards={onShuffleCards}
        onUpdateSettings={onUpdateSettings}
      />

      <div className="flex flex-col gap-3.5 mt-1 w-full">
        {cards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-indigo-100 bg-white/70 px-4 py-5 text-center text-[10px] font-bold text-slate-400 select-none">
            Chưa có thẻ. Nhấn 'Thêm thẻ' để bắt đầu.
          </div>
        ) : (
          cards.map((card, index) => (
            <FlashcardCard
              key={card.id}
              card={card}
              index={index}
              onUpdateCard={(updated) => onUpdateCard(card.id, updated)}
              onDelete={() => onDeleteCard(card.id)}
              onDuplicate={() => onDuplicateCard(card.id)}
              onMove={(direction) => onMoveCard(card.id, direction)}
              canMoveUp={index > 0}
              canMoveDown={index < cards.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const FlashcardEditor = React.memo(FlashcardEditorComponent);
