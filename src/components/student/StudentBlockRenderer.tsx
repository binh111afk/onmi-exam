import React, { useEffect, useState } from 'react';
import { Video } from 'lucide-react';
import { SharedTableRenderer } from '../teacher/doc-editor/blocks/table/SharedTableRenderer';
import { QuizPreview } from '../teacher/doc-editor/blocks/quiz/QuizPreview';
import { FlashcardPreview } from '../teacher/doc-editor/blocks/flashcard/FlashcardPreview';
import { MindmapPreview } from '../teacher/doc-editor/blocks/mindmap/MindmapPreview';
import { TimelinePreview } from '../teacher/doc-editor/blocks/timeline/TimelinePreview';
import { FlowPreview } from '../teacher/doc-editor/blocks/flow/FlowPreview';
import { TabsPreview } from '../teacher/doc-editor/blocks/tabs/TabsPreview';
import { ComparePreview } from '../teacher/doc-editor/blocks/compare/ComparePreview';
import { DiagramPreview } from '../teacher/doc-editor/blocks/diagram/DiagramPreview';
import { MatchingPreview } from '../teacher/doc-editor/blocks/matching/MatchingPreview';
import { Preview as FillBlankPreview } from '../teacher/doc-editor/blocks/fillblank/Preview';
import { Preview as DragDropPreview } from '../teacher/doc-editor/blocks/dragdrop/Preview';
import { Preview as SortOrderPreview } from '../teacher/doc-editor/blocks/sortorder/Preview';
import { CodePreview } from '../teacher/doc-editor/blocks/code/CodePreview';
import type { CodeLanguage } from '../teacher/doc-editor/blocks/code/CodeTypes';
import type { DocBlock, GalleryImage } from '../../types/doc-editor';

/**
 * Renderer student DUY NHẤT cho luồng học (B2) — cùng typography với canvas
 * soạn thảo ("soạn sao học sinh thấy vậy"). Tách từ switch đã được chứng minh
 * của DocPreviewSimulator (git HEAD), bỏ mọi phần editor-only.
 */

const getNumberedIndex = (blocks: DocBlock[], index: number): string => {
  const currentBlock = blocks[index];
  if (!currentBlock || currentBlock.type !== 'numbered-list') return '1.';
  let count = 1;
  const currentIndent = currentBlock.indent || 0;
  for (let i = index - 1; i >= 0; i--) {
    const prev = blocks[i];
    if (prev.type !== 'numbered-list') {
      if (prev.type !== 'bullet-list' && prev.type !== 'todo-list') break;
      continue;
    }
    const prevIndent = prev.indent || 0;
    if (prevIndent === currentIndent) count++;
    else if (prevIndent < currentIndent) break;
  }
  return `${count}.`;
};

