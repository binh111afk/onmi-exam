import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { publishedDocService } from '../services/publishedDocService';
import { lessonProgressService } from '../services/lessonProgressService';
import { resolveDuration } from '../utils/lessonEstimate';

// Chapter Overview — tối giản theo spec: nhãn chương + danh sách bài + CTA tiếp tục học.
// KHÔNG dashboard hoá (tiến độ %/điểm/mastery để phase sau).
export const ChapterOverview: React.FC = () => {
  const { docId = '', chapterIdx: chapterIdxParam = '0' } = useParams();
  const navigate = useNavigate();

  const doc = publishedDocService.getById(docId);
  const parsedIdx = Number.parseInt(chapterIdxParam, 10);
  const chapterIdx = Number.isInteger(parsedIdx) && parsedIdx >= 0 ? parsedIdx : 0;
  const chapter = doc?.chapters[chapterIdx];

  if (!doc || !chapter) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-sm font-bold text-text-secondary">Không tìm thấy chương của tài liệu này.</p>
        <Link to="/library" className="inline-block mt-4 text-xs font-bold text-primary hover:underline">← Về thư viện</Link>
      </div>
    );
  }

  const lessons = chapter.lessons;
  const totalMinutes = lessons.reduce((sum, l) => sum + resolveDuration(l), 0);
  const done = (i: number) => lessonProgressService.isCompleted(doc.id, chapterIdx, i);
  const firstIncomplete = lessons.findIndex((_, i) => !done(i));
  const resumeIdx = firstIncomplete === -1 ? 0 : firstIncomplete;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to={`/library/${doc.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-primary transition">
        <ChevronLeft size={14} /> {doc.title}
      </Link>

      <p className="text-xs font-black text-primary uppercase tracking-wider mt-6">{`Chương ${String(chapterIdx + 1).padStart(2, '0')}`}</p>
      <h1 className="text-3xl font-bold text-text-primary mt-1">{chapter.title}</h1>
      <p className="text-sm font-medium text-text-secondary mt-2">
        {lessons.length} bài học · ~{totalMinutes} phút
      </p>

      <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {lessons.map((lesson, i) => {
          const completed = done(i);
          return (
            <button
              key={lesson.id}
              onClick={() => navigate(`/library/${doc.id}/chapter/${chapterIdx}/lesson/${i}`)}
              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50/60 transition cursor-pointer group"
            >
              <span className={`text-sm font-black shrink-0 w-7 ${completed ? 'text-success' : 'text-slate-300'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${completed ? 'text-text-secondary' : 'text-text-primary group-hover:text-primary'}`}>
                  {lesson.title}
                </p>
                <p className="text-xs font-medium text-text-secondary mt-0.5">
                  {resolveDuration(lesson)} phút
                  {lesson.practiceIds.length > 0 && ` · ${lesson.practiceIds.length} bài luyện`}
                </p>
              </div>
              {completed && <CheckCircle2 size={18} className="text-success shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate(`/library/${doc.id}/chapter/${chapterIdx}/lesson/${resumeIdx}`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-100"
        >
          {firstIncomplete === -1 ? 'Học lại từ đầu' : 'Tiếp tục học'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
