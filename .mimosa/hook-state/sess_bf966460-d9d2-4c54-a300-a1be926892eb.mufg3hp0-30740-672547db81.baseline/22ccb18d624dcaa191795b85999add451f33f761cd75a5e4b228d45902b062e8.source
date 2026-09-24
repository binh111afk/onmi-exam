import React, { useMemo, useRef } from 'react';
import type { MindmapData } from './MindmapTypes';
import { getMindmapBounds, getNodeMetrics, getVisibleNodeIds, MINDMAP_CANVAS_HEIGHT, MINDMAP_CANVAS_WIDTH } from './MindmapUtils';

interface MindmapMiniMapProps {
  data: MindmapData;
  onViewportChange: (offsetX: number, offsetY: number) => void;
}

const MINI_WIDTH = 184;
const MINI_HEIGHT = 124;

export const MindmapMiniMap: React.FC<MindmapMiniMapProps> = ({ data, onViewportChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const visibleNodeIds = useMemo(() => getVisibleNodeIds(data), [data]);
  const bounds = useMemo(() => getMindmapBounds(data), [data]);
  const scale = Math.min(MINI_WIDTH / bounds.width, MINI_HEIGHT / bounds.height);
  const zoomScale = data.zoom / 100;
  const viewport = {
    x: (-data.offsetX / zoomScale - bounds.minX) * scale,
    y: (-data.offsetY / zoomScale - bounds.minY) * scale,
    width: (MINDMAP_CANVAS_WIDTH / zoomScale) * scale,
    height: (MINDMAP_CANVAS_HEIGHT / zoomScale) * scale,
  };

  const jumpToPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width) * MINI_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * MINI_HEIGHT;
    const worldX = bounds.minX + x / scale;
    const worldY = bounds.minY + y / scale;

    onViewportChange(
      MINDMAP_CANVAS_WIDTH / 2 - worldX * zoomScale,
      MINDMAP_CANVAS_HEIGHT / 2 - worldY * zoomScale
    );
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 rounded-2xl border border-white/80 bg-white/85 p-2 shadow-lg shadow-slate-200/70 backdrop-blur-md">
      <svg
        ref={svgRef}
        width={MINI_WIDTH}
        height={MINI_HEIGHT}
        viewBox={`0 0 ${MINI_WIDTH} ${MINI_HEIGHT}`}
        className="cursor-pointer overflow-hidden rounded-xl bg-slate-50"
        onPointerDown={jumpToPointer}
        onPointerMove={(event) => {
          if (event.buttons === 1) jumpToPointer(event);
        }}
      >
        <rect width={MINI_WIDTH} height={MINI_HEIGHT} rx="12" fill="#F8FAFC" />
        {visibleNodeIds.map(nodeId => {
          const node = data.nodes[nodeId];
          const metrics = getNodeMetrics(node, nodeId === data.rootId);
          const x = (node.position.x - metrics.width / 2 - bounds.minX) * scale;
          const y = (node.position.y - metrics.height / 2 - bounds.minY) * scale;
          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={Math.max(5, metrics.width * scale)}
              height={Math.max(4, metrics.height * scale)}
              rx="3"
              fill={node.id === data.rootId ? '#6C5DD3' : node.color}
              opacity={node.id === data.rootId ? 0.9 : 0.62}
            />
          );
        })}
        <rect
          x={Math.max(0, Math.min(MINI_WIDTH, viewport.x))}
          y={Math.max(0, Math.min(MINI_HEIGHT, viewport.y))}
          width={Math.max(12, Math.min(MINI_WIDTH, viewport.width))}
          height={Math.max(10, Math.min(MINI_HEIGHT, viewport.height))}
          rx="6"
          fill="none"
          stroke="#6C5DD3"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
      </svg>
    </div>
  );
};

