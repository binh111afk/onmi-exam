import { useCallback } from 'react';
import type { MindmapData, MindmapLayout, MindmapNode } from './MindmapTypes';
import { getMindmapBounds, getNodeMetrics, MINDMAP_CANVAS_HEIGHT, MINDMAP_CANVAS_WIDTH } from './MindmapUtils';

const LEVEL_GAP_X = 250;
const LEVEL_GAP_Y = 118;
const SIBLING_GAP_X = 190;
const SIBLING_GAP_Y = 86;

export function useMindmapLayout(data: MindmapData, onChange: (data: MindmapData, isDebounced?: boolean) => void) {
  const applyAutoLayout = useCallback((layout: MindmapLayout) => {
    if (layout !== 'horizontal' && layout !== 'vertical') return;

    const nextNodes: Record<string, MindmapNode> = Object.fromEntries(
      Object.entries(data.nodes).map(([id, node]) => [id, { ...node, position: { ...node.position } }])
    );

    const measureSubtree = (nodeId: string): number => {
      const node = nextNodes[nodeId];
      if (!node || node.children.length === 0 || node.collapsed) {
        const metrics = getNodeMetrics(node, nodeId === data.rootId);
        return layout === 'horizontal' ? metrics.height + SIBLING_GAP_Y : metrics.width + SIBLING_GAP_X;
      }

      return Math.max(
        layout === 'horizontal' ? getNodeMetrics(node, nodeId === data.rootId).height + SIBLING_GAP_Y : getNodeMetrics(node, nodeId === data.rootId).width + SIBLING_GAP_X,
        node.children.reduce((sum, childId) => sum + measureSubtree(childId), 0)
      );
    };

    const place = (nodeId: string, x: number, y: number) => {
      const node = nextNodes[nodeId];
      if (!node) return;

      nextNodes[nodeId] = {
        ...node,
        position: { x, y },
      };

      if (node.collapsed || node.children.length === 0) return;

      const childSizes = node.children.map(measureSubtree);
      const total = childSizes.reduce((sum, size) => sum + size, 0);
      let cursor = (layout === 'horizontal' ? y : x) - total / 2;

      node.children.forEach((childId, childPosition) => {
        const childSize = childSizes[childPosition];
        const childCenter = cursor + childSize / 2;
        cursor += childSize;

        if (layout === 'horizontal') {
          place(childId, x + LEVEL_GAP_X, childCenter);
        } else {
          place(childId, childCenter, y + LEVEL_GAP_Y);
        }
      });
    };

    place(data.rootId, 0, 0);
    const nextData = {
      ...data,
      nodes: nextNodes,
    };
    const bounds = getMindmapBounds(nextData);

    onChange({
      ...nextData,
      offsetX: MINDMAP_CANVAS_WIDTH / 2 - (bounds.minX + bounds.width / 2) * (data.zoom / 100),
      offsetY: MINDMAP_CANVAS_HEIGHT / 2 - (bounds.minY + bounds.height / 2) * (data.zoom / 100),
    });
  }, [data, onChange]);

  return { applyAutoLayout };
}
