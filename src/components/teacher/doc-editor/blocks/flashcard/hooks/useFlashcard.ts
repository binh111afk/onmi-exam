import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { FlashcardCard, FlashcardContent, FlashcardSettings } from '../FlashcardTypes';
import { createNewFlashcardCard, shuffleFlashcardCards } from '../FlashcardUtils';

export function useFlashcard(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const flashcardContent: FlashcardContent = block.flashcardContent || {
    version: 1,
    settings: {
      shuffleCards: false,
      flipAnimation: true,
      autoPlay: false,
      showProgress: true,
      cardOrder: 'manual',
    },
    cards: [],
  };
  const cards = flashcardContent.cards;

  const updateFlashcardContent = useCallback((nextContent: FlashcardContent) => {
    onUpdateBlock(idx, {
      ...block,
      flashcardContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateCards = useCallback((nextCards: FlashcardCard[]) => {
    updateFlashcardContent({
      ...flashcardContent,
      cards: nextCards,
    });
  }, [flashcardContent, updateFlashcardContent]);

  const updateSettings = useCallback((nextSettings: Partial<FlashcardSettings>) => {
    updateFlashcardContent({
      ...flashcardContent,
      settings: {
        ...flashcardContent.settings,
        ...nextSettings,
      },
    });
  }, [flashcardContent, updateFlashcardContent]);

  const addCard = useCallback(() => {
    updateCards([...cards, createNewFlashcardCard('', '')]);
  }, [cards, updateCards]);

  const deleteCard = useCallback((cardId: string) => {
    updateCards(cards.filter(card => card.id !== cardId));
  }, [cards, updateCards]);

  const duplicateCard = useCallback((cardId: string) => {
    const cardIndex = cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;

    const duplicated: FlashcardCard = {
      ...cards[cardIndex],
      id: crypto.randomUUID(),
    };
    const next = [...cards];
    next.splice(cardIndex + 1, 0, duplicated);
    updateCards(next);
  }, [cards, updateCards]);

  const moveCard = useCallback((cardId: string, direction: 'up' | 'down') => {
    const cardIndex = cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    const targetIndex = direction === 'up' ? cardIndex - 1 : cardIndex + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const next = [...cards];
    [next[cardIndex], next[targetIndex]] = [next[targetIndex], next[cardIndex]];
    updateCards(next);
  }, [cards, updateCards]);

  const shuffleCards = useCallback(() => {
    if (cards.length < 2) return;
    updateCards(shuffleFlashcardCards(cards));
  }, [cards, updateCards]);

  const updateCard = useCallback((cardId: string, updated: FlashcardCard) => {
    updateCards(cards.map(card => card.id === cardId ? updated : card));
  }, [cards, updateCards]);

  return {
    cards,
    settings: flashcardContent.settings,
    addCard,
    deleteCard,
    duplicateCard,
    moveCard,
    shuffleCards,
    updateCard,
    updateFlashcardContent,
    updateSettings,
  };
}
