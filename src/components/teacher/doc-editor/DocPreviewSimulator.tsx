import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, X, Video } from 'lucide-react';
import { Tooltip } from './Tooltip';



const getCleanChapterTitle = (title: string): string => {
  const cleaned = title.replace(/^Chương\s+[a-zA-Z0-9\-\u00c0-\u1ef9]+\s*[\.:-]?\s*/i, '');
  return cleaned.trim();
};

const getPreviewNodeTitle = (title: string): string =>
  title.replace(/^\d+(?:\.\d+)*[.\s/-]*/, '').trim();

const chapterIndexToRoman = (index: number): string => {
  const numerals: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let remaining = index;
  return numerals.reduce((result, [value, symbol]) => {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
    return result;
  }, '');
};

import { SharedTableRenderer } from './blocks/table/SharedTableRenderer';
import { QuizPreview } from './blocks/quiz/QuizPreview';
import { FlashcardPreview } from './blocks/flashcard/FlashcardPreview';
import { MindmapPreview } from './blocks/mindmap/MindmapPreview';
import { TimelinePreview } from './blocks/timeline/TimelinePreview';
import { FlowPreview } from './blocks/flow/FlowPreview';
import { TabsPreview } from './blocks/tabs/TabsPreview';
import { ComparePreview } from './blocks/compare/ComparePreview';
import { DiagramPreview } from './blocks/diagram/DiagramPreview';
import { MatchingPreview } from './blocks/matching/MatchingPreview';
import { Preview as FillBlankPreview } from './blocks/fillblank/Preview';
import { Preview as DragDropPreview } from './blocks/dragdrop/Preview';
import { Preview as SortOrderPreview } from './blocks/sortorder/Preview';
import type { Chapter, DocBlock, Lesson, LiveTableResizeState } from '../../../types/doc-editor';

interface DocPreviewSimulatorProps {
  documentTree: Chapter[];
  currentDocumentId: string;
  documentTitle: string;
  liveTableResize?: LiveTableResizeState | null;
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
  documentTree,
  currentDocumentId,
  documentTitle,
  liveTableResize,
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

  const currentDocument = React.useMemo(() => {
    for (let chapterIndex = 0; chapterIndex < documentTree.length; chapterIndex++) {
      const chapter = documentTree[chapterIndex];
      for (let lessonIndex = 0; lessonIndex < chapter.lessons.length; lessonIndex++) {
        const lesson = chapter.lessons[lessonIndex];
        if (lesson.id === currentDocumentId) {
          return { chapter, document: lesson, previewFolder: lesson.isFolder ? lesson : null, chapterIndex };
        }
        for (const subLesson of lesson.subLessons ?? []) {
          if (subLesson.id === currentDocumentId) {
            return {
              chapter,
              document: subLesson,
              previewFolder: subLesson.isFolder ? subLesson : lesson,
              chapterIndex,
            };
          }
          const file = subLesson.subLessons?.find(child => child.id === currentDocumentId);
          if (file) {
            return { chapter, document: file, previewFolder: subLesson, chapterIndex };
          }
        }
      }
    }
    return null;
  }, [currentDocumentId, documentTree]);

  const chapter = currentDocument?.chapter;
  const activeDocument = currentDocument?.document;
  const previewFolder = currentDocument?.previewFolder;
  const blocks = activeDocument?.blocks ?? [];
  const previewFolderTitle = previewFolder ? getPreviewNodeTitle(previewFolder.title) : '';
  const hasFolderHeading = activeDocument?.isFolder && blocks[0]?.type === 'heading' && blocks[0].level === 1;

  const [katexLoaded, setKatexLoaded] = useState(!!(window as any).katex);
  useEffect(() => {
    if (!window.document) return;
    if ((window as any).katex) {
      setKatexLoaded(true);
      return;
    }
    const link = window.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    window.document.head.appendChild(link);

    const script = window.document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
    script.onload = () => setKatexLoaded(true);
    window.document.body.appendChild(script);
  }, []);

