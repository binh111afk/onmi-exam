import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronUp, History, Target } from 'lucide-react';
import type { Course, Exam, MistakeWithId, User } from '../types';
import { courseProgress, subjectProgress, subjectToSlug } from '../data/mockData';

interface ProgressProps {
  user: User;
  courses: Course[];
  exams: Exam[];
  onSelectCourse: (id: string) => void;
  onSelectExam: (id: string) => void;
  onNavigatePath: (path: string) => void;
}

const practiceTitle = (examId: string): string => {
  if (examId === 'adaptive') return 'Luyện thích ứng';
  if (examId === 'mistakes-review') return 'Ôn câu sai';
  if (examId.startsWith('quick-')) return 'Luyện nhanh';
  if (examId.startsWith('topic-')) return 'Luyện theo chủ đề';
  return examId;
};

export const Progress: React.FC<ProgressProps> = ({ user, courses, exams, onSelectCourse, onSelectExam, onNavigatePath }) => {
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const subjects = useMemo(() => subjectProgress(courses, user.completedLessons), [courses, user.completedLessons]);

  const topics = useMemo(() => {
    // group theo subject+topic — tránh gộp nhầm topic trùng tên khác môn (review P5)
    const groups = new Map<string, { subject: string; entries: MistakeWithId[] }>();
    for (const [questionId, m] of Object.entries(user.examMistakes)) {
      const exam = exams.find((e) => e.id === m.examId);
      if (!exam?.questions.some((q) => q.id === questionId)) continue;
      const key = `${exam.subject}::${m.topic}`;
      const group = groups.get(key) || { subject: exam.subject, entries: [] };
      group.entries.push({ ...m, questionId });
      groups.set(key, group);
    }
    return [...groups.values()].map(({ subject, entries }) => ({
      topic: entries[0].topic,
      entries,
      total: entries.length,
      masteredCount: entries.filter((e) => e.mastered).length,
      subject,
    }));
  }, [user.examMistakes, exams]);

  const history = useMemo(
    () =>
      Object.entries(user.completedExams)
        .map(([examId, r]) => ({ examId, score: r.score, completedAt: r.completedAt }))
        .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1)),
    [user.completedExams]
  );

  const examTitle = (examId: string): string =>
    exams.find((e) => e.id === examId)?.title || practiceTitle(examId);

  return (
    <div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-8 antialiased">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Tiến độ</h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Bạn đang ở đâu và cần cải thiện gì — mọi số liệu derive từ hoạt động học thật của bạn
        </p>
      </header>

      {/* 1. TỔNG QUAN */}
      <section className="mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3">Tổng quan</h2>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
          {subjects.length === 0 ? (
            <p className="text-xs font-bold text-text-secondary text-center py-2">Chưa có khóa học nào</p>
          ) : (
            subjects.map((item) => (
              <div key={item.subject} className="flex items-center gap-3">
                <span className="w-20 text-[11px] font-bold text-text-primary shrink-0">{item.subject}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
                <span className="w-9 text-right text-[11px] font-black text-text-secondary shrink-0">{item.percent}%</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. MÔN HỌC */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-text-primary">Môn học</h2>
          <button
            onClick={() => onNavigatePath('/courses')}
            className="text-[10px] font-black text-primary hover:underline cursor-pointer"
          >
            Tất cả khóa học &rarr;
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {courses.map((course) => {
            // dùng courseProgress — một nguồn sự thật với subjectProgress ở Tổng quan (review P5)
            const { percent, done, total } = courseProgress(course, user.completedLessons);
            return (
              <div key={course.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-text-primary truncate">{course.title}</p>
                  <div className="flex justify-between text-[10px] font-bold text-text-secondary mt-1.5 mb-1">
                    <span>{percent}%</span>
                    <span>{done}/{total} bài</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCourse(course.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-primary-light hover:bg-primary/10 text-primary text-[10px] font-black rounded-xl cursor-pointer transition-all duration-200 shrink-0"
                >
                  Tiếp tục <ArrowRight size={11} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. KIẾN THỨC (mastery từ câu sai) */}
      <section className="mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3">Kiến thức</h2>
        {topics.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
            <Target size={26} className="mx-auto text-slate-300 mb-3" />
            <p className="text-xs font-bold text-text-secondary mb-3">
              Làm bài luyện tập để Omni ghi nhận điểm yếu của bạn
            </p>
            <button
              onClick={() => onNavigatePath('/practice/exams')}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all duration-200"
            >
              Làm bài đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map(({ topic, entries, total, masteredCount, subject }) => {
              const isOpen = openTopic === topic;
              const allMastered = masteredCount === total;
              const slug = subject ? subjectToSlug(subject) : undefined;
              return (
                <div key={topic} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenTopic(isOpen ? null : topic)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-text-primary truncate">{topic}</p>
                      <p className="text-[10px] font-bold text-text-secondary mt-0.5">
                        Đã nắm {masteredCount}/{total} câu từng sai
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-1 rounded-md flex items-center gap-1 ${allMastered ? 'bg-emerald-100/70 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {allMastered && <CheckCircle2 size={10} />} {allMastered ? 'Đã nắm' : 'Đang cải thiện'}
                      </span>
                      {isOpen ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-2 border-t border-slate-50 pt-3">
                      {entries.map((entry) => {
                        const question = exams.find((e) => e.id === entry.examId)?.questions.find((q) => q.id === entry.questionId);
                        return (
                          <div key={entry.questionId} className="flex items-start justify-between gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                            <p className="text-[11px] font-bold text-text-primary line-clamp-2">{question?.text}</p>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0 bg-slate-100 text-text-secondary">
                              sai {entry.wrongCount} lần
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {slug && (
                          <button
                            onClick={() => onNavigatePath(`/practice/quick-${slug}-10`)}
                            className="px-3 py-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-black rounded-xl cursor-pointer transition-all duration-200"
                          >
                            Luyện 10 câu
                          </button>
                        )}
                        <button
                          onClick={() => onNavigatePath('/practice/mistakes-review')}
                          className="px-3 py-2 bg-primary-light hover:bg-primary/10 text-primary text-[10px] font-black rounded-xl cursor-pointer transition-all duration-200"
                        >
                          Ôn câu sai
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. LỊCH SỬ */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-wider text-text-primary mb-3 flex items-center gap-1.5">
          <History size={13} /> Lịch sử làm bài
        </h2>
        {history.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
            <BookOpen size={26} className="mx-auto text-slate-300 mb-3" />
            <p className="text-xs font-bold text-text-secondary mb-3">Chưa có bài làm nào được ghi nhận</p>
            <button
              onClick={() => onNavigatePath('/practice/exams')}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all duration-200"
            >
              Xem kho đề luyện tập
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100">
            {history.map((item) => (
              <button
                key={item.examId}
                onClick={() => onSelectExam(item.examId)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                    {examTitle(item.examId)}
                  </p>
                  <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                    {new Date(item.completedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 ${item.score >= 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-text-secondary'}`}>
                  {item.score.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
