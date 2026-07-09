import type { FillBlankContent } from './Types';

export const createDefaultFillBlankContent = (): FillBlankContent => ({
  version: 1,
  paragraphs: [
    {
      id: 'default-p1',
      text: 'HTML là ngôn ngữ dùng để tạo <span class="fillblank-inline inline-block mx-1 px-2.5 py-0.5 border border-purple-300 bg-purple-50 text-purple-700 font-bold rounded-lg cursor-pointer" data-blank-id="default-b1" contenteditable="false" placeholder="Nhập đáp án..." aria-label="Ô trống">Cấu trúc trang web</span>.'
    }
  ],
  blanks: {
    'default-b1': {
      id: 'default-b1',
      answer: 'Cấu trúc trang web',
      caseSensitive: false,
      hint: 'Cấu trúc...',
      score: 1,
      alternativeAnswers: ['cấu trúc web'],
      width: 140,
      placeholder: 'Nhập câu trả lời...'
    }
  },
  settings: {
    shuffleBlanks: false,
    caseSensitive: false,
    showHints: true,
    showAnswerAfterSubmit: true,
    partialScoring: true,
    acceptMultipleAnswers: true,
    blankStyle: 'underline',
    maxAttempts: 3,
    themeColor: '#8B5CF6'
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
