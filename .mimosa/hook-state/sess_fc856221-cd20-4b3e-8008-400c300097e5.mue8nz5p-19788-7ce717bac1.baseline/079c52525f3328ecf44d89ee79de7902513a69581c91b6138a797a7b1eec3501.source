import type { MindmapBounds, MindmapClipboard, MindmapData, MindmapNode, MindmapNodeMetrics } from './MindmapTypes';

export const MINDMAP_ZOOM_MIN = 20;
export const MINDMAP_ZOOM_MAX = 300;
export const MINDMAP_CANVAS_HEIGHT = 520;
export const MINDMAP_CANVAS_WIDTH = 960;
export const MINDMAP_DEFAULT_ROOT_TITLE = 'Nhập chủ đề...';

export const MINDMAP_COLORS = [
  { id: 'purple', label: 'Tím', value: '#6C5DD3', className: 'bg-primary' },
  { id: 'blue', label: 'Xanh dương', value: '#3B82F6', className: 'bg-blue-500' },
  { id: 'green', label: 'Xanh lá', value: '#10B981', className: 'bg-success' },
  { id: 'orange', label: 'Cam', value: '#F97316', className: 'bg-orange-500' },
  { id: 'pink', label: 'Hồng', value: '#FF758F', className: 'bg-accent' },
] as const;

