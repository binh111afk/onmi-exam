import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CircleDashed, Clock, FileText, HelpCircle, Target } from 'lucide-react';
import type { Course, Document, Exam, User } from '../types';
import { courseProgress } from '../data/mockData';

interface CourseDetailProps {
  course: Course;
  user: User;
  exams: Exam[];
  documents: Document[];
  onSelectLesson: (courseId: string, lessonId: string) => void;
  onBack: () => void;
  onStartPractice: () => void;
  onStartExam: (examId: string) => void;
  onSelectDoc: (docId: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, user, exams, documents, onSelectLesson, onBack, onStartPractice, onStartExam, onSelectDoc }) => {
  const progress = courseProgress(course, user.completedLessons);
  const percent = progress.percent;
  const nextLesson = progress.nextLesson;
  const relatedExams = exams.filter((e) => e.subject === course.subject).slice(0, 2);
  const relatedDocs = documents.filter((d) => d.subject === course.subject).slice(0, 3);

  return (
    <div className="max-w-[1320px] mx-auto px-6 lg:px-8 py-8 antialiased">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer mb-5"
      >
        <ArrowLeft size={14} /> Khóa học
      </button>

      <header className="bg-white border border-slate-100 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-text-primary">{course.title}</h1>
            <p className="text-[11px] text-text-secondary font-medium mt-1">
              {course.subject} • {course.grade} • {progress.total} bài học
            </p>
            <p className="text-xs text-text-secondary font-medium leading-relaxed mt-3 max-w-2xl">
              {course.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-primary">{percent}%</p>
            <p className="text-[10px] font-bold text-text-secondary">{progress.done}/{progress.total} bài hoàn thành</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          {nextLesson ? (
            <button
              onClick={() => onSelectLesson(course.id, nextLesson.id)}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
            >
              {percent === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
            </button>
          ) : (
            <button
              onClick={() => onSelectLesson(course.id, course.chapters[0].lessons[0].id)}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
            >
              Học lại từ đầu
            </button>
          )}
          <button
            onClick={onStartPractice}
            className="px-5 py-2.5 bg-primary-light hover:bg-primary/10 text-primary text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
          >
            Luyện tập
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {course.chapters.map((chapter) => (
          <section key={chapter.id} className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="text-sm font-black text-text-primary mb-4">
              {chapter.title}
            </h2>
            <div className="space-y-2">
              {chapter.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(course.id, lesson.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-primary-light rounded-xl transition-all duration-200 cursor-pointer group text-left"
                >
                  {user.completedLessons[lesson.id] ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <CircleDashed size={16} className="text-slate-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                      {lesson.title}
                    </p>
                    <p className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {lesson.durationMinutes} phút
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </section>
        ))}

        {relatedExams.length > 0 && (
          <section className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="text-sm font-black text-text-primary mb-4">Kiểm tra chương</h2>
            <div className="space-y-2">
              {relatedExams.map((exam) => (
                <div key={exam.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{exam.title}</p>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                      {exam.questionCount} câu • {exam.durationMinutes} phút • {exam.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-black rounded-xl cursor-pointer transition-all duration-200 shrink-0"
                  >
                    Làm bài
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedDocs.length > 0 && (
          <section className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="text-sm font-black text-text-primary mb-4">Tài liệu liên quan</h2>
            <div className="space-y-2">
              {relatedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{doc.title}</p>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                      {doc.pageCount} trang • {doc.readingTimeMinutes} phút đọc
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectDoc(doc.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary-light hover:bg-primary/10 text-primary text-[10px] font-black rounded-xl cursor-pointer transition-all duration-200 shrink-0"
                  >
                    <HelpCircle size={11} /> Xem tài liệu
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Target size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-text-primary">Kiểm tra kiến thức</p>
              <p className="text-[10px] text-text-secondary font-medium">
                {course.practiceCount} bài luyện • {course.examCount} đề thi gắn với khóa này
              </p>
            </div>
          </div>
          <button
            onClick={onStartPractice}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-light hover:bg-primary/10 text-primary text-[11px] font-bold rounded-xl transition-all duration-200 cursor-pointer shrink-0"
          >
            <BookOpen size={12} /> Luyện ngay
          </button>
        </section>
      </div>
    </div>
  );
};
