import React, { useState, useMemo } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { DragDropContent } from './Types';
import { shuffleArray } from './Utils';
import { LatexText } from '../common/LatexText';

interface PreviewProps {
  block: { dragdropContent?: DragDropContent };
}

export const Preview: React.FC<PreviewProps> = ({ block }) => {
  const content = block.dragdropContent;
  if (!content) return null;

  const { cards, zones, settings } = content;
  const themeColor = settings.themeColor || '#3B82F6';

  const [placedCards, setPlacedCards] = useState<Record<string, string | null>>({}); // cardId -> zoneId or null
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Memoized shuffled cards and zones for student presentation
  const studentCards = useMemo(() => {
    return settings.shuffleCards ? shuffleArray(cards) : cards;
  }, [cards, settings.shuffleCards]);

  const studentZones = useMemo(() => {
    return settings.shuffleZones ? shuffleArray(zones) : zones;
  }, [zones, settings.shuffleZones]);

  // Unplaced cards list
  const unplacedCards = studentCards.filter(card => !placedCards[card.id]);

  const handlePlaceCard = (cardId: string, zoneId: string | null) => {
    if (isSubmitted) return;
    setPlacedCards(prev => ({
      ...prev,
      [cardId]: zoneId
    }));
  };

  const handleCheck = () => {
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setPlacedCards({});
  };

  // Check card correctness
  const isCardCorrect = (cardId: string, zoneId: string | null): boolean => {
    if (!zoneId) return false;
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.correctCardIds.includes(cardId) : false;
  };

  // Calculate score
  const score = Object.entries(placedCards).reduce((acc, [cardId, zoneId]) => {
    if (zoneId && isCardCorrect(cardId, zoneId)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const totalPossible = cards.length;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm select-none">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left Column: Draggable Cards Bank */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const cardId = e.dataTransfer.getData('text/plain');
            if (cardId) handlePlaceCard(cardId, null);
          }}
          className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col min-h-[220px]"
        >
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-3">
            Thẻ chưa phân loại ({unplacedCards.length})
          </span>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {unplacedCards.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-xl p-4 text-[9px] font-bold text-slate-400 text-center">
                Đã kéo toàn bộ thẻ
              </div>
            ) : (
              unplacedCards.map(card => (
                <div
                  key={card.id}
                  draggable={!isSubmitted}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', card.id)}
                  style={{ cursor: isSubmitted ? 'default' : 'grab' }}
                  className="bg-white border border-slate-200 hover:border-slate-300 p-2.5 rounded-xl text-[10px] font-bold text-slate-700 shadow-2xs hover:shadow-sm transition"
                >
                  {card.type === 'text' && <span><LatexText value={card.content} /></span>}
                  {card.type === 'image' && (
                    <img src={card.content} className="max-h-16 w-auto mx-auto rounded object-contain" alt="card" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Drop Zones */}
        <div className="md:col-span-3 flex flex-col gap-3 min-h-[220px]">
          {studentZones.map(zone => {
            const cardsInZone = studentCards.filter(card => placedCards[card.id] === zone.id);

            return (
              <div
                key={zone.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const cardId = e.dataTransfer.getData('text/plain');
                  if (cardId) handlePlaceCard(cardId, zone.id);
                }}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3 flex flex-col gap-2 transition min-h-[100px]"
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] font-black text-slate-800">
                    <LatexText value={zone.content || 'Nhóm'} />
                  </span>
                  <span className="text-[8px] font-black text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                    Chứa: {cardsInZone.length} thẻ
                  </span>
                </div>

                {/* Drop Container */}
                <div className="flex flex-wrap gap-1.5 flex-1 min-h-[50px] items-center p-1 rounded-xl bg-slate-50/20 border border-dashed border-slate-100">
                  {cardsInZone.length === 0 ? (
                    <span className="text-[8px] font-bold text-slate-350 mx-auto pointer-events-none">Thả thẻ vào đây</span>
                  ) : (
                    cardsInZone.map(card => {
                      const isCorrect = isCardCorrect(card.id, zone.id);
                      let borderClass = 'border-slate-200';
                      if (isSubmitted) {
                        borderClass = isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-rose-500 bg-rose-50 text-rose-700';
                      }

                      return (
                        <div
                          key={card.id}
                          draggable={!isSubmitted}
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', card.id)}
                          style={{ cursor: isSubmitted ? 'default' : 'grab' }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border rounded-xl text-[9px] font-bold text-slate-700 shadow-3xs hover:shadow-2xs transition ${borderClass}`}
                        >
                          {card.type === 'text' && <span><LatexText value={card.content} /></span>}
                          {card.type === 'image' && (
                            <img src={card.content} className="max-h-8 w-auto rounded object-contain" alt="card" />
                          )}

                          {!isSubmitted && (
                            <button
                              type="button"
                              onClick={() => handlePlaceCard(card.id, null)}
                              className="text-slate-350 hover:text-slate-500 cursor-pointer"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Show correct answers drawer if wrong */}
                {isSubmitted && settings.showCorrectAnswer && (
                  <div className="text-[8px] font-bold text-slate-400 mt-1 flex flex-wrap gap-1 items-center">
                    <span className="text-emerald-600 font-extrabold uppercase">Đúng:</span>
                    {zone.correctCardIds.map(cId => {
                      const c = cards.find(card => card.id === cId);
                      if (!c) return null;
                      return (
                        <span key={cId} className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100/50">
                          <LatexText value={c.content} />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          {isSubmitted ? (
            <div className="flex items-center gap-2">
              {score === totalPossible ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                  <CheckCircle2 size={12} /> Hoàn hảo ({score}/{totalPossible} thẻ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                  <XCircle size={12} /> Chưa hoàn toàn chính xác ({score}/{totalPossible} thẻ)
                </span>
              )}
            </div>
          ) : (
            <span className="text-[9px] font-bold text-slate-400">
              Lượt thử: {attempts} / {settings.allowRetry ? 'Vô hạn' : '1'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            (settings.allowRetry || attempts < 1) && (
              <button
                type="button"
                onClick={handleRetry}
                style={{ borderColor: themeColor, color: themeColor }}
                className="px-3 py-1.5 border hover:bg-slate-50 font-black text-[9px] rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw size={10} /> Làm lại
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleCheck}
              style={{ backgroundColor: themeColor }}
              className="px-3 py-1.5 text-white hover:opacity-95 font-black text-[9px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
