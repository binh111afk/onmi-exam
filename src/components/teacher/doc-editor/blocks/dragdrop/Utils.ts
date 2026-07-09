import type { DragDropContent } from './Types';

export const createDefaultDragDropContent = (): DragDropContent => ({
  version: 1,
  cards: [
    { id: 'c1', type: 'text', content: 'Nước' },
    { id: 'c2', type: 'text', content: 'Carbon' },
  ],
  zones: [
    { id: 'z1', type: 'text', content: 'Dung môi hòa tan', correctCardIds: ['c1'] },
    { id: 'z2', type: 'text', content: 'Nguyên tố cốt lõi của sự sống', correctCardIds: ['c2'] },
  ],
  settings: {
    shuffleCards: true,
    shuffleZones: true,
    allowRetry: true,
    snapAnimation: true,
    showCorrectAnswer: true,
    autoCheck: false,
    multipleCorrect: true,
    randomOrder: false,
    themeColor: '#3B82F6'
  }
});

export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
