import type { CompareContent, CompareColumn } from './CompareTypes';

export const createNewCompareContent = (): CompareContent => {
  return {
    version: 1,
    columns: [
      { id: crypto.randomUUID(), title: '', content: '' },
      { id: crypto.randomUUID(), title: '', content: '' }
    ],
    settings: {
      themeColor: '#6366f1'
    }
  };
};

export const createDefaultColumn = (id: string): CompareColumn => ({
  id,
  title: '',
  content: ''
});
