import { useCallback } from 'react';
import type { FlashcardCard } from '../FlashcardTypes';

export function useCard(
  card: FlashcardCard,
  onUpdateCard: (updated: FlashcardCard) => void
) {
  const updateFront = useCallback((front: string) => {
    onUpdateCard({ ...card, front });
  }, [card, onUpdateCard]);

  const updateBack = useCallback((back: string) => {
    onUpdateCard({ ...card, back });
  }, [card, onUpdateCard]);

  return {
    updateFront,
    updateBack,
  };
}
