import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Heading1, Image as ImageIcon, List, ListOrdered, MessageSquare, Minus, Plus, Quote, Type, Check, Activity, Code2 } from 'lucide-react';
import { CopyIcon, TrashIcon } from '../../../../AppIcons';
import type { DocBlock, LayoutContent } from '../../../../../types/doc-editor';
import { createDefaultBlock, generateBlockId } from '../BlockFactory';
import { BlockWrapperContext } from '../../BlockWrapper';
import { ImageBlock } from '../ImageBlock';
import { FormulaBlock } from '../FormulaBlock';
import { CodeBlock } from '../code/CodeBlock';

// Slot mini-editor cho block "layout" (G1): thêm/xóa/nhân bản/lên-xuống block tĩnh + inline text edit.
// KHÔNG đụng selection toàn cục (R3): keydown stopPropagation ở gốc, click menu/controls stopPropagation;
// pointerdown vẫn bubble để bấm vào layout là chọn block (toolbar chung hoạt động bình thường).

const SLOT_MENU: Array<{ type: DocBlock['type']; label: string; icon: React.ReactNode }> = [
  { type: 'paragraph', label: 'Văn bản', icon: <Type size={12} /> },
  { type: 'heading', label: 'Tiêu đề', icon: <Heading1 size={12} /> },
  { type: 'image', label: 'Hình ảnh', icon: <ImageIcon size={12} /> },
  { type: 'formula', label: 'Công thức', icon: <Activity size={12} /> },
  { type: 'code', label: 'Code', icon: <Code2 size={12} /> },
  { type: 'quote', label: 'Trích dẫn', icon: <Quote size={12} /> },
  { type: 'callout', label: 'Lưu ý', icon: <MessageSquare size={12} /> },
  { type: 'bullet-list', label: 'Gạch đầu dòng', icon: <List size={12} /> },
  { type: 'numbered-list', label: 'Danh sách số', icon: <ListOrdered size={12} /> },
  { type: 'todo-list', label: 'Việc cần làm', icon: <Check size={12} /> },
  { type: 'divider', label: 'Đường kẻ', icon: <Minus size={12} /> },
];

interface LayoutViewProps {
  block: DocBlock;
  onUpdateLayout: (next: LayoutContent) => void;
}

/** Text nội bộ: uncontrolled contentEditable (tránh caret nhảy), commit onBlur */
const EditableText: React.FC<{
  text: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  editable?: boolean;
}> = ({ text, onCommit, className = '', placeholder, editable = true }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.textContent !== text) ref.current.textContent = text;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // BlockWrapper preventDefault pointerdown khi block chưa active → chặn focus mặc định;
  // self-focus thủ công khi click (click vẫn fire sau pointerdown)
  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      onClick={() => { if (editable && ref.current) ref.current.focus(); }}
      onBlur={(e) => onCommit(e.currentTarget.innerText)}
      data-placeholder={placeholder}
      className={`${className} outline-none focus:ring-1 focus:ring-primary/40 rounded px-1 py-0.5 whitespace-pre-wrap ${editable ? 'cursor-text' : ''} empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400`}
    />
  );
};

