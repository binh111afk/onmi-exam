import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, X, AlertTriangle, Lightbulb, Sparkles, BookOpen, Bookmark, Eye, Sun, Calculator, Book, Columns, FileText, ArrowUp } from 'lucide-react';
import type { Exam, User } from '../types';

interface ActiveExamProps {
  exam: Exam;
  user: User;
  onFinishExam: (examId: string, score: number, xpGained: number) => void;
  onExit: () => void;
}

const getExamSessionKey = (examId: string) => `omni_exam_session_${examId}`;

const loadExamSession = (examId: string) => {
  try {
    const saved = localStorage.getItem(getExamSessionKey(examId));
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(getExamSessionKey(examId));
    return null;
  }
};

// Variation Table SVG for Math exam
const VariationTable: React.FC = () => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 my-4 flex justify-center overflow-x-auto">
    <svg viewBox="0 0 600 180" className="w-full max-w-[500px]" fill="none">
      <line x1="100" y1="0" x2="100" y2="180" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="0" y1="40" x2="600" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="0" y1="80" x2="600" y2="80" stroke="#CBD5E1" strokeWidth="1.5" />
      <text x="50" y="25" textAnchor="middle" fill="#1E293B" className="text-sm font-bold">x</text>
      <text x="50" y="65" textAnchor="middle" fill="#1E293B" className="text-sm font-bold">f'(x)</text>
      <text x="50" y="130" textAnchor="middle" fill="#1E293B" className="text-sm font-bold">f(x)</text>
      <text x="140" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">-∞</text>
      <text x="280" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">-1</text>
      <text x="420" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">2</text>
      <text x="560" y="25" textAnchor="middle" fill="#475569" className="text-xs font-semibold">+∞</text>
      <text x="210" y="65" textAnchor="middle" fill="#475569" className="text-sm">+</text>
      <text x="280" y="65" textAnchor="middle" fill="#475569" className="text-sm">0</text>
      <text x="350" y="65" textAnchor="middle" fill="#475569" className="text-sm">-</text>
      <text x="420" y="65" textAnchor="middle" fill="#475569" className="text-sm">0</text>
      <text x="490" y="65" textAnchor="middle" fill="#475569" className="text-sm">+</text>
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
  const savedSession: any = loadExamSession(exam.id);

  // States
  const [answers, setAnswers] = useState<Record<string, number>>(savedSession?.answers ?? {});
  const [timeLeft, setTimeLeft] = useState<number>(savedSession?.timeLeft ?? exam.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(savedSession?.isSubmitted ?? false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showReview, setShowReview] = useState<boolean>(savedSession?.showReview ?? false);
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(Boolean(savedSession && !savedSession.isSubmitted));

  const [bookmarked, setBookmarked] = useState<string[]>(savedSession?.bookmarked ?? []);
  const [reviewLater, setReviewLater] = useState<string[]>(savedSession?.reviewLater ?? []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(savedSession?.isSidebarCollapsed ?? false);

  // PDF scroll: currently visible question index (for highlight in sidebar)
  const [visibleIdx, setVisibleIdx] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Drawer states for Mobile
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Tool popups
  const [activeTool, setActiveTool] = useState<'calculator' | 'formulas' | 'periodic' | 'scratchpad' | null>(null);
  const [calcDisplay, setCalcDisplay] = useState<string>(savedSession?.calcDisplay ?? '');
  const [scratchText, setScratchText] = useState<string>(savedSession?.scratchText ?? '');

  // Refs for PDF scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Persist session
  useEffect(() => {
    if (isSubmitted) return;
    localStorage.setItem(getExamSessionKey(exam.id), JSON.stringify({
      answers,
      timeLeft,
      isSubmitted,
      showReview,
      bookmarked,
      reviewLater,
      isSidebarCollapsed,
      calcDisplay,
      scratchText,
    }));
  }, [exam.id, answers, timeLeft, isSubmitted, showReview, bookmarked, reviewLater, isSidebarCollapsed, calcDisplay, scratchText]);

  const handleStartOver = () => {
    localStorage.removeItem(getExamSessionKey(exam.id));
    setAnswers({});
    setTimeLeft(exam.durationMinutes * 60);
    setIsSubmitted(false);
    setShowReview(false);
    setBookmarked([]);
    setReviewLater([]);
    setCalcDisplay('');
    setScratchText('');
    setShowResumeDialog(false);
  };

  // Timer
  useEffect(() => {
    if (isSubmitted || showResumeDialog) return;
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
  }, [isSubmitted, showResumeDialog]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pad questions to 50
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

  const totalQuestions = paddedQuestions.length;

  // Scroll-based visible question tracker
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowScrollTop(container.scrollTop > 300);

    // Find which question is most visible
    const containerTop = container.scrollTop;
    let closestIdx = 0;
    let closestDist = Infinity;
    questionRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const dist = Math.abs(ref.offsetTop - containerTop - 120);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    setVisibleIdx(closestIdx);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to a specific question
  const scrollToQuestion = (idx: number) => {
    const ref = questionRefs.current[idx];
    if (!ref || !scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: ref.offsetTop - 80,
      behavior: 'smooth',
    });
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleReviewLater = (id: string) => {
    setReviewLater(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    let correctCount = 0;
    paddedQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) correctCount++;
    });
    const calculatedScore = (correctCount / totalQuestions) * 10;
    setIsSubmitted(true);
    localStorage.removeItem(getExamSessionKey(exam.id));
    const xpReward = Math.round((correctCount / totalQuestions) * 100);
    onFinishExam(exam.id, calculatedScore, xpReward);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const stats = useMemo(() => {
    let correctCount = 0;
    paddedQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) correctCount++;
    });
    return {
      correct: correctCount,
      incorrect: totalQuestions - correctCount,
      score: (correctCount / totalQuestions) * 10
    };
  }, [answers, paddedQuestions, totalQuestions]);

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

  // ── LEFT SIDEBAR ──
  const renderLeftSidebarContent = (isDrawer = false) => (
    <>
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 className="text-[13px] font-black text-[#1E293B] uppercase">Danh sách câu hỏi</h2>
          {isDrawer && (
            <button onClick={() => setIsLeftDrawerOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B] font-bold mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span><span>Chưa làm</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span><span>Đã làm</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span><span>Đánh dấu</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span><span>Xem lại</span></div>
        </div>

        {/* Question grid — click scrolls to that question */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">PHẦN 1: TRẮC NGHIỆM</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {paddedQuestions.slice(0, 25).map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = visibleIdx === idx;
                const isBookmarkedQ = bookmarked.includes(q.id);
                const isReview = reviewLater.includes(q.id);
                let btnClass = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';
                if (isAnswered) btnClass = 'border-[#10B981] text-[#10B981] bg-emerald-50/10';
                if (isBookmarkedQ) btnClass = 'border-[#F59E0B] text-[#F59E0B] bg-amber-50/10';
                if (isReview) btnClass = 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6]';
                if (isActive) btnClass = 'border-[#6366F1] ring-2 ring-indigo-100 text-[#6366F1] bg-indigo-50/10 font-bold';
                return (
                  <button key={q.id} onClick={() => { scrollToQuestion(idx); if (isDrawer) setIsLeftDrawerOpen(false); }}
                    className={`aspect-square rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">PHẦN 2: TRẮC NGHIỆM</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {paddedQuestions.slice(25, 50).map((q, idx) => {
                const realIdx = idx + 25;
                const isAnswered = answers[q.id] !== undefined;
                const isActive = visibleIdx === realIdx;
                const isBookmarkedQ = bookmarked.includes(q.id);
                const isReview = reviewLater.includes(q.id);
                let btnClass = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';
                if (isAnswered) btnClass = 'border-[#10B981] text-[#10B981] bg-emerald-50/10';
                if (isBookmarkedQ) btnClass = 'border-[#F59E0B] text-[#F59E0B] bg-amber-50/10';
                if (isReview) btnClass = 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6]';
                if (isActive) btnClass = 'border-[#6366F1] ring-2 ring-indigo-100 text-[#6366F1] bg-indigo-50/10 font-bold';
                return (
                  <button key={q.id} onClick={() => { scrollToQuestion(realIdx); if (isDrawer) setIsLeftDrawerOpen(false); }}
                    className={`aspect-square rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}>
                    {realIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {!isDrawer && (
        <button onClick={() => setIsSidebarCollapsed(true)}
          className="p-3.5 border-t border-slate-100 text-left text-xs font-semibold text-[#64748B] hover:text-[#6366F1] flex items-center gap-1.5 transition-colors cursor-pointer w-full bg-slate-50/30">
          <ChevronLeft size={14} />Thu gọn
        </button>
      )}
    </>
  );

  // ── RIGHT SIDEBAR ──
  const renderRightSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-5 p-5 overflow-y-auto flex-1">
        {/* Clock */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center">
          <div className="flex items-center justify-between w-full pb-1.5 border-b border-slate-50 mb-3">
            <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-[#6366F1]" />Thời gian làm bài
            </h3>
            {isDrawer && (
              <button onClick={() => setIsRightDrawerOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="55" className="stroke-[#EEF2FF]" strokeWidth="10" fill="transparent" />
              <circle cx="72" cy="72" r="55" className="stroke-[#6366F1] transition-all duration-1000" strokeWidth="10" fill="transparent"
                strokeDasharray={2 * Math.PI * 55}
                strokeDashoffset={2 * Math.PI * 55 * (1 - timeLeft / (exam.durationMinutes * 60))}
                strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#1E293B]">{formatTime(timeLeft)}</span>
              <span className="text-[10px] font-bold text-[#94A3B8] mt-0.5">Còn lại</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-[#64748B]">
            <strong className="text-[#1E293B]">{exam.durationMinutes}:00</strong> Tổng thời gian
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-[#1E293B] mb-2">
            <span>Tiến độ bài làm</span>
            <span className="text-[#6366F1]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#6366F1] transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="text-[11px] text-[#64748B] font-bold mb-3">{answeredCount} / {totalQuestions} câu đã làm</div>
          <div className="space-y-2 border-t border-slate-50 pt-2.5">
            {[
              { label: 'Đã làm', color: '#10B981', count: answeredCount },
              { label: 'Chưa làm', color: '#CBD5E1', count: unansweredCount },
              { label: 'Đánh dấu', color: '#F59E0B', count: bookmarked.length },
              { label: 'Xem lại', color: '#8B5CF6', count: reviewLater.length },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }}></span>
                  <span className="font-semibold text-slate-500">{item.label}</span>
                </div>
                <span className="font-black text-[#1E293B]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2">
          <h3 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider pb-1.5 border-b border-slate-50">Công cụ hỗ trợ</h3>
          {[
            { id: 'calculator' as const, Icon: Calculator, label: 'Máy tính bỏ túi' },
            { id: 'formulas' as const, Icon: Book, label: 'Công thức trọng tâm' },
            { id: 'periodic' as const, Icon: Columns, label: 'Bảng tuần hoàn' },
            { id: 'scratchpad' as const, Icon: FileText, label: 'Giấy nháp' },
          ].map(({ id, Icon, label }) => (
            <button key={id}
              onClick={() => { setActiveTool(activeTool === id ? null : id); if (isDrawer) setIsRightDrawerOpen(false); }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${activeTool === id ? 'bg-indigo-50/60 text-[#6366F1]' : 'hover:bg-slate-50 text-slate-600'}`}>
              <div className="flex items-center gap-2">
                <Icon size={14} className={activeTool === id ? 'text-[#6366F1]' : 'text-slate-400'} />
                <span>{label}</span>
              </div>
              <ChevronRight size={13} className="text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/30">
        <button onClick={() => { handleSubmit(); if (isDrawer) setIsRightDrawerOpen(false); }}
          className="w-full py-3 bg-[#6366F1] hover:bg-[#4F46E5] rounded-2xl text-white font-black text-xs cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all">
          <CheckCircle2 size={14} />Nộp bài thi trắc nghiệm
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#F1F5F9] flex flex-col font-sans select-none antialiased overflow-hidden">
      {/* Resume dialog */}
      {showResumeDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative z-[101] border border-slate-100 text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={22} className="stroke-[2.5]" />
            </div>
            <div className="space-y-2 leading-relaxed">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Bạn có muốn tiếp tục bài thi?</h3>
              <p className="text-[11px] text-slate-500 font-bold">Bài thi này chưa nộp. Chúng tôi đã khôi phục câu hiện tại, đáp án, đánh dấu và giấy nháp của bạn.</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleStartOver} className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition cursor-pointer">Làm lại</button>
              <button onClick={() => setShowResumeDialog(false)} className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-indigo-150">Tiếp tục</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-100 h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setIsLeftDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" title="Xem sơ đồ câu hỏi">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-[15px] font-black text-[#1E293B] line-clamp-1 max-w-[150px] sm:max-w-[300px]">{exam.title}</h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs text-[#64748B]">
              <span className="hidden sm:inline">Thí sinh: <strong className="text-[#1E293B]">{user.name}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>50 câu</span><span>•</span><span>90 phút</span><span>•</span>
              <span className="bg-[#EEF2FF] text-[#6366F1] font-bold px-1.5 py-0.5 rounded-md text-[8px] sm:text-[10px] uppercase">Đang làm bài</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsRightDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-[#6366F1] hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs">
            <Clock size={14} /><span>{formatTime(timeLeft)}</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors hidden sm:flex">
            <Sun size={15} />
          </button>
          <button onClick={() => { if (isSubmitted) onExit(); else handleSubmit(); }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-indigo-100 text-[#6366F1] hover:bg-indigo-50 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer">
            <CheckCircle2 size={13} /><span className="hidden sm:inline">Nộp bài</span>
          </button>
          <button onClick={() => { if (isSubmitted) onExit(); else setShowExitConfirm(true); }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer">
            <X size={13} /><span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Desktop Left Sidebar */}
        <aside className={`hidden lg:flex bg-white border-r border-slate-100 transition-all duration-300 flex-col justify-between shrink-0 ${isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
          {renderLeftSidebarContent()}
        </aside>

        {/* Mobile Left Drawer */}
        {isLeftDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={() => setIsLeftDrawerOpen(false)} />
            <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col justify-between shadow-2xl animate-slideRight">
              {renderLeftSidebarContent(true)}
            </div>
          </div>
        )}

        {/* Expand button when sidebar collapsed */}
        {isSidebarCollapsed && (
          <button onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-4 top-20 z-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-md text-xs font-bold text-[#6366F1] flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer hidden lg:flex">
            Danh sách câu hỏi<ChevronRight size={14} />
          </button>
        )}

        {/* ── PDF SCROLL CENTER AREA ── */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-[#F1F5F9] relative"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-0">

            {/* Exit confirm banner */}
            {showExitConfirm && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-3 animate-fadeIn">
                <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-rose-700">Xác nhận rời khỏi bài thi?</h4>
                  <p className="text-[11px] text-rose-600/80 mt-1">Mọi tiến độ làm bài thi của bạn sẽ không được lưu lại.</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={onExit} className="px-3.5 py-1.5 bg-rose-600 text-white text-[11px] font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer">Thoát và hủy kết quả</button>
                    <button onClick={() => setShowExitConfirm(false)} className="px-3.5 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">Tiếp tục làm bài</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBMITTED RESULT VIEW ── */}
            {isSubmitted && !showReview ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6">
                <div className="max-w-[450px] mx-auto space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã nộp bài thi thành công</span>
                    <h2 className="text-lg font-bold text-[#1E293B] mt-1">Kết quả của {user.name}</h2>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-3 gap-4 border border-slate-100">
                    <div><div className="text-2xl font-bold text-[#1E293B]">{stats.score.toFixed(1)}</div><div className="text-[10px] text-[#64748B]">Điểm số</div></div>
                    <div><div className="text-2xl font-bold text-[#10B981]">{stats.correct}</div><div className="text-[10px] text-[#64748B]">Chính xác</div></div>
                    <div><div className="text-2xl font-bold text-rose-600">{stats.incorrect}</div><div className="text-[10px] text-[#64748B]">Sai sót</div></div>
                  </div>
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
                    <button onClick={() => setShowReview(true)} className="w-full sm:flex-1 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer">Xem chi tiết lời giải</button>
                    <button onClick={onExit} className="w-full sm:flex-1 py-2.5 border border-slate-200 text-[#1E293B] text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer">Quay về kho đề thi</button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── PDF SCROLL QUESTIONS ── */
              <>
                {/* Exam title card (page header) */}
                <div className="bg-white border border-slate-100 rounded-3xl px-8 py-6 shadow-sm mb-4 text-center">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Đề thi trắc nghiệm</div>
                  <h2 className="text-base font-black text-[#1E293B]">{exam.title}</h2>
                  <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-500 font-bold">
                    <span>Môn: {exam.subject}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{totalQuestions} câu hỏi</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>Thời gian: {exam.durationMinutes} phút</span>
                  </div>
                  <div className="mt-3 text-[10px] text-slate-400 font-medium italic">Cuộn xuống để xem và trả lời tất cả câu hỏi</div>
                </div>

                {/* Divider ruler */}
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PHẦN 1: Trắc nghiệm (Câu 1–25)</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* All questions rendered inline */}
                {paddedQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isBookmarkedQ = bookmarked.includes(q.id);
                  const isReviewQ = reviewLater.includes(q.id);
                  const isActive = visibleIdx === idx;

                  // Section divider before question 26
                  const showSection2Divider = idx === 25;

                  return (
                    <React.Fragment key={q.id}>
                      {showSection2Divider && (
                        <div className="flex items-center gap-3 my-6 px-2">
                          <div className="flex-1 h-px bg-slate-200"></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PHẦN 2: Trắc nghiệm (Câu 26–50)</span>
                          <div className="flex-1 h-px bg-slate-200"></div>
                        </div>
                      )}

                      {/* Question Card */}
                      <div
                        ref={el => { questionRefs.current[idx] = el; }}
                        className={`bg-white rounded-3xl border shadow-sm mb-4 transition-all duration-200 ${
                          isActive
                            ? 'border-indigo-200 shadow-indigo-50 shadow-md'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {/* Card header */}
                        <div className={`flex items-center justify-between px-5 py-3 border-b rounded-t-3xl ${
                          isActive ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-50 bg-slate-50/40'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                              isAnswered
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              Câu {idx + 1}
                            </span>
                            <span className="bg-slate-100 text-[#475569] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              {idx % 3 === 0 ? 'Nhận biết' : idx % 3 === 1 ? 'Thông hiểu' : 'Vận dụng'}
                            </span>
                            {isAnswered && (
                              <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 size={11} /> Đã trả lời
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleBookmark(q.id)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                isBookmarkedQ ? 'border-[#F59E0B] bg-amber-50 text-[#F59E0B]' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Đánh dấu"
                            >
                              <Bookmark size={12} className={isBookmarkedQ ? 'fill-[#F59E0B]' : ''} />
                            </button>
                            <button
                              onClick={() => toggleReviewLater(q.id)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                isReviewQ ? 'border-[#8B5CF6] bg-purple-50 text-[#8B5CF6]' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Xem lại sau"
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Question body */}
                        <div className="px-6 pt-5 pb-4">
                          {/* Question text */}
                          <p className="text-[13px] font-semibold text-[#1E293B] leading-relaxed mb-5">
                            {q.text}
                          </p>

                          {/* Math table for first question */}
                          {exam.subject === 'Toán học' && idx === 0 && <VariationTable />}

                          {/* Options */}
                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((opt, oIdx) => {
                              const letter = String.fromCharCode(65 + oIdx);
                              const isSelected = answers[q.id] === oIdx;
                              const isCorrect = isSubmitted && oIdx === q.correctOptionIndex;
                              const isWrong = isSubmitted && isSelected && oIdx !== q.correctOptionIndex;

                              let optClass = 'border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/20';
                              let badgeClass = 'bg-slate-100 text-[#64748B] border border-slate-200';

                              if (isSelected && !isSubmitted) {
                                optClass = 'border-[#6366F1] bg-[#6366F1]/5';
                                badgeClass = 'bg-[#6366F1] text-white border-[#6366F1]';
                              }
                              if (isCorrect) {
                                optClass = 'border-emerald-300 bg-emerald-50';
                                badgeClass = 'bg-emerald-500 text-white border-emerald-500';
                              }
                              if (isWrong) {
                                optClass = 'border-rose-300 bg-rose-50';
                                badgeClass = 'bg-rose-500 text-white border-rose-500';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectOption(q.id, oIdx)}
                                  disabled={isSubmitted}
                                  className={`w-full flex items-center gap-3.5 p-3.5 border rounded-2xl text-left text-xs transition-all cursor-pointer disabled:cursor-default ${optClass}`}
                                >
                                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${badgeClass}`}>
                                    {letter}
                                  </span>
                                  <span className="font-semibold text-slate-700 leading-relaxed">{opt}</span>
                                  {isSelected && !isSubmitted && (
                                    <div className="ml-auto w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Solution (after submit or in review) */}
                          {(isSubmitted || showReview) && (
                            <div className="mt-4 p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
                              <div className="flex items-center gap-1.5 mb-2">
                                <BookOpen size={14} className="text-[#6366F1]" />
                                <span className="text-xs font-black text-[#1E293B]">Lời giải chi tiết</span>
                              </div>
                              <p className="text-[11px] text-[#475569] leading-relaxed pl-5 border-l-2 border-indigo-200">
                                {q.explanation}
                              </p>
                            </div>
                          )}

                          {/* Hint (during exam) */}
                          {!isSubmitted && (
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  // Toggle hint per-question using a subtle expand - here we use a global show solution per-q
                                }}
                                className="text-xs font-bold text-[#6366F1] flex items-center gap-1.5 hover:underline cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                              >
                                <Lightbulb size={13} className="text-[#6366F1] fill-indigo-50" />
                                Gợi ý: {q.hint}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Bottom submit button in scroll flow */}
                {!isSubmitted && (
                  <div className="mt-6 mb-8">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-6 text-center space-y-4">
                      <div className="text-sm font-black text-[#1E293B]">Bạn đã trả lời {answeredCount}/{totalQuestions} câu</div>
                      {unansweredCount > 0 && (
                        <div className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2">
                          ⚠️ Còn {unansweredCount} câu chưa được trả lời. Bạn có chắc muốn nộp bài không?
                        </div>
                      )}
                      <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-[#6366F1] hover:bg-[#4F46E5] rounded-2xl text-white font-black text-sm cursor-pointer shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all mx-auto"
                      >
                        <CheckCircle2 size={16} />
                        Nộp bài thi
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Desktop Right Sidebar */}
        <aside className="hidden lg:flex w-72 bg-white border-l border-slate-100 flex-col justify-between shrink-0">
          {renderRightSidebarContent()}
        </aside>

        {/* Mobile Right Drawer */}
        {isRightDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={() => setIsRightDrawerOpen(false)} />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl animate-slideLeft z-50">
              {renderRightSidebarContent(true)}
            </div>
          </div>
        )}
      </div>

      {/* Scroll-to-top FAB */}
      {showScrollTop && (
        <button
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-80 z-20 w-10 h-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition-all animate-fadeIn cursor-pointer hidden lg:flex"
          title="Lên đầu trang"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Tool Modals */}
      {activeTool && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto relative animate-scaleIn">
            <button onClick={() => setActiveTool(null)} className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
              <X size={15} />
            </button>

            {activeTool === 'calculator' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5"><Calculator size={16} className="text-[#6366F1]" />Máy tính bỏ túi</h3>
                <div className="bg-slate-100 rounded-2xl p-4 mb-4 text-right text-lg font-black text-[#1E293B] break-all min-h-12 flex items-center justify-end border border-slate-200/50">{calcDisplay || '0'}</div>
                <div className="grid grid-cols-4 gap-2">
                  {['C', '(', ')', ':', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', ''].map((btn, bIdx) => {
                    if (btn === '') return <div key={bIdx}></div>;
                    const isOperator = ['+', '-', 'x', ':', '=', 'C', '(', ')'].includes(btn);
                    return (
                      <button key={bIdx} onClick={() => handleCalcPress(btn)}
                        className={`py-3.5 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95 ${btn === '=' ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-200' : isOperator ? 'bg-slate-100 text-[#6366F1] hover:bg-slate-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/30'}`}>
                        {btn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTool === 'formulas' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5"><Book size={16} className="text-[#6366F1]" />Công thức trọng tâm</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-[#475569] leading-relaxed">
                  {[
                    { title: '1. Đạo hàm & Nguyên hàm', items: ["(x^n)' = n . x^(n-1)", "(sin x)' = cos x", "∫ x^n dx = [x^(n+1)] / (n+1) + C"] },
                    { title: '2. Mũ & Logarit', items: ["log_a(b . c) = log_a(b) + log_a(c)", "a^(x+y) = a^x . a^y"] },
                    { title: '3. Lượng giác', items: ["sin²x + cos²x = 1", "sin 2x = 2 sin x cos x"] },
                  ].map(section => (
                    <div key={section.title} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/30">
                      <h4 className="font-black text-[#1E293B] mb-1">{section.title}</h4>
                      {section.items.map(item => <p key={item}>• {item}</p>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTool === 'periodic' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5"><Columns size={16} className="text-[#6366F1]" />Bảng tuần hoàn thu gọn</h3>
                <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {[
                    { n: 1, s: 'H', m: 1.008, c: 'bg-red-50 text-red-600' }, { n: 2, s: 'He', m: 4.003, c: 'bg-blue-50 text-blue-600' },
                    { n: 3, s: 'Li', m: 6.94, c: 'bg-amber-50 text-amber-600' }, { n: 4, s: 'Be', m: 9.012, c: 'bg-amber-50 text-amber-600' },
                    { n: 5, s: 'B', m: 10.81, c: 'bg-green-50 text-green-600' }, { n: 6, s: 'C', m: 12.011, c: 'bg-green-50 text-green-600' },
                    { n: 7, s: 'N', m: 14.007, c: 'bg-green-50 text-green-600' }, { n: 8, s: 'O', m: 15.999, c: 'bg-green-50 text-green-600' },
                    { n: 9, s: 'F', m: 18.998, c: 'bg-green-50 text-green-600' }, { n: 10, s: 'Ne', m: 20.18, c: 'bg-blue-50 text-blue-600' },
                    { n: 11, s: 'Na', m: 22.99, c: 'bg-amber-50 text-amber-600' }, { n: 12, s: 'Mg', m: 24.305, c: 'bg-amber-50 text-amber-600' },
                    { n: 13, s: 'Al', m: 26.982, c: 'bg-slate-50 text-slate-600' }, { n: 14, s: 'Si', m: 28.085, c: 'bg-green-50 text-green-600' },
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

            {activeTool === 'scratchpad' && (
              <div>
                <h3 className="font-black text-sm text-[#1E293B] mb-4 flex items-center gap-1.5"><FileText size={16} className="text-[#6366F1]" />Giấy nháp kỹ thuật số</h3>
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
