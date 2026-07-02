import React from 'react';
import { FileCode2, HelpCircle } from 'lucide-react';

interface ExamLivePreviewProps {
  infoMeta: {
    title: string;
    totalQuestion?: number;
    time?: number;
  };
  previewQuestions: any[];
  selectedQuestionId: number;
  setSelectedQuestionId: (id: number) => void;
}

export const ExamLivePreview: React.FC<ExamLivePreviewProps> = ({
  infoMeta,
  previewQuestions,
  selectedQuestionId,
  setSelectedQuestionId,
}) => {
  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      <div className="h-10 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/20">
        <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Xem trước đề thi</span>
      </div>

      {/* Rendering Viewport */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 p-5 md:p-6 flex justify-center items-start">
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/60 shadow-sm flex flex-col h-fit w-full max-w-full">
          {/* Paper Header */}
          <div className="border-b border-slate-150 pb-4 mb-6">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wide">
              {infoMeta.title}
            </h2>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-2 font-sans">
              <span className="flex items-center gap-1">
                <FileCode2 size={12} /> {infoMeta.totalQuestion || 50} câu hỏi
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle size={12} /> {infoMeta.time || 90} phút
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-extrabold uppercase tracking-wider">
                TRẮC NGHIỆM
              </span>
            </div>
          </div>

          {/* Questions List Render */}
          <div className="space-y-6">
            {previewQuestions.map((q: any, qIdx: number) => {
              const isActive = selectedQuestionId === q.id;
              return (
                <div 
                  key={q.id || qIdx}
                  id={`q-${q.id}`}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`p-4 border rounded-xl transition duration-150 cursor-pointer ${
                    isActive 
                      ? 'border-primary/30 bg-primary-light/5 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="text-[11px] leading-relaxed font-bold">
                    <span className="font-black text-primary">Câu {q.id}.</span> {q.question}
                  </div>

                  {/* Water molecule SVG */}
                  {q.id === 2 && (
                    <div className="flex justify-center py-4 my-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible select-none">
                        {/* Covalent bonds */}
                        <line x1="110" y1="50" x2="60" y2="96" stroke="#1E293B" strokeWidth="2.5" />
                        <line x1="110" y1="50" x2="160" y2="96" stroke="#1E293B" strokeWidth="2.5" />

                        {/* Oxygen atom (O) */}
                        <circle cx="110" cy="50" r="18" fill="white" stroke="#6C5DD3" strokeWidth="2.5" />
                        <text x="110" y="54" textAnchor="middle" fontSize="12" fontWeight="black" fill="#6C5DD3" fontFamily="sans-serif">O</text>

                        {/* Hydrogen atom left (H) */}
                        <circle cx="60" cy="96" r="12" fill="white" stroke="#1E293B" strokeWidth="2" />
                        <text x="60" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">H</text>

                        {/* Hydrogen atom right (H) */}
                        <circle cx="160" cy="96" r="12" fill="white" stroke="#1E293B" strokeWidth="2" />
                        <text x="160" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">H</text>

                        {/* Lone electron pairs (dots) */}
                        <circle cx="102" cy="26" r="2.2" fill="#6C5DD3" />
                        <circle cx="108" cy="22" r="2.2" fill="#6C5DD3" />

                        <circle cx="118" cy="22" r="2.2" fill="#6C5DD3" />
                        <circle cx="124" cy="26" r="2.2" fill="#6C5DD3" />

                        {/* Angle indicator curve and text label */}
                        <path d="M 98,62 A 16,16 0 0,0 122,62" fill="none" stroke="#6C5DD3" strokeWidth="1" strokeDasharray="2 1.5" />
                        <text x="110" y="78" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6C5DD3" fontFamily="sans-serif">104.5°</text>
                      </svg>
                    </div>
                  )}

                  {/* Options grid */}
                  <div className={`mt-3.5 space-y-2.5 font-sans ${q.id === 2 ? 'grid grid-cols-2 gap-3 space-y-0' : ''}`}>
                    {q.options?.map((opt: any) => {
                      const isChecked = q.answer === opt.key;
                      const letter = opt.key;
                      
                      let optClass = 'border-[#E8EAF3] bg-white hover:border-[#6366F1]/40 hover:bg-[#6366F1]/5';
                      let badgeClass = 'bg-slate-100 text-[#64748B] border border-slate-200';

                      if (isChecked) {
                        optClass = 'border-[#6366F1] bg-[#6366F1]/10 text-primary';
                        badgeClass = 'bg-[#6366F1] text-white border-[#6366F1]';
                      }

                      return (
                        <div 
                          key={opt.key}
                          className={`w-full flex items-center justify-between gap-3 p-3.5 border rounded-2xl text-left text-xs transition duration-150 ${optClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${badgeClass}`}>
                              {letter}
                            </span>
                            <span className="font-semibold text-slate-700 leading-relaxed">{opt.content}</span>
                          </div>
                          {isChecked && (
                            <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation and difficulty */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100/50 rounded-xl space-y-1.5 text-[9px]">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-primary">Giải thích:</span>
                      <span className={`font-black text-[8px] ${q.level === 'easy' ? 'text-success' : 'text-amber-500'}`}>
                        Độ khó: {q.level === 'easy' ? 'Dễ' : 'Trung bình'}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed font-bold">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
