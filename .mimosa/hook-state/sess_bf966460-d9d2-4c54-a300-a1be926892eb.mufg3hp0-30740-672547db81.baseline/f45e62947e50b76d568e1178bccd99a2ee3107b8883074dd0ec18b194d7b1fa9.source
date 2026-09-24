import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { FillBlankContent, BlankItem, FillBlankSettings, FillBlankParagraph } from '../Types';
import { createDefaultFillBlankContent } from '../Utils';

export function useFillBlank(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const content: FillBlankContent = block.fillblankContent || createDefaultFillBlankContent();

  const updateContent = useCallback((nextContent: FillBlankContent) => {
    onUpdateBlock(idx, {
      ...block,
      fillblankContent: nextContent
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateParagraphs = useCallback((paragraphs: FillBlankParagraph[]) => {
    updateContent({
      ...content,
      paragraphs
    });
  }, [content, updateContent]);

  const updateBlanks = useCallback((blanks: Record<string, BlankItem>) => {
    updateContent({
      ...content,
      blanks
    });
  }, [content, updateContent]);

  const updateSettings = useCallback((nextSettings: Partial<FillBlankSettings>) => {
    updateContent({
      ...content,
      settings: {
        ...content.settings,
        ...nextSettings
      }
    });
  }, [content, updateContent]);

  const addParagraph = useCallback(() => {
    const newParagraph: FillBlankParagraph = {
      id: `p-${crypto.randomUUID().slice(0, 8)}`,
      text: ''
    };
    updateParagraphs([...content.paragraphs, newParagraph]);
  }, [content.paragraphs, updateParagraphs]);

  const removeParagraph = useCallback((pId: string) => {
    updateParagraphs(content.paragraphs.filter(p => p.id !== pId));
  }, [content.paragraphs, updateParagraphs]);

  const updateParagraph = useCallback((pId: string, text: string) => {
    const next = content.paragraphs.map(p =>
      p.id === pId ? { ...p, text } : p
    );
    updateParagraphs(next);
  }, [content.paragraphs, updateParagraphs]);

  const registerBlank = useCallback((blank: BlankItem) => {
    updateContent({
      ...content,
      blanks: {
        ...content.blanks,
        [blank.id]: blank
      }
    });
  }, [content, updateContent]);

  const updateBlank = useCallback((blankId: string, updatedBlank: Partial<BlankItem>) => {
    if (!content.blanks[blankId]) return;
    updateContent({
      ...content,
      blanks: {
        ...content.blanks,
        [blankId]: {
          ...content.blanks[blankId],
          ...updatedBlank
        }
      }
    });
  }, [content, updateContent]);

  const removeBlank = useCallback((blankId: string) => {
    const nextBlanks = { ...content.blanks };
    delete nextBlanks[blankId];
    updateContent({
      ...content,
      blanks: nextBlanks
    });
  }, [content, updateContent]);

  return {
    content,
    paragraphs: content.paragraphs,
    blanks: content.blanks,
    settings: content.settings,
    addParagraph,
    removeParagraph,
    updateParagraph,
    registerBlank,
    updateBlank,
    removeBlank,
    updateBlanks,
    updateSettings,
  };
}