  const renderInlineLatex = (html: string): string => {
    const katex = (window as Window & {
      katex?: { renderToString: (latex: string, options: { displayMode: boolean; throwOnError: boolean }) => string };
    }).katex;
    if (!katexLoaded || !katex || !html.includes('$')) return html;

    const template = window.document.createElement('template');
    template.innerHTML = html;
    const walker = window.document.createTreeWalker(template.content, window.NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let textNode = walker.nextNode();

    while (textNode) {
      textNodes.push(textNode as Text);
      textNode = walker.nextNode();
    }

    textNodes.forEach(node => {
      if (!node.textContent?.includes('$')) return;

      const fragment = window.document.createDocumentFragment();
      const parts = node.textContent.split(/(\$[^$\n]+\$)/g);
      parts.forEach(part => {
        const latexMatch = part.match(/^\$([^$\n]+)\$$/);
        if (!latexMatch) {
          fragment.appendChild(window.document.createTextNode(part));
          return;
        }

        const formula = window.document.createElement('span');
        try {
          formula.innerHTML = katex.renderToString(latexMatch[1].trim(), { displayMode: false, throwOnError: false });
        } catch {
          formula.textContent = part;
        }
        fragment.appendChild(formula);
      });
      node.parentNode?.replaceChild(fragment, node);
    });

    return template.innerHTML;
  };

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
    className = '',
    style?: React.CSSProperties,
  ) => (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 sm:p-7 font-sans h-fit transition-all duration-300 shrink-0 w-full select-text ${className}`}
      style={style}
    >
      {/* Chapter Label (uppercase, bold, indigo, e.g. CHƯƠNG 1) */}
      <div className="inline-flex rounded-md bg-primary px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white mb-4 select-none">
        CHƯƠNG {currentDocument ? chapterIndexToRoman(currentDocument.chapterIndex + 1) : ''}
      </div>

      {/* Chapter Title (large, bold, black, textbook style) */}
      <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug uppercase mb-3">
        {chapter ? getCleanChapterTitle(chapter.title) : ''}
      </h3>

      {/* Thin horizontal divider below chapter title */}
      <div className="border-b border-slate-200 mb-5" />

      {/* Current folder title */}
      {!hasFolderHeading && previewFolderTitle && (
        <h4 className="text-sm font-black text-primary tracking-tight mt-5 mb-4">
          {previewFolderTitle}
        </h4>
      )}

      {/* Dynamic content blocks rendering */}
      <div className="space-y-4 text-[11px] leading-relaxed text-slate-900">
        {blocks.map((block, idx) => {
          const alignClass = block.align === 'center' 
            ? 'text-center' 
            : block.align === 'right' 
              ? 'text-right' 
              : block.align === 'justify' 
                ? 'text-justify' 
                : 'text-left';

          const indentStyle = { paddingLeft: `${(block.indent || 0) * 16}px` };
          const isFileNameHeading = !activeDocument?.isFolder
            && idx === 0
            && block.type === 'heading'
            && getPreviewNodeTitle(block.text) === getPreviewNodeTitle(activeDocument.title);

          if (isFileNameHeading) return null;

          if (block.type === 'heading') {
            if (block.level === 1) {
              return (
                <h4 
                  key={block.id} 
                  style={indentStyle} 
                  className={`text-sm font-bold text-slate-900 tracking-tight mt-5 mb-4 leading-tight [&_b]:font-black [&_strong]:font-black ${alignClass}`} 
                  dangerouslySetInnerHTML={{ __html: idx === 0 && activeDocument?.isFolder ? getPreviewNodeTitle(block.text) : block.text }} 
                />
              );
            }
            if (block.level === 2) {
              return (
                <h5 
                  key={block.id} 
                  style={indentStyle} 
                  className={`text-xs font-medium text-slate-600 tracking-tight mt-4 mb-2 leading-tight ${alignClass}`} 
                  dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} 
                />
              );
            }
            return (
              <h6 
                key={block.id} 
                style={indentStyle} 
                className={`text-[11px] font-medium text-slate-500 tracking-tight mt-3 mb-1.5 leading-tight ${alignClass}`} 
                  dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} 
              />
            );
          }

          if (block.type === 'bullet-list') {
            return (
              <div key={block.id} style={indentStyle} className={`flex items-start gap-2 ${alignClass}`}>
                <span className="text-slate-400 mt-0.5">•</span>
                <span className="flex-1 text-slate-900 font-bold text-xs leading-relaxed [&_b]:font-black [&_strong]:font-black" dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} />
              </div>
            );
          }

          if (block.type === 'numbered-list') {
            return (
              <div key={block.id} style={indentStyle} className={`flex items-start gap-2 ${alignClass}`}>
                <span className="text-primary font-black mt-0.5 shrink-0 text-[11px]">{getNumberedIndex(blocks, idx)}</span>
                <span className="flex-1 text-slate-900 font-bold text-xs leading-relaxed [&_b]:font-black [&_strong]:font-black" dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} />
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
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-primary pointer-events-none"
                />
                <span className={`flex-1 text-slate-900 font-bold text-xs leading-relaxed [&_b]:font-black [&_strong]:font-black ${block.checked ? 'line-through text-slate-400' : ''}`} dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} />
              </div>
            );
          }

          if (block.type === 'callout') {
            return (
              <div key={block.id} style={indentStyle} className="p-4 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-xl flex gap-2.5 items-center">
                <span className="text-xs shrink-0">💧</span>
                <div className={`flex-1 leading-normal text-slate-900 font-bold text-xs [&_b]:font-black [&_strong]:font-black ${alignClass}`} dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} />
              </div>
            );
          }

          if (block.type === 'quote') {
            return (
              <blockquote key={block.id} style={indentStyle} className={`border-l-4 border-primary/30 pl-4 italic text-xs font-bold text-slate-600 my-3 [&_b]:font-black [&_strong]:font-black ${alignClass}`} dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} />
            );
          }

          if (block.type === 'divider') {
            return (
              <hr key={block.id} className="border-t border-slate-200 my-3" />
            );
          }

          if (block.type === 'image') {
            const defaultSrc = 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500';
            const imgJustify = block.align === 'left'
              ? 'justify-start'
              : block.align === 'right'
                ? 'justify-end'
                : 'justify-center';
            return (
              <div key={block.id} style={indentStyle} className={`w-full flex ${imgJustify} my-2.5`}>
                <div style={{ width: block.width || '100%' }} className="flex flex-col items-center gap-1.5 max-w-full">
                  <img src={block.src || defaultSrc} alt={block.caption || 'Hình minh họa'} className="w-full h-auto rounded-lg object-contain shadow-sm border border-slate-100" />
                  {block.caption && <span className="text-[8px] text-slate-400 font-bold">{block.caption}</span>}
                </div>
              </div>
            );
          }

          if (block.type === 'table') {
            return (
              <div key={block.id} className="my-2.5">
                <SharedTableRenderer
                  block={block}
                  isEditable={false}
                  liveTableResize={liveTableResize}
                />
              </div>
            );
          }

          if (block.type === 'formula') {
            const latex = block.latex || '';
            const displayMode = block.display !== 'inline';
            let html = '';
            const katex = (window as any).katex;
            if (katexLoaded && katex) {
              try {
                html = katex.renderToString(latex || '\\text{Formula Block}', { displayMode, throwOnError: false });
              } catch (e) {
                html = '';
              }
            }
            return (
              <div 
                key={block.id} 
                className={`my-3.5 overflow-x-auto select-all ${displayMode ? 'w-full flex justify-center' : 'inline-block'}`}
              >
                {html ? (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <code className="font-mono text-[9px] bg-slate-100 text-slate-600 rounded px-2.5 py-1">
                    {latex || 'f(x) = x^2'}
                  </code>
                )}
              </div>
            );
          }

          if (block.type === 'code') {
            return (
              <pre key={block.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[8px] leading-normal overflow-x-auto my-2.5 select-text">
                <div className="text-slate-500 uppercase tracking-widest text-[7px] font-black mb-1.5">{block.language || 'typescript'}</div>
                <code>{block.text}</code>
              </pre>
            );
          }

          if (block.type === 'quiz') {
            return (
              <QuizPreview 
                key={block.id} 
                block={block} 
                indentStyle={indentStyle} 
              />
            );
          }

          if (block.type === 'flashcard') {
            return (
              <FlashcardPreview
                key={block.id}
                block={block}
              />
            );
          }

          if (block.type === 'mindmap') {
            return (
              <MindmapPreview key={block.id} block={block} />
            );
          }

          if (block.type === 'timeline') {
            return (
              <TimelinePreview key={block.id} block={block} />
            );
          }

          if (block.type === 'flow') {
            return (
              <FlowPreview key={block.id} block={block} />
            );
          }

          if (block.type === 'tabs') {
            return (
              <TabsPreview key={block.id} block={block} />
            );
          }

          if (block.type === 'compare' && block.compareContent) {
            return (
              <ComparePreview key={block.id} content={block.compareContent} />
            );
          }

          if (block.type === 'diagram' && block.diagramContent) {
            return (
              <DiagramPreview key={block.id} content={block.diagramContent} />
            );
          }

          if (block.type === 'matching' && block.matchingContent) {
            return (
              <MatchingPreview key={block.id} content={block.matchingContent} />
            );
          }

          if (block.type === 'fillblank' && block.fillblankContent) {
            return (
              <FillBlankPreview key={block.id} block={block} />
            );
          }

          if (block.type === 'dragdrop' && block.dragdropContent) {
            return (
              <DragDropPreview key={block.id} block={block} />
            );
          }

          if (block.type === 'sortorder' && block.sortorderContent) {
            return (
              <SortOrderPreview key={block.id} block={block} />
            );
          }

          if (block.type === 'media') {
            const mediaContent = block.content || {};
            const videoUrl = mediaContent.url || block.url;
            const sourceType = mediaContent.sourceType || block.sourceType || 'upload';
            const caption = mediaContent.caption || block.caption;

            return (
              <div key={block.id} style={indentStyle} className="w-full max-w-lg mx-auto my-2.5 flex flex-col gap-1.5 font-sans">
                {videoUrl ? (
                  <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shadow-sm">
                    {sourceType === 'upload' ? (
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <iframe
                        src={videoUrl}
                        className="w-full h-full aspect-video rounded-lg shadow-sm border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title="Embedded Video Preview"
                      />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-4 relative group border border-slate-800">
                    <div className="absolute top-3 left-3 text-white/60 font-black text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <Video size={10} /> Video Bài học
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer mb-2">
                      <span className="translate-x-0.5 text-xs">▶</span>
                    </div>
                    <div className="text-[9px] text-white/80 font-bold truncate max-w-full">
                      Video bài giảng chưa thiết lập
                    </div>
                  </div>
                )}
                {caption && (
                  <p 
                    className="text-center text-[11px] font-bold text-slate-500 italic mt-1"
                    dangerouslySetInnerHTML={{ __html: renderInlineLatex(caption) }}
                  />
                )}
              </div>
            );
          }

          return (
            <p key={block.id} style={indentStyle} className={`text-slate-900 leading-relaxed font-bold text-xs [&_b]:font-black [&_strong]:font-black ${alignClass}`} dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text) }} />
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
          aria-label="Phóng to xem trước"
          className={`flex h-[94vh] w-[96vw] flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl transition-all duration-200 ${isFullscreenClosing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="h-14 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <Tooltip content="Đóng">
                <button
                  type="button"
                  onClick={closeFullscreen}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                  aria-label="Đóng xem trước"
                >
                  <X size={18} />
                </button>
              </Tooltip>
              <div className="min-w-0">
                <div className="truncate text-xs font-black uppercase tracking-wide text-slate-800">{previewFolder?.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[9px] font-bold text-slate-400">
                  <span>{documentTitle}</span>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[8px] font-black text-primary">Tài liệu</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-slate-500">
              <Tooltip content="Thu nhỏ">
                <button type="button" onClick={() => stepZoom(-1)} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" aria-label="Thu nhỏ">
                  <ZoomOut size={16} />
                </button>
              </Tooltip>
              <span className="w-12 text-center text-[10px] font-black text-slate-700">{isFitWidth ? 'Fit' : `${previewZoom}%`}</span>
              <Tooltip content="Phóng to">
                <button type="button" onClick={() => stepZoom(1)} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" aria-label="Phóng to">
                  <ZoomIn size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Reset Zoom">
                <button type="button" onClick={() => applyZoom(100)} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" aria-label="Reset Zoom">
                  <RotateCcw size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Fit Width">
                <button type="button" onClick={() => setIsFitWidth(true)} className={`px-3 py-2 rounded-xl text-[10px] font-black transition cursor-pointer ${isFitWidth ? 'bg-indigo-50 text-primary' : 'hover:bg-slate-100 hover:text-slate-900'}`} aria-label="Fit Width">
                  Fit Width
                </button>
              </Tooltip>
              <Tooltip content="Thu nhỏ xem trước">
                <button type="button" onClick={closeFullscreen} className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer" aria-label="Thu nhỏ xem trước">
                  <Minimize2 size={16} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div ref={fullscreenScrollRef} className="flex-1 overflow-auto bg-slate-100/80 p-6">
            <div className="flex min-h-full justify-center items-start">
              {renderPreviewFrame('rounded-2xl', { width: paperWidth })}
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
        <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Xem trước (Giao diện học sinh)</span>

        <div className="flex items-center gap-1.5 text-slate-400">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer">
            <RefreshCw size={12} />
          </button>
          <Tooltip content="Phóng to xem trước">
            <button
              type="button"
              aria-label="Phóng to xem trước"
              onClick={openFullscreen}
              className="p-1.5 hover:bg-indigo-50 hover:text-primary rounded-lg transition cursor-pointer"
            >
              <Maximize2 size={12} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div ref={previewScrollRef} className="flex-1 p-6 overflow-auto flex justify-center bg-slate-100/50">
        {/* Virtual Frame Simulator */}
        {isFullscreenOpen ? (
          <div className="w-full h-fit rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-[10px] font-bold text-slate-400">
            Xem trước đang mở ở chế độ phóng to
          </div>
        ) : renderPreviewFrame()}
      </div>

      {renderFullscreenOverlay()}
    </aside>
  );
};
