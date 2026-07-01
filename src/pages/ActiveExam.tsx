import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, X, AlertTriangle, Lightbulb, Sparkles, BookOpen, Bookmark, Eye, Sun, Calculator, Book, Columns, FileText } from 'lucide-react';
import type { Exam, User } from '../types';

interface ActiveExamProps {
  exam: Exam;
  user: User;
  onFinishExam: (examId: string, score: number, xpGained: number) => void;
  onExit: () => void;
}

// Variation Table SVG for Math exam
const VariationTable: React.FC = () => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 my-4 flex justify-center overflow-x-auto">
    <svg viewBox="0 0 600 180" className="w-full max-w-[500px]" fill="none">
      {/* Grid Lines */}
      <line x1="100" y1="0" x2="100" y2="180" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="0" y1="40" x2="600" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="0" y1="80" x2="600" y2="80" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Row Labels */}
      <text x="50" y="25" textAnchor="middle" fill="#1E293B" className="text-sm font-bold">x</text>
      <text x="50" y="65" textAnchor="middle" fill="#1E293B" className="text-sm font-bold">f'(x)</text>
      <text x="50" y="130" textAnchor="middle" fill="#1E293B" className="text-sm font-bold">f(x)</text>

      {/* Row 1 Content: x values */}
      <text x="140" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">-∞</text>
      <text x="280" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">-1</text>
      <text x="420" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">2</text>
      <text x="560" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">+∞</text>

      {/* Row 2 Content: f'(x) values */}
      <text x="210" y="65" textAnchor="middle" fill="#475569" className="text-sm">+</text>
      <text x="280" y="65" textAnchor="middle" fill="#475569" className="text-sm">0</text>
      <text x="350" y="65" textAnchor="middle" fill="#475569" className="text-sm">-</text>
      <text x="420" y="65" textAnchor="middle" fill="#475569" className="text-sm">0</text>
      <text x="490" y="65" textAnchor="middle" fill="#475569" className="text-sm">+</text>

      {/* Row 3 Content: f(x) arrows and extrema */}
      <line x1="150" y1="160" x2="260" y2="105" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="260,105 250,108 255,114" fill="#4F46E5" />
      <text x="150" y="172" textAnchor="middle" fill="#64748B" className="text-[10px] font-medium">-∞</text>
      <text x="280" y="98" textAnchor="middle" fill="#1E293B" className="text-xs font-bold">3</text>

      <line x1="300" y1="108" x2="400" y2="158" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="400,158 396,148 391,153" fill="#4F46E5" />
      <text x="420" y="172" textAnchor="middle" fill="#1E293B" className="text-xs font-bold">-2</text>

      <line x1="440" y1="160" x2="540" y2="105" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="540,105 530,108 535,114" fill="#4F46E5" />
      <text x="560" y="98" textAnchor="middle" fill="#64748B" className="text-[10px] font-medium">+∞</text>
    </svg>
  </div>
);

