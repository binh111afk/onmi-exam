import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { MatchingPair, MatchingContent, MatchingSettings } from '../MatchingTypes';
import { createDefaultPair, createNewMatchingContent } from '../MatchingUtils';

export function useMatching(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const matchingContent: MatchingContent = block.matchingContent || createNewMatchingContent();
  const pairs = matchingContent.pairs;

  const updateMatchingContent = useCallback((nextContent: MatchingContent) => {
    onUpdateBlock(idx, {
      ...block,
      matchingContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updatePairs = useCallback((nextPairs: MatchingPair[]) => {
    updateMatchingContent({
      ...matchingContent,
      pairs: nextPairs,
    });
  }, [matchingContent, updateMatchingContent]);

  const updateSettings = useCallback((nextSettings: Partial<MatchingSettings>) => {
    updateMatchingContent({
      ...matchingContent,
      settings: {
        ...matchingContent.settings,
        ...nextSettings,
      },
    });
  }, [matchingContent, updateMatchingContent]);

  const addPair = useCallback(() => {
    updatePairs([...pairs, createDefaultPair(crypto.randomUUID())]);
  }, [pairs, updatePairs]);

  const deletePair = useCallback((pairId: string) => {
    updatePairs(pairs.filter(p => p.id !== pairId));
  }, [pairs, updatePairs]);

  const updatePair = useCallback((pairId: string, updated: MatchingPair) => {
    updatePairs(pairs.map(p => p.id === pairId ? updated : p));
  }, [pairs, updatePairs]);

  const shufflePairs = useCallback(() => {
    // Fisher-Yates shuffle
    const next = [...pairs];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    updatePairs(next);
  }, [pairs, updatePairs]);

  return {
    pairs,
    settings: matchingContent.settings,
    addPair,
    deletePair,
    updatePair,
    shufflePairs,
    updateSettings,
  };
}
