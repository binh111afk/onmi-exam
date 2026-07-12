import React, { useEffect, useMemo, useState } from 'react';

declare global {
  interface Window {
    katex?: {
      renderToString: (input: string, options: { displayMode: boolean; throwOnError: boolean }) => string;
    };
  }
}

let katexLoadPromise: Promise<void> | null = null;

const ensureKatexLoaded = () => {
  if (window.katex) return Promise.resolve();
  if (katexLoadPromise) return katexLoadPromise;

  katexLoadPromise = new Promise<void>((resolve) => {
    if (!document.querySelector('link[data-onmi-katex="true"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      link.dataset.onmiKatex = 'true';
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[data-onmi-katex="true"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.dataset.onmiKatex = 'true';
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.body.appendChild(script);
      return;
    }

    resolve();
  });

  return katexLoadPromise;
};

export const containsLatexDelimiter = (value: string) => /\${1,2}[\s\S]+?\${1,2}/.test(value);

interface LatexTextProps {
  value: string;
}

export const LatexText: React.FC<LatexTextProps> = ({ value }) => {
  const [isKatexReady, setIsKatexReady] = useState(Boolean(window.katex));

  useEffect(() => {
    let mounted = true;
    ensureKatexLoaded().then(() => {
      if (mounted) setIsKatexReady(Boolean(window.katex));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const parts = useMemo(() => {
    const tokens: Array<{ type: 'text' | 'latex'; value: string; displayMode?: boolean }> = [];
    const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(value)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', value: value.slice(lastIndex, match.index) });
      }

      const token = match[0];
      const displayMode = token.startsWith('$$');
      tokens.push({
        type: 'latex',
        value: displayMode ? token.slice(2, -2) : token.slice(1, -1),
        displayMode,
      });
      lastIndex = match.index + token.length;
    }

    if (lastIndex < value.length) {
      tokens.push({ type: 'text', value: value.slice(lastIndex) });
    }

    return tokens.length > 0 ? tokens : [{ type: 'text' as const, value }];
  }, [value]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <React.Fragment key={index}>{part.value}</React.Fragment>;
        }

        if (!isKatexReady || !window.katex) {
          return <React.Fragment key={index}>{part.displayMode ? `$$${part.value}$$` : `$${part.value}$`}</React.Fragment>;
        }

        const html = window.katex.renderToString(part.value, {
          displayMode: Boolean(part.displayMode),
          throwOnError: false,
        });

        return (
          <span
            key={index}
            className={part.displayMode ? 'block my-1 overflow-x-auto' : 'inline-block align-middle'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </>
  );
};
