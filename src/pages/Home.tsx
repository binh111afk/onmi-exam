import React from 'react';
import { ArrowRight, Flame, Clock } from 'lucide-react';
import type { Exam, Document, User } from '../types';
import { ExamCard } from '../components/ExamCard';
import { DocCard } from '../components/DocCard';

interface HomeProps {
  user: User;
  onViewChange: (view: string) => void;
  featuredExams: Exam[];
  featuredDocs: Document[];
  onSelectExam: (id: string) => void;
  onSelectDoc: (id: string) => void;
  onStartExam: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  onViewChange,
  featuredExams,
  featuredDocs,
  onSelectExam,
  onSelectDoc,
  onStartExam,
}) => {
  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* 1. Hero Section (Small & Compact) */}
      <section className="relative rounded-card border border-slate-100 p-8 sm:p-12 bg-white text-center max-w-[850px] mx-auto notion-shadow">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-3">
          Học tập hiệu quả hơn mỗi ngày
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[550px] mx-auto mb-6">
          Onmi Exam cung cấp kho đề thi thử chuẩn cấu trúc và tài liệu học tập chọn lọc chất lượng cao. Khám phá lộ trình cá nhân hóa giúp giảm áp lực thi cử và tối ưu hóa điểm số của bạn.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onViewChange('exams')}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default"
          >
            Bắt đầu học ngay
          </button>
          <button
            onClick={() => onViewChange('documents')}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-text-primary text-xs font-semibold rounded-btn hover:bg-slate-50 transition-default"
          >
            Khám phá tài liệu
          </button>
        </div>
      </section>

      {/* 2. Statistics Counter */}
      <section className="max-w-[950px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { label: 'Đề thi chọn lọc', value: '1.200+' },
          { label: 'Tài liệu ôn thi', value: '500+' },
          { label: 'Lượt luyện tập', value: '10.000+' },
          { label: 'Đánh giá tích cực', value: '95%' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-card">
            <div className="text-xl font-bold text-text-primary mb-1">{stat.value}</div>
            <div className="text-xs text-text-secondary">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* 3. Continue Learning Section */}
      <section className="max-w-[1100px] mx-auto">
        <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-1.5">
          <span>Tiếp tục học</span>
          {user.loggedIn && (
            <span className="text-[10px] font-normal bg-accent-light text-accent px-2 py-0.5 rounded flex items-center gap-0.5">
              <Flame size={10} className="fill-accent" /> {user.streak} ngày liên tiếp
            </span>
          )}
        </h2>

        {!user.loggedIn ? (
          /* Logged out view */
          <div className="bg-white border border-slate-100 rounded-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 notion-shadow">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-primary">Lưu trữ tiến trình học tập của bạn</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-[600px]">
                Đăng nhập để tự động lưu lịch sử làm bài, ghi chép tài liệu học tập, theo dõi điểm số và nhận các huy hiệu thi đua hàng ngày cùng hàng nghìn học sinh khác.
              </p>
            </div>
            <button
              onClick={() => onViewChange('login')}
              className="w-full md:w-auto px-4 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default whitespace-nowrap"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          /* Logged in view - Custom continue learning dashboard item */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active item 1 */}
            <div className="bg-white border border-slate-100 rounded-card p-5 flex items-center justify-between gap-4 notion-shadow">
              <div className="space-y-2">
                <span className="text-[9px] font-bold bg-accent-light text-accent px-2 py-0.5 rounded">
                  ĐANG LUYỆN TẬP
                </span>
                <h3 className="text-xs font-semibold text-text-primary line-clamp-1">
                  Đề thi thử THPT Quốc gia 2026 - Môn Toán học - Đề số 1
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                  <span className="flex items-center gap-0.5"><Clock size={10} /> Còn lại 45 phút</span>
                  <span>•</span>
                  <span>5 câu hỏi</span>
                </div>
              </div>
              <button
                onClick={() => onStartExam('exam-math-1')}
                className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover transition-default whitespace-nowrap"
              >
                Làm tiếp
              </button>
            </div>

            {/* Active item 2 */}
            <div className="bg-white border border-slate-100 rounded-card p-5 flex items-center justify-between gap-4 notion-shadow">
              <div className="space-y-2">
                <span className="text-[9px] font-bold bg-success-light text-success px-2 py-0.5 rounded">
                  ĐANG ĐỌC TÀI LIỆU
                </span>
                <h3 className="text-xs font-semibold text-text-primary line-clamp-1">
                  Sổ tay công thức Giải tích lớp 12 đầy đủ và chi tiết nhất
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                  <span className="flex items-center gap-0.5"><Clock size={10} /> Đã đọc 2/3 chương</span>
                  <span>•</span>
                  <span>Toán học</span>
                </div>
              </div>
              <button
                onClick={() => onSelectDoc('doc-math-1')}
                className="px-3.5 py-1.5 border border-slate-200 text-text-primary text-xs font-semibold rounded-btn hover:bg-slate-50 transition-default whitespace-nowrap"
              >
                Đọc tiếp
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Highlighted Exams Grid */}
      <section className="max-w-[1100px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Đề thi nổi bật</h2>
          <button
            onClick={() => onViewChange('exams')}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5 transition-default"
          >
            Xem tất cả đề thi
            <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredExams.slice(0, 4).map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onSelect={onSelectExam}
              onStartExam={onStartExam}
            />
          ))}
        </div>
      </section>

      {/* 5. Highlighted Documents Grid */}
      <section className="max-w-[1100px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Tài liệu nổi bật</h2>
          <button
            onClick={() => onViewChange('documents')}
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5 transition-default"
          >
            Xem tất cả tài liệu
            <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredDocs.slice(0, 4).map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              onSelect={onSelectDoc}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
