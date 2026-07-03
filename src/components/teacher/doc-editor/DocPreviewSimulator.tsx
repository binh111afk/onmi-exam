import React, { useEffect, useRef, useState } from 'react';
import { Laptop, Tablet as TabletIcon, Smartphone, RefreshCw, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';

interface Ch2ListItem {
  id: number;
  label: string;
  color: string;
  icon: string;
}

interface DocPreviewSimulatorProps {
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  selectedPage: 'water' | 'macromolecules';
  ch1Title: string;
  ch1Text: string;
  ch1Callout: string;
  ch2Title: string;
  ch2Text: string;
  ch2List: Ch2ListItem[];
}

export const DocPreviewSimulator: React.FC<DocPreviewSimulatorProps> = ({
  viewport,
  setViewport,
  selectedPage,
  ch1Title,
  ch1Text,
  ch1Callout,
  ch2Title,
  ch2Text,
  ch2List,
}) => {
  const previewZoomLevels = [50, 75, 100, 125, 150, 200] as const;
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isFullscreenClosing, setIsFullscreenClosing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<50 | 75 | 100 | 125 | 150 | 200>(100);
  const [isFitWidth, setIsFitWidth] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollTopRef = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const title = selectedPage === 'water' ? ch1Title : ch2Title;

  const openFullscreen = () => {
    savedScrollTopRef.current = previewScrollRef.current?.scrollTop ?? savedScrollTopRef.current;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsFullscreenClosing(true);
    setIsFullscreenOpen(true);
    requestAnimationFrame(() => {
      setIsFullscreenClosing(false);
      if (fullscreenScrollRef.current) {
        fullscreenScrollRef.current.scrollTop = savedScrollTopRef.current;
      }
    });
  };

  const closeFullscreen = () => {
    savedScrollTopRef.current = fullscreenScrollRef.current?.scrollTop ?? savedScrollTopRef.current;
    setIsFullscreenClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsFullscreenOpen(false);
      setIsFullscreenClosing(false);
      requestAnimationFrame(() => {
        if (previewScrollRef.current) {
          previewScrollRef.current.scrollTop = savedScrollTopRef.current;
        }
      });
    }, 200);
  };

  const applyZoom = (zoom: typeof previewZoomLevels[number]) => {
    setPreviewZoom(zoom);
    setIsFitWidth(false);
  };

  const stepZoom = (direction: -1 | 1) => {
    const currentIndex = previewZoomLevels.indexOf(previewZoom);
    const nextIndex = Math.min(previewZoomLevels.length - 1, Math.max(0, currentIndex + direction));
    applyZoom(previewZoomLevels[nextIndex]);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen]);

  const renderPreviewFrame = (
    frameViewport: 'desktop' | 'tablet' | 'mobile',
    className = '',
    style?: React.CSSProperties,
  ) => (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5 font-sans h-fit transition-all duration-300 shrink-0 ${
        frameViewport === 'desktop'
          ? 'w-full'
          : frameViewport === 'tablet'
            ? 'w-[390px]'
            : 'w-[310px]'
      } ${className}`}
      style={style}
    >
      {/* Header Tag inside simulator */}
      <div className="inline-block px-2.5 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded mb-4">
        Chương I
      </div>
      <h3 className="text-xs font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
        Thành phần hóa học của tế bào
      </h3>

      {/* Simulated live page text */}
      <div className="space-y-4 text-[10px] leading-relaxed text-[#475569]">
        {selectedPage === 'water' ? (
          <>
            <h4 className="text-[11px] font-black text-primary leading-tight">
              {ch1Title}
            </h4>
            <p className="text-text-secondary leading-relaxed font-bold">
              {ch1Text}
            </p>

            {/* Callout box inside simulator */}
            <div className="p-3 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-xl flex gap-2.5 items-center">
              <span className="text-xs">💧</span>
              <div className="flex-1 leading-normal text-text-secondary font-black">
                {ch1Callout}
              </div>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-[11px] font-black text-primary leading-tight">
              {ch2Title}
            </h4>
            <p className="text-text-secondary leading-relaxed font-bold">
              {ch2Text}
            </p>

            {/* List items inside simulator */}
            <div className="space-y-2">
              {ch2List.map(item => (
                <div key={item.id} className="p-2 border border-slate-100 rounded-xl flex gap-2 items-center bg-[#FAF9FF] shadow-sm">
                  <span className="text-xs shrink-0">{item.icon}</span>
                  <span className="text-[9px] font-black text-text-secondary leading-normal">{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderFullscreenOverlay = () => {
    if (!isFullscreenOpen) return null;

    const paperWidth = isFitWidth ? '100%' : `${Math.round(820 * previewZoom / 100)}px`;

    return (
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-opacity duration-200 ${isFullscreenClosing ? 'opacity-0' : 'opacity-100'}`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeFullscreen();
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Phóng to Preview"
          className={`flex h-[94vh] w-[96vw] flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl transition-all duration-200 ${isFullscreenClosing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="h-14 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <button
                type="button"
                onClick={closeFullscreen}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                aria-label="Đóng Preview"
                title="Đóng"
              >
                <X size={18} />
              </button>
              <div className="min-w-0">
                <div className="truncate text-xs font-black uppercase tracking-wide text-slate-800">{title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[9px] font-bold text-slate-400">
                  <span>Tài liệu Sinh học 10</span>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[8px] font-black text-primary">DOC</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-slate-500">
              <button type="button" onClick={() => stepZoom(-1)} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" title="Thu nhỏ" aria-label="Thu nhỏ">
                <ZoomOut size={16} />
              </button>
              <span className="w-12 text-center text-[10px] font-black text-slate-700">{isFitWidth ? 'Fit' : `${previewZoom}%`}</span>
              <button type="button" onClick={() => stepZoom(1)} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" title="Phóng to" aria-label="Phóng to">
                <ZoomIn size={16} />
              </button>
              <button type="button" onClick={() => applyZoom(100)} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" title="Reset Zoom" aria-label="Reset Zoom">
                <RotateCcw size={16} />
              </button>
              <button type="button" onClick={() => setIsFitWidth(true)} className={`px-3 py-2 rounded-xl text-[10px] font-black transition cursor-pointer ${isFitWidth ? 'bg-indigo-50 text-primary' : 'hover:bg-slate-100 hover:text-slate-900'}`} title="Fit Width" aria-label="Fit Width">
                Fit Width
              </button>
              <button type="button" onClick={closeFullscreen} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" title="Thu nhỏ Preview" aria-label="Thu nhỏ Preview">
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          <div ref={fullscreenScrollRef} className="flex-1 overflow-auto bg-slate-100/80 p-6">
            <div className="flex min-h-full justify-center items-start">
              {renderPreviewFrame('desktop', 'rounded-2xl', { width: paperWidth })}
            </div>
          </div>

          <div className="h-10 shrink-0 border-t border-slate-200 bg-white px-5 flex items-center text-[10px] font-bold text-slate-500">
            Trang 1 / 1
          </div>
        </section>
      </div>
    );
  };

  return (
    <aside className="w-[460px] bg-[#F8FAFC] border-r border-slate-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
      {/* Preview Simulator Header */}
      <div className="h-11 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white">
        <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Preview (Giao diện học sinh)</span>

        {/* Responsive viewport selector */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'desktop' ? 'bg-slate-100 text-primary' : ''}`}
          >
            <Laptop size={12} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'tablet' ? 'bg-slate-100 text-primary' : ''}`}
          >
            <TabletIcon size={12} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'mobile' ? 'bg-slate-100 text-primary' : ''}`}
          >
            <Smartphone size={12} />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-0.5" />
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer">
            <RefreshCw size={12} />
          </button>
          <button
            type="button"
            title="Phóng to Preview"
            aria-label="Phóng to Preview"
            onClick={openFullscreen}
            className="p-1.5 hover:bg-indigo-50 hover:text-primary rounded-lg transition cursor-pointer"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Preview Frame Container */}
      <div ref={previewScrollRef} className="flex-1 p-6 overflow-y-auto flex justify-center bg-slate-100/50">
        {/* Virtual Frame Simulator */}
        {isFullscreenOpen ? (
          <div className="w-full h-fit rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-[10px] font-bold text-slate-400">
            Preview đang mở ở chế độ phóng to
          </div>
        ) : renderPreviewFrame(viewport)}
      </div>

      {renderFullscreenOverlay()}
    </aside>
  );
};