import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, RotateCcw, Check, Eye } from 'lucide-react';
import type { MatchingContent, MatchingPair } from './MatchingTypes';
import { LatexText } from '../common/LatexText';

interface MatchingPreviewProps {
  content: MatchingContent;
}

export const MatchingPreview: React.FC<MatchingPreviewProps> = ({ content }) => {
  const pairs = content.pairs || [];
  const settings = content.settings || {};
  const themeColor = settings.themeColor || '#6366f1';

  const containerRef = useRef<HTMLDivElement>(null);
  const [shuffledRight, setShuffledRight] = useState<MatchingPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [coords, setCoords] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Shuffle right items on mount or when pairs change
  useEffect(() => {
    if (pairs.length > 0) {
      const isShuffle = settings.shuffleAnswers !== false;
      const rightItems = isShuffle 
        ? [...pairs].sort(() => Math.random() - 0.5) 
        : [...pairs];
      setShuffledRight(rightItems);
      setMatches([]);
      setShowValidation(false);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [pairs, settings.shuffleAnswers]);

  // Update line coordinates
  const updateCoords = () => {
    const parentEl = containerRef.current;
    if (!parentEl) return;
    const parentRect = parentEl.getBoundingClientRect();

    const newCoords: typeof coords = {};
    pairs.forEach(pair => {
      const el = document.getElementById(`left-port-${pair.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        newCoords[`left-${pair.id}`] = {
          x: r.left + r.width / 2 - parentRect.left,
          y: r.top + r.height / 2 - parentRect.top,
        };
      }
    });

    shuffledRight.forEach(pair => {
      const el = document.getElementById(`right-port-${pair.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        newCoords[`right-${pair.id}`] = {
          x: r.left + r.width / 2 - parentRect.left,
          y: r.top + r.height / 2 - parentRect.top,
        };
      }
    });

    setCoords(newCoords);
  };

  // Recalculate positions after DOM updates
  useEffect(() => {
    const timer = setTimeout(updateCoords, 100);
    return () => clearTimeout(timer);
  }, [matches, shuffledRight]);

  // Resize listener
  useEffect(() => {
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [matches, shuffledRight]);

  if (pairs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs font-bold select-none">
        Chưa có cặp ghép.
      </div>
    );
  }

  const handleLeftClick = (id: string) => {
    if (showValidation) return;
    if (selectedLeft === id) {
      setSelectedLeft(null);
      return;
    }

    if (selectedRight) {
      makeConnection(id, selectedRight);
    } else {
      setSelectedLeft(id);
    }
  };

  const handleRightClick = (id: string) => {
    if (showValidation) return;
    if (selectedRight === id) {
      setSelectedRight(null);
      return;
    }

    if (selectedLeft) {
      makeConnection(selectedLeft, id);
    } else {
      setSelectedRight(id);
    }
  };

  const makeConnection = (leftId: string, rightId: string) => {
    const filtered = matches.filter(m => m.leftId !== leftId && m.rightId !== rightId);
    const nextMatches = [...filtered, { leftId, rightId }];
    setMatches(nextMatches);
    setSelectedLeft(null);
    setSelectedRight(null);
    
    if (settings.autoCheck && nextMatches.length === pairs.length) {
      setShowValidation(true);
    }
  };

  const removeConnection = (leftId: string) => {
    if (showValidation && !settings.autoCheck) return;
    setMatches(prev => {
      const next = prev.filter(m => m.leftId !== leftId);
      if (settings.autoCheck) setShowValidation(false);
      return next;
    });
  };

  const handleReset = () => {
    setMatches([]);
    setShowValidation(false);
    setSelectedLeft(null);
    setSelectedRight(null);
    const isShuffle = settings.shuffleAnswers !== false;
    const rightItems = isShuffle 
      ? [...pairs].sort(() => Math.random() - 0.5) 
      : [...pairs];
    setShuffledRight(rightItems);
  };

  const checkResults = () => {
    setShowValidation(true);
  };

  const handleReveal = () => {
    const correctMatches = pairs.map(p => ({ leftId: p.id, rightId: p.id }));
    setMatches(correctMatches);
    setShowValidation(true);
  };

  // Check if all connected pairs are correct
  const correctCount = matches.filter(m => m.leftId === m.rightId).length;
  const isPerfect = correctCount === pairs.length && matches.length === pairs.length;

  return (
    <div className="flex flex-col gap-4 w-full mt-1 animate-fadeIn">
      {/* Game Board */}
      <div ref={containerRef} className="relative w-full grid grid-cols-2 gap-16 select-none bg-slate-50/30 p-6 rounded-2xl border border-slate-200 overflow-hidden">
        
        {/* SVG Drawing Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          {matches.map((match, idx) => {
            const start = coords[`left-${match.leftId}`];
            const end = coords[`right-${match.rightId}`];
            if (!start || !end) return null;

            // Compute line color based on validation state
            let strokeColor = themeColor;
            if (showValidation) {
              strokeColor = match.leftId === match.rightId ? '#10b981' : '#ef4444';
            }

            return (
              <g key={idx}>
                {/* SVG path connection */}
                <path
                  d={`M ${start.x} ${start.y} C ${(start.x + end.x) / 2} ${start.y}, ${(start.x + end.x) / 2} ${end.y}, ${end.x} ${end.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  className="transition duration-300"
                />
                {/* Connection dot */}
                <circle cx={start.x} cy={start.y} r="4" fill={strokeColor} />
                <circle cx={end.x} cy={end.y} r="4" fill={strokeColor} />
              </g>
            );
          })}
        </svg>

        {/* Left Column (Correct side reference) */}
        <div className="flex flex-col gap-4 z-20">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 text-center select-none">
            Cột bên trái
          </div>
          {pairs.map((pair) => {
            const isSelected = selectedLeft === pair.id;
            const isMatched = matches.some(m => m.leftId === pair.id);
            const activeMatch = matches.find(m => m.leftId === pair.id);

            // Highlight border if selected
            let borderStyle: React.CSSProperties = isSelected ? { borderColor: themeColor, boxShadow: `0 0 0 2px ${themeColor}20` } : {};
            if (showValidation && activeMatch) {
              borderStyle = { borderColor: activeMatch.leftId === activeMatch.rightId ? '#10b981' : '#ef4444' };
            }

            return (
              <div
                key={pair.id}
                id={`left-item-${pair.id}`}
                onClick={() => handleLeftClick(pair.id)}
                className={`bg-white border border-slate-200 rounded-xl p-3.5 hover:bg-slate-50/50 transition cursor-pointer flex items-center justify-between gap-3 min-h-[50px] relative ${
                  isSelected ? 'ring-2 ring-offset-1 ring-primary/20' : ''
                }`}
                style={borderStyle}
              >
                <div className="text-[10px] font-bold text-slate-700 pr-2">
                  <LatexText value={pair.leftText || '(Trống)'} />
                </div>
                {/* Connecting port dot right center of left card */}
                <div
                  id={`left-port-${pair.id}`}
                  className="w-2.5 h-2.5 rounded-full border-2 border-white absolute -right-1.5 top-1/2 -translate-y-1/2 shadow-xs transition duration-150 z-30"
                  style={{
                    backgroundColor: isSelected ? themeColor : (isMatched ? themeColor : '#cbd5e1')
                  }}
                />
                
                {/* Quick reset button for this connection */}
                {isMatched && !showValidation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(pair.id);
                    }}
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 text-[8px] font-bold cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column (Shuffled side target) */}
        <div className="flex flex-col gap-4 z-20">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 text-center select-none">
            Cột bên phải
          </div>
          {shuffledRight.map((pair) => {
            const isSelected = selectedRight === pair.id;
            const isMatched = matches.some(m => m.rightId === pair.id);
            const activeMatch = matches.find(m => m.rightId === pair.id);

            let borderStyle: React.CSSProperties = isSelected ? { borderColor: themeColor, boxShadow: `0 0 0 2px ${themeColor}20` } : {};
            if (showValidation && activeMatch) {
              borderStyle = { borderColor: activeMatch.leftId === activeMatch.rightId ? '#10b981' : '#ef4444' };
            }

            return (
              <div
                key={pair.id}
                id={`right-item-${pair.id}`}
                onClick={() => handleRightClick(pair.id)}
                className={`bg-white border border-slate-200 rounded-xl p-3.5 hover:bg-slate-50/50 transition cursor-pointer flex items-center gap-3 min-h-[50px] relative ${
                  isSelected ? 'ring-2 ring-offset-1 ring-primary/20' : ''
                }`}
                style={borderStyle}
              >
                {/* Connecting port dot left center of right card */}
                <div
                  id={`right-port-${pair.id}`}
                  className="w-2.5 h-2.5 rounded-full border-2 border-white absolute -left-1.5 top-1/2 -translate-y-1/2 shadow-xs transition duration-150 z-30"
                  style={{
                    backgroundColor: isSelected ? themeColor : (isMatched ? themeColor : '#cbd5e1')
                  }}
                />
                <div className="text-[10px] font-bold text-slate-700 pl-2">
                  <LatexText value={pair.rightText || '(Trống)'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons & Validation Messages */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          {!settings.autoCheck && (
            <button
              onClick={checkResults}
              disabled={matches.length === 0}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl shadow-2xs transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check size={11} className="stroke-[2.5]" />
              Kiểm tra
            </button>
          )}
          {settings.revealAnswers && (
            <button
              onClick={handleReveal}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-indigo-600 border border-indigo-200 font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition duration-150 cursor-pointer"
            >
              <Eye size={11} />
              Xem đáp án
            </button>
          )}
          {settings.allowRetries !== false && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition duration-150 cursor-pointer"
            >
              <RotateCcw size={11} />
              Làm lại
            </button>
          )}
        </div>

        {/* Feedback Area */}
        {settings.showFeedback !== false && showValidation && (
          <div className="flex items-center gap-1.5 animate-fadeIn">
            {isPerfect ? (
              <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <CheckCircle2 size={12} />
                Ghép nối chính xác hoàn toàn! (+100 EXP)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-black text-red-655 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                <AlertCircle size={12} />
                {settings.showScore !== false 
                  ? `Đã ghép đúng ${correctCount}/${pairs.length} cặp. Thử lại nhé!`
                  : 'Ghép nối chưa chính xác hoàn toàn. Hãy thử lại!'
                }
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
