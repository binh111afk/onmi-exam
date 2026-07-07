import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ToggleLeft, HelpCircle } from 'lucide-react';
import { BlockWrapperContext } from '../BlockWrapper';
import type { DocBlock } from '../../../../types/doc-editor';

interface FormulaBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent<any>) => void;
}

const GREEK_LETTERS = [
  { label: 'alpha (α)', value: '\\alpha' },
  { label: 'beta (β)', value: '\\beta' },
  { label: 'gamma (γ)', value: '\\gamma' },
  { label: 'pi (π)', value: '\\pi' },
  { label: 'theta (θ)', value: '\\theta' },
  { label: 'omega (ω)', value: '\\omega' },
  { label: 'Delta (Δ)', value: '\\Delta' },
  { label: 'sigma (σ)', value: '\\sigma' },
  { label: 'mu (μ)', value: '\\mu' },
  { label: 'lambda (λ)', value: '\\lambda' },
];

const COMMON_SYMBOLS = [
  { label: 'Cộng trừ (±)', value: '\\pm' },
  { label: 'Nhân (×)', value: '\\times' },
  { label: 'Chia (÷)', value: '\\div' },
  { label: 'Khác (≠)', value: '\\neq' },
  { label: 'Xấp xỉ (≈)', value: '\\approx' },
  { label: 'Nhỏ hơn hoặc bằng (≤)', value: '\\le' },
  { label: 'Lớn hơn hoặc bằng (≥)', value: '\\ge' },
  { label: 'Vô hạn (∞)', value: '\\infty' },
  { label: 'Đạo hàm riêng (∂)', value: '\\partial' },
  { label: 'Tích phân (∫)', value: '\\int' },
  { label: 'Tổng Sigma (∑)', value: '\\sum' },
  { label: 'Mũi tên phải (→)', value: '\\rightarrow' },
];

const FORMULA_CATEGORIES = [
  {
    id: 'fraction',
    name: 'Phân số',
    items: [
      { label: 'Phân số thường', previewLatex: '\\frac{a}{b}', value: '\\frac{a}{b}' },
    ],
  },
  {
    id: 'root',
    name: 'Căn',
    items: [
      { label: 'Căn bậc hai', previewLatex: '\\sqrt{x}', value: '\\sqrt{x}' },
      { label: 'Căn bậc n', previewLatex: '\\sqrt[n]{x}', value: '\\sqrt[n]{x}' },
    ],
  },
  {
    id: 'power',
    name: 'Lũy thừa',
    items: [
      { label: 'Mũ 2', previewLatex: 'x^2', value: 'x^2' },
      { label: 'Mũ n', previewLatex: 'a^n', value: 'a^n' },
    ],
  },
  {
    id: 'subscript',
    name: 'Chỉ số dưới',
    items: [
      { label: 'Chỉ số i', previewLatex: 'x_i', value: 'x_i' },
      { label: 'Chỉ số ij', previewLatex: 'a_{ij}', value: 'a_{ij}' },
    ],
  },
  {
    id: 'greek',
    name: 'Ký hiệu Hy Lạp',
    items: GREEK_LETTERS.map(g => ({ label: g.label, previewLatex: g.value, value: g.value })),
  },
  {
    id: 'symbols',
    name: 'Ký hiệu',
    items: COMMON_SYMBOLS.map(s => ({ label: s.label, previewLatex: s.value, value: s.value })),
  },
  {
    id: 'matrix',
    name: 'Ma trận',
    items: [
      { label: 'Ma trận 2x2', previewLatex: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', value: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}' },
    ],
  },
  {
    id: 'integral',
    name: 'Tích phân',
    items: [
      { label: 'Tích phân bất định', previewLatex: '\\int f(x) dx', value: '\\int f(x) dx' },
      { label: 'Tích phân xác định', previewLatex: '\\int_a^b f(x) dx', value: '\\int_a^b f(x) dx' },
    ],
  },
  {
    id: 'sigma',
    name: 'Tổng Sigma',
    items: [
      { label: 'Tổng thông thường', previewLatex: '\\sum x_i', value: '\\sum x_i' },
      { label: 'Tổng có giới hạn', previewLatex: '\\sum_{i=1}^n x_i', value: '\\sum_{i=1}^n x_i' },
    ],
  },
  {
    id: 'limit',
    name: 'Giới hạn',
    items: [
      { label: 'Dần tới x0', previewLatex: '\\lim_{x \\to x_0} f(x)', value: '\\lim_{x \\to x_0} f(x)' },
      { label: 'Dần tới vô cực', previewLatex: '\\lim_{x \\to \\infty} f(x)', value: '\\lim_{x \\to \\infty} f(x)' },
    ],
  },
  {
    id: 'derivative',
    name: 'Đạo hàm',
    items: [
      { label: 'Đạo hàm bậc nhất', previewLatex: '\\frac{df}{dx}', value: '\\frac{df}{dx}' },
      { label: 'Đạo hàm f\'(x)', previewLatex: 'f\'(x)', value: 'f\'(x)' },
    ],
  },
];

