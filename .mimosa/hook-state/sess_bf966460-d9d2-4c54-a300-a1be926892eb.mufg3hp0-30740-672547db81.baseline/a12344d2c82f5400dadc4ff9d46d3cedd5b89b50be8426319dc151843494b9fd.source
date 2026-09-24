import React, { useMemo } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { mockClassAnalytics, mockExams } from '../../data/mockData';

interface TeacherAnalyticsProps {
  examId: string;
  onBack: () => void;
}

// biên tường minh theo điều kiện Gatekeeper: [0-4) | [4-6) | [6-8) | [8-10]
const scoreBuckets = [
  { label: '0 – 4', test: (s: number) => s < 4 },
  { label: '4 – 6', test: (s: number) => s >= 4 && s < 6 },
  { label: '6 – 8', test: (s: number) => s >= 6 && s < 8 },
  { label: '8 – 10', test: (s: number) => s >= 8 && s <= 10 },
];

export const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({ examId, onBack }) => {
  const analytics = mockClassAnalytics.find((a) => a.examId === examId);

  const stats = useMemo(() => {
    if (!analytics) return null;
    const { studentScores, questionAccuracy, topicAccuracy } = analytics;
    const avg = studentScores.length > 0
      ? studentScores.reduce((s, v) => s + v, 0) / studentScores.length
      : 0;
    const accuracy = questionAccuracy.length > 0
      ? questionAccuracy.reduce((s, v) => s + v, 0) / questionAccuracy.length
      : 0;
    const hardestIndex = questionAccuracy.length > 0
      ? questionAccuracy.reduce((min, v, i) => (v < questionAccuracy[min] ? i : min), 0)
      : -1;
    const weakestTopic = topicAccuracy.length > 0
      ? topicAccuracy.reduce((min, t) => (t.percent < min.percent ? t : min), topicAccuracy[0])
      : null;
    const distribution = scoreBuckets.map((b) => ({
      label: b.label,
      count: studentScores.filter(b.test).length,
    }));
    return { avg, accuracy, hardestIndex, weakestTopic, distribution };
  }, [analytics]);

  if (!analytics || !stats) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8 antialiased">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer mb-5"
        >
          <ArrowLeft size={14} /> Lớp học
        </button>
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
          <p className="text-xs font-bold text-text-secondary">Không có dữ liệu analytics cho đề này</p>
        </div>
      </div>
    );
  }

  const exam = mockExams.find((e) => e.id === analytics.examId);
  const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1);
  const maxQuestionAccuracy = analytics.questionAccuracy.length > 0 ? Math.max(...analytics.questionAccuracy) : 100;
  const maxTopicAccuracy = analytics.topicAccuracy.length > 0 ? Math.max(...analytics.topicAccuracy.map((t) => t.percent)) : 100;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8 antialiased">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer mb-5"
      >
        <ArrowLeft size={14} /> Lớp học
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-primary">{analytics.className}</h1>
        <p className="text-xs text-text-secondary font-medium mt-1">
          {exam?.title || analytics.examId} • {analytics.studentScores.length} học sinh
        </p>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase">Sĩ số</p>
          <p className="text-xl font-black text-text-primary mt-1">{analytics.studentScores.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase">Điểm trung bình</p>
          <p className="text-xl font-black text-primary mt-1">{stats.avg.toFixed(1)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase">Accuracy</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{Math.round(stats.accuracy)}%</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <p className="text-[10px] font-extrabold text-text-secondary uppercase">Câu khó nhất</p>
          <p className="text-sm font-black text-text-primary mt-1.5">
            {stats.hardestIndex >= 0
              ? `Câu ${stats.hardestIndex + 1} — ${analytics.questionAccuracy[stats.hardestIndex]}% đúng`
              : '—'}
          </p>
        </div>
      </div>

      {/* Chủ đề yếu nhất */}
      {stats.weakestTopic && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs font-bold text-amber-800">
            Chủ đề yếu nhất: <strong>{stats.weakestTopic.topic}</strong> — {stats.weakestTopic.percent}% đúng
          </p>
        </div>
      )}

      {/* Phân phối điểm */}
      <section className="bg-white border border-slate-100 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-black text-text-primary mb-4">Phân phối điểm</h2>
        <div className="space-y-3">
          {stats.distribution.map((bucket) => (
            <div key={bucket.label} className="flex items-center gap-3">
              <span className="w-14 text-[11px] font-bold text-text-secondary shrink-0">{bucket.label}</span>
              <div className="flex-1 h-5 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-primary/80 rounded-lg transition-all duration-300"
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                ></div>
              </div>
              <span className="w-16 text-right text-[11px] font-black text-text-secondary shrink-0">
                {bucket.count} HS
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Độ khó từng câu */}
      <section className="bg-white border border-slate-100 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-black text-text-primary mb-4">Độ khó từng câu</h2>
        {analytics.questionAccuracy.length === 0 ? (
          <p className="text-xs font-bold text-text-secondary">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-2.5">
            {analytics.questionAccuracy.map((acc, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-12 text-[11px] font-bold text-text-secondary shrink-0">Câu {idx + 1}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${acc < 50 ? 'bg-rose-400' : 'bg-primary/80'}`}
                    style={{ width: `${(acc / maxQuestionAccuracy) * 100}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right text-[11px] font-black text-text-secondary shrink-0">{acc}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Theo chủ đề */}
      <section className="bg-white border border-slate-100 rounded-2xl p-5">
        <h2 className="text-sm font-black text-text-primary mb-4">Theo chủ đề</h2>
        {analytics.topicAccuracy.length === 0 ? (
          <p className="text-xs font-bold text-text-secondary">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-2.5">
            {analytics.topicAccuracy.map((item) => (
              <div key={item.topic} className="flex items-center gap-3">
                <span className="w-36 text-[11px] font-bold text-text-primary truncate shrink-0">{item.topic}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${item.percent < 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${(item.percent / maxTopicAccuracy) * 100}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right text-[11px] font-black text-text-secondary shrink-0">{item.percent}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
