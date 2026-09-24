import React from 'react';

// ── INLINE MARKDOWN renderer (bold / italic / highlight / inline formula) ──
export const renderInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;

  // Simple replacements for display — no external dep needed
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/==(.+?)==/g, '<mark class="bg-yellow-100 rounded px-0.5">$1</mark>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 rounded px-1 font-mono text-[10px]">$1</code>');

  // ── STEP 1: Render block LaTeX $$...$$ FIRST (display mode)
  // IMPORTANT: Must run BEFORE the inline $...$ pass so double-dollar delimiters
  // are not partially consumed by the single-dollar regex.
  // We still use displayMode:false here because this function always renders
  // into an inline context (<p><span dangerouslySetInnerHTML>). Using
  // displayMode:true produces block-level KaTeX HTML which violates DOM nesting
  // rules inside <p> and causes React to crash.
  html = html.replace(/\$\$([^$]+?)\$\$/g, (_, latex) => {
    const katex = (window as any).katex;
    if (katex) {
      try {
        return `<span class="katex-block-inline">${katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false })}</span>`;
      } catch (e) {
        return `<code class="bg-purple-50 text-purple-700 rounded px-1 font-mono text-[10px]">${latex}</code>`;
      }
    }
    return `<code class="bg-purple-50 text-purple-700 rounded px-1 font-mono text-[10px]">${latex}</code>`;
  });

  // ── STEP 2: Render inline LaTeX $...$ (must run AFTER the $$ pass above)
  html = html.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
    const katex = (window as any).katex;
    if (katex) {
      try {
        return katex.renderToString(latex, { displayMode: false, throwOnError: false });
      } catch (e) {
        return `<code class="bg-purple-50 text-purple-700 rounded px-1 font-mono text-[10px]">${latex}</code>`;
      }
    }
    return `<code class="bg-purple-50 text-purple-700 rounded px-1 font-mono text-[10px]">${latex}</code>`;
  });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export const getImageSizeClass = (size?: string): string => {
  const sizeMap: Record<string, string> = {
    small: 'w-full max-w-xs mx-auto',
    medium: 'w-full max-w-xl mx-auto',
    full: 'w-full max-w-full',
  };

  return sizeMap[size ?? 'medium'] ?? sizeMap.medium;
};

export const getImageStyle = (image: any, fallback?: React.CSSProperties): React.CSSProperties | undefined => {
  if (image?.size) return undefined;
  if (image?.width) return { maxWidth: image.width };
  return fallback;
};

export const getImageGroupLayoutClass = (layout?: string): string => {
  const layoutMap: Record<string, string> = {
    horizontal: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    vertical: 'flex flex-col gap-4',
    'grid-2x2': 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  };

  return layoutMap[layout ?? 'vertical'] ?? layoutMap.vertical;
};

export const getFillBlankUnits = (block: any): string[] => {
  if (Array.isArray(block.blankUnits)) return block.blankUnits;
  if (Array.isArray(block.units)) return block.units;
  if (typeof block.unit === 'string') return [block.unit];
  return [];
};

export const getBlankCount = (block: any): number => {
  const tokens = String(block.question ?? '').match(/\[blank-\d+\]/g) ?? [];
  const answerCount = Array.isArray(block.answer) ? block.answer.length : 0;
  return Math.max(tokens.length, answerCount, 1);
};
