import { useCallback, useRef } from 'react';

export const useEditorFormatting = ({
  activeBlockIndex,
  updateBlockText,
}: {
  activeBlockIndex: number;
  updateBlockText: (index: number, newHtml: string) => void;
}) => {
  const syncFormattingRef = useRef<(() => void) | null>(null);
  const pendingFontSizeRef = useRef<string>('16');

  const rgbToHex = (colorVal: string): string => {
    if (!colorVal) return '#1F2C3F';
    const val = colorVal.trim().toLowerCase();
    if (val.startsWith('#')) return val.toUpperCase();
    if (val === 'transparent' || val === 'rgba(0, 0, 0, 0)' || val === 'rgba(0,0,0,0)') return 'transparent';

    const match = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    if (!match) return colorVal;

    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`.toUpperCase();
  };

  const executeFormat = useCallback((command: string, value: string = '') => {
    document.execCommand(command, false, value);
    const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
    if (activeEl) {
      updateBlockText(activeBlockIndex, activeEl.innerHTML);
    }
    syncFormattingRef.current?.();
  }, [activeBlockIndex, updateBlockText]);

  const handleColorChange = useCallback((color: string) => {
    let activeColor = document.queryCommandValue('foreColor') || '#1F2C3F';
    activeColor = rgbToHex(activeColor);
    const targetColor = activeColor === rgbToHex(color) ? '#1F2C3F' : color;
    executeFormat('foreColor', targetColor);
  }, [executeFormat]);

  const handleHighlightChange = useCallback((color: string) => {
    let activeHighlight = document.queryCommandValue('backColor') || 'transparent';
    activeHighlight = rgbToHex(activeHighlight);
    const targetHighlight = activeHighlight === rgbToHex(color) ? 'transparent' : color;
    executeFormat('backColor', targetHighlight);
  }, [executeFormat]);

  const applyFontSize = useCallback((size: string) => {
    pendingFontSizeRef.current = size;

    const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
    if (activeEl) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed && activeEl.contains(selection.anchorNode) && activeEl.contains(selection.focusNode)) {
        const range = selection.getRangeAt(0);
        const fragment = range.extractContents();
        fragment.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
          element.style.fontSize = '';
          if (!element.getAttribute('style')) {
            element.removeAttribute('style');
          }
        });
        fragment.querySelectorAll('font[size]').forEach((font) => {
          font.removeAttribute('size');
        });
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.appendChild(fragment);
        range.insertNode(span);
        selection.removeAllRanges();
        const nextRange = document.createRange();
        nextRange.selectNodeContents(span);
        selection.addRange(nextRange);
      } else {
        document.execCommand('fontSize', false, '7');
        const fonts = activeEl.querySelectorAll('font[size="7"]');
        fonts.forEach(font => {
          const span = document.createElement('span');
          span.style.fontSize = `${size}px`;
          span.innerHTML = font.innerHTML;
          font.parentNode?.replaceChild(span, font);
        });
      }
      updateBlockText(activeBlockIndex, activeEl.innerHTML);
    }
    syncFormattingRef.current?.();
  }, [activeBlockIndex, updateBlockText]);

  return {
    executeFormat,
    handleColorChange,
    handleHighlightChange,
    applyFontSize,
    syncFormattingRef,
    pendingFontSizeRef,
  };
};
