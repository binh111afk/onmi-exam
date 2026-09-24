import { useState, useEffect, useRef } from 'react';

const previewZoomLevels = [50, 75, 100, 125, 150, 200] as const;
type ZoomLevel = typeof previewZoomLevels[number];

export const useExamViewportZoom = () => {
  const [isPreviewFullscreenOpen, setIsPreviewFullscreenOpen] = useState(false);
  const [isPreviewFullscreenClosing, setIsPreviewFullscreenClosing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<ZoomLevel>(100);
  const [isPreviewFitWidth, setIsPreviewFitWidth] = useState(false);

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fullscreenPreviewScrollRef = useRef<HTMLDivElement>(null);
  const savedPreviewScrollTopRef = useRef(0);
  const previewCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPreviewFullscreen = () => {
    savedPreviewScrollTopRef.current = previewScrollRef.current?.scrollTop ?? savedPreviewScrollTopRef.current;
    if (previewCloseTimerRef.current) clearTimeout(previewCloseTimerRef.current);
    setIsPreviewFullscreenClosing(true);
    setIsPreviewFullscreenOpen(true);
    requestAnimationFrame(() => {
      setIsPreviewFullscreenClosing(false);
      if (fullscreenPreviewScrollRef.current) {
        fullscreenPreviewScrollRef.current.scrollTop = savedPreviewScrollTopRef.current;
      }
    });
  };

  const closePreviewFullscreen = () => {
    savedPreviewScrollTopRef.current = fullscreenPreviewScrollRef.current?.scrollTop ?? savedPreviewScrollTopRef.current;
    setIsPreviewFullscreenClosing(true);
    if (previewCloseTimerRef.current) clearTimeout(previewCloseTimerRef.current);
    previewCloseTimerRef.current = setTimeout(() => {
      setIsPreviewFullscreenOpen(false);
      setIsPreviewFullscreenClosing(false);
      requestAnimationFrame(() => {
        if (previewScrollRef.current) {
          previewScrollRef.current.scrollTop = savedPreviewScrollTopRef.current;
        }
      });
    }, 200);
  };

  const applyPreviewZoom = (zoom: ZoomLevel) => {
    setPreviewZoom(zoom);
    setIsPreviewFitWidth(false);
  };

  const stepPreviewZoom = (direction: -1 | 1) => {
    const currentIndex = previewZoomLevels.indexOf(previewZoom);
    const nextIndex = Math.min(previewZoomLevels.length - 1, Math.max(0, currentIndex + direction));
    applyPreviewZoom(previewZoomLevels[nextIndex]);
  };

  useEffect(() => {
    return () => {
      if (previewCloseTimerRef.current) clearTimeout(previewCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPreviewFullscreenOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreviewFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreenOpen]);

  return {
    isPreviewFullscreenOpen,
    setIsPreviewFullscreenOpen,
    isPreviewFullscreenClosing,
    setIsPreviewFullscreenClosing,
    previewZoom,
    setPreviewZoom,
    isPreviewFitWidth,
    setIsPreviewFitWidth,
    previewScrollRef,
    fullscreenPreviewScrollRef,
    openPreviewFullscreen,
    closePreviewFullscreen,
    applyPreviewZoom,
    stepPreviewZoom,
  };
};