export const ActiveExam: React.FC<ActiveExamProps> = ({
  exam,
  user,
  onFinishExam,
  onExit,
}) => {
  // 1. Exam States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Bookmark and Review Later states
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [reviewLater, setReviewLater] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Drawer states for Mobile responsiveness
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Tool popups
  const [activeTool, setActiveTool] = useState<'calculator' | 'formulas' | 'periodic' | 'scratchpad' | null>(null);
  const [calcDisplay, setCalcDisplay] = useState('');
  const [scratchText, setScratchText] = useState('');

  // 2. Timer countdown
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pad questions to exactly 50 for realistic layout
  const paddedQuestions = useMemo(() => {
    const result = [...exam.questions];
    const targetCount = 50;
    if (result.length < targetCount) {
      const remaining = targetCount - result.length;
      for (let i = 0; i < remaining; i++) {
        const qNum = result.length + 1;
        result.push({
          id: `mock-q-${qNum}`,
          text: `[Câu hỏi luyện tập ${qNum}] Đề bài trắc nghiệm bổ trợ kiến thức môn ${exam.subject} phần nâng cao để chuẩn bị cho kỳ thi tốt nghiệp THPT. Lựa chọn phương án trả lời chính xác nhất dưới đây.`,
          options: [
            `Phương án trả lời A của câu số ${qNum}`,
            `Phương án trả lời B của câu số ${qNum}`,
            `Phương án trả lời C của câu số ${qNum}`,
            `Phương án trả lời D của câu số ${qNum}`,
          ],
          correctOptionIndex: Math.floor(Math.random() * 4),
          explanation: `Giải thích chi tiết câu ${qNum}: Dựa vào định lý và các hệ thức toán học/khoa học cơ bản đã được giảng dạy trong chương trình ôn tập môn ${exam.subject}, ta dễ dàng tìm được đáp án đúng.`,
          hint: `Hãy suy luận logic hoặc áp dụng các định luật căn bản của môn ${exam.subject}.`
        });
      }
    }
    return result;
  }, [exam]);

  const currentQuestion = paddedQuestions[currentIdx];
  const totalQuestions = paddedQuestions.length;

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleReviewLater = (id: string) => {
    setReviewLater(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowSolution(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowSolution(false);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    let correctCount = 0;
    paddedQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = (correctCount / totalQuestions) * 10;
    setIsSubmitted(true);

    const xpReward = Math.round((correctCount / totalQuestions) * 100);
    onFinishExam(exam.id, calculatedScore, xpReward);
  };

  // Statistics
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const stats = useMemo(() => {
    let correctCount = 0;
    paddedQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });
    return {
      correct: correctCount,
      incorrect: totalQuestions - correctCount,
      score: (correctCount / totalQuestions) * 10
    };
  }, [answers, paddedQuestions, totalQuestions]);

  // Calculator logic
  const handleCalcPress = (btn: string) => {
    if (btn === 'C') {
      setCalcDisplay('');
    } else if (btn === '=') {
      try {
        const result = new Function(`return ${calcDisplay.replace(/x/g, '*').replace(/:/g, '/')}`)();
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay('Lỗi');
      }
    } else {
      setCalcDisplay(prev => prev + btn);
    }
  };

  // ── RENDER SUB-COMPONENTS TO PREVENT DUPLICATION ──

  const renderLeftSidebarContent = (isDrawer = false) => (
    <>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 className="text-[13px] font-black text-[#1E293B] uppercase">
            Danh sách câu hỏi
          </h2>
          {isDrawer && (
            <button
              onClick={() => setIsLeftDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Legend indicators */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B] font-bold mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            <span>Chưa làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            <span>Đánh dấu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span>
            <span>Xem lại</span>
          </div>
        </div>

        {/* Questions Grid with sections scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Part 1 */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">PHẦN 1: TRẮC NGHIỆM</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {paddedQuestions.slice(0, 25).map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = currentIdx === idx;
                const isBookmarked = bookmarked.includes(q.id);
                const isReview = reviewLater.includes(q.id);

                let btnClass = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';
                if (isAnswered) btnClass = 'border-[#10B981] text-[#10B981] bg-emerald-50/10';
                if (isBookmarked) btnClass = 'border-[#F59E0B] text-[#F59E0B] bg-amber-50/10';
                if (isReview) btnClass = 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6]';
                if (isActive) btnClass = 'border-[#6366F1] ring-2 ring-indigo-100 text-[#6366F1] bg-indigo-50/10 font-bold';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIdx(idx);
                      if (isDrawer) setIsLeftDrawerOpen(false);
                    }}
                    className={`aspect-square rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part 2 */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">PHẦN 2: TRẮC NGHIỆM</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {paddedQuestions.slice(25, 50).map((q, idx) => {
                const realIdx = idx + 25;
                const isAnswered = answers[q.id] !== undefined;
                const isActive = currentIdx === realIdx;
                const isBookmarked = bookmarked.includes(q.id);
                const isReview = reviewLater.includes(q.id);

                let btnClass = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';
                if (isAnswered) btnClass = 'border-[#10B981] text-[#10B981] bg-emerald-50/10';
                if (isBookmarked) btnClass = 'border-[#F59E0B] text-[#F59E0B] bg-amber-50/10';
                if (isReview) btnClass = 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6]';
                if (isActive) btnClass = 'border-[#6366F1] ring-2 ring-indigo-100 text-[#6366F1] bg-indigo-50/10 font-bold';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIdx(realIdx);
                      if (isDrawer) setIsLeftDrawerOpen(false);
                    }}
                    className={`aspect-square rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {realIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {!isDrawer && (
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="p-3.5 border-t border-slate-100 text-left text-xs font-semibold text-[#64748B] hover:text-[#6366F1] flex items-center gap-1.5 transition-colors cursor-pointer w-full bg-slate-50/30"
        >
          <ChevronLeft size={14} />
          Thu gọn
        </button>
      )}
    </>
  );

  const renderRightSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-5 p-5 overflow-y-auto flex-1">
        {/* Countdown Clock Box */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center">
          <div className="flex items-center justify-between w-full pb-1.5 border-b border-slate-50 mb-3">
            <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-[#6366F1]" />
              Thời gian làm bài
            </h3>
            {isDrawer && (
              <button
                onClick={() => setIsRightDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {/* Circular SVG Countdown */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="55"
                className="stroke-[#EEF2FF]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="55"
                className="stroke-[#6366F1] transition-all duration-1000"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 55}
                strokeDashoffset={2 * Math.PI * 55 * (1 - timeLeft / (exam.durationMinutes * 60))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#1E293B]">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-bold text-[#94A3B8] mt-0.5">Còn lại</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-[#64748B]">
            <strong className="text-[#1E293B]">{exam.durationMinutes}:00</strong> Tổng thời gian
          </div>
        </div>

        {/* Progress Box */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-[#1E293B] mb-2">
            <span>Tiến độ bài làm</span>
            <span className="text-[#6366F1]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#6366F1] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-[#64748B] font-bold mb-3">
            {answeredCount} / {totalQuestions} câu đã làm
          </div>

          {/* Status Breakdown items */}
          <div className="space-y-2 border-t border-slate-50 pt-2.5">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span className="font-semibold text-slate-500">Đã làm</span>
              </div>
              <span className="font-black text-[#1E293B]">{answeredCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                <span className="font-semibold text-slate-500">Chưa làm</span>
              </div>
              <span className="font-black text-[#1E293B]">{unansweredCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <span className="font-semibold text-slate-500">Đánh dấu</span>
              </div>
              <span className="font-black text-[#1E293B]">{bookmarked.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                <span className="font-semibold text-slate-500">Xem lại</span>
              </div>
              <span className="font-black text-[#1E293B]">{reviewLater.length}</span>
            </div>
          </div>
        </div>

        {/* Utility Tools Box */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2">
          <h3 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider pb-1.5 border-b border-slate-50">
            Công cụ hỗ trợ
          </h3>
          <button
            onClick={() => {
              setActiveTool(activeTool === 'calculator' ? null : 'calculator');
              if (isDrawer) setIsRightDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${activeTool === 'calculator' ? 'bg-indigo-50/60 text-[#6366F1]' : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <div className="flex items-center gap-2">
              <Calculator size={14} className={activeTool === 'calculator' ? 'text-[#6366F1]' : 'text-slate-400'} />
              <span>Máy tính bỏ túi</span>
            </div>
            <ChevronRight size={13} className="text-slate-400" />
          </button>
          <button
            onClick={() => {
              setActiveTool(activeTool === 'formulas' ? null : 'formulas');
              if (isDrawer) setIsRightDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${activeTool === 'formulas' ? 'bg-indigo-50/60 text-[#6366F1]' : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <div className="flex items-center gap-2">
              <Book size={14} className={activeTool === 'formulas' ? 'text-[#6366F1]' : 'text-slate-400'} />
              <span>Công thức trọng tâm</span>
            </div>
            <ChevronRight size={13} className="text-slate-400" />
          </button>
          <button
            onClick={() => {
              setActiveTool(activeTool === 'periodic' ? null : 'periodic');
              if (isDrawer) setIsRightDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${activeTool === 'periodic' ? 'bg-indigo-50/60 text-[#6366F1]' : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <div className="flex items-center gap-2">
              <Columns size={14} className={activeTool === 'periodic' ? 'text-[#6366F1]' : 'text-slate-400'} />
              <span>Bảng tuần hoàn</span>
            </div>
            <ChevronRight size={13} className="text-slate-400" />
          </button>
          <button
            onClick={() => {
              setActiveTool(activeTool === 'scratchpad' ? null : 'scratchpad');
              if (isDrawer) setIsRightDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${activeTool === 'scratchpad' ? 'bg-indigo-50/60 text-[#6366F1]' : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className={activeTool === 'scratchpad' ? 'text-[#6366F1]' : 'text-slate-400'} />
              <span>Giấy nháp</span>
            </div>
            <ChevronRight size={13} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/30">
        <button
          onClick={() => {
            handleSubmit();
            if (isDrawer) setIsRightDrawerOpen(false);
          }}
          className="w-full py-3 bg-[#6366F1] hover:bg-[#4F46E5] rounded-2xl text-white font-black text-xs cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all"
        >
          <CheckCircle2 size={14} />
          Nộp bài thi trắc nghiệm
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans select-none antialiased">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-100 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* Mobile Left Drawer Trigger (Question List) */}
          <button
            onClick={() => setIsLeftDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Xem sơ đồ câu hỏi"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>

          <div className="flex flex-col">
            <h1 className="text-xs sm:text-[15px] font-black text-[#1E293B] line-clamp-1 max-w-[150px] sm:max-w-[300px]">
              {exam.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs text-[#64748B]">
              <span className="hidden sm:inline">Thí sinh: <strong className="text-[#1E293B]">{user.name}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>50 câu</span>
              <span>•</span>
              <span>90 phút</span>
              <span>•</span>
              <span className="bg-[#EEF2FF] text-[#6366F1] font-bold px-1.5 py-0.5 rounded-md text-[8px] sm:text-[10px] uppercase">
                Đang làm bài
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Right Drawer Trigger (Clock & Tools) */}
          <button
            onClick={() => setIsRightDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-[#6366F1] hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Xem tiến độ & Công cụ"
          >
            <Clock size={14} />
            <span>{formatTime(timeLeft)}</span>
          </button>

          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors hidden sm:flex">
            <Sun size={15} />
          </button>
          <button
            onClick={() => {
              if (isSubmitted) onExit();
              else handleSubmit();
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-indigo-100 text-[#6366F1] hover:bg-indigo-50 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span className="hidden sm:inline">Nộp bài</span>
          </button>
          <button
            onClick={() => {
              if (isSubmitted) onExit();
              else setShowExitConfirm(true);
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X size={13} />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex w-full relative overflow-hidden">

        {/* ── DESKTOP LEFT SIDEBAR: QUESTION NAVIGATOR ── */}
        <aside className={`hidden lg:flex bg-white border-r border-slate-100 transition-all duration-300 flex-col justify-between ${isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
          {renderLeftSidebarContent()}
        </aside>

        {/* ── MOBILE LEFT DRAWER ── */}
        {isLeftDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={() => setIsLeftDrawerOpen(false)} />
            <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col justify-between shadow-2xl animate-slideRight">
              {renderLeftSidebarContent(true)}
            </div>
          </div>
        )}

        {/* Floating Expand Sidebar Button (if collapsed on Desktop) */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-4 top-4 z-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-md text-xs font-bold text-[#6366F1] flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer hidden lg:flex"
          >
            Danh sách câu hỏi
            <ChevronRight size={14} />
          </button>
        )}

        {/* ── CENTER AREA: QUESTION DETAIL ── */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-w-4xl mx-auto w-full">

          {/* Exit banner confirm */}
          {showExitConfirm && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-rose-700">Xác nhận rời khỏi bài thi?</h4>
                <p className="text-[11px] text-rose-600/80 mt-1">
                  Mọi tiến độ làm bài thi của bạn sẽ không được lưu lại. Bạn có chắc chắn muốn thoát?
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={onExit}
                    className="px-3.5 py-1.5 bg-rose-600 text-white text-[11px] font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Thoát và hủy kết quả
                  </button>
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Tiếp tục làm bài
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isSubmitted || showReview ? (
            /* Question panel */
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-5 sm:p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[480px]">

              {/* Header navigations */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrev}
                      disabled={currentIdx === 0}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-bold text-[#1E293B]">
                      Câu {currentIdx + 1} / {totalQuestions}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentIdx === totalQuestions - 1}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmark(currentQuestion.id)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${bookmarked.includes(currentQuestion.id)
                          ? 'border-[#F59E0B] bg-amber-50/40 text-[#F59E0B]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-500'
                        }`}
                    >
                      <Bookmark size={12} className={bookmarked.includes(currentQuestion.id) ? 'fill-[#F59E0B]' : ''} />
                      Đánh dấu
                    </button>
                    <button
                      onClick={() => toggleReviewLater(currentQuestion.id)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${reviewLater.includes(currentQuestion.id)
                          ? 'border-[#8B5CF6] bg-purple-50/40 text-[#8B5CF6]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-500'
                        }`}
                    >
                      <Eye size={12} />
                      Xem lại sau
                    </button>
                  </div>
                </div>

                {/* Question Level Badge and Content */}
                <div className="mt-5">
                  <div className="flex gap-2">
                    <span className="bg-[#6366F1] text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                      Câu {currentIdx + 1}
                    </span>
                    <span className="bg-slate-100 text-[#475569] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                      {currentIdx % 3 === 0 ? 'Nhận biết' : currentIdx % 3 === 1 ? 'Thông hiểu' : 'Vận dụng'}
                    </span>
                  </div>

                  <div className="text-[13px] font-semibold text-[#1E293B] mt-4 leading-relaxed">
                    {currentQuestion.text}
                  </div>

                  {/* Variation Table display for question 1 in Math exam */}
                  {exam.subject === 'Toán học' && currentIdx === 0 && (
                    <VariationTable />
                  )}
                </div>

                {/* Options selection list */}
                <div className="grid grid-cols-1 gap-2.5 mt-5">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isSelected = answers[currentQuestion.id] === oIdx;

                    let optClass = 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/30';
                    let badgeClass = 'bg-slate-100 text-[#64748B] border border-slate-200';

                    if (isSelected) {
                      optClass = 'border-[#6366F1] bg-[#6366F1]/5';
                      badgeClass = 'bg-[#6366F1] text-white border-[#6366F1]';
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                        className={`w-full flex items-center justify-between gap-3.5 p-3.5 border rounded-2xl text-left text-xs transition-colors cursor-pointer ${optClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${badgeClass}`}>
                            {letter}
                          </span>
                          <span className="font-semibold text-slate-700 leading-relaxed">{opt}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solution Collapsible Box */}
              {(isSubmitted || showSolution) && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#6366F1]" />
                      Lời giải chi tiết
                    </span>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="text-[10px] text-[#6366F1] font-bold hover:underline cursor-pointer"
                    >
                      {showSolution ? 'Ẩn lời giải ⌃' : 'Xem lời giải ⌵'}
                    </button>
                  </div>
                  {showSolution && (
                    <p className="text-xs text-[#475569] leading-relaxed mt-2 pl-5 border-l-2 border-indigo-100">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Show Solution Hint (if not submitted yet but need a hint/solution toggle) */}
              {!isSubmitted && (
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="text-xs font-bold text-[#6366F1] flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <Lightbulb size={14} className="text-[#6366F1] fill-indigo-50" />
                      {showSolution ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}
                    </button>
                  </div>
                  {showSolution && (
                    <p className="text-[11px] text-[#475569] leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/30">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* POST-SUBMISSION RESULTS CARD */
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6 flex-1 flex flex-col justify-center items-center">
              <div className="max-w-[450px] mx-auto space-y-4">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã nộp bài thi thành công</span>
                  <h2 className="text-lg font-bold text-[#1E293B] mt-1">Kết quả của {user.name}</h2>
                </div>

                {/* Score panel */}
                <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-3 gap-4 border border-slate-100">
                  <div>
                    <div className="text-2xl font-bold text-[#1E293B]">{stats.score.toFixed(1)}</div>
                    <div className="text-[10px] text-[#64748B]">Điểm số</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#10B981]">{stats.correct}</div>
                    <div className="text-[10px] text-[#64748B]">Chính xác</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{stats.incorrect}</div>
                    <div className="text-[10px] text-[#64748B]">Sai sót</div>
                  </div>
                </div>

                {/* XP rewards */}
                {stats.score >= 5.0 ? (
                  <div className="p-3.5 bg-indigo-50/50 text-[#6366F1] rounded-2xl text-xs font-semibold border border-indigo-100/50 flex items-center justify-center gap-2">
                    <Sparkles size={16} className="fill-[#6366F1] text-[#6366F1] shrink-0" />
                    <span>Chúc mừng! Bạn tích lũy thành công <strong>+{Math.round((stats.correct / totalQuestions) * 100)} XP</strong> và duy trì chuỗi học tập.</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 text-[#64748B] border border-slate-100 rounded-2xl text-xs font-medium">
                    Hãy nỗ lực đạt trên 5.0 điểm ở lần sau để bắt đầu nhận thưởng XP nhé!
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    onClick={() => {
                      setShowReview(true);
                      setCurrentIdx(0);
                    }}
                    className="w-full sm:flex-1 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Xem chi tiết lời giải
                  </button>
                  <button
                    onClick={onExit}
                    className="w-full sm:flex-1 py-2.5 border border-slate-200 text-[#1E293B] text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Quay về kho đề thi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom navigation bar */}
          {(!isSubmitted || showReview) && (
            <div className="flex items-center justify-between mt-5 gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#475569] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:hover:bg-white flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                Câu trước
              </button>



              <button
                onClick={handleNext}
                disabled={currentIdx === totalQuestions - 1}
                className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-50 disabled:hover:bg-[#6366F1] flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-100"
              >
                Câu tiếp theo
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </main>

        {/* ── DESKTOP RIGHT COLUMN: CLOCK & TOOLS ── */}
        <aside className="hidden lg:flex w-72 bg-white border-l border-slate-100 flex-col justify-between shrink-0">
          {renderRightSidebarContent()}
        </aside>

        {/* ── MOBILE RIGHT DRAWER ── */}
        {isRightDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={() => setIsRightDrawerOpen(false)} />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl animate-slideLeft z-50">
              {renderRightSidebarContent(true)}
            </div>
          </div>
        )}
      </div>

      {/* ── UTILITY MODALS ── */}
      {activeTool && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto relative animate-scaleIn">
            <button
              onClick={() => setActiveTool(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            {/* 1. Calculator Panel */}
            {activeTool === 'calculator' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5">
                  <Calculator size={16} className="text-[#6366F1]" />
                  Máy tính bỏ túi
                </h3>
                <div className="bg-slate-100 rounded-2xl p-4 mb-4 text-right text-lg font-black text-[#1E293B] break-all min-h-12 flex items-center justify-end border border-slate-200/50">
                  {calcDisplay || '0'}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['C', '(', ')', ':', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', ''].map((btn, bIdx) => {
                    if (btn === '') return <div key={bIdx}></div>;
                    const isOperator = ['+', '-', 'x', ':', '=', 'C', '(', ')'].includes(btn);
                    return (
                      <button
                        key={bIdx}
                        onClick={() => handleCalcPress(btn)}
                        className={`py-3.5 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95 ${btn === '='
                            ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-200'
                            : isOperator
                              ? 'bg-slate-100 text-[#6366F1] hover:bg-slate-200'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/30'
                          }`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Formulas Panel */}
            {activeTool === 'formulas' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5">
                  <Book size={16} className="text-[#6366F1]" />
                  Công thức trọng tâm
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-[#475569] leading-relaxed">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/30">
                    <h4 className="font-black text-[#1E293B] mb-1">1. Đạo hàm & Nguyên hàm</h4>
                    <p>• (x^n)' = n . x^(n-1)</p>
                    <p>• (sin x)' = cos x</p>
                    <p>• ∫ x^n dx = [x^(n+1)] / (n+1) + C</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/30">
                    <h4 className="font-black text-[#1E293B] mb-1">2. Mũ & Logarit</h4>
                    <p>• log_a(b . c) = log_a(b) + log_a(c)</p>
                    <p>• a^(x+y) = a^x . a^y</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/30">
                    <h4 className="font-black text-[#1E293B] mb-1">3. Lượng giác</h4>
                    <p>• sin²x + cos²x = 1</p>
                    <p>• sin 2x = 2 sin x cos x</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Periodic Table Panel */}
            {activeTool === 'periodic' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5">
                  <Columns size={16} className="text-[#6366F1]" />
                  Bảng tuần hoàn thu gọn
                </h3>
                <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {[
                    { n: 1, s: 'H', m: 1.008, c: 'bg-red-50 text-red-600' },
                    { n: 2, s: 'He', m: 4.003, c: 'bg-blue-50 text-blue-600' },
                    { n: 3, s: 'Li', m: 6.94, c: 'bg-amber-50 text-amber-600' },
                    { n: 4, s: 'Be', m: 9.012, c: 'bg-amber-50 text-amber-600' },
                    { n: 5, s: 'B', m: 10.81, c: 'bg-green-50 text-green-600' },
                    { n: 6, s: 'C', m: 12.011, c: 'bg-green-50 text-green-600' },
                    { n: 7, s: 'N', m: 14.007, c: 'bg-green-50 text-green-600' },
                    { n: 8, s: 'O', m: 15.999, c: 'bg-green-50 text-green-600' },
                    { n: 9, s: 'F', m: 18.998, c: 'bg-green-50 text-green-600' },
                    { n: 10, s: 'Ne', m: 20.18, c: 'bg-blue-50 text-blue-600' },
                    { n: 11, s: 'Na', m: 22.99, c: 'bg-amber-50 text-amber-600' },
                    { n: 12, s: 'Mg', m: 24.305, c: 'bg-amber-50 text-amber-600' },
                    { n: 13, s: 'Al', m: 26.982, c: 'bg-slate-50 text-slate-600' },
                    { n: 14, s: 'Si', m: 28.085, c: 'bg-green-50 text-green-600' },
                    { n: 15, s: 'P', m: 30.974, c: 'bg-green-50 text-green-600' },
                  ].map((el, eIdx) => (
                    <div key={eIdx} className={`${el.c} rounded-xl p-2 border border-slate-100 text-center flex flex-col justify-between h-14`}>
                      <span className="text-[9px] font-bold block text-left leading-none">{el.n}</span>
                      <span className="text-sm font-black tracking-tighter">{el.s}</span>
                      <span className="text-[8px] font-semibold block leading-none">{el.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Scratchpad Panel */}
            {activeTool === 'scratchpad' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5">
                  <FileText size={16} className="text-[#6366F1]" />
                  Giấy nháp kỹ thuật số
                </h3>
                <textarea
                  value={scratchText}
                  onChange={e => setScratchText(e.target.value)}
                  placeholder="Ghi chú nhanh, các phép tính nháp hoặc công thức tính toán tại đây..."
                  className="w-full h-44 p-4 border border-[#E2E8F0] rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6366F1] resize-none"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveExam;