const getSnippetSelection = (template: string): { selOffset: number; selLen: number } => {
  if (template.includes('\\frac{a}{b}')) {
    return { selOffset: template.indexOf('\\frac{a}{b}') + 6, selLen: 1 };
  }
  if (template.includes('\\sqrt{x}')) {
    return { selOffset: template.indexOf('\\sqrt{x}') + 6, selLen: 1 };
  }
  if (template.includes('\\sqrt[n]{x}')) {
    return { selOffset: template.indexOf('\\sqrt[n]{x}') + 6, selLen: 1 };
  }
  if (template.includes('x^2')) {
    return { selOffset: template.indexOf('x^2') + 2, selLen: 1 };
  }
  if (template.includes('a^n')) {
    return { selOffset: template.indexOf('a^n') + 2, selLen: 1 };
  }
  if (template.includes('x_i')) {
    return { selOffset: template.indexOf('x_i') + 2, selLen: 1 };
  }
  if (template.includes('a_{ij}')) {
    return { selOffset: template.indexOf('a_{ij}') + 3, selLen: 2 };
  }
  if (template.includes('\\begin{matrix}')) {
    return { selOffset: template.indexOf('\\begin{matrix}') + 15, selLen: 1 };
  }
  if (template.includes('\\int_a^b')) {
    return { selOffset: template.indexOf('\\int_a^b') + 5, selLen: 1 };
  }
  if (template.includes('\\int f(x) dx')) {
    return { selOffset: template.indexOf('\\int f(x) dx') + 5, selLen: 4 };
  }
  if (template.includes('\\sum_{i=1}^n')) {
    return { selOffset: template.indexOf('\\sum_{i=1}^n') + 6, selLen: 3 };
  }
  if (template.includes('\\sum x_i')) {
    return { selOffset: template.indexOf('\\sum x_i') + 5, selLen: 3 };
  }
  if (template.includes('\\lim_{x \\to x_0}')) {
    return { selOffset: template.indexOf('\\lim_{x \\to x_0}') + 5, selLen: 10 };
  }
  if (template.includes('\\lim_{x \\to \\infty}')) {
    return { selOffset: template.indexOf('\\lim_{x \\to \\infty}') + 5, selLen: 11 };
  }
  if (template.includes('\\frac{df}{dx}')) {
    return { selOffset: template.indexOf('\\frac{df}{dx}') + 6, selLen: 2 };
  }
  if (template.includes('f\'(x)')) {
    return { selOffset: template.indexOf('f\'(x)') + 3, selLen: 1 };
  }

  return { selOffset: template.length, selLen: 0 };
};

