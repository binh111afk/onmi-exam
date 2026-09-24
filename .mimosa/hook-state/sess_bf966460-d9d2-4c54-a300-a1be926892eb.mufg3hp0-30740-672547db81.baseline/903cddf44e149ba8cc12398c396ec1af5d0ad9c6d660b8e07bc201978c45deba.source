import type { FlashcardCard, FlashcardContent } from './FlashcardTypes';
import { getDeterministicShuffledItems, shuffleItems } from '../interactiveBlockUtils';

export const createFlashcardId = (): string => crypto.randomUUID();

export const createNewFlashcardCard = (
  front = '',
  back = ''
): FlashcardCard => ({
  id: createFlashcardId(),
  front,
  back,
});

export const createNewFlashcardContent = (): FlashcardContent => ({
  version: 1,
  settings: {
    shuffleCards: false,
    flipAnimation: true,
    autoPlay: false,
    showProgress: true,
    cardOrder: 'manual',
  },
  cards: [],
});

export const shuffleFlashcardCards = (cards: FlashcardCard[]): FlashcardCard[] => {
  return shuffleItems(cards);
};

export const getPreviewCards = (content: FlashcardContent, seed: string): FlashcardCard[] => {
  const cards = content.cards || [];
  if (!content.settings.shuffleCards || cards.length < 2) return cards;

  return getDeterministicShuffledItems(cards, seed);
};
