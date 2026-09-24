import type { SortOrderContent } from './Types';

export const createDefaultSortOrderContent = (): SortOrderContent => ({
  version: 1,
  items: [
    { id: 's1', type: 'text', content: 'Tế bào' },
    { id: 's2', type: 'text', content: 'Mô' },
    { id: 's3', type: 'text', content: 'Cơ quan' },
    { id: 's4', type: 'text', content: 'Hệ cơ quan' }
  ],
  settings: {
    shuffleInitialOrder: true,
    order: 'ascending',
    allowRetry: true,
    showExplanation: false,
    explanationText: 'Thứ tự cấp độ tổ chức sống từ thấp đến cao.',
    autoCheck: false,
    score: 1,
    themeColor: '#10B981'
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
