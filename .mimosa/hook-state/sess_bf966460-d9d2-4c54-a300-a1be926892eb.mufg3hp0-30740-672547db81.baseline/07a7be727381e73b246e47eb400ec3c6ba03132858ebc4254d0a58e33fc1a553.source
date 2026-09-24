import React, { useRef, useEffect, useCallback } from 'react';
import type { BlankItem } from '../Types';

interface ParagraphEditorProps {
  paragraphId: string;
  html: string;
  onUpdateParagraph: (html: string, newBlanks?: BlankItem[]) => void;
}

function getCaretCharacterOffsetWithin(element: HTMLElement) {
  let caretOffset = 0;
  const doc = element.ownerDocument || document;
  const win = doc.defaultView || window;
  const sel = win.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
}

function setCaretCharacterOffsetWithin(element: HTMLElement, offset: number) {
  const doc = element.ownerDocument || document;
  const win = doc.defaultView || window;
  const sel = win.getSelection();
  if (!sel) return;

  const range = doc.createRange();
  range.selectNodeContents(element);
  
  let currentOffset = 0;
  const nodeQueue: Node[] = [element];
  let found = false;

  while (nodeQueue.length > 0) {
    const node = nodeQueue.shift()!;
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length || 0;
      if (currentOffset + len >= offset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        found = true;
        break;
      }
      currentOffset += len;
    } else {
      const children = Array.from(node.childNodes);
      nodeQueue.push(...children);
    }
  }

  if (found) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export const ParagraphEditorComponent: React.FC<ParagraphEditorProps> = ({
  paragraphId,
  html,
  onUpdateParagraph,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastCommittedHtmlRef = useRef<string>('');
  const isComposingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state from parent (e.g. Undo/Redo)
  useEffect(() => {
    if (!ref.current) return;
    if (html === lastCommittedHtmlRef.current) return;

    // If a blank chip (child) is currently focused, do NOT reset innerHTML —
    // that would destroy focus and trap the cursor inside the span.
    // Just acknowledge the new html so the next unfocused sync is correct.
    const isChildFocused = ref.current.contains(document.activeElement) && document.activeElement !== ref.current;
    if (isChildFocused) {
      lastCommittedHtmlRef.current = html;
      return;
    }

    const isFocused = document.activeElement === ref.current;
    let caretOffset = 0;
    if (isFocused) {
      caretOffset = getCaretCharacterOffsetWithin(ref.current);
    }

    ref.current.innerHTML = html;
    lastCommittedHtmlRef.current = html;

    if (isFocused) {
      setCaretCharacterOffsetWithin(ref.current, caretOffset);
    }
  }, [html]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const triggerChange = useCallback(() => {
    if (isComposingRef.current) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (ref.current) {
        const html = ref.current.innerHTML;
        lastCommittedHtmlRef.current = html;
        onUpdateParagraph(html);
      }
    }, 400);
  }, [onUpdateParagraph]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. If user typed inside a blank chip
    if (target.classList.contains('fillblank-inline')) {
      const blankId = target.dataset.blankId;
      if (blankId) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          if (ref.current) {
            const htmlVal = ref.current.innerHTML;
            lastCommittedHtmlRef.current = htmlVal;
            onUpdateParagraph(htmlVal);
          }
        }, 300);
      }
      return;
    }

    // 2. Standard paragraph input
    triggerChange();
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // If a blank chip is blurred, lock it again
    if (target.classList.contains('fillblank-inline')) {
      target.setAttribute('contenteditable', 'false');
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (ref.current) {
      const html = ref.current.innerHTML;
      lastCommittedHtmlRef.current = html;
      onUpdateParagraph(html);
    }
  };

  // Keyboard navigation & Delete confirmation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('fillblank-inline')) {
      e.stopPropagation(); // prevent block keydowns

      const blankSpans = Array.from(e.currentTarget.querySelectorAll('.fillblank-inline')) as HTMLElement[];
      const currentIndex = blankSpans.indexOf(target);

      if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex >= 0 && nextIndex < blankSpans.length) {
          const nextSpan = blankSpans[nextIndex];
          nextSpan.setAttribute('contenteditable', 'true');
          nextSpan.focus();
          
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(nextSpan);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        target.blur();
        ref.current?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        target.blur();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // Accidental delete protection
        if (target.textContent === '') {
          e.preventDefault();
          if (window.confirm('Bạn có chắc chắn muốn xóa ô trống này không?')) {
            target.remove();
            if (ref.current) {
              const html = ref.current.innerHTML;
              lastCommittedHtmlRef.current = html;
              onUpdateParagraph(html);
            }
          }
        }
      }
    }
  };

  // Click & Double click toggling
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const span = target.closest('.fillblank-inline') as HTMLElement;
    if (span) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const span = target.closest('.fillblank-inline') as HTMLElement;
    if (span) {
      e.preventDefault();
      e.stopPropagation();
      // Double click: Edit inline chip answer
      span.setAttribute('contenteditable', 'true');
      span.focus();
      
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Intercept Paste for clean HTML & UUID collision generation
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    let contentToInsert = '';
    const newBlanksToRegister: BlankItem[] = [];

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const body = doc.body;

      const pastedSpans = body.querySelectorAll('.fillblank-inline');
      pastedSpans.forEach((span) => {
        const s = span as HTMLElement;
        let config: BlankItem | null = null;
        
        try {
          if (s.dataset.blankConfig) {
            config = JSON.parse(s.dataset.blankConfig);
          }
        } catch (err) {
          console.error('Failed to parse pasted blank config', err);
        }

        // Always generate a new unique blank ID to prevent collisions on paste
        const finalId = `fb-${crypto.randomUUID().slice(0, 8)}`;
        s.dataset.blankId = finalId;
        s.setAttribute('contenteditable', 'false');

        const newBlank: BlankItem = {
          id: finalId,
          answer: s.textContent || config?.answer || 'Chỗ trống',
          caseSensitive: config?.caseSensitive ?? false,
          hint: config?.hint ?? '',
          score: config?.score ?? 1,
          alternativeAnswers: config?.alternativeAnswers ?? [],
          width: config?.width ?? 120,
          placeholder: config?.placeholder ?? 'Nhập...'
        };

        s.dataset.blankConfig = JSON.stringify(newBlank);
        newBlanksToRegister.push(newBlank);
      });

      contentToInsert = body.innerHTML;
    } else if (text) {
      const tempDiv = document.createElement('div');
      tempDiv.textContent = text;
      contentToInsert = tempDiv.innerHTML;
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const fragment = range.createContextualFragment(contentToInsert);
      const lastNode = fragment.lastChild;
      range.insertNode(fragment);
      
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    if (ref.current) {
      const htmlContent = ref.current.innerHTML;
      lastCommittedHtmlRef.current = htmlContent;
      onUpdateParagraph(htmlContent, newBlanksToRegister);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    triggerChange();
  };

  return (
    <div
      ref={el => { ref.current = el; }}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      data-placeholder="Nhập câu văn bản tại đây, chọn từ và nhấn 'Chèn ô trống'..."
      data-paragraph-id={paragraphId}
      className={`flex-1 min-h-[32px] bg-white border border-slate-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 outline-none rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 transition relative ${html.trim() === '' ? 'before:content-[attr(data-placeholder)] before:text-slate-300 before:absolute before:left-3 before:top-2 before:pointer-events-none' : ''}`}
    />
  );
};

export const ParagraphEditor = React.memo(ParagraphEditorComponent);
