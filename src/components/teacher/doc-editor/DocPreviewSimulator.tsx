import React, { useEffect, useRef, useState } from 'react';
import { Laptop, Tablet as TabletIcon, Smartphone, RefreshCw, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';

export interface DocBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'todo-list' | 'callout';
  level?: 1 | 2 | 3;
  indent?: number;
  text: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  checked?: boolean;
}

interface DocPreviewSimulatorProps {
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  selectedPage: 'water' | 'macromolecules';
  blocks: DocBlock[];
}

const getNumberedIndex = (blocks: DocBlock[], index: number): string => {
  const currentBlock = blocks[index];
  if (!currentBlock || currentBlock.type !== 'numbered-list') return '1.';
  
  let count = 1;
  const currentIndent = currentBlock.indent || 0;
  
  for (let i = index - 1; i >= 0; i--) {
    const prev = blocks[i];
    if (prev.type !== 'numbered-list') {
      if (prev.type !== 'bullet-list' && prev.type !== 'todo-list') {
        break;
      }
      continue;
    }
    const prevIndent = prev.indent || 0;
    if (prevIndent === currentIndent) {
      count++;
    } else if (prevIndent < currentIndent) {
      break;
    }
  }
  return `${count}.`;
};

export const DocPreviewSimulator: React.FC<DocPreviewSimulatorProps> = ({
  viewport,
  setViewport,
  selectedPage,
  blocks,
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

  const title = selectedPage === 'water' ? '1. Nguyên tố hóa học và Nước' : '2. Các đại phân tử hữu cơ';

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

      {/* Dynamic content blocks rendering */}
      <div className="space-y-4 text-[10px] leading-relaxed text-[#475569]">
        {blocks.map((block, idx) => {
          const alignClass = block.align === 'center' 
            ? 'text-center' 
            : block.align === 'right' 
              ? 'text-right' 
              : block.align === 'justify' 
                ? 'text-justify' 
                : 'text-left';

          const indentStyle = { paddingLeft: `${(block.indent || 0) * 16}px` };

          if (block.type === 'heading') {
            if (block.level === 1) {
              return (
                <h4 key={block.id} style={indentStyle} className={`text-[13px] font-black text-primary leading-tight ${alignClass}`} dangerouslySetInnerHTML={{ __html: block.text }} />
              );
            }
            if (block.level === 2) {
              return (
                <h5 key={block.id} style={indentStyle} className={`text-[11px] font-black text-slate-800 leading-tight ${alignClass}`} dangerouslySetInnerHTML={{ __html: block.text }} />
              );
            }
            return (
              <h6 key={block.id} style={indentStyle} className={`text-[10px] font-bold text-slate-700 leading-tight ${alignClass}`} dangerouslySetInnerHTML={{ __html: block.text }} />
            );
          }

          if (block.type === 'bullet-list') {
            return (
              <div key={block.id} style={indentStyle} className={`flex items-start gap-2 ${alignClass}`}>
                <span className="text-slate-400 mt-0.5">•</span>
                <span className="flex-1 text-text-secondary font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );
          }

          if (block.type === 'numbered-list') {
            return (
              <div key={block.id} style={indentStyle} className={`flex items-start gap-2 ${alignClass}`}>
                <span className="text-primary font-black mt-0.5 shrink-0">{getNumberedIndex(blocks, idx)}</span>
                <span className="flex-1 text-text-secondary font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );
          }

          if (block.type === 'todo-list') {
            return (
              <div key={block.id} style={indentStyle} className={`flex items-start gap-2.5 ${alignClass}`}>
                <input 
                  type="checkbox" 
                  checked={!!block.checked} 
                  disabled 
                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-350 accent-primary pointer-events-none"
                />
                <span className={`flex-1 text-text-secondary font-bold leading-relaxed ${block.checked ? 'line-through text-slate-400 font-medium' : ''}`} dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );
          }

          if (block.type === 'callout') {
            return (
              <div key={block.id} style={indentStyle} className="p-3 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-xl flex gap-2.5 items-center">
                <span className="text-xs shrink-0">💧</span>
                <div className={`flex-1 leading-normal text-text-secondary font-black ${alignClass}`} dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );
          }

          return (
            <p key={block.id} style={indentStyle} className={`text-text-secondary leading-relaxed font-bold ${alignClass}`} dangerouslySetInnerHTML={{ __html: block.text }} />
          );
        })}
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

          <div className="h-10 shrink-0 border-t border-slate-200 bg-white px-5 flex items-center text-[10px] font-bold text-slate-550">
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