export const hexToRgba = (hex: string, opacity: number): string => {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const createMindmapId = (): string => crypto.randomUUID();

export const createMindmapNode = (
  parentId: string | null,
  title = '',
  position = { x: 0, y: 0 },
  color: string = MINDMAP_COLORS[0].value
): MindmapNode => ({
  id: createMindmapId(),
  parentId,
  title,
  color,
  collapsed: false,
  children: [],
  position,
});

export const createDefaultMindmapData = (): MindmapData => {
  const root = createMindmapNode(null, '', { x: 0, y: 0 });

  return {
    rootId: root.id,
    nodes: {
      [root.id]: {
        ...root,
        color: MINDMAP_COLORS[0].value,
      },
    },
    zoom: 100,
    offsetX: 420,
    offsetY: 240,
  };
};

export const clampZoom = (zoom: number): number => Math.min(MINDMAP_ZOOM_MAX, Math.max(MINDMAP_ZOOM_MIN, Math.round(zoom)));

export const getNodeMetrics = (node: MindmapNode, isRoot: boolean): MindmapNodeMetrics => {
  const plainTitle = node.title.trim() || (isRoot ? 'Nhập chủ đề...' : 'Nhập nhánh...');
  const longestLine = plainTitle.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
  const lineCount = Math.max(1, plainTitle.split('\n').length);
  const iconSpace = node.icon ? 24 : 0;
  const width = Math.min(isRoot ? 240 : 220, Math.max(isRoot ? 136 : 112, longestLine * 7.2 + iconSpace + 42));
  const height = Math.max(isRoot ? 52 : 42, lineCount * 18 + (isRoot ? 26 : 22));

  return { width, height };
};

export const getDescendantIds = (nodes: Record<string, MindmapNode>, nodeId: string): string[] => {
  const node = nodes[nodeId];
  if (!node) return [];

  return node.children.flatMap(childId => [childId, ...getDescendantIds(nodes, childId)]);
};

export const getSubtreeIds = (nodes: Record<string, MindmapNode>, nodeId: string): string[] => [
  nodeId,
  ...getDescendantIds(nodes, nodeId),
];

export const getVisibleNodeIds = (data: MindmapData): string[] => {
  const visible: string[] = [];

  const visit = (nodeId: string) => {
    const node = data.nodes[nodeId];
    if (!node) return;

    visible.push(nodeId);
    if (node.collapsed) return;
    node.children.forEach(visit);
  };

  visit(data.rootId);
  return visible;
};

export const getMindmapBounds = (data: MindmapData, visibleOnly = true): MindmapBounds => {
  const ids = visibleOnly ? getVisibleNodeIds(data) : Object.keys(data.nodes);
  if (ids.length === 0) {
    return { minX: -160, minY: -120, maxX: 160, maxY: 120, width: 320, height: 240 };
  }

  const bounds = ids.reduce(
    (acc, nodeId) => {
      const node = data.nodes[nodeId];
      const metrics = getNodeMetrics(node, node.id === data.rootId);
      return {
        minX: Math.min(acc.minX, node.position.x - metrics.width / 2),
        minY: Math.min(acc.minY, node.position.y - metrics.height / 2),
        maxX: Math.max(acc.maxX, node.position.x + metrics.width / 2),
        maxY: Math.max(acc.maxY, node.position.y + metrics.height / 2),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const padding = 120;
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  const maxX = bounds.maxX + padding;
  const maxY = bounds.maxY + padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const getConnectorPath = (parent: MindmapNode, child: MindmapNode, rootId: string): string => {
  const parentMetrics = getNodeMetrics(parent, parent.id === rootId);
  const childMetrics = getNodeMetrics(child, child.id === rootId);
  const isMostlyHorizontal = Math.abs(child.position.x - parent.position.x) >= Math.abs(child.position.y - parent.position.y);
  const startX = isMostlyHorizontal
    ? parent.position.x + (child.position.x >= parent.position.x ? parentMetrics.width / 2 : -parentMetrics.width / 2)
    : parent.position.x;
  const startY = isMostlyHorizontal
    ? parent.position.y
    : parent.position.y + (child.position.y >= parent.position.y ? parentMetrics.height / 2 : -parentMetrics.height / 2);
  const endX = isMostlyHorizontal
    ? child.position.x + (child.position.x >= parent.position.x ? -childMetrics.width / 2 : childMetrics.width / 2)
    : child.position.x;
  const endY = isMostlyHorizontal
    ? child.position.y
    : child.position.y + (child.position.y >= parent.position.y ? -childMetrics.height / 2 : childMetrics.height / 2);
  const curve = Math.max(60, Math.abs(endX - startX) * 0.45 + Math.abs(endY - startY) * 0.15);

  if (isMostlyHorizontal) {
    const direction = endX >= startX ? 1 : -1;
    return `M ${startX} ${startY} C ${startX + curve * direction} ${startY}, ${endX - curve * direction} ${endY}, ${endX} ${endY}`;
  }

  const direction = endY >= startY ? 1 : -1;
  return `M ${startX} ${startY} C ${startX} ${startY + curve * direction}, ${endX} ${endY - curve * direction}, ${endX} ${endY}`;
};

export const moveSubtree = (
  nodes: Record<string, MindmapNode>,
  nodeId: string,
  deltaX: number,
  deltaY: number
): Record<string, MindmapNode> => {
  const movingIds = new Set(getSubtreeIds(nodes, nodeId));

  return Object.fromEntries(
    Object.entries(nodes).map(([id, node]) => [
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
  );
};

export const createClipboardFromSubtree = (nodes: Record<string, MindmapNode>, rootId: string): MindmapClipboard => {
  const subtreeIds = getSubtreeIds(nodes, rootId);
  const subtreeNodes = Object.fromEntries(subtreeIds.map(id => [id, nodes[id]]));
  return {
    rootId,
    nodes: subtreeNodes,
  };
};

export const cloneClipboardSubtree = (
  clipboard: MindmapClipboard,
  parentId: string,
  anchorPosition: { x: number; y: number }
): { rootId: string; nodes: Record<string, MindmapNode> } => {
  const oldIds = Object.keys(clipboard.nodes);
  const idMap = new Map(oldIds.map(id => [id, createMindmapId()]));
  const sourceRoot = clipboard.nodes[clipboard.rootId];
  const rootOffset = {
    x: anchorPosition.x - sourceRoot.position.x,
    y: anchorPosition.y - sourceRoot.position.y,
  };

  const clonedNodes = Object.fromEntries(
    oldIds.map(oldId => {
      const source = clipboard.nodes[oldId];
      const nextId = idMap.get(oldId) ?? createMindmapId();
      const nextParent = source.parentId && clipboard.nodes[source.parentId]
        ? idMap.get(source.parentId) ?? parentId
        : parentId;

      return [
        nextId,
        {
          ...source,
          id: nextId,
          parentId: oldId === clipboard.rootId ? parentId : nextParent,
          children: source.children.map(childId => idMap.get(childId)).filter((id): id is string => Boolean(id)),
          position: {
            x: source.position.x + rootOffset.x,
            y: source.position.y + rootOffset.y,
          },
        },
      ];
    })
  );

  return {
    rootId: idMap.get(clipboard.rootId) ?? createMindmapId(),
    nodes: clonedNodes,
  };
};

export const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const renderMarkdownToHtml = (markdown: string): string => {
  const escaped = escapeHtml(markdown.trim());
  return escaped
    .replace(/^### (.*)$/gm, '<h4 class="text-[11px] font-black text-slate-800">$1</h4>')
    .replace(/^## (.*)$/gm, '<h3 class="text-xs font-black text-slate-800">$1</h3>')
    .replace(/^# (.*)$/gm, '<h2 class="text-sm font-black text-slate-900">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">$1</code>')
    .replace(/\n/g, '<br />');
};
