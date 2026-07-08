import React from 'react';
import { Award } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { FlashcardEditor } from './FlashcardEditor';
import { useFlashcard } from './hooks/useFlashcard';
import { createNewFlashcardContent } from './FlashcardUtils';

interface FlashcardBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const FlashcardBlockComponent: React.FC<FlashcardBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    cards,
    settings,
    addCard,
    deleteCard,
    duplicateCard,
    moveCard,
    shuffleCards,
    updateCard,
    updateSettings,
  } = useFlashcard(block, idx, onUpdateBlock);

  React.useEffect(() => {
    if (!block.flashcardContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        flashcardContent: createNewFlashcardContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <div className="flex items-center justify-between text-indigo-600 font-extrabold text-[8px] uppercase tracking-wide select-none">
        <span className="flex items-center gap-1">
          <Award size={10} className="stroke-[2.5]" /> Bộ thẻ ghi nhớ
        </span>
      </div>

      <FlashcardEditor
        cards={cards}
        settings={settings}
        isBlockActive={isActive}
        onAddCard={addCard}
        onShuffleCards={shuffleCards}
        onUpdateSettings={updateSettings}
        onDeleteCard={deleteCard}
        onDuplicateCard={duplicateCard}
        onMoveCard={moveCard}
        onUpdateCard={updateCard}
      />
    </div>
  );
};

export const FlashcardBlock = React.memo(FlashcardBlockComponent);
