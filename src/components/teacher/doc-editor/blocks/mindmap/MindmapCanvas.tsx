import React, { useCallback, useMemo } from 'react';
import { Plus, StickyNote } from 'lucide-react';
import type { MindmapData, MindmapMode } from './MindmapTypes';
import { MindmapMiniMap } from './MindmapMiniMap';
import { MindmapNode } from './MindmapNode';
import { MindmapToolbar } from './MindmapToolbar';
import { useMindmap } from './useMindmap';
import { useMindmapDrag } from './useMindmapDrag';
import { useMindmapKeyboard } from './useMindmapKeyboard';
import {
  getConnectorPath,
  MINDMAP_CANVAS_HEIGHT,
  MINDMAP_CANVAS_WIDTH,
  renderMarkdownToHtml,
} from './MindmapUtils';

interface MindmapCanvasProps {
  data: MindmapData;
  mode: MindmapMode;
  isActive?: boolean;
  onChange: (data: MindmapData, isDebounced?: boolean) => void;
}

export const MindmapCanvas: React.FC<MindmapCanvasProps> = ({
  data,
  mode,
  isActive = true,
  onChange,
}) => {
  const isReadOnly = mode === 'preview';
  const mindmap = useMindmap(data, onChange);
  const drag = useMindmapDrag(data, mindmap.moveNodeSubtree, mindmap.panBy);
  const selectedNode = mindmap.selectedNode;
  const openNoteNode = mindmap.openNoteNodeId ? data.nodes[mindmap.openNoteNodeId] : null;
  const scale = data.zoom / 100;

  const visibleSet = useMemo(() => new Set(mindmap.visibleNodeIds), [mindmap.visibleNodeIds]);
  const visibleConnections = useMemo(() => (
    mindmap.visibleNodeIds.flatMap(nodeId => {
      const parent = data.nodes[nodeId];
      if (!parent || parent.collapsed) return [];
      return parent.children
        .filter(childId => visibleSet.has(childId))
        .map(childId => ({ parent, child: data.nodes[childId] }))
        .filter(connection => Boolean(connection.child));
    })
  ), [data.nodes, mindmap.visibleNodeIds, visibleSet]);

  const toggleSelectedCollapse = useCallback(() => {
    if (!selectedNode || selectedNode.children.length === 0) return;
    mindmap.updateNode(selectedNode.id, { collapsed: !selectedNode.collapsed });
  }, [mindmap, selectedNode]);

  useMindmapKeyboard({
    enabled: isActive && !isReadOnly,
    isEditing: Boolean(mindmap.editingNodeId),
    onAddSibling: mindmap.addSibling,
    onAddChild: mindmap.addChild,
    onSelectParent: mindmap.selectParent,
    onDelete: mindmap.deleteNode,
    onRename: () => mindmap.setEditingNodeId(selectedNode.id),
    onDuplicate: mindmap.duplicateSubtree,
    onCopy: mindmap.copySubtree,
    onPaste: mindmap.pasteSubtree,
    onMoveSelection: mindmap.selectByDirection,
    onToggleCollapse: toggleSelectedCollapse,
    onExitEditing: () => mindmap.setEditingNodeId(null),
  });

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const sensitivity = event.ctrlKey ? 0.04 : 0.12;
    mindmap.setZoom(data.zoom - event.deltaY * sensitivity, anchor);
  }, [data.zoom, mindmap]);

  const isEmpty = data.nodes[data.rootId]?.children.length === 0;

  return (
    <div
      className={`relative h-[520px] w-full overflow-hidden rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 shadow-sm ${drag.isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
      onWheel={handleWheel}
    >
      <MindmapToolbar
        selectedNode={selectedNode}
        zoom={data.zoom}
        isReadOnly={isReadOnly}
        onAddChild={mindmap.addChild}
        onAddSibling={mindmap.addSibling}
        onColorChange={(color) => mindmap.updateNode(selectedNode.id, { color })}
        onIconChange={(icon) => mindmap.updateNode(selectedNode.id, { icon })}
        onOpenNote={() => mindmap.setOpenNoteNodeId(selectedNode.id)}
        onAutoLayout={mindmap.applyAutoLayout}
        onToggleCollapse={toggleSelectedCollapse}
        onZoomChange={(zoom) => mindmap.setZoom(zoom)}
        onCenterView={mindmap.centerView}
        onDeleteNode={mindmap.deleteNode}
      />

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${MINDMAP_CANVAS_WIDTH} ${MINDMAP_CANVAS_HEIGHT}`}
        className="h-full w-full touch-none select-none"
        onPointerMove={drag.handlePointerMove}
        onPointerUp={drag.endDrag}
        onPointerCancel={drag.endDrag}
        onDoubleClick={(event) => {
          if (event.target === event.currentTarget) mindmap.centerView();
        }}
      >
        <defs>
          <linearGradient id="mindmapRootGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B7CF6" />
            <stop offset="100%" stopColor="#6C5DD3" />
          </linearGradient>
          <radialGradient id="mindmapRootGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="mindmapRootShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#6C5DD3" floodOpacity="0.22" />
          </filter>
          <filter id="mindmapNodeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#64748B" floodOpacity="0.13" />
          </filter>
          <filter id="mindmapSelectedShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#6C5DD3" floodOpacity="0.2" />
          </filter>
        </defs>

        <rect
          width={MINDMAP_CANVAS_WIDTH}
          height={MINDMAP_CANVAS_HEIGHT}
          fill="transparent"
          onPointerDown={drag.startCanvasDrag}
          onDoubleClick={mindmap.centerView}
        />

        <g transform={`translate(${data.offsetX} ${data.offsetY}) scale(${scale})`}>
          <g className="transition-opacity duration-200">
            {visibleConnections.map(({ parent, child }) => (
              <path
                key={`${parent.id}-${child.id}`}
                d={getConnectorPath(parent, child, data.rootId)}
                fill="none"
                stroke={child.color}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.42"
                className="transition-all duration-200"
              />
            ))}
          </g>

          {mindmap.visibleNodeIds.map(nodeId => {
            const node = data.nodes[nodeId];
            if (!node) return null;

            return (
              <MindmapNode
                key={node.id}
                node={node}
                isRoot={node.id === data.rootId}
                isSelected={node.id === selectedNode.id}
                isEditing={mindmap.editingNodeId === node.id}
                isReadOnly={isReadOnly}
                onSelect={mindmap.setSelectedNodeId}
                onStartEdit={mindmap.setEditingNodeId}
                onStopEdit={() => mindmap.setEditingNodeId(null)}
                onUpdateTitle={(nodeId, title) => mindmap.updateNode(nodeId, { title }, true)}
                onToggleCollapse={(nodeId) => {
                  const target = data.nodes[nodeId];
                  if (target) mindmap.updateNode(nodeId, { collapsed: !target.collapsed });
                }}
                onOpenNote={mindmap.setOpenNoteNodeId}
                onPointerDown={drag.startNodeDrag}
              />
            );
          })}
        </g>
      </svg>

      {isEmpty && !isReadOnly && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center">
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-indigo-100 bg-white/90 px-5 py-4 text-center shadow-lg shadow-slate-200/70 backdrop-blur-md">
            <div className="text-sm font-black text-slate-800">Bắt đầu xây dựng sơ đồ tư duy</div>
            <div className="mt-1 text-[11px] font-bold text-slate-500">Nhấn vào nút "+" hoặc Enter để thêm nhánh đầu tiên.</div>
            <button
              type="button"
              onClick={() => mindmap.addChild()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-primary-hover"
            >
              <Plus size={13} /> Thêm nhánh
            </button>
          </div>
        </div>
      )}

      <MindmapMiniMap data={data} onViewportChange={mindmap.setViewport} />

      {openNoteNode && (
        <div className="absolute bottom-4 left-4 z-20 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary">
                <StickyNote size={15} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-black text-slate-800">{openNoteNode.title || 'Ghi chú'}</div>
                <div className="text-[9px] font-bold text-slate-400">Markdown note</div>
              </div>
            </div>
            <button type="button" onClick={() => mindmap.setOpenNoteNodeId(null)} className="rounded-lg px-2 py-1 text-[10px] font-black text-slate-400 hover:bg-slate-50 hover:text-slate-700">
              Close
            </button>
          </div>
          {isReadOnly ? (
            <div
              className="max-h-44 overflow-auto rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-slate-600"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(openNoteNode.note || '') }}
            />
          ) : (
            <textarea
              value={openNoteNode.note || ''}
              onChange={(event) => mindmap.updateNode(openNoteNode.id, { note: event.target.value }, true)}
              placeholder="Viết ghi chú Markdown cho node này..."
              className="h-36 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          )}
        </div>
      )}
    </div>
  );
};
