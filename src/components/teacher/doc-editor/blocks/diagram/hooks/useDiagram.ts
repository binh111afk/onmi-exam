import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { DiagramNode, DiagramContent, DiagramSettings } from '../DiagramTypes';
import { createDefaultNode, createNewDiagramContent } from '../DiagramUtils';

export function useDiagram(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const diagramContent: DiagramContent = block.diagramContent || createNewDiagramContent();
  const nodes = diagramContent.nodes;

  const updateDiagramContent = useCallback((nextContent: DiagramContent) => {
    onUpdateBlock(idx, {
      ...block,
      diagramContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateNodes = useCallback((nextNodes: DiagramNode[]) => {
    updateDiagramContent({
      ...diagramContent,
      nodes: nextNodes,
    });
  }, [diagramContent, updateDiagramContent]);

  const updateSettings = useCallback((nextSettings: Partial<DiagramSettings>) => {
    updateDiagramContent({
      ...diagramContent,
      settings: {
        ...diagramContent.settings,
        ...nextSettings,
      },
    });
  }, [diagramContent, updateDiagramContent]);

  const addNode = useCallback(() => {
    updateNodes([...nodes, createDefaultNode(crypto.randomUUID())]);
  }, [nodes, updateNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    updateNodes(nodes.filter(n => n.id !== nodeId));
  }, [nodes, updateNodes]);

  const updateNode = useCallback((nodeId: string, updated: DiagramNode) => {
    updateNodes(nodes.map(n => n.id === nodeId ? updated : n));
  }, [nodes, updateNodes]);

  const moveNode = useCallback((nodeId: string, direction: 'up' | 'down') => {
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;
    const targetIndex = direction === 'up' ? nodeIndex - 1 : nodeIndex + 1;
    if (targetIndex < 0 || targetIndex >= nodes.length) return;

    const next = [...nodes];
    [next[nodeIndex], next[targetIndex]] = [next[targetIndex], next[nodeIndex]];
    updateNodes(next);
  }, [nodes, updateNodes]);

  const duplicateNode = useCallback((nodeId: string) => {
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;

    const duplicated: DiagramNode = {
      ...nodes[nodeIndex],
      id: crypto.randomUUID(),
    };
    const next = [...nodes];
    next.splice(nodeIndex + 1, 0, duplicated);
    updateNodes(next);
  }, [nodes, updateNodes]);

  return {
    nodes,
    settings: diagramContent.settings,
    addNode,
    deleteNode,
    updateNode,
    moveNode,
    duplicateNode,
    updateSettings,
  };
}
