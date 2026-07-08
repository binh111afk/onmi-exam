import { useCallback, useMemo, useRef, useState } from 'react';
import type { MindmapClipboard, MindmapData, MindmapNode } from './MindmapTypes';
import {
  clampZoom,
  cloneClipboardSubtree,
  createClipboardFromSubtree,
  createMindmapNode,
  getDescendantIds,
  getMindmapBounds,
  getSubtreeIds,
  getVisibleNodeIds,
  MINDMAP_CANVAS_HEIGHT,
  MINDMAP_CANVAS_WIDTH,
  MINDMAP_COLORS,
} from './MindmapUtils';
import { useMindmapLayout } from './useMindmapLayout';

export function useMindmap(data: MindmapData, onChange: (data: MindmapData, isDebounced?: boolean) => void) {
  const [selectedNodeId, setSelectedNodeId] = useState(data.rootId);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [openNoteNodeId, setOpenNoteNodeId] = useState<string | null>(null);
  const clipboardRef = useRef<MindmapClipboard | null>(null);
  const { applyAutoLayout } = useMindmapLayout(data, onChange);

  const selectedNode = data.nodes[selectedNodeId] ?? data.nodes[data.rootId];
  const visibleNodeIds = useMemo(() => getVisibleNodeIds(data), [data]);
  const visibleNodes = useMemo(() => visibleNodeIds.map(id => data.nodes[id]).filter(Boolean), [data.nodes, visibleNodeIds]);

  const updateNode = useCallback((nodeId: string, patch: Partial<MindmapNode>, isDebounced = false) => {
    const node = data.nodes[nodeId];
    if (!node) return;

    onChange({
      ...data,
      nodes: {
        ...data.nodes,
        [nodeId]: {
          ...node,
          ...patch,
        },
      },
    }, isDebounced);
  }, [data, onChange]);

  const addChild = useCallback((parentId = selectedNodeId) => {
    const parent = data.nodes[parentId];
    if (!parent) return;

    const child = createMindmapNode(parentId, 'Nhánh mới', {
      x: parent.position.x + 250,
      y: parent.position.y + (parent.children.length - Math.max(0, parent.children.length - 1) / 2) * 86,
    }, parent.color || MINDMAP_COLORS[0].value);

    onChange({
      ...data,
      nodes: {
        ...data.nodes,
        [parentId]: {
          ...parent,
          collapsed: false,
          children: [...parent.children, child.id],
        },
        [child.id]: child,
      },
    });
    setSelectedNodeId(child.id);
    setEditingNodeId(child.id);
  }, [data, onChange, selectedNodeId]);

  const addSibling = useCallback(() => {
    const node = data.nodes[selectedNodeId];
    if (!node || !node.parentId) {
      addChild(selectedNodeId);
      return;
    }

    const parent = data.nodes[node.parentId];
    if (!parent) return;

    const sibling = createMindmapNode(parent.id, 'Nhánh mới', {
      x: node.position.x,
      y: node.position.y + 92,
    }, node.color);

    onChange({
      ...data,
      nodes: {
        ...data.nodes,
        [parent.id]: {
          ...parent,
          children: [...parent.children, sibling.id],
        },
        [sibling.id]: sibling,
      },
    });
    setSelectedNodeId(sibling.id);
    setEditingNodeId(sibling.id);
  }, [addChild, data, onChange, selectedNodeId]);

  const deleteNode = useCallback((nodeId = selectedNodeId) => {
    const node = data.nodes[nodeId];
    if (!node || node.id === data.rootId || !node.parentId) return;

    const removingIds = new Set(getSubtreeIds(data.nodes, nodeId));
    const nextNodes = Object.fromEntries(
      Object.entries(data.nodes)
        .filter(([id]) => !removingIds.has(id))
        .map(([id, current]) => [
          id,
          current.id === node.parentId
            ? { ...current, children: current.children.filter(childId => childId !== nodeId) }
            : current,
        ])
    );

    onChange({
      ...data,
      nodes: nextNodes,
    });
    setSelectedNodeId(node.parentId);
    setEditingNodeId(null);
    setOpenNoteNodeId(null);
  }, [data, onChange, selectedNodeId]);

  const duplicateSubtree = useCallback((nodeId = selectedNodeId) => {
    const node = data.nodes[nodeId];
    if (!node) return;

    const parentId = node.parentId ?? data.rootId;
    const parent = data.nodes[parentId];
    if (!parent) return;

    const clipboard = createClipboardFromSubtree(data.nodes, nodeId);
    const cloned = cloneClipboardSubtree(clipboard, parentId, {
      x: node.position.x + 54,
      y: node.position.y + 92,
    });

    onChange({
      ...data,
      nodes: {
        ...data.nodes,
        [parentId]: {
          ...parent,
          children: [...parent.children, cloned.rootId],
        },
        ...cloned.nodes,
      },
    });
    setSelectedNodeId(cloned.rootId);
  }, [data, onChange, selectedNodeId]);

  const copySubtree = useCallback((nodeId = selectedNodeId) => {
    if (!data.nodes[nodeId]) return;
    clipboardRef.current = createClipboardFromSubtree(data.nodes, nodeId);
  }, [data.nodes, selectedNodeId]);

  const pasteSubtree = useCallback((parentId = selectedNodeId) => {
    const clipboard = clipboardRef.current;
    const parent = data.nodes[parentId];
    if (!clipboard || !parent) return;

    const cloned = cloneClipboardSubtree(clipboard, parentId, {
      x: parent.position.x + 250,
      y: parent.position.y + 92,
    });

    onChange({
      ...data,
      nodes: {
        ...data.nodes,
        [parentId]: {
          ...parent,
          collapsed: false,
          children: [...parent.children, cloned.rootId],
        },
        ...cloned.nodes,
      },
    });
    setSelectedNodeId(cloned.rootId);
  }, [data, onChange, selectedNodeId]);

  const selectParent = useCallback(() => {
    const parentId = data.nodes[selectedNodeId]?.parentId;
    if (parentId) setSelectedNodeId(parentId);
  }, [data.nodes, selectedNodeId]);

  const selectByDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const current = data.nodes[selectedNodeId];
    if (!current) return;

    let candidates = visibleNodes.filter(node => node.id !== selectedNodeId);
    if (direction === 'up') candidates = candidates.filter(node => node.position.y < current.position.y - 8);
    if (direction === 'down') candidates = candidates.filter(node => node.position.y > current.position.y + 8);
    if (direction === 'left') candidates = candidates.filter(node => node.position.x < current.position.x - 8);
    if (direction === 'right') candidates = candidates.filter(node => node.position.x > current.position.x + 8);

    const nearest = candidates
      .map(node => ({
        node,
        distance: Math.hypot(node.position.x - current.position.x, node.position.y - current.position.y),
      }))
      .sort((a, b) => a.distance - b.distance)[0]?.node;

    if (nearest) setSelectedNodeId(nearest.id);
  }, [data.nodes, selectedNodeId, visibleNodes]);

  const centerView = useCallback(() => {
    const bounds = getMindmapBounds(data);
    onChange({
      ...data,
      offsetX: MINDMAP_CANVAS_WIDTH / 2 - (bounds.minX + bounds.width / 2) * (data.zoom / 100),
      offsetY: MINDMAP_CANVAS_HEIGHT / 2 - (bounds.minY + bounds.height / 2) * (data.zoom / 100),
    });
  }, [data, onChange]);

  const setZoom = useCallback((nextZoom: number, anchor?: { x: number; y: number }) => {
    const zoom = clampZoom(nextZoom);
    const oldScale = data.zoom / 100;
    const newScale = zoom / 100;
    const point = anchor ?? { x: MINDMAP_CANVAS_WIDTH / 2, y: MINDMAP_CANVAS_HEIGHT / 2 };
    const worldX = (point.x - data.offsetX) / oldScale;
    const worldY = (point.y - data.offsetY) / oldScale;

    onChange({
      ...data,
      zoom,
      offsetX: point.x - worldX * newScale,
      offsetY: point.y - worldY * newScale,
    }, true);
  }, [data, onChange]);

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    onChange({
      ...data,
      offsetX: data.offsetX + deltaX,
      offsetY: data.offsetY + deltaY,
    }, true);
  }, [data, onChange]);

  const setViewport = useCallback((offsetX: number, offsetY: number) => {
    onChange({
      ...data,
      offsetX,
      offsetY,
    }, true);
  }, [data, onChange]);

  const moveNodeSubtree = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    const movingIds = new Set([nodeId, ...getDescendantIds(data.nodes, nodeId)]);
    onChange({
      ...data,
      nodes: Object.fromEntries(
        Object.entries(data.nodes).map(([id, node]) => [
          id,
          movingIds.has(id)
            ? {
                ...node,
                position: {
                  x: node.position.x + deltaX,
                  y: node.position.y + deltaY,
                },
              }
            : node,
        ])
      ),
    }, true);
  }, [data, onChange]);

  return {
    selectedNode,
    selectedNodeId,
    editingNodeId,
    openNoteNodeId,
    visibleNodeIds,
    setSelectedNodeId,
    setEditingNodeId,
    setOpenNoteNodeId,
    updateNode,
    addChild,
    addSibling,
    deleteNode,
    duplicateSubtree,
    copySubtree,
    pasteSubtree,
    selectParent,
    selectByDirection,
    centerView,
    setZoom,
    panBy,
    setViewport,
    moveNodeSubtree,
    applyAutoLayout,
  };
}
