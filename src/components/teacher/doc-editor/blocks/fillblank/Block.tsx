import React, { useState, useCallback, useEffect } from 'react';
import { Type, Trash2, Edit3 } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { useFillBlank } from './hooks/useFillBlank';
import { Toolbar } from './Toolbar';
import { ParagraphEditor } from './components/ParagraphEditor';
import type { BlankItem } from './Types';

interface BlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const FillBlankBlockComponent: React.FC<BlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    content,
    paragraphs,
    blanks,
    settings,
    addParagraph,
    updateBlank,
    updateSettings,
  } = useFillBlank(block, idx, onUpdateBlock);

  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);
  // Local raw text for alternative answers input — allows typing spaces freely.
  // Only parsed into array model on blur.
  const [altAnswersText, setAltAnswersText] = useState('');

  // Sync paragraph text content with bottom config panel updates
  useEffect(() => {
    let changed = false;
    const nextParagraphs = paragraphs.map((p) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = p.text;
      const spans = tempDiv.querySelectorAll('.fillblank-inline');
      let pChanged = false;
      spans.forEach((span) => {
        const s = span as HTMLElement;
        const bId = s.dataset.blankId || '';
        const blank = blanks[bId];
        if (blank) {
          if (s.textContent !== blank.answer) {
            s.textContent = blank.answer;
            pChanged = true;
          }
          const configStr = JSON.stringify(blank);
          if (s.dataset.blankConfig !== configStr) {
            s.dataset.blankConfig = configStr;
            pChanged = true;
          }
        }
      });
      if (pChanged) {
        changed = true;
        return { ...p, text: tempDiv.innerHTML };
      }
      return p;
    });

    if (changed) {
      onUpdateBlock(idx, {
        ...block,
        fillblankContent: {
          ...content,
          paragraphs: nextParagraphs
        }
      });
    }
  }, [blanks, paragraphs, content, block, idx, onUpdateBlock]);

  // Sync altAnswersText whenever the active blank changes
  useEffect(() => {
    const b = activeBlankId ? blanks[activeBlankId] : null;
    setAltAnswersText((b?.alternativeAnswers || []).join(', '));
  }, [activeBlankId, blanks]);

  // Intercept click on blank spans to open the configuration panel
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const span = target.closest('.fillblank-inline') as HTMLElement;
    if (span) {
      const blankId = span.dataset.blankId || '';
      if (blanks[blankId]) {
        setActiveBlankId(blankId);
      }
    }
  };

  // Function to insert a blank at the current cursor selection
  const handleInsertBlank = useCallback(() => {
    setActiveBlockIndex(idx);
    const blankId = `fb-${crypto.randomUUID().slice(0, 8)}`;
    const newBlank: BlankItem = {
      id: blankId,
      answer: '',
      caseSensitive: false,
      hint: '',
      score: 1,
      alternativeAnswers: [],
      width: 120,
      placeholder: 'Nhập...'
    };

    const selection = window.getSelection();
    let updatedParagraphs = [...paragraphs];
    let isInsideOurEditor = false;
    let paragraphId = '';

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let container = range.commonAncestorContainer as HTMLElement;

      let cur: HTMLElement | null = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
      while (cur) {
        if (cur.dataset && cur.dataset.paragraphId) {
          isInsideOurEditor = true;
          paragraphId = cur.dataset.paragraphId;
          break;
        }
        cur = cur.parentElement;
      }

      if (isInsideOurEditor && paragraphId) {
        const span = document.createElement('span');
        const themeColor = settings.themeColor || '#8B5CF6';
        
        span.className = 'fillblank-inline inline-block mx-1 px-2.5 py-0.5 border border-purple-300 bg-purple-50 text-purple-700 font-bold rounded-lg cursor-pointer empty:before:content-[attr(placeholder)] empty:before:text-slate-350 empty:before:pointer-events-none';
        span.style.borderColor = `${themeColor}60`;
        span.style.backgroundColor = `${themeColor}10`;
        span.style.color = themeColor;
        span.dataset.blankId = blankId;
        span.dataset.blankConfig = JSON.stringify(newBlank);
        span.setAttribute('placeholder', 'Nhập đáp án...');
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('aria-label', 'Ô trống');
        span.textContent = '';

        range.deleteContents();
        range.insertNode(span);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);

        span.focus();

        const editorEl = document.querySelector(`[data-paragraph-id="${paragraphId}"]`) as HTMLElement;
        if (editorEl) {
          updatedParagraphs = paragraphs.map(p =>
            p.id === paragraphId ? { ...p, text: editorEl.innerHTML } : p
          );
        }
      }
    }

    if (!isInsideOurEditor && paragraphs.length > 0) {
      const firstP = paragraphs[0];
      const spanHtml = `<span class="fillblank-inline inline-block mx-1 px-2.5 py-0.5 border border-purple-300 bg-purple-50 text-purple-700 font-bold rounded-lg cursor-pointer empty:before:content-[attr(placeholder)] empty:before:text-slate-350 empty:before:pointer-events-none" data-blank-id="${blankId}" data-blank-config='${JSON.stringify(newBlank)}' contenteditable="false" placeholder="Nhập đáp án..." aria-label="Ô trống"></span>`;
      updatedParagraphs = paragraphs.map(p =>
        p.id === firstP.id ? { ...p, text: p.text + spanHtml } : p
      );
    }

    onUpdateBlock(idx, {
      ...block,
      fillblankContent: {
        ...content,
        paragraphs: updatedParagraphs,
        blanks: {
          ...blanks,
          [blankId]: newBlank
        }
      }
    });

    setActiveBlankId(blankId);
  }, [idx, paragraphs, blanks, content, block, onUpdateBlock, setActiveBlockIndex, settings.themeColor]);

  const handleUpdateParagraph = (pId: string, text: string, newBlanks?: BlankItem[]) => {
    // Strict isolation check: Verify matching paragraph exists and update ONLY that paragraph.
    const targetP = paragraphs.find(p => p.id === pId);
    if (!targetP) return;

    const nextParagraphs = paragraphs.map(p =>
      p.id === pId ? { ...p, text } : p
    );

    // Safeguard verification: editing text must never alter paragraph length/order.
    if (nextParagraphs.length !== paragraphs.length) {
      console.error('State Integrity Error: Paragraph mismatch detected.');
      return;
    }

    // 2. Scan for currently used blank IDs and update answers from HTML textContent
    const usedIds = new Set<string>();
    const nextBlanks = { ...blanks };

    // Register any new blanks from paste first
    if (newBlanks && newBlanks.length > 0) {
      newBlanks.forEach(b => {
        nextBlanks[b.id] = b;
      });
    }

    nextParagraphs.forEach(p => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = p.text;
      const spans = tempDiv.querySelectorAll('.fillblank-inline');
      spans.forEach((span) => {
        const s = span as HTMLElement;
        const bId = s.dataset.blankId || '';
        if (bId) {
          usedIds.add(bId);
          // Dynamically read/sync typed answer back to the blanks map config
          if (nextBlanks[bId]) {
            nextBlanks[bId] = {
              ...nextBlanks[bId],
              answer: s.textContent || ''
            };
          }
        }
      });
    });

    // 3. Garbage collect deleted blanks
    Object.keys(nextBlanks).forEach(id => {
      if (!usedIds.has(id)) {
        delete nextBlanks[id];
      }
    });

    onUpdateBlock(idx, {
      ...block,
      fillblankContent: {
        ...content,
        paragraphs: nextParagraphs,
        blanks: nextBlanks
      }
    });

    if (activeBlankId && !usedIds.has(activeBlankId)) {
      setActiveBlankId(null);
    }
  };

  const handleRemoveParagraph = (pId: string) => {
    const nextParagraphs = paragraphs.filter(p => p.id !== pId);

    const usedIds = new Set<string>();
    const regex = /data-blank-id=["']([^"']+)["']/g;
    nextParagraphs.forEach(p => {
      let match;
      while ((match = regex.exec(p.text)) !== null) {
        usedIds.add(match[1]);
      }
    });

    const nextBlanks = { ...blanks };
    Object.keys(nextBlanks).forEach(id => {
      if (!usedIds.has(id)) {
        delete nextBlanks[id];
      }
    });

    onUpdateBlock(idx, {
      ...block,
      fillblankContent: {
        ...content,
        paragraphs: nextParagraphs,
        blanks: nextBlanks
      }
    });
  };

  const activeBlank = activeBlankId ? blanks[activeBlankId] : null;
  const themeColor = settings.themeColor || '#8B5CF6';

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-purple-100 bg-purple-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Type size={10} className="stroke-[2.5]" />} label="Bài tập điền khuyết" />

      <Toolbar
        onInsertBlank={handleInsertBlank}
        settings={settings}
        onUpdateSettings={updateSettings}
        isBlockActive={isActive}
      />

      <div className="flex flex-col gap-3 mt-1 w-full" onClick={handleEditorClick}>
        {paragraphs.length === 0 ? (
          <BlockEmptyState
            text="Chưa có văn bản."
            actionLabel="Thêm dòng"
            onAction={addParagraph}
            icon={<Type size={20} />}
          />
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {paragraphs.map((p) => (
              <div key={p.id} className="flex items-start gap-2 group/row w-full">
                <ParagraphEditor
                  paragraphId={p.id}
                  html={p.text}
                  onUpdateParagraph={(html, newBlanks) => handleUpdateParagraph(p.id, html, newBlanks)}
                />

                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(p.id)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition cursor-pointer"
                  title="Xóa dòng"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addParagraph}
              className="text-[9px] font-black text-slate-400 hover:text-slate-600 mt-1 cursor-pointer w-fit self-start"
            >
              + Thêm đoạn văn bản mới
            </button>
          </div>
        )}
      </div>

      {/* Editing Panel for active blank */}
      {activeBlank && (
        <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl animate-fadeIn flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 size={11} style={{ color: themeColor }} /> Cấu hình ô trống: {activeBlank.answer || 'Chưa nhập'}
            </span>
            <button
              type="button"
              onClick={() => setActiveBlankId(null)}
              className="text-[9px] font-black text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Đóng cấu hình
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-[9px] font-bold text-slate-500">
            <div className="flex flex-col gap-1">
              <label>Từ đúng (Đáp án chính)</label>
              <input
                type="text"
                value={activeBlank.answer}
                onChange={(e) => updateBlank(activeBlank.id, { answer: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-700 outline-none focus:border-purple-400 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>Gợi ý học sinh (Hint)</label>
              <input
                type="text"
                value={activeBlank.hint}
                onChange={(e) => updateBlank(activeBlank.id, { hint: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Ví dụ: Bắt đầu bằng chữ H..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-700 outline-none focus:border-purple-400 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>Chiều rộng ô trống (px)</label>
              <input
                type="number"
                min={50}
                max={400}
                value={activeBlank.width || 120}
                onChange={(e) => updateBlank(activeBlank.id, { width: parseInt(e.target.value, 10) || 120 })}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-700 outline-none focus:border-purple-400 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>Điểm số ô trống</label>
              <input
                type="number"
                min={1}
                value={activeBlank.score || 1}
                onChange={(e) => updateBlank(activeBlank.id, { score: parseInt(e.target.value, 10) || 1 })}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-700 outline-none focus:border-purple-400 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <label>Đáp án thay thế (cách nhau bởi dấu phẩy)</label>
              <input
                type="text"
                value={altAnswersText}
                onChange={(e) => setAltAnswersText(e.target.value)}
                onBlur={(e) => {
                  const answers = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                  updateBlank(activeBlank.id, { alternativeAnswers: answers });
                  setAltAnswersText(answers.join(', '));
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Ví dụ: HTML5, htm"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-700 outline-none focus:border-purple-400 focus:bg-white transition"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FillBlankBlock = React.memo(FillBlankBlockComponent);
