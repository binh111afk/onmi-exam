import type { MatchingContent, MatchingPair } from './MatchingTypes';

export const createNewMatchingContent = (): MatchingContent => {
  return {
    version: 1,
    pairs: [
      { id: crypto.randomUUID(), leftText: '', rightText: '' },
      { id: crypto.randomUUID(), leftText: '', rightText: '' },
      { id: crypto.randomUUID(), leftText: '', rightText: '' }
    ],
    settings: {
      themeColor: '#6366f1'
    }
  };
};

export const createDefaultPair = (id: string): MatchingPair => ({
  id,
  leftText: '',
  rightText: ''
});
