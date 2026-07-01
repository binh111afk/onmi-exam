import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, BookOpen, Star, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import type { Exam } from '../types';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';

interface ExamsProps {
  exams: Exam[];
  onSelectExam: (id: string) => void;
  onStartExam: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Subject themes for cards with light pastel backgrounds and matching badges
const subjectThemes: Record<string, { bg: string; text: string; btn: string; badgeBg: string; badgeText: string }> = {
  'Toán học': {
    bg: 'bg-blue-50/60',
    text: 'text-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    badgeBg: 'bg-blue-100/70 text-blue-700',
    badgeText: 'Toán học',
  },
  'Vật lý': {
    bg: 'bg-teal-50/60',
    text: 'text-teal-600',
    btn: 'bg-teal-600 hover:bg-teal-700 text-white',
    badgeBg: 'bg-teal-100/70 text-teal-700',
    badgeText: 'Vật lý',
  },
  'Hóa học': {
    bg: 'bg-amber-50/60',
    text: 'text-amber-600',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    badgeBg: 'bg-amber-100/70 text-amber-700',
    badgeText: 'Hóa học',
  },
  'Sinh học': {
    bg: 'bg-emerald-50/60',
    text: 'text-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    badgeBg: 'bg-emerald-100/70 text-emerald-700',
    badgeText: 'Sinh học',
  },
  'Tiếng Anh': {
    bg: 'bg-purple-50/60',
    text: 'text-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    badgeBg: 'bg-purple-100/70 text-purple-700',
    badgeText: 'Tiếng Anh',
  },
};

const defaultTheme = {
  bg: 'bg-slate-50/60',
  text: 'text-slate-600',
  btn: 'bg-slate-600 hover:bg-slate-700 text-white',
  badgeBg: 'bg-slate-100/70 text-slate-700',
  badgeText: 'Môn học',
};

const difficultyStyle: Record<string, { bg: string; color: string }> = {
  'Dễ': { bg: 'bg-blue-50 text-blue-600', color: '#2563EB' },
  'Trung bình': { bg: 'bg-emerald-50 text-emerald-600', color: '#059669' },
  'Khó': { bg: 'bg-rose-50 text-rose-600', color: '#E11D48' },
};

// Mini SVG illustrations per subject, styled to be modern and pastel/soft
const IllustrationSVG: React.FC<{ subject: string }> = ({ subject }) => {
  const containerClass = "w-15 h-15 rounded-2xl flex items-center justify-center overflow-hidden shrink-0";

  if (subject === 'Toán học') return (
    <div className={`${containerClass} bg-blue-50/60`}>
      <svg viewBox="0 0 80 80" className="w-11 h-11" fill="none">
        <polygon points="40,16 68,64 12,64" fill="#C7D2FE" opacity="0.4" stroke="#6366F1" strokeWidth="1.5" />
        <circle cx="40" cy="46" r="10" fill="#E0E7FF" opacity="0.6" stroke="#4F46E5" strokeWidth="1.5" />
        <line x1="40" y1="16" x2="40" y2="64" stroke="#6366F1" strokeWidth="1.2" strokeDasharray="3,2" />
      </svg>
    </div>
  );
  if (subject === 'Vật lý') return (
    <div className={`${containerClass} bg-teal-50/60`}>
      <svg viewBox="0 0 80 80" className="w-11 h-11" fill="none">
        <rect x="24" y="20" width="32" height="6" rx="2" fill="#A7F3D0" stroke="#059669" strokeWidth="1.5" />
        <line x1="32" y1="26" x2="32" y2="52" stroke="#059669" strokeWidth="1.2" />
        <line x1="40" y1="26" x2="40" y2="52" stroke="#059669" strokeWidth="1.2" />
        <line x1="48" y1="26" x2="48" y2="52" stroke="#059669" strokeWidth="1.2" />
        <circle cx="32" cy="56" r="4.5" fill="#34D399" opacity="0.5" stroke="#059669" strokeWidth="1.2" />
        <circle cx="40" cy="56" r="4.5" fill="#34D399" opacity="0.5" stroke="#059669" strokeWidth="1.2" />
        <circle cx="48" cy="56" r="4.5" fill="#34D399" opacity="0.5" stroke="#059669" strokeWidth="1.2" />
      </svg>
    </div>
  );
  if (subject === 'Hóa học') return (
    <div className={`${containerClass} bg-amber-50/60`}>
      <svg viewBox="0 0 80 80" className="w-11 h-11" fill="none">
        <path d="M32 16 L32 38 L18 62 L62 62 L48 38 L48 16 Z" fill="#FDE68A" opacity="0.4" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="28" y="12" width="24" height="4" rx="2" fill="#D97706" />
        <circle cx="40" cy="50" r="6" fill="#F59E0B" opacity="0.5" />
        <circle cx="30" cy="54" r="4" fill="#FCD34D" opacity="0.5" />
        <circle cx="48" cy="52" r="3" fill="#FCD34D" opacity="0.5" />
      </svg>
    </div>
  );
  if (subject === 'Sinh học') return (
    <div className={`${containerClass} bg-emerald-50/60`}>
      <svg viewBox="0 0 80 80" className="w-11 h-11" fill="none">
        <circle cx="40" cy="40" r="26" fill="#BBF7D0" opacity="0.3" stroke="#16A34A" strokeWidth="1.5" />
        <path d="M28 32 C28 32 36 24 40 40 C44 56 52 48 52 48" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M28 48 C28 48 36 56 40 40 C44 24 52 32 52 32" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="34" cy="36" r="2" fill="#047857" />
        <circle cx="46" cy="44" r="2" fill="#047857" />
      </svg>
    </div>
  );
  if (subject === 'Tiếng Anh') return (
    <div className={`${containerClass} bg-purple-50/60`}>
      <svg viewBox="0 0 80 80" className="w-11 h-11" fill="none">
        <rect x="16" y="20" width="48" height="40" rx="6" fill="#DDD6FE" opacity="0.4" stroke="#7C3AED" strokeWidth="1.5" />
        <text x="40" y="47" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#7C3AED" opacity="0.7">ABC</text>
        <line x1="26" y1="52" x2="54" y2="52" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
  return (
    <div className={`${containerClass} bg-slate-50/60`}>
      <svg viewBox="0 0 80 80" className="w-11 h-11" fill="none">
        <rect x="20" y="16" width="40" height="48" rx="4" fill="#E2E8F0" opacity="0.5" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="28" y1="30" x2="52" y2="30" stroke="#94A3B8" strokeWidth="1.2" />
        <line x1="28" y1="40" x2="52" y2="40" stroke="#94A3B8" strokeWidth="1.2" />
        <line x1="28" y1="50" x2="44" y2="50" stroke="#94A3B8" strokeWidth="1.2" />
      </svg>
    </div>
  );
};

// Styled exam card matching the mockup
const NewExamCard: React.FC<{ exam: Exam; onSelect: (id: string) => void; onStart: (id: string) => void }> = ({ exam, onSelect, onStart }) => {
  const theme = subjectThemes[exam.subject] || defaultTheme;
  const diff = difficultyStyle[exam.difficulty] || { bg: 'bg-slate-50 text-slate-600', color: '#475569' };

  return (
    <div
      onClick={() => onSelect(exam.id)}
      className="bg-white rounded-3xl border border-[#E2E8F0]/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between h-full relative overflow-hidden group"
    >
      <div>
        {/* Badges row */}
        <div className="flex justify-between items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
            {exam.subject}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${diff.bg}`}>
            {exam.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xs font-black text-[#1E293B] leading-snug mt-3.5 pr-16 line-clamp-2 h-9 group-hover:text-[#6366F1] transition-colors">
          {exam.title}
        </h3>

        {/* Info row (question count, duration) */}
        <div className="flex gap-4 text-[11px] text-[#64748B] mt-2.5">
          <span className="flex items-center gap-1">
            <HelpCircle size={13} className="text-slate-300" />
            {exam.questionCount} câu
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-slate-300" />
            {exam.durationMinutes} phút
          </span>
        </div>
      </div>

      {/* Illustration (positioned middle-right) */}
      <div className="absolute right-4 top-1/2 -translate-y-12">
        <IllustrationSVG subject={exam.subject} />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E2E8F0]/40">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#64748B]">
            {exam.tries >= 1000 ? `${(exam.tries / 1000).toFixed(1)}K` : exam.tries} lượt làm
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#1E293B]">
            <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
            {exam.rating.toFixed(1)}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onStart(exam.id); }}
          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center cursor-pointer transition-all ${theme.btn} shadow-sm`}
        >
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

const subjectCategories = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học'];

const subjectIcons: Record<string, React.ReactNode> = {
  'Tất cả': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" /></svg>,
  'Toán học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h14M8 1l3 7-3 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  'Vật lý': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5" /><path d="M8 3v5l3 2" strokeLinecap="round" /></svg>,
  'Hóa học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h6v6l3 7H2l3-7V2z" strokeLinejoin="round" /></svg>,
  'Tiếng Anh': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="11" rx="2" /><path d="M4 7h8M4 10h5" strokeLinecap="round" /></svg>,
  'Sinh học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1c-4 0-6 3-6 6s2 6 6 6 6-3 6-6-2-6-6-6z" /><path d="M2 8h12M8 1c-2 3-2 9 0 14" strokeLinecap="round" /></svg>,
};

const ITEMS_PER_PAGE = 12;

export const Exams: React.FC<ExamsProps> = ({
  exams,
  onSelectExam,
  onStartExam,
  searchQuery,
  onSearchChange,
}) => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học'];
  const grades = ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'];
  const difficulties = ['Dễ', 'Trung bình', 'Khó'];

  const toggle = <T,>(arr: T[], val: T) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleReset = () => {
    setSelectedSubjects([]); setSelectedGrades([]); setSelectedDifficulties([]);
    setSelectedPrices([]); setSortBy('newest'); onSearchChange(''); setActiveCategory('Tất cả');
    setCurrentPage(1);
  };

  const filteredExams = useMemo(() => {
    let result = [...exams];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q));
    }
    if (activeCategory !== 'Tất cả') result = result.filter(e => e.subject === activeCategory);
    if (selectedSubjects.length > 0) result = result.filter(e => selectedSubjects.includes(e.subject));
    if (selectedGrades.length > 0) result = result.filter(e => selectedGrades.includes(e.grade));
    if (selectedDifficulties.length > 0) result = result.filter(e => selectedDifficulties.includes(e.difficulty));
    if (selectedPrices.length > 0) result = result.filter(e => {
      if (selectedPrices.includes('free') && !e.isPremium) return true;
      if (selectedPrices.includes('premium') && e.isPremium) return true;
      return false;
    });
    result.sort((a, b) => {
      if (sortBy === 'popular') return b.tries - a.tries;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'hardest') { const m = { 'Khó': 3, 'Trung bình': 2, 'Dễ': 1 }; return (m[b.difficulty as keyof typeof m] || 0) - (m[a.difficulty as keyof typeof m] || 0); }
      if (sortBy === 'easiest') { const m = { 'Khó': 3, 'Trung bình': 2, 'Dễ': 1 }; return (m[a.difficulty as keyof typeof m] || 0) - (m[b.difficulty as keyof typeof m] || 0); }
      return a.id.localeCompare(b.id);
    });
    return result;
  }, [exams, searchQuery, activeCategory, selectedSubjects, selectedGrades, selectedDifficulties, selectedPrices, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / ITEMS_PER_PAGE));
  const pagedExams = filteredExams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);



  // FilterSection with toggle capability
  const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div className="border-b border-slate-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full font-bold text-xs text-[#1E293B] uppercase tracking-wider mb-3 cursor-pointer select-none"
        >
          <span>{title}</span>
          <svg
            viewBox="0 0 20 20"
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {isOpen && (
          <div className="flex flex-col gap-1.5 transition-all duration-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ROW ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1E293B] flex items-center gap-2">
            Kho đề thi trắc nghiệm
            <span className="text-[#818CF8]">✨</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">Tập trung luyện tập với hàng ngàn đề thi thử chọn lọc, cập nhật liên tục.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đề, môn học..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0]/80 rounded-xl text-xs text-[#1E293B] placeholder-slate-400 outline-none w-full focus:ring-2 focus:ring-indigo-100 focus:border-[#6366F1] shadow-sm transition-all"
            />
          </div>
          {/* Sort */}
          <div className="relative w-full sm:w-auto">
            <Select
              value={sortBy}
              onChange={(val) => { setSortBy(val); setCurrentPage(1); }}
              variant="default"
              options={[
                { value: 'newest', label: 'Sắp xếp: Mới nhất' },
                { value: 'popular', label: 'Phổ biến nhất' },
                { value: 'rating', label: 'Đánh giá cao' },
                { value: 'hardest', label: 'Độ khó: Tăng dần' },
                { value: 'easiest', label: 'Độ khó: Giảm dần' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="flex gap-2.5 mb-6 flex-wrap">
        {subjectCategories.map(cat => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all select-none border ${active
                  ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-500 border-[#E2E8F0] hover:text-[#1E293B] hover:border-slate-300'
                }`}
            >
              <span className={active ? 'text-white' : 'text-slate-400'}>
                {subjectIcons[cat]}
              </span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN LAYOUT: Cards (left) + Filter Sidebar (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* ── LEFT: EXAM CARDS GRID ── */}
        <div className="flex flex-col gap-6">
          {pagedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pagedExams.map(exam => (
                <NewExamCard key={exam.id} exam={exam} onSelect={onSelectExam} onStart={onStartExam} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-12 text-center shadow-sm">
              <BookOpen size={36} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1E293B] mb-1">Chưa tìm thấy đề thi phù hợp</h3>
              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold cursor-pointer bg-white text-[#1E293B] hover:bg-slate-50 transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages >= 1 && (
            <div className="flex justify-center items-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor"><path d="M15 8a.5.5 0 00-.5-.5H2.707l3.147-3.146a.5.5 0 10-.708-.708l-4 4a.5.5 0 000 .708l4 4a.5.5 0 00.708-.708L2.707 8.5H14.5A.5.5 0 0015 8z" /></svg>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page
                        ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-200'
                        : 'bg-white border border-[#E2E8F0] text-[#1E293B] hover:bg-slate-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-slate-400 text-xs px-1">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor"><path d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: FILTER SIDEBAR ── */}
        <aside className="w-full bg-white rounded-3xl p-5 border border-[#E2E8F0]/50 shadow-sm sticky top-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-[13px] font-bold text-[#1E293B]">Bộ lọc đề thi</span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#6366F1] bg-none border-none cursor-pointer font-bold transition-colors"
            >
              <RefreshCw size={11} /> Đặt lại
            </button>
          </div>

          <FilterSection title="Môn học">
            {subjects.map(s => <Checkbox key={s} checked={selectedSubjects.includes(s)} label={s} onChange={() => setSelectedSubjects(prev => toggle(prev, s))} />)}
          </FilterSection>

          <FilterSection title="Khối lớp">
            {grades.map(g => <Checkbox key={g} checked={selectedGrades.includes(g)} label={g} onChange={() => setSelectedGrades(prev => toggle(prev, g))} />)}
          </FilterSection>

          <FilterSection title="Độ khó">
            {difficulties.map(d => <Checkbox key={d} checked={selectedDifficulties.includes(d)} label={d} onChange={() => setSelectedDifficulties(prev => toggle(prev, d))} />)}
          </FilterSection>

          <FilterSection title="Gói học tập">
            <Checkbox checked={selectedPrices.includes('free')} label="Miễn phí (Free)" onChange={() => setSelectedPrices(prev => toggle(prev, 'free'))} />
            <Checkbox checked={selectedPrices.includes('premium')} label="Hội viên (Premium)" onChange={() => setSelectedPrices(prev => toggle(prev, 'premium'))} />
          </FilterSection>

          <button
            onClick={() => setCurrentPage(1)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-bold text-xs border-none cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-sm hover:shadow transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            Áp dụng bộ lọc
          </button>
        </aside>

      </div>
    </div>
  );
};

export default Exams;
