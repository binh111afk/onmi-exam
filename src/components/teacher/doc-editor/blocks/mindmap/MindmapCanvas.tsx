import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Minus,
  StickyNote,
  Palette,
  SmilePlus,
  Trash2,
  GitBranchPlus,
  ChevronRight,
  BookOpen,
  Brain,
  Settings,
  Pin,
  Star,
  TriangleAlert,
  Lightbulb,
} from 'lucide-react';
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
  MINDMAP_ZOOM_MIN,
  MINDMAP_ZOOM_MAX,
  MINDMAP_COLORS,
} from './MindmapUtils';

interface MindmapCanvasProps {
  data: MindmapData;
  mode: MindmapMode;
  isActive?: boolean;
  onChange: (data: MindmapData, isDebounced?: boolean) => void;
}

const iconOptions = [
  { id: 'book', label: 'Sách', icon: BookOpen },
  { id: 'brain', label: 'Tư duy', icon: Brain },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
  { id: 'pin', label: 'Ghim', icon: Pin },
  { id: 'star', label: 'Sao', icon: Star },
  { id: 'warning', label: 'Cảnh báo', icon: TriangleAlert },
  { id: 'idea', label: 'Ý tưởng', icon: Lightbulb },
];

interface NodeContextMenuProps {
  x: number;
  y: number;
  node: any;
  isRoot: boolean;
  onClose: () => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onColorChange: (color: string) => void;
  onIconChange: (icon?: string) => void;
  onToggleCollapse: () => void;
  onDeleteNode: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  node,
  isRoot,
  onClose,
  onAddChild,
  onAddSibling,
  onColorChange,
  onIconChange,
  onToggleCollapse,
  onDeleteNode,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x, y });
  const [activeSubmenu, setActiveSubmenu] = useState<'color' | 'icon' | null>(null);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 8;
      }
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 8;
      }

      setCoords({ x: Math.max(8, adjustedX), y: Math.max(8, adjustedY) });
    }
  }, [x, y]);

  const handleAction = (cb: () => void) => {
    cb();
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: `${coords.y}px`, left: `${coords.x}px` }}
      className="fixed z-[9999] w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-md flex flex-col gap-0.5 animate-fadeIn text-[11px] font-semibold text-slate-700 select-none cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => handleAction(onAddChild)}
        className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer font-bold"
      >
        <Plus size={12} className="text-slate-400" />
        <span>Thêm nhánh con</span>
      </button>

      {!isRoot && (
        <button
          type="button"
          onClick={() => handleAction(onAddSibling)}
          className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer font-bold"
        >
          <GitBranchPlus size={12} className="text-slate-400" />
          <span>Thêm nhánh ngang</span>
        </button>
      )}

      <div className="h-px bg-slate-100 my-0.5" />

      {/* Colors Submenu */}
      <div 
        className="relative"
        onMouseEnter={() => setActiveSubmenu('color')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button 
          type="button"
          className="w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 cursor-pointer text-slate-700"
        >
          <div className="flex items-center gap-2">
            <Palette size={12} className="text-slate-400" />
            <span>Đổi màu</span>
          </div>
          <ChevronRight size={10} className="text-slate-400" />
        </button>

        {activeSubmenu === 'color' && (
          <div className="absolute left-full top-0 ml-1 w-36 bg-white border border-slate-200 rounded-lg shadow-md p-1.5 flex flex-col gap-0.5 animate-fadeIn z-[10000]">
            {MINDMAP_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleAction(() => onColorChange(c.value))}
                className={`px-2 py-1 text-left text-[10px] font-bold rounded flex items-center justify-between cursor-pointer ${
                  node.color === c.value ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: c.value }} />
                  <span>{c.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Icon Submenu */}
      <div 
        className="relative"
        onMouseEnter={() => setActiveSubmenu('icon')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button 
          type="button"
          className="w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 cursor-pointer text-slate-700"
        >
          <div className="flex items-center gap-2">
            <SmilePlus size={12} className="text-slate-400" />
            <span>Biểu tượng</span>
          </div>
          <ChevronRight size={10} className="text-slate-400" />
        </button>

        {activeSubmenu === 'icon' && (
          <div className="absolute left-full top-0 ml-1 w-36 bg-white border border-slate-200 rounded-lg shadow-md p-1 flex flex-col gap-0.5 animate-fadeIn z-[10000]">
            <button
              type="button"
              onClick={() => handleAction(() => onIconChange(undefined))}
              className="px-2 py-1.5 text-left text-[10px] font-bold rounded text-rose-500 hover:bg-rose-50 cursor-pointer flex items-center gap-2"
            >
              <span>Xóa biểu tượng</span>
            </button>
            <div className="h-px bg-slate-100 my-0.5" />
            {iconOptions.map(c => {
              const Icon = c.icon;
              const iconValue = `lucide:${c.id}`;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleAction(() => onIconChange(iconValue))}
                  className={`px-2 py-1.5 text-left text-[10px] font-bold rounded flex items-center gap-2 cursor-pointer ${
                    node.icon === iconValue ? 'bg-primary-light text-primary' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={12} className="text-slate-400" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <button
          type="button"
          onClick={() => handleAction(onToggleCollapse)}
          className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
        >
          <ChevronRight size={12} className="text-slate-400" />
          <span>{node.collapsed ? 'Mở rộng' : 'Thu gọn'}</span>
        </button>
      )}

      {!isRoot && (
        <>
          <div className="h-px bg-slate-100 my-0.5" />
          <button
            type="button"
            onClick={() => handleAction(onDeleteNode)}
            className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-rose-50 text-rose-600 cursor-pointer font-bold"
          >
            <Trash2 size={12} className="text-rose-400" />
            <span>Xóa nhánh</span>
          </button>
        </>
      )}
    </div>,
    document.body
  );
};

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

  const [showGrid, setShowGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const nodeCount = useMemo(() => Object.keys(data.nodes).length, [data.nodes]);
  const isGridVisible = showGrid || data.zoom > 120;
  const isMinimapVisible = showMinimap || nodeCount > 30;

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

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, nodeId: string) => {
    if (isReadOnly) return;
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId,
    });
  }, [isReadOnly]);

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const isEmpty = data.nodes[data.rootId]?.children.length === 0;

  return (
    <div
      className={`relative h-[520px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white select-none transition-all duration-200 ${
        drag.isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onWheel={handleWheel}
    >
      <MindmapToolbar
        selectedNode={selectedNode}
        isReadOnly={isReadOnly}
        onAddChild={mindmap.addChild}
        onAddSibling={mindmap.addSibling}
        onColorChange={(color) => mindmap.updateNode(selectedNode.id, { color })}
        onAutoLayout={mindmap.applyAutoLayout}
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
          <pattern id="mindmapGridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#64748B" strokeWidth="0.5" opacity="0.04" />
          </pattern>
          <filter id="mindmapNodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#64748B" floodOpacity="0.08" />
          </filter>
        </defs>

        {isGridVisible && (
          <rect
            width={MINDMAP_CANVAS_WIDTH}
            height={MINDMAP_CANVAS_HEIGHT}
            fill="url(#mindmapGridPattern)"
            pointerEvents="none"
          />
        )}

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
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
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
                level={node.id === data.rootId ? 0 : (node.parentId === data.rootId ? 1 : 2)}
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
                onNodeContextMenu={handleNodeContextMenu}
              />
            );
          })}
        </g>
      </svg>

      {isEmpty && !isReadOnly && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center bg-white/70 backdrop-blur-3xs">
          <div className="text-sm font-bold text-slate-800">Nhập chủ đề...</div>
          <div className="mt-1 text-[11px] font-medium text-slate-400">Nhấn Enter để tạo nhánh</div>
          <button
            type="button"
            onClick={() => mindmap.addChild()}
            className="pointer-events-auto mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-3xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <Plus size={12} /> Thêm nhánh
          </button>
        </div>
      )}

      {isMinimapVisible && (
        <MindmapMiniMap data={data} onViewportChange={mindmap.setViewport} />
      )}

      {/* Compact Zoom and View Controls card */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-2xs select-none">
        <button
          type="button"
          onClick={() => mindmap.setZoom(Math.max(MINDMAP_ZOOM_MIN, data.zoom - 10))}
          className="rounded p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          title="Thu nhỏ"
        >
          <Minus size={12} />
        </button>
        <button
          type="button"
          onClick={() => mindmap.setZoom(100)}
          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          title="Đặt lại 100%"
        >
          {data.zoom}%
        </button>
        <button
          type="button"
          onClick={() => mindmap.setZoom(Math.min(MINDMAP_ZOOM_MAX, data.zoom + 10))}
          className="rounded p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          title="Phóng to"
        >
          <Plus size={12} />
        </button>
        <div className="h-3 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          onClick={mindmap.centerView}
          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          title="Căn giữa sơ đồ"
        >
          Vừa khung
        </button>
        <div className="h-3 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition ${
            isGridVisible ? 'bg-primary-light text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Bật/tắt lưới tọa độ"
        >
          Hiển thị lưới
        </button>
        <div className="h-3 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          onClick={() => setShowMinimap(!showMinimap)}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition ${
            isMinimapVisible ? 'bg-primary-light text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Bật/tắt bản đồ thu nhỏ"
        >
          Bản đồ thu nhỏ
        </button>
      </div>

      {openNoteNode && (
        <div className="absolute bottom-4 left-4 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <StickyNote size={14} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-800">{openNoteNode.title || 'Ghi chú'}</div>
                <div className="text-[9px] font-semibold text-slate-400">Ghi chú Markdown</div>
              </div>
            </div>
            <button type="button" onClick={() => mindmap.setOpenNoteNodeId(null)} className="rounded px-2 py-1 text-[10px] font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-700 cursor-pointer">
              Đóng
            </button>
          </div>
          {isReadOnly ? (
            <div
              className="max-h-44 overflow-auto rounded-lg bg-slate-50 p-2.5 text-xs font-medium leading-relaxed text-slate-600"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(openNoteNode.note || '') }}
            />
          ) : (
            <textarea
              value={openNoteNode.note || ''}
              onChange={(event) => mindmap.updateNode(openNoteNode.id, { note: event.target.value }, true)}
              placeholder="Viết ghi chú Markdown cho node này..."
              className="h-36 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          )}
        </div>
      )}

      {/* Render Node Right-Click Context Menu */}
      {contextMenu && data.nodes[contextMenu.nodeId] && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={data.nodes[contextMenu.nodeId]}
          isRoot={contextMenu.nodeId === data.rootId}
          onClose={() => setContextMenu(null)}
          onAddChild={() => {
            mindmap.setSelectedNodeId(contextMenu.nodeId);
            mindmap.addChild(contextMenu.nodeId);
          }}
          onAddSibling={() => {
            mindmap.setSelectedNodeId(contextMenu.nodeId);
            mindmap.addSibling();
          }}
          onColorChange={(color) => {
            mindmap.setSelectedNodeId(contextMenu.nodeId);
            mindmap.updateNode(contextMenu.nodeId, { color });
          }}
          onIconChange={(icon) => {
            mindmap.setSelectedNodeId(contextMenu.nodeId);
            mindmap.updateNode(contextMenu.nodeId, { icon });
          }}
          onToggleCollapse={() => {
            const target = data.nodes[contextMenu.nodeId];
            if (target) {
              mindmap.setSelectedNodeId(contextMenu.nodeId);
              mindmap.updateNode(contextMenu.nodeId, { collapsed: !target.collapsed });
            }
          }}
          onDeleteNode={() => {
            mindmap.setSelectedNodeId(contextMenu.nodeId);
            mindmap.deleteNode(contextMenu.nodeId);
          }}
        />
      )}
    </div>
  );
};
