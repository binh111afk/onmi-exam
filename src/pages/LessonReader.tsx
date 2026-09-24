import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { publishedDocService } from '../services/publishedDocService';
import { lessonProgressService } from '../services/lessonProgressService';
import { StudentBlockRenderer } from '../components/student/StudentBlockRenderer';

// Lesson Reader — học sinh đọc MỘT bài: breadcrumb, eyebrow "BÀI N" + tiêu đề,
// nội dung qua renderer student, đánh dấu hoàn thành, ← Bài trước / Bài tiếp theo (cross-chapter).
export const LessonReader: React.FC = () => {
  const { docId = '', chapterIdx: chapterIdxParam = '0', lessonIdx: lessonIdxParam = '0' } = useParams();
  const navigate = useNavigate();

  const doc = publishedDocService.getById(docId);
  const cIdx = Number.parseInt(chapterIdxParam, 10);
  const lIdx = Number.parseInt(lessonIdxParam, 10);
  const chapterIdx = doc && Number.isInteger(cIdx) && cIdx >= 0 && cIdx < doc.chapters.length ? cIdx : 0;
  const chapter = doc?.chapters[chapterIdx];
  const safeLIdx = Number.isInteger(lIdx) && lIdx >= 0 ? lIdx : 0;
  const lesson = chapter?.lessons[safeLIdx];
  // Đẩy re-render sau khi ghi progress vào localStorage (state không React-managed)
  const [progressBump, setProgressBump] = useState(0);

  useEffect(() => {
    if (doc && chapter && lesson) {
      lessonProgressService.touch(doc.id, chapterIdx, safeLIdx, lesson.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, chapterIdx, safeLIdx]);

  if (!doc || !chapter || !lesson) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-sm font-bold text-text-secondary">Không tìm thấy bài học này.</p>
        {doc && (
          <Link to={`/library/${doc.id}/chapter/${chapterIdx}`} className="inline-block mt-4 text-xs font-bold text-primary hover:underline">
            ← Về chương
          </Link>
        )}
      </div>
    );
  }

  const completed = progressBump >= 0 && lessonProgressService.isCompleted(doc.id, chapterIdx, safeLIdx);

  // Danh sách phẳng toàn tài liệu để điều hướng trước/sau xuyên chương
  const flat: Array<{ cIdx: number; lIdx: number; title: string }> = [];
  doc.chapters.forEach((ch, ci) => ch.lessons.forEach((l, li) => flat.push({ cIdx: ci, lIdx: li, title: l.title })));
  const flatIdx = flat.findIndex(f => f.cIdx === chapterIdx && f.lIdx === safeLIdx);
  const prev = flatIdx > 0 ? flat[flatIdx - 1] : null;
  const next = flatIdx >= 0 && flatIdx < flat.length - 1 ? flat[flatIdx + 1] : null;

  const go = (f: { cIdx: number; lIdx: number }) =>
    navigate(`/library/${doc.id}/chapter/${f.cIdx}/lesson/${f.lIdx}`);

  const markCompleted = () => {
    lessonProgressService.setCompleted(doc.id, chapterIdx, safeLIdx, lesson.id);
    setProgressBump(b => b + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-1.5 text-xs font-bold min-w-0">
        <Link to={`/library/${doc.id}`} className="text-text-secondary hover:text-primary truncate max-w-[180px]">{doc.title}</Link>
        <span className="text-slate-300">/</span>
        <Link to={`/library/${doc.id}/chapter/${chapterIdx}`} className="text-text-secondary hover:text-primary truncate">{chapter.title}</Link>
      </div>

      <p className="text-xs font-black text-primary uppercase tracking-wider mt-8">Bài {safeLIdx + 1}</p>
      <h1 className="text-3xl font-bold text-text-primary mt-1 leading-snug">{lesson.title}</h1>
      <div className="border-t border-slate-100 mt-6 mb-8" />

      <StudentBlockRenderer blocks={lesson.blocks} />

      <div className="mt-12">
        {completed ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-success/10 text-success text-sm font-bold rounded-xl border border-success/20">
            <CheckCircle2 size={16} /> Đã hoàn thành
          </div>
        ) : (
          <button
            onClick={markCompleted}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-100"
          >
            <CheckCircle2 size={16} /> Đánh dấu hoàn thành
          </button>
        )}
      </div>

      <div className="mt-10 border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
        <button
          onClick={() => prev && go(prev)}
          disabled={!prev}
          className="flex flex-col items-start min-w-0 group disabled:opacity-40 disabled:cursor-default transition"
        >
          <span className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary group-enabled:group-hover:text-primary">
            <ArrowLeft size={13} /> Bài trước
          </span>
          {prev && <span className="text-[11px] font-medium text-slate-400 truncate max-w-[220px]">{prev.title}</span>}
        </button>
        <button
          onClick={() => next && go(next)}
          disabled={!next}
          className="flex flex-col items-end min-w-0 text-right group disabled:opacity-40 disabled:cursor-default transition"
        >
          <span className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary group-enabled:group-hover:text-primary">
            Bài tiếp theo <ArrowRight size={13} />
          </span>
          {next && <span className="text-[11px] font-medium text-slate-400 truncate max-w-[220px]">{next.title}</span>}
        </button>
      </div>

      <Link to={`/library/${doc.id}/chapter/${chapterIdx}`} className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-primary mt-8 transition">
        <ChevronLeft size={13} /> Về chương
      </Link>
    </div>
  );
};
