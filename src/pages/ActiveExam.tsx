import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, X, AlertTriangle, Lightbulb, Sparkles, BookOpen } from 'lucide-react';
import type { Exam, User } from '../types';

interface ActiveExamProps {
  exam: Exam;
  user: User;
  onFinishExam: (examId: string, score: number, xpGained: number) => void;
  onExit: () => void;
}

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
  const [showHint, setShowHint] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Review answers states
  const [showReview, setShowReview] = useState(false);

  // 2. Timer countdown
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Format time (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
    setShowHint(false); // Hide hint when selecting
  };

  const currentQuestion = exam.questions[currentIdx];
  const totalQuestions = exam.questions.length;

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowHint(false);
    }
  };

  // Score Calculation and submission
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    let correctCount = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = (correctCount / totalQuestions) * 10;
    setIsSubmitted(true);
    
    // Earn XP proportional to performance + streak bonuses
    const xpReward = Math.round((correctCount / totalQuestions) * 100);
    
    onFinishExam(exam.id, calculatedScore, xpReward);
  };

  const scorePercentage = (Object.keys(answers).length / totalQuestions) * 100;
  
  // Calculate statistics for the results card
  const stats = (() => {
    let correctCount = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });
    return {
      correct: correctCount,
      incorrect: totalQuestions - correctCount,
      score: (correctCount / totalQuestions) * 10
    };
  })();

  return (
    <div className="min-h-screen bg-bg-surface flex flex-col font-sans">
      
      {/* 1. Sacred Header: Distraction Free */}
      <header className="bg-white border-b border-slate-150 h-16 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isSubmitted) {
                onExit();
              } else {
                setShowExitConfirm(true);
              }
            }}
            className="p-1.5 rounded-btn hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-default"
            title="Thoát khỏi bài thi"
          >
            <X size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Thi trắc nghiệm CBT</span>
            <h1 className="text-xs font-semibold text-text-primary max-w-[280px] sm:max-w-[450px] line-clamp-1">
              {exam.title}
            </h1>
          </div>
        </div>

        {/* Timer and Action */}
        <div className="flex items-center gap-4">
          {!isSubmitted && (
            <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-btn border ${
              timeLeft < 300 
                ? 'bg-danger-light text-danger border-danger/25 animate-pulse' 
                : 'bg-slate-50 text-text-primary border-slate-200'
            }`}>
              <Clock size={15} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-btn shadow-sm transition-default"
            >
              Nộp bài
            </button>
          ) : (
            <button
              onClick={onExit}
              className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-text-primary text-xs font-semibold rounded-btn transition-default"
            >
              Thoát giao diện thi
            </button>
          )}
        </div>
      </header>

      {/* Main content Layout */}
      <div className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Area: Question content (occupies 3/4 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Exit confirmation alert banner */}
          {showExitConfirm && (
            <div className="p-4 bg-danger-light border border-danger/20 rounded-card flex items-start gap-3">
              <AlertTriangle className="text-danger shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-danger">Xác nhận rời khỏi bài thi?</h4>
                <p className="text-[11px] text-text-secondary mt-1">
                  Mọi tiến độ làm bài thi của bạn sẽ không được lưu lại nếu bạn thoát ngay lúc này. Bạn có chắc chắn muốn thoát?
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={onExit}
                    className="px-3 py-1 bg-danger text-white text-[10px] font-semibold rounded-btn hover:bg-danger-hover transition-default"
                  >
                    Thoát và Hủy kết quả
                  </button>
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="px-3 py-1 border border-slate-200 bg-white text-[10px] font-semibold text-text-primary rounded-btn hover:bg-slate-50 transition-default"
                  >
                    Tiếp tục làm bài
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isSubmitted || showReview ? (
            /* ACTIVE EXAM TEST PANEL */
            <div className="bg-white border border-slate-150 rounded-card p-6 sm:p-8 notion-shadow space-y-6">
              
              {/* Question indicator & Action toolbar */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-xs font-semibold text-text-secondary">
                  Câu hỏi {currentIdx + 1} của {totalQuestions}
                </span>

                {/* AI Tutor Hint button (only available if not submitted yet) */}
                {!isSubmitted && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline bg-primary-light px-2.5 py-1 rounded-btn"
                  >
                    <Lightbulb size={13} className="text-primary fill-primary-light" />
                    Trợ lý gia sư AI
                  </button>
                )}
              </div>

              {/* Question text */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-text-primary leading-relaxed">
                  {currentQuestion.text}
                </div>
              </div>

              {/* Options selection */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isSelected = answers[currentQuestion.id] === oIdx;
                  
                  // Tactile keycap styling
                  let optionStyle = 'border-slate-200 border-b-[3.5px] hover:border-slate-300 hover:bg-slate-50/50 active:translate-y-[1px] active:border-b-[2.5px]';
                  let letterStyle = 'bg-slate-100 text-text-secondary border-b border-slate-200';

                  if (isSelected && !isSubmitted) {
                    optionStyle = 'border-primary border-b-[3.5px] border-b-primary-hover bg-primary-light/10 active:translate-y-[1px] active:border-b-[2.5px]';
                    letterStyle = 'bg-primary text-white border-b border-primary-hover';
                  }

                  if (isSubmitted) {
                    const isCorrect = currentQuestion.correctOptionIndex === oIdx;
                    if (isCorrect) {
                      optionStyle = 'border-success border-b-[3.5px] border-b-success-hover bg-success-light/10 text-success pointer-events-none';
                      letterStyle = 'bg-success text-white border-b border-success-hover';
                    } else if (isSelected) {
                      optionStyle = 'border-danger border-b-[3.5px] border-b-danger-hover bg-danger-light/10 text-danger pointer-events-none';
                      letterStyle = 'bg-danger text-white border-b border-danger-hover';
                    } else {
                      optionStyle = 'border-slate-100 border-b text-text-secondary opacity-50 pointer-events-none';
                      letterStyle = 'bg-slate-50 text-slate-450';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                      className={`w-full flex items-center gap-3.5 p-3.5 border rounded-btn text-left text-xs transition-default ${optionStyle}`}
                    >
                      <span className={`h-6 w-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${letterStyle}`}>
                        {letter}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* AI Tutor Hint Text Box */}
              {showHint && !isSubmitted && (
                <div className="p-4 bg-accent-light/50 border border-accent/15 rounded-card space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                    <Sparkles size={14} className="fill-accent" />
                    <span>Gia sư AI gợi ý học tập:</span>
                  </div>
                  <p className="text-[11px] text-text-primary leading-relaxed pl-5 italic">
                    "{currentQuestion.hint}"
                  </p>
                </div>
              )}

              {/* Explanation block in review mode */}
              {isSubmitted && (
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-card space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                    <BookOpen size={14} className="text-primary" />
                    <span>Giải thích đáp án chi tiết:</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed pl-5">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  disabled={currentIdx === 0}
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-btn text-xs font-semibold text-text-primary hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-default"
                >
                  <ChevronLeft size={14} />
                  Câu trước đó
                </button>
                <button
                  disabled={currentIdx === totalQuestions - 1}
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-btn text-xs font-semibold text-text-primary hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-default"
                >
                  Câu tiếp theo
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>
          ) : (
            /* POST-SUBMISSION MOTIVATING STATS CARD */
            <div className="bg-white border border-slate-150 rounded-card p-6 sm:p-10 notion-shadow text-center space-y-6">
              <div className="max-w-[450px] mx-auto space-y-4">
                <div className="h-16 w-16 bg-success-light text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider">Đã nộp bài thi thành công</span>
                  <h2 className="text-lg font-bold text-text-primary mt-1">Kết quả của {user.name}</h2>
                </div>

                {/* Score panel */}
                <div className="bg-slate-50 rounded-card p-5 grid grid-cols-3 gap-4 border border-slate-100">
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stats.score.toFixed(1)}</div>
                    <div className="text-[10px] text-text-secondary">Điểm số</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{stats.correct}</div>
                    <div className="text-[10px] text-text-secondary">Chính xác</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-danger">{stats.incorrect}</div>
                    <div className="text-[10px] text-text-secondary">Sai sót</div>
                  </div>
                </div>

                {/* XP motivation rewards (if any score > 0) */}
                {stats.score >= 5.0 ? (
                  <div className="p-3.5 bg-accent-light text-accent rounded-card text-xs font-semibold border border-accent/10 flex items-center justify-center gap-2">
                    <Sparkles size={16} className="fill-accent shrink-0" />
                    <span>Chúc mừng! Bạn tích lũy thành công <strong>+{Math.round((stats.correct/totalQuestions)*100)} XP</strong> và duy trì chuỗi học tập.</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 text-text-secondary border border-slate-100 rounded-card text-xs font-medium">
                    Hãy nỗ lực đạt trên 5.0 điểm ở lần sau để bắt đầu nhận thưởng XP nhé!
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    onClick={() => {
                      setShowReview(true);
                      setCurrentIdx(0);
                    }}
                    className="w-full sm:flex-1 py-2.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default"
                  >
                    Xem chi tiết lời giải
                  </button>
                  <button
                    onClick={onExit}
                    className="w-full sm:flex-1 py-2.5 border border-slate-200 text-text-primary text-xs font-semibold rounded-btn hover:bg-slate-50 transition-default"
                  >
                    Quay về kho đề thi
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Area: CBT Navigation & Stats (1/4 cols) */}
        <aside className="space-y-6">
          {/* Question navigator panel */}
          <div className="bg-white border border-slate-150 rounded-card p-5 notion-shadow space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary pb-2 border-b border-slate-50">
              Sơ đồ câu hỏi
            </h3>
            
            {/* Squares grid */}
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = currentIdx === idx;
                
                let buttonStyle = 'bg-white border-slate-200 border-b-[3.5px] border-b-slate-300 text-text-primary hover:border-slate-350 active:translate-y-[1px] active:border-b-[2.5px]';
                
                if (isAnswered) {
                  buttonStyle = 'bg-primary-light/35 border-primary/20 border-b-[3.5px] border-b-primary text-primary active:translate-y-[1px] active:border-b-[2.5px]';
                }

                if (isActive) {
                  buttonStyle = 'bg-primary border-primary border-b-[3.5px] border-b-primary-hover text-white';
                }

                if (isSubmitted) {
                  const isCorrect = q.correctOptionIndex === answers[q.id];
                  if (isCorrect) {
                    buttonStyle = 'bg-success border-success border-b-[3.5px] border-b-success-hover text-white';
                  } else if (answers[q.id] !== undefined) {
                    buttonStyle = 'bg-danger border-danger border-b-[3.5px] border-b-danger-hover text-white';
                  } else {
                    buttonStyle = 'bg-slate-50 border-slate-200 border-b text-slate-400';
                  }
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (isSubmitted && !showReview) {
                        setShowReview(true);
                      }
                      setCurrentIdx(idx);
                    }}
                    className={`aspect-square rounded-btn border text-xs font-bold flex items-center justify-center transition-default ${buttonStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Completion percentage bar (only if active) */}
            {!isSubmitted && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] text-text-secondary font-medium">
                  <span>Tiến độ hoàn thành</span>
                  <span>{Math.round(scorePercentage)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick info specs */}
          <div className="bg-white border border-slate-150 rounded-card p-5 notion-shadow text-xs text-text-secondary space-y-3">
            <div className="flex justify-between">
              <span>Đề thi:</span>
              <span className="font-semibold text-text-primary">{exam.subject} {exam.grade}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời lượng:</span>
              <span className="font-semibold text-text-primary">{exam.durationMinutes} phút</span>
            </div>
            <div className="flex justify-between">
              <span>Gia sư AI hỗ trợ:</span>
              <span className="font-semibold text-success flex items-center gap-0.5">Sẵn sàng</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