export const StudentBlockRenderer: React.FC<{ blocks: DocBlock[] }> = ({ blocks }) => {
  const [katexLoaded, setKatexLoaded] = useState(!!(window as any).katex);

  useEffect(() => {
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

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        const indentStyle = { paddingLeft: `${(block.indent || 0) * 16}px` };
        const alignClass =
          block.align === 'center' ? 'text-center'
            : block.align === 'right' ? 'text-right'
              : block.align === 'justify' ? 'text-justify' : 'text-left';
        const inline = { __html: renderInlineLatex(block.text || '') } as const;

        if (block.type === 'layout') {
          // R1 — fallback; R7 — không hỗ trợ layout lồng (slot render qua self-composition chỉ nhận block tĩnh)
          const lc = block.layoutContent;
          if (!lc || !lc.slots?.length) return <div key={block.id} />;
          return (
            <div
              key={block.id}
              className="w-full my-3 grid grid-cols-1 gap-3 md:[grid-template-columns:var(--layout-cols)]"
              style={{ '--layout-cols': lc.columns.map(c => `${c}fr`).join(' ') } as React.CSSProperties}
            >
              {lc.slots.map((slotBlocks, si) => (
                <div key={si} className="min-w-0">
                  <StudentBlockRenderer blocks={slotBlocks} />
                </div>
              ))}
            </div>
          );
        }
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h2 key={block.id} style={indentStyle} className={`text-2xl font-bold text-slate-900 tracking-tight mt-8 mb-4 leading-snug [&_b]:font-bold [&_strong]:font-bold ${alignClass}`} dangerouslySetInnerHTML={inline} />
            );
          }
          if (block.level === 2) {
            return (
              <h3 key={block.id} style={indentStyle} className={`text-lg font-bold text-slate-800 tracking-tight mt-6 mb-3 leading-snug [&_b]:font-bold [&_strong]:font-bold ${alignClass}`} dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text || '') }} />
            );
          }
          return (
            <h4 key={block.id} style={indentStyle} className={`text-base font-bold text-slate-700 mt-4 mb-2 leading-snug ${alignClass}`} dangerouslySetInnerHTML={{ __html: renderInlineLatex(block.text || '') }} />
          );
        }

        if (block.type === 'bullet-list') {
          return (
            <div key={block.id} style={indentStyle} className={`flex items-start gap-2.5 ${alignClass}`}>
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span className="flex-1 text-slate-800 text-base font-normal leading-[1.75] [&_b]:font-bold [&_strong]:font-bold" dangerouslySetInnerHTML={inline} />
            </div>
          );
        }

        if (block.type === 'numbered-list') {
          return (
            <div key={block.id} style={indentStyle} className={`flex items-start gap-2.5 ${alignClass}`}>
              <span className="text-primary font-bold mt-0.5 shrink-0 text-sm">{getNumberedIndex(blocks, idx)}</span>
              <span className="flex-1 text-slate-800 text-base font-normal leading-[1.75] [&_b]:font-bold [&_strong]:font-bold" dangerouslySetInnerHTML={inline} />
            </div>
          );
        }

        if (block.type === 'todo-list') {
          return (
            <div key={block.id} style={indentStyle} className={`flex items-start gap-2.5 ${alignClass}`}>
              <input type="checkbox" checked={!!block.checked} disabled className="w-4 h-4 mt-1 rounded border-slate-300 accent-primary pointer-events-none" />
              <span className={`flex-1 text-slate-800 text-base font-normal leading-[1.75] [&_b]:font-bold [&_strong]:font-bold ${block.checked ? 'line-through text-slate-400' : ''}`} dangerouslySetInnerHTML={inline} />
            </div>
          );
        }

        if (block.type === 'callout') {
          return (
            <div key={block.id} style={indentStyle} className="p-4 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-xl flex gap-2.5 items-center">
              <span className="text-base shrink-0">💡</span>
              <div className={`flex-1 leading-[1.75] text-slate-900 text-base font-normal [&_b]:font-bold [&_strong]:font-bold ${alignClass}`} dangerouslySetInnerHTML={inline} />
            </div>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={block.id} style={indentStyle} className={`border-l-4 border-primary/30 pl-4 italic text-slate-600 text-base font-normal leading-[1.75] my-3 [&_b]:font-bold [&_strong]:font-bold ${alignClass}`} dangerouslySetInnerHTML={inline} />
          );
        }

        if (block.type === 'divider') {
          return <hr key={block.id} className="border-t border-slate-200 my-4" />;
        }

        if (block.type === 'image') {
          const defaultSrc = 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500';
          // Suy dẫn giống ImageBlock: images nếu có, không thì [src] — block cũ 1 ảnh giữ nguyên layout
          const gallery: GalleryImage[] = block.images?.length
            ? block.images
            : block.src
              ? [{ src: block.src, caption: block.caption }]
              : [];
          if (gallery.length >= 2) {
            return (
              <div key={block.id} style={indentStyle} className={`w-full flex ${block.align === 'center' ? 'justify-center' : block.align === 'right' ? 'justify-end' : 'justify-start'} my-3`}>
                <div style={{ width: block.width || '100%' }} className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] max-w-full">
                  {gallery.map((img, gi) => (
                    <figure key={`${img.src}-${gi}`} className="min-w-0 flex flex-col gap-1">
                      <img src={img.src} alt={img.caption || 'Hình minh họa'} loading="lazy" className="w-full h-40 object-cover rounded-lg border border-slate-100 shadow-sm" />
                      {img.caption && (
                        <figcaption className="text-xs text-slate-500 font-medium text-center">
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={block.id} style={indentStyle} className={`w-full flex ${block.align === 'center' ? 'justify-center' : block.align === 'right' ? 'justify-end' : 'justify-start'} my-3`}>
              <div style={{ width: block.width || '100%' }} className="flex flex-col items-center gap-1.5 max-w-full">
                <img src={gallery[0]?.src || defaultSrc} alt={gallery[0]?.caption || 'Hình minh họa'} className="w-full h-auto rounded-lg object-contain shadow-sm border border-slate-100" />
                {gallery[0]?.caption && <span className="text-xs text-slate-500 font-medium">{gallery[0].caption}</span>}
              </div>
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={block.id} className="my-3 overflow-x-auto">
              <SharedTableRenderer block={block} isEditable={false} />
            </div>
          );
        }

        if (block.type === 'formula') {
          const latex = block.latex || '';
          const displayMode = block.display !== 'inline';
          const katex = (window as any).katex;
          let html = '';
          if (katexLoaded && katex) {
            try {
              html = katex.renderToString(latex || '\\text{Nhập công thức}', { displayMode, throwOnError: false });
            } catch {
              html = '';
            }
          }
          return (
            <div key={block.id} className={`my-4 overflow-x-auto select-all ${displayMode ? 'w-full flex justify-center' : 'inline-block'}`}>
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <code className="font-mono text-xs bg-slate-100 text-slate-600 rounded px-2.5 py-1">{latex || 'Công thức'}</code>
              )}
            </div>
          );
        }

        if (block.type === 'code') {
          const cc = block.codeContent;
          const lang = (cc?.language || block.language || 'typescript') as CodeLanguage;
          const code = cc?.code ?? block.text ?? '';
          const showNums = cc?.showLineNumbers ?? true;
          const wrap = cc?.wrapLine ?? false;
          const theme = cc?.theme ?? 'dark';
          return (
            <div key={block.id} className="my-3 select-text">
              <CodePreview code={code} language={lang} theme={theme} showLineNumbers={showNums} wrapLine={wrap} />
            </div>
          );
        }

        if (block.type === 'quiz') {
          return <QuizPreview key={block.id} block={block} indentStyle={indentStyle} />;
        }
        if (block.type === 'flashcard') {
          return <FlashcardPreview key={block.id} block={block} />;
        }
        if (block.type === 'mindmap') {
          return <MindmapPreview key={block.id} block={block} />;
        }
        if (block.type === 'timeline') {
          return <TimelinePreview key={block.id} block={block} />;
        }
        if (block.type === 'flow') {
          return <FlowPreview key={block.id} block={block} />;
        }
        if (block.type === 'tabs') {
          return <TabsPreview key={block.id} block={block} />;
        }
        if (block.type === 'compare' && block.compareContent) {
          return <ComparePreview key={block.id} content={block.compareContent} />;
        }
        if (block.type === 'diagram' && block.diagramContent) {
          return <DiagramPreview key={block.id} content={block.diagramContent} />;
        }
        if (block.type === 'matching' && block.matchingContent) {
          return <MatchingPreview key={block.id} content={block.matchingContent} />;
        }
        if (block.type === 'fillblank' && block.fillblankContent) {
          return <FillBlankPreview key={block.id} block={block} />;
        }
        if (block.type === 'dragdrop' && block.dragdropContent) {
          return <DragDropPreview key={block.id} block={block} />;
        }
        if (block.type === 'sortorder' && block.sortorderContent) {
          return <SortOrderPreview key={block.id} block={block} />;
        }

        if (block.type === 'media') {
          const mediaContent = block.content || {};
          const videoUrl = mediaContent.url || block.url;
          const sourceType = mediaContent.sourceType || block.sourceType || 'upload';
          const caption = mediaContent.caption || block.caption;
          return (
            <div key={block.id} style={indentStyle} className="w-full max-w-lg mx-auto my-3 flex flex-col gap-1.5">
              {videoUrl ? (
                <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shadow-sm">
                  {sourceType === 'upload' ? (
                    <video src={videoUrl} controls className="w-full h-full object-contain rounded-lg shadow-sm" />
                  ) : (
                    <iframe src={videoUrl} className="w-full h-full aspect-video rounded-lg shadow-sm border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Embedded Video" />
                  )}
                </div>
              ) : (
                <div className="aspect-video w-full max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-4 relative border border-slate-800">
                  <Video size={22} className="text-white/70 mb-2" />
                  <span className="text-[10px] text-white/80 font-bold">Chưa có phương tiện video</span>
                </div>
              )}
              {caption && <p className="text-center text-xs text-slate-500 italic mt-1">{caption}</p>}
            </div>
          );
        }

        // paragraph + fallback
        return (
          <p key={block.id} style={indentStyle} className={`text-slate-800 text-base font-normal leading-[1.75] [&_b]:font-bold [&_strong]:font-bold ${alignClass}`} dangerouslySetInnerHTML={inline} />
        );
      })}
    </div>
  );
};
