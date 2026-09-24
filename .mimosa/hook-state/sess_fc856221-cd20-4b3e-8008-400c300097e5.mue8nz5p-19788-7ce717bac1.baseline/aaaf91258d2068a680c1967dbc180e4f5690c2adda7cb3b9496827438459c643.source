import React from 'react';
import { Layers, Trash2 } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { EditableText } from '../common/EditableText';
import { useDragDrop } from './hooks/useDragDrop';
import { Toolbar } from './Toolbar';

interface BlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const DragDropBlockComponent: React.FC<BlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    cards,
    zones,
    settings,
    addCard,
    removeCard,
    updateCard,
    addZone,
    removeZone,
    updateZone,
    toggleCardInZone,
    updateSettings,
  } = useDragDrop(block, idx, onUpdateBlock);

  const themeColor = settings.themeColor || '#3B82F6';

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-blue-100 bg-blue-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Layers size={10} className="stroke-[2.5]" />} label="Bài tập phân loại Kéo thả" />

      <Toolbar
        onAddCard={() => addCard('text')}
        onAddZone={() => addZone('text')}
        settings={settings}
        onUpdateSettings={updateSettings}
        isBlockActive={isActive}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Left pane: Cards editing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-3xs flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Danh sách Thẻ kéo ({cards.length})</span>
            <button
              type="button"
              onClick={() => addCard('text')}
              style={{ color: themeColor }}
              className="text-[9px] font-bold cursor-pointer"
            >
              + Thêm thẻ
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="text-[9px] font-bold text-slate-400 text-center py-6">Chưa có thẻ.</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-0.5">
              {cards.map((card, cIdx) => (
                <div key={card.id} className="border border-slate-100 hover:border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 bg-slate-50/30 group">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Thẻ {cIdx + 1}</span>
                      <select
                        value={card.type}
                        onChange={(e) => updateCard(card.id, { type: e.target.value as any, content: '' })}
                        className="text-[8px] font-bold text-slate-500 bg-transparent border-none outline-none cursor-pointer"
                      >
                        <option value="text">Văn bản</option>
                        <option value="image">Hình ảnh (URL)</option>
                      </select>
                    </div>

                    <EditableText
                      value={card.content}
                      onChange={(val) => updateCard(card.id, { content: val })}
                      placeholder={card.type === 'text' ? 'Nhập nội dung thẻ...' : 'Nhập liên kết ảnh URL...'}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-700 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => removeCard(card.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right pane: Drop zones editing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-3xs flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Danh sách Vùng thả ({zones.length})</span>
            <button
              type="button"
              onClick={() => addZone('text')}
              style={{ color: themeColor }}
              className="text-[9px] font-bold cursor-pointer"
            >
              + Thêm vùng
            </button>
          </div>

          {zones.length === 0 ? (
            <div className="text-[9px] font-bold text-slate-400 text-center py-6">Chưa có vùng thả.</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-0.5">
              {zones.map((zone, zIdx) => (
                <div key={zone.id} className="border border-slate-100 hover:border-slate-200 rounded-xl p-2.5 flex flex-col gap-2 bg-slate-50/30 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Vùng thả {zIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeZone(zone.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition"
                      title="Xóa"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <EditableText
                    value={zone.content}
                    onChange={(val) => updateZone(zone.id, { content: val })}
                    placeholder="Tên vùng thả (ví dụ: Động vật có xương sống)..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-700 outline-none"
                  />

                  {/* Mapping options */}
                  <div className="mt-1 pt-1 border-t border-slate-100/60">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Thẻ ánh xạ đúng (Correct Cards)
                    </span>
                    
                    {cards.length === 0 ? (
                      <span className="text-[8px] text-slate-350 italic">Cần thêm thẻ để chọn ánh xạ</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {cards.map(card => {
                          const isMapped = zone.correctCardIds.includes(card.id);
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => toggleCardInZone(zone.id, card.id)}
                              style={{
                                backgroundColor: isMapped ? `${themeColor}15` : 'transparent',
                                borderColor: isMapped ? themeColor : '#e2e8f0',
                                color: isMapped ? themeColor : '#64748b'
                              }}
                              className="px-2 py-0.5 rounded-lg border text-[8px] font-bold cursor-pointer transition"
                            >
                              {card.content || `Thẻ ID: ${card.id.slice(0, 4)}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DragDropBlock = React.memo(DragDropBlockComponent);