export const LayoutView: React.FC<LayoutViewProps> = ({ block, onUpdateLayout }) => {
  const wrapperContext = useContext(BlockWrapperContext);
  const isPreview = wrapperContext?.isPreviewMode ?? false;
  const lc = block.layoutContent as LayoutContent;
  const [menuSlot, setMenuSlot] = useState<number | null>(null);

  const setSlotBlocks = (si: number, next: DocBlock[]) => {
    onUpdateLayout({ columns: lc.columns, slots: lc.slots.map((s, i) => (i === si ? next : s)) });
  };

  const updateInner = (updated: DocBlock) => {
    onUpdateLayout({
      columns: lc.columns,
      slots: lc.slots.map(s => s.map(b => (b.id === updated.id ? updated : b))),
    });
  };

  const addInner = (si: number, type: DocBlock['type']) => {
    setSlotBlocks(si, [...lc.slots[si], createDefaultBlock(type)]);
    setMenuSlot(null);
  };

  const duplicateInner = (si: number, bi: number) => {
    const src = lc.slots[si][bi];
    const copy: DocBlock = { ...src, id: generateBlockId(), content: { ...src.content } };
    const next = [...lc.slots[si]];
    next.splice(bi + 1, 0, copy);
    setSlotBlocks(si, next);
  };

  const moveInner = (si: number, bi: number, dir: -1 | 1) => {
    const target = bi + dir;
    if (target < 0 || target >= lc.slots[si].length) return;
    const next = [...lc.slots[si]];
    [next[bi], next[target]] = [next[target], next[bi]];
    setSlotBlocks(si, next);
  };

  const deleteInner = (si: number, bi: number) => {
    setSlotBlocks(si, lc.slots[si].filter((_, i) => i !== bi));
  };

  const commitText = (si: number, bi: number, v: string) => {
    const b = lc.slots[si][bi];
    updateInner({ ...b, text: v, content: { ...b.content, text: v } });
  };

  /** Render block tĩnh trong slot — path scoped, KHÔNG route về handler danh sách phẳng (R3) */
  const renderInner = (b: DocBlock, si: number, bi: number) => {
    // R7 — guard layout lồng: v1 không hỗ trợ
    if (b.type === 'layout') {
      return <div className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-lg px-2 py-3 text-center">Layout lồng không hỗ trợ</div>;
    }
    if (b.type === 'divider') return <hr className="border-slate-200 my-1" />;

    if (b.type === 'image') {
      return (
        <BlockWrapperContext.Provider value={{ registerCustomActions: () => {}, isPreviewMode: isPreview }}>
          <ImageBlock
            block={b}
            idx={-1}
            isActive={false}
            setActiveBlockIndex={() => {}}
            onUpdateBlock={(_i, updated) => updateInner(updated)}
          />
        </BlockWrapperContext.Provider>
      );
    }
    if (b.type === 'formula') {
      return (
        <BlockWrapperContext.Provider value={{ registerCustomActions: () => {}, isPreviewMode: isPreview }}>
          <FormulaBlock
            block={b}
            idx={-1}
            isActive={false}
            setActiveBlockIndex={() => {}}
            onUpdateBlock={(_i, updated) => updateInner(updated)}
            handleKeyDown={() => {}}
            showUniversalToolbar={false}
          />
        </BlockWrapperContext.Provider>
      );
    }
    if (b.type === 'code') {
      return (
        <CodeBlock
          block={b}
          idx={-1}
          isActive={false}
          setActiveBlockIndex={() => {}}
          onUpdateBlock={(_i, updated) => updateInner(updated)}
        />
      );
    }

    const base = 'text-slate-800 leading-[1.75]';
    if (b.type === 'heading') {
      const cls = b.level === 1 ? 'text-lg font-bold' : b.level === 2 ? 'text-base font-bold' : 'text-sm font-bold';
      return <EditableText text={b.text} onCommit={v => commitText(si, bi, v)} className={`${base} ${cls}`} placeholder="Tiêu đề..." editable={!isPreview} />;
    }
    if (b.type === 'quote') {
      return (
        <blockquote className="border-l-2 border-primary/50 pl-2.5 py-0.5">
          <EditableText text={b.text} onCommit={v => commitText(si, bi, v)} className={`${base} italic text-slate-600 text-sm`} placeholder="Trích dẫn..." editable={!isPreview} />
        </blockquote>
      );
    }
    if (b.type === 'callout') {
      return (
        <div className="bg-primary-light/40 border border-primary/20 rounded-lg px-2.5 py-1.5">
          <EditableText text={b.text} onCommit={v => commitText(si, bi, v)} className={`${base} text-sm`} placeholder="Nội dung lưu ý..." editable={!isPreview} />
        </div>
      );
    }
    if (b.type === 'bullet-list' || b.type === 'numbered-list' || b.type === 'todo-list') {
      const marker = b.type === 'bullet-list' ? '•' : b.type === 'numbered-list' ? '1.' : '';
      return (
        <div className={`flex items-start gap-1.5 ${base} text-sm`}>
          {b.type === 'todo-list' ? (
            <input
              type="checkbox"
              checked={!!b.checked}
              disabled={isPreview}
              onChange={() => updateInner({ ...b, checked: !b.checked, content: { ...b.content, checked: !b.checked } })}
              className="mt-1.5 accent-primary cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="font-black text-slate-400 mt-0.5 shrink-0">{marker}</span>
          )}
          <EditableText text={b.text} onCommit={v => commitText(si, bi, v)} className="min-w-0 flex-1" placeholder="Nội dung..." editable={!isPreview} />
        </div>
      );
    }
    // paragraph
    return <EditableText text={b.text} onCommit={v => commitText(si, bi, v)} className={`${base} text-base`} placeholder="Gõ nội dung..." editable={!isPreview} />;
  };

  const controls = (si: number, bi: number) => (
    <div
      className="absolute -top-2.5 right-1 z-20 hidden group-hover/inner:flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg shadow-sm px-0.5 py-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" title="Nhân bản" onClick={(e) => { e.stopPropagation(); duplicateInner(si, bi); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"><CopyIcon size={10} /></button>
      <button type="button" title="Lên" disabled={bi === 0} onClick={(e) => { e.stopPropagation(); moveInner(si, bi, -1); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"><ChevronUp size={12} /></button>
      <button type="button" title="Xuống" disabled={bi === lc.slots[si].length - 1} onClick={(e) => { e.stopPropagation(); moveInner(si, bi, 1); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 cursor-pointer"><ChevronDown size={12} /></button>
      <button type="button" title="Xóa" onClick={(e) => { e.stopPropagation(); deleteInner(si, bi); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-500 cursor-pointer"><TrashIcon size={10} /></button>
    </div>
  );

  return (
    <div
      className="grid grid-cols-1 gap-3 md:[grid-template-columns:var(--layout-cols)] my-1"
      style={{ '--layout-cols': lc.columns.map(c => `${c}fr`).join(' ') } as React.CSSProperties}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {lc.slots.map((slot, si) => (
        <div
          key={si}
          className={`min-w-0 rounded-xl p-3 min-h-[110px] flex flex-col gap-2 relative ${isPreview ? '' : 'border border-dashed border-slate-300 bg-slate-50/40'}`}
        >
          {slot.length === 0 ? (
            isPreview ? (
              <p className="text-xs text-slate-300 font-medium text-center my-auto">Ô trống</p>
            ) : (
              <div className="flex-1 flex items-center justify-center py-4">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuSlot(menuSlot === si ? null : si); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary border border-dashed border-slate-300 hover:border-primary rounded-lg px-3 py-2 transition cursor-pointer"
                >
                  <Plus size={13} /> Thêm nội dung
                </button>
              </div>
            )
          ) : (
            <>
              {slot.map((b, bi) => (
                <div key={b.id} className="group/inner relative">
                  {!isPreview && controls(si, bi)}
                  {renderInner(b, si, bi)}
                </div>
              ))}
              {!isPreview && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuSlot(menuSlot === si ? null : si); }}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-primary transition cursor-pointer mt-0.5 px-1"
                >
                  <Plus size={12} /> Thêm
                </button>
              )}
            </>
          )}

          {menuSlot === si && (
            <>
              <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuSlot(null); }} />
              <div className="absolute left-3 top-8 z-30 w-44 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 max-h-64 overflow-y-auto">
                {SLOT_MENU.map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); addInner(si, item.type); }}
                    className="w-full px-3 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition cursor-pointer flex items-center gap-2"
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
