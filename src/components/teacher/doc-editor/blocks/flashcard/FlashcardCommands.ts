import type { FlashcardSettings } from './FlashcardTypes';

export type FlashcardCommand =
  | { type: 'add-card' }
  | { type: 'shuffle-cards' }
  | { type: 'update-settings'; settings: Partial<FlashcardSettings> };