export const FormulaBlockComponent: React.FC<FormulaBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
  handleKeyDown,
}) => {
  const wrapperContext = useContext(BlockWrapperContext);
  const [katexLoaded, setKatexLoaded] = useState(!!(window as any).katex);
  const [showPicker, setShowPicker] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [pickerCoords, setPickerCoords] = useState<{
    top: number;
    left: number;
    maxHeight: string;
  }>({ top: 0, left: 0, maxHeight: 'none' });

  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load KaTeX Assets dynamically if not already present
  useEffect(() => {
    if ((window as any).katex) {
      setKatexLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
    script.onload = () => setKatexLoaded(true);
    document.body.appendChild(script);
  }, []);

  const latex = block.latex || '';
  const displayMode = block.display !== 'inline'; // default is block mode

  // Render LaTeX using window.katex
  let html = '';
  let errorMsg = '';
  const katex = (window as any).katex;

  if (katexLoaded && katex) {
    try {
      html = katex.renderToString(latex || '\\text{Formula Block}', {
        displayMode,
        throwOnError: true,
      });
    } catch (err: any) {
      errorMsg = err.message || 'Lỗi cú pháp LaTeX';
      try {
        html = katex.renderToString(latex || '\\text{Formula Block}', {
          displayMode,
          throwOnError: false,
        });
      } catch {
        html = '';
      }
    }
  }

  // Helper to render KaTeX snippets inside picker buttons
  const renderPresetHtml = (latexStr: string) => {
    if (katexLoaded && katex) {
      try {
        return katex.renderToString(latexStr, { displayMode: false, throwOnError: false });
      } catch {
        return '';
      }
    }
    return '';
  };

  // Insert formula helper
  const insertAtCursor = useCallback((template: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart ?? 0;
    const end = inputRef.current.selectionEnd ?? 0;
    const currentText = block.latex || '';
    
    // Replace the selection or insert at cursor
    const newText = currentText.substring(0, start) + template + currentText.substring(end);
    
    // Save state instantly and trigger single non-debounced history push
    onUpdateBlock(idx, { ...block, latex: newText }, false);

    // Calculate caret selection ranges inside the inserted template
    const { selOffset, selLen } = getSnippetSelection(template);
    const targetStart = start + selOffset;
    const targetEnd = targetStart + selLen;

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(targetStart, targetEnd);
      }
    }, 50);
  }, [block, idx, onUpdateBlock]);

  const toggleDisplayMode = useCallback(() => {
    onUpdateBlock(idx, { ...block, display: displayMode ? 'inline' : 'block' }, false);
  }, [block, idx, displayMode, onUpdateBlock]);

  const calculatePickerPosition = useCallback(() => {
    const btnEl = buttonRef.current;
    if (!btnEl) return;
    const rect = btnEl.getBoundingClientRect();
    const popupWidth = 280;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    let targetTop = rect.bottom + 4;
    let targetLeft = rect.left;
    let computedMaxHeight = 'none';

    // Clamp horizontally to viewport bounds
    targetLeft = Math.max(8, Math.min(viewportWidth - popupWidth - 8, targetLeft));

    if (spaceBelow >= 320) {
      targetTop = rect.bottom + 4;
      computedMaxHeight = `${Math.min(400, spaceBelow)}px`;
    } else if (spaceAbove >= 320) {
      const height = Math.min(400, spaceAbove);
      targetTop = rect.top - height - 4;
      computedMaxHeight = `${height}px`;
    } else {
      if (spaceBelow >= spaceAbove) {
        targetTop = rect.bottom + 4;
        computedMaxHeight = `${spaceBelow}px`;
      } else {
        targetTop = 12;
        computedMaxHeight = `${spaceAbove}px`;
      }
    }

    setPickerCoords({
      top: targetTop,
      left: targetLeft,
      maxHeight: computedMaxHeight,
    });
  }, []);

  const handleTogglePicker = useCallback(() => {
    if (showPicker) {
      setShowPicker(false);
    } else {
      calculatePickerPosition();
      setShowPicker(true);
    }
  }, [showPicker, calculatePickerPosition]);

  // Register custom actions to the BlockWrapper
  useEffect(() => {
    if (wrapperContext && isActive) {
      wrapperContext.registerCustomActions([
        {
          label: 'Chế độ hiển thị',
          icon: <ToggleLeft size={13} className="text-slate-400" />,
          onTrigger: toggleDisplayMode
        },
        {
          label: 'Chèn công thức ▼',
          icon: <HelpCircle size={13} className="text-slate-400" />,
          onTrigger: handleTogglePicker,
          ref: buttonRef
        }
      ]);
    }
  }, [wrapperContext, isActive, toggleDisplayMode, handleTogglePicker]);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        popupRef.current && !popupRef.current.contains(target) &&
        (!buttonRef.current || !buttonRef.current.contains(target))
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPicker]);

  // Keyboard navigation overrides
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textLen = (block.latex || '').length;
    const selectionStart = inputRef.current?.selectionStart ?? 0;
    const selectionEnd = inputRef.current?.selectionEnd ?? 0;

    if (e.key === 'ArrowUp' && selectionStart === 0) {
      handleKeyDown(e);
    }
    else if (e.key === 'ArrowDown' && selectionEnd === textLen) {
      handleKeyDown(e);
    }
    else if (e.key === 'Backspace' && selectionStart === 0 && selectionEnd === 0) {
      handleKeyDown(e);
    }
    else if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      handleKeyDown(e);
    }
  };

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 flex flex-col w-full"
    >
      {isActive && (
        <div className="flex flex-col gap-2 relative">
          {/* LaTeX editor area */}
          <textarea
            ref={inputRef}
            id={`block-editor-${idx}`}
            value={latex}
            onKeyDown={handleInputKeyDown}
            onChange={(e) => onUpdateBlock(idx, { ...block, latex: e.target.value }, true)}
            placeholder="Ví dụ: \frac{a}{b}, \sqrt{x}, \int_0^1 x^2 dx, \sum_{i=1}^{n}"
            className="w-full min-h-16 text-[10px] bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-mono text-slate-700 focus:ring-1 focus:ring-primary focus:border-primary resize-y"
          />

          <div className="text-[7.5px] text-slate-400 font-extrabold uppercase mt-1 select-none tracking-wider">
            Xem trước công thức:
          </div>
        </div>
      )}

      {/* Rendered output */}
      <div className={`py-2 overflow-x-auto ${displayMode ? 'w-full flex flex-col items-center justify-center' : 'inline-block'}`}>
        {html ? (
          <div
            className="select-all"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <code className="font-mono text-[9px] bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5 select-text">
            {latex || '\\text{Formula Block}'}
          </code>
        )}

        {/* LaTeX syntax errors display */}
        {isActive && errorMsg && (
          <div className="mt-1 text-[8px] text-rose-500 font-bold bg-rose-50/50 border border-rose-100 rounded-lg px-2.5 py-1">
            Lỗi cú pháp LaTeX: {errorMsg}
          </div>
        )}
      </div>

      {/* Formula Snippet Picker Popover */}
      {showPicker && isActive && createPortal(
        <div
          ref={popupRef}
          className="fixed w-[280px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-2 flex flex-col gap-1 overflow-y-auto select-none"
          style={{
            top: `${pickerCoords.top}px`,
            left: `${pickerCoords.left}px`,
            maxHeight: pickerCoords.maxHeight,
          }}
        >
          <div className="flex flex-col gap-1 select-none">
            {FORMULA_CATEGORIES.map(cat => {
              const isExpanded = expandedCategory === cat.id;
              return (
                <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setExpandedCategory(isExpanded ? null : cat.id);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[9.5px] font-bold text-slate-700 transition cursor-pointer hover:bg-slate-50/80 ${isExpanded ? 'bg-indigo-50/40 text-indigo-700 border-b border-slate-100' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown size={11} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="p-2 bg-white grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                      {cat.items.map(item => {
                        const itemHtml = renderPresetHtml(item.previewLatex);
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertAtCursor(item.value);
                              setShowPicker(false);
                            }}
                            className="p-1.5 border border-slate-150 bg-slate-50/30 hover:bg-indigo-50/40 hover:border-indigo-200 rounded-lg flex flex-col items-center justify-center text-center text-slate-700 transition cursor-pointer max-w-full overflow-hidden"
                          >
                            {itemHtml ? (
                              <div dangerouslySetInnerHTML={{ __html: itemHtml }} className="scale-[0.85] leading-none shrink-0" />
                            ) : (
                              <code className="font-mono text-[8px] truncate">{item.previewLatex}</code>
                            )}
                            <span className="text-[7px] text-slate-400 font-bold mt-1 truncate w-full">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const FormulaBlock = React.memo(FormulaBlockComponent);
