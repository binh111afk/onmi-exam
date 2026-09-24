import { useCallback, useRef, useState } from 'react';
import type { MindmapData } from './MindmapTypes';

type DragState =
  | { type: 'node'; nodeId: string; pointerX: number; pointerY: number }
  | { type: 'canvas'; pointerX: number; pointerY: number }
  | null;

export function useMindmapDrag(
  data: MindmapData,
  moveNodeSubtree: (nodeId: string, deltaX: number, deltaY: number) => void,
  panBy: (deltaX: number, deltaY: number) => void
) {
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragRef = useRef<DragState>(null);

  const startNodeDrag = useCallback((event: React.PointerEvent, nodeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    dragRef.current = {
      type: 'node',
      nodeId,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
  }, []);

  const startCanvasDrag = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    setIsDraggingCanvas(true);
    dragRef.current = {
      type: 'canvas',
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaX = event.clientX - drag.pointerX;
    const deltaY = event.clientY - drag.pointerY;

    if (drag.type === 'node') {
      const scale = data.zoom / 100;
      moveNodeSubtree(drag.nodeId, deltaX / scale, deltaY / scale);
    } else {
      panBy(deltaX, deltaY);
    }

    dragRef.current = {
      ...drag,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
  }, [data.zoom, moveNodeSubtree, panBy]);

  const endDrag = useCallback((event: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (event.currentTarget as Element).releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture can already be released when the pointer leaves the SVG.
      }
    }
    dragRef.current = null;
    setIsDraggingCanvas(false);
  }, []);

  return {
    isDraggingCanvas,
    startNodeDrag,
    startCanvasDrag,
    handlePointerMove,
    endDrag,
  };
}

