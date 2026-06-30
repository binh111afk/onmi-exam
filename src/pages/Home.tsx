import React from 'react';
import { Flame, Star, GraduationCap, BarChart3, ArrowRight, BookOpenCheck } from 'lucide-react';
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

  const subjectsList = [
    { label: 'Toán học', count: '1.250 đề thi', bg: 'bg-blue-50/60 hover:bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
    { label: 'Vật lý', count: '890 đề thi', bg: 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    { label: 'Hóa học', count: '950 đề thi', bg: 'bg-amber-50/60 hover:bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
    { label: 'Sinh học', count: '780 đề thi', bg: 'bg-teal-50/60 hover:bg-teal-50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
    { label: 'Ngữ văn', count: '850 đề thi', bg: 'bg-red-50/60 hover:bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
    { label: 'Tiếng Anh', count: '1.100 đề thi', bg: 'bg-purple-50/60 hover:bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: Main viewport area (70%)      */}
        {/* ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Hero banner matching reference graphic layout */}
          <section className="bg-white border border-slate-200/80 rounded-card p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Grid decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none"></div>

            <div className="flex-1 space-y-4 relative z-10">
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight leading-snug">
                Học thông minh<br />
                Thi tự tin – <span className="text-primary">Đỗ dễ dàng</span>
              </h1>
              <p className="text-xs text-text-secondary leading-relaxed max-w-[420px]">
                Kho đề thi chất lượng – Tài liệu chọn lọc – Lộ trình cá nhân hóa<br />
                Đồng hành cùng bạn chinh phục mọi kỳ thi quan trọng.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onViewChange('exams')}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                >
                  Khám phá đề thi
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => onViewChange('documents')}
                  className="px-5 py-2 border border-slate-200 text-primary bg-white hover:bg-slate-50 text-xs font-bold rounded-full transition-all duration-200"
                >
                  Bắt đầu ôn luyện
                </button>
              </div>
            </div>

            {/* Right: Atomic Orbit Sphere Graphic in pure vector SVG */}
            <div className="relative w-44 h-44 md:w-56 md:h-56 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer orbit lines */}
                <ellipse cx="100" cy="100" rx="90" ry="32" stroke="#D1E2FF" strokeWidth="1.5" transform="rotate(-30, 100, 100)" />
                <ellipse cx="100" cy="100" rx="80" ry="26" stroke="#D1E2FF" strokeWidth="1.5" transform="rotate(35, 100, 100)" />
                <ellipse cx="100" cy="100" rx="85" ry="28" stroke="#D1E2FF" strokeWidth="1.5" transform="rotate(-75, 100, 100)" />
                
                {/* Central main glowing sphere representing logo orbits */}
                <circle cx="100" cy="100" r="28" fill="url(#sphereGradient)" filter="drop-shadow(0px 8px 16px rgba(37, 99, 235, 0.25))" />
                
                {/* Inner brand symbol inside sphere */}
                <circle cx="92" cy="104" r="2" fill="#FFFFFF" />
                <circle cx="108" cy="94" r="2" fill="#0ea5e9" />
                <circle cx="107" cy="105" r="2.5" fill="#f97316" />
                <ellipse cx="100" cy="100" rx="14" ry="5" stroke="#FFFFFF" strokeWidth="1" transform="rotate(-20, 100, 100)" />
                <ellipse cx="100" cy="100" rx="12" ry="4.5" stroke="#FFFFFF" strokeWidth="1" transform="rotate(25, 100, 100)" />

                {/* Floating subject badge capsules */}
                {/* Graduation cap */}
                <g transform="translate(100, 20)">
                  <circle cx="0" cy="0" r="13" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2.5" />
                  <path d="M-6 -2.5L0 -5.5L6 -2.5L0 0.5L-6 -2.5Z" fill="#FFFFFF" />
                  <path d="M-4 -1V3C-4 4 0 5 0 5C0 5 4 4 4 3V-1" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                </g>
                {/* Document icon */}
                <g transform="translate(162, 108)">
                  <circle cx="0" cy="0" r="11" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  <path d="M-3 -4.5H1.5L4.5 -1.5V4.5H-3V-4.5Z" fill="#FFFFFF" />
                </g>
                {/* Yellow star badge */}
                <g transform="translate(132, 160)">
                  <circle cx="0" cy="0" r="12" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                  <path d="M0 -5L1.5 -1.5H5L2.2 0.5L3.2 4L0 2L-3.2 4L-2.2 0.5L-5 -1.5H-1.5L0 -5Z" fill="#FFFFFF" />
                </g>
                {/* Stats chart badge */}
                <g transform="translate(36, 128)">
                  <circle cx="0" cy="0" r="12" fill="#EF562F" stroke="#FFFFFF" strokeWidth="2" />
                  <rect x="-4" y="-4" width="2" height="8" rx="0.5" fill="#FFFFFF" />
                  <rect x="-1" y="-6" width="2" height="10" rx="0.5" fill="#FFFFFF" />
                  <rect x="2" y="-2" width="2" height="6" rx="0.5" fill="#FFFFFF" />
                </g>

                {/* Gradients */}
                <defs>
                  <radialGradient id="sphereGradient" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="65%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </section>

          {/* 2. Stats Grid (4 Blocks with colored icons) */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '2.500+', label: 'Đề thi', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { value: '5.000+', label: 'Tài liệu', icon: BookOpenCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { value: '100.000+', label: 'Lượt làm bài', icon: BarChart3, color: 'text-orange-650 bg-orange-50 border-orange-100' },
              { value: '96%', label: 'Hài lòng', icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200/80 p-4 rounded-card flex items-center gap-3">
                  <div className={`h-9 w-9 rounded flex items-center justify-center border shrink-0 ${stat.color}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-text-primary leading-none">{stat.value}</div>
                    <div className="text-[10px] text-text-secondary mt-1 font-semibold">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 3. Featured Exams Grid */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Đề thi nổi bật
              </h2>
              <button
                onClick={() => onViewChange('exams')}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                Xem tất cả &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* 4. Explore by Subject Categories */}
          <section className="space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Khám phá theo môn học
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {subjectsList.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => onViewChange('exams')}
                  className={`px-4 py-2.5 rounded border text-[11px] font-bold flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] ${sub.bg}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${sub.dot}`}></span>
                  <span>{sub.label}</span>
                  <span className="opacity-60 font-semibold">({sub.count})</span>
                </button>
              ))}

              <button
                onClick={() => onViewChange('exams')}
                className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold rounded flex items-center gap-1 text-text-primary transition-default ml-auto"
              >
                Xem tất cả môn học
                <ArrowRight size={12} />
              </button>
            </div>
          </section>

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Sidebar stats & lists (30%)   */}
        {/* ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Auth Card / User Progress Dashboard */}
          {!user.loggedIn ? (
            <section className="bg-white border border-slate-200/80 rounded-card p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-text-primary">Chào mừng trở lại! 👋</h3>
                <p className="text-[11px] text-text-secondary leading-normal">
                  Đăng nhập để lưu tiến độ và tiếp tục hành trình học tập.
                </p>
              </div>
              <div className="space-y-2 pt-1.5">
                <button
                  onClick={() => onViewChange('login')}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-btn transition-default flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onViewChange('register')}
                  className="w-full py-2 border border-slate-200 bg-white hover:bg-slate-50 text-text-primary text-xs font-bold rounded-btn transition-default"
                >
                  Đăng ký tài khoản
                </button>
              </div>
            </section>
          ) : (
            <section className="bg-white border border-slate-200/80 rounded-card p-5 space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Thành tích của bạn</h3>
                <span className="text-[10px] font-bold text-accent flex items-center gap-0.5">
                  <Flame size={12} className="fill-accent text-accent" /> {user.streak} ngày
                </span>
              </div>

              {/* Achievements stats grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { label: 'Bài đã làm', value: '0', color: 'text-blue-600 bg-blue-50/50' },
                  { label: 'Độ chính xác', value: '0%', color: 'text-purple-600 bg-purple-50/50' },
                  { label: 'Ngày học', value: '0', color: 'text-emerald-600 bg-emerald-50/50' },
                  { label: 'Kinh nghiệm', value: `${user.xp} XP`, color: 'text-orange-650 bg-orange-50/50' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-text-secondary leading-none">{item.label}</span>
                    <span className="text-xs font-black text-text-primary mt-2">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Level Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                  <span>CẤP ĐỘ 1</span>
                  <span>{user.xp} / 100 XP</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="h-full bg-primary transition-all duration-350"
                    style={{ width: `${Math.min(user.xp, 100)}%` }}
                  ></div>
                </div>
              </div>
            </section>
          )}

          {/* 2. Featured Documents List */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                Tài liệu nổi bật
              </h2>
              <button
                onClick={() => onViewChange('documents')}
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                Xem tất cả &rarr;
              </button>
            </div>

            {/* List layout stack */}
            <div className="space-y-2.5">
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

      </div>
    </div>
  );
};
