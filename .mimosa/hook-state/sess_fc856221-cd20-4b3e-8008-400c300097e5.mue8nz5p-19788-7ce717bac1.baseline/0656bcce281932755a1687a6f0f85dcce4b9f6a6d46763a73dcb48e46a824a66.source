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
    badgeBg: 'bg-[#FFF0F2] text-accent',
    badgeText: 'Sinh học',
  },
  'Tiếng Anh': {
    bg: 'bg-purple-50/60',
    text: 'text-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    badgeBg: 'bg-purple-100/70 text-purple-700',
    badgeText: 'Tiếng Anh',
  },
  'Anh văn': {
    bg: 'bg-purple-50/60',
    text: 'text-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    badgeBg: 'bg-purple-100/70 text-purple-700',
    badgeText: 'Tiếng Anh',
  },
  'Công nghệ': {
    bg: 'bg-orange-50/60',
    text: 'text-orange-600',
    btn: 'bg-orange-600 hover:bg-orange-700 text-white',
    badgeBg: 'bg-orange-100/70 text-orange-700',
    badgeText: 'Công nghệ',
  },
  'Tin học': {
    bg: 'bg-cyan-50/60',
    text: 'text-cyan-600',
    btn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    badgeBg: 'bg-cyan-100/70 text-cyan-700',
    badgeText: 'Tin học',
  },
  'Lịch sử': {
    bg: 'bg-yellow-50/60',
    text: 'text-yellow-600',
    btn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    badgeBg: 'bg-yellow-100/70 text-yellow-700',
    badgeText: 'Lịch sử',
  },
  'Địa lý': {
    bg: 'bg-sky-50/60',
    text: 'text-sky-600',
    btn: 'bg-sky-600 hover:bg-sky-700 text-white',
    badgeBg: 'bg-sky-100/70 text-sky-700',
    badgeText: 'Địa lý',
  },
  'Kinh tế pháp luật': {
    bg: 'bg-rose-50/60',
    text: 'text-rose-600',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    badgeBg: 'bg-rose-100/70 text-rose-700',
    badgeText: 'Kinh tế pháp luật',
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

const getSubjectCover = (subject: string): string => {
  const mapping: Record<string, string> = {
    'Toán học': '/math_illustration.png',
    'Vật lý': '/physics_illustration.png',
    'Hóa học': '/chemistry_illustration.png',
    'Sinh học': '/biology_illustration.png',
    'Tiếng Anh': '/english_illustration.png',
    'Anh văn': '/english_illustration.png',
    'Công nghệ': '/technology_illustration.png',
    'Tin học': '/it_illustration.png',
    'Lịch sử': '/history_illustration.png',
    'Địa lý': '/geography_illustration.png',
    'Kinh tế pháp luật': '/economics_illustration.png',
  };
  return mapping[subject] || '/biology_illustration.png';
};

const getSubjectDescription = (exam: Exam): string => {
  const mapping: Record<string, string> = {
    'Sinh học': 'Bài thi khảo sát cấu trúc tế bào, trao đổi chất và vai trò sinh học của nước trong cơ thể sống.',
    'Toán học': 'Đề kiểm tra khảo sát kiến thức Giải tích và Hình học không gian chuẩn bị cho kỳ thi THPT Quốc gia.',
    'Vật lý': 'Bài thi trắc nghiệm kiểm tra lý thuyết và bài tập về Dao động cơ học, Sóng cơ và dòng điện xoay chiều.',
    'Hóa học': 'Đề thi trắc nghiệm củng cố lý thuyết về cấu tạo nguyên tử, liên kết hóa học và hóa học hữu cơ.',
    'Tiếng Anh': 'Bài kiểm tra ngữ pháp nâng cao, đọc hiểu và cấu trúc đảo ngữ tiếng Anh chuẩn.',
    'Anh văn': 'Bài kiểm tra ngữ pháp nâng cao, đọc hiểu và cấu trúc đảo ngữ tiếng Anh chuẩn.',
    'Công nghệ': 'Bài thi trắc nghiệm đánh giá kiến thức thiết kế kỹ thuật, vẽ kỹ thuật và công nghệ tự động hóa.',
    'Tin học': 'Đề thi củng cố kiến thức khoa học máy tính, lập trình cơ bản và cơ sở dữ liệu.',
    'Lịch sử': 'Bài kiểm tra kiến thức lịch sử Việt Nam cận đại, thế giới hiện đại và tiến trình phát triển xã hội.',
    'Địa lý': 'Bài thi trắc nghiệm về địa lý tự nhiên, địa lý kinh tế xã hội Việt Nam và bản đồ thế giới.',
    'Kinh tế pháp luật': 'Bài thi trắc nghiệm ôn tập về luật dân sự, luật hình sự và quy luật cung cầu kinh tế.',
  };
  return mapping[exam.subject] || 'Đề thi trắc nghiệm ôn tập và củng cố kiến thức theo chương trình giáo dục phổ thông mới.';
};

// Styled exam card matching the mockup
const NewExamCard: React.FC<{ exam: Exam; onSelect: (id: string) => void; onStart: (id: string) => void }> = ({ exam, onSelect, onStart }) => {
  const theme = subjectThemes[exam.subject] || defaultTheme;
  const diff = difficultyStyle[exam.difficulty] || { bg: 'bg-slate-50 text-slate-600', color: '#475569' };

  return (
    <div
      onClick={() => onSelect(exam.id)}
      className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden h-full relative group"
    >
      <div className="h-36 bg-[#F1EEFC] relative overflow-hidden shrink-0">
        <img
          src={getSubjectCover(exam.subject)}
          alt={`${exam.subject} Cover`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-[#8F85F3]/15 mix-blend-multiply" />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wide inline-block ${theme.badgeBg}`}>
              {exam.subject.toUpperCase()} {exam.grade.replace(/Lớp\s*/i, '')}
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${diff.bg}`}>
              {exam.difficulty}
            </span>
          </div>

          <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2 h-9 group-hover:text-primary transition-colors">
            {exam.title}
          </h4>

          <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2 h-10">
            {getSubjectDescription(exam)}
          </p>

          <div className="flex gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-2.5">
            <span className="flex items-center gap-1">
              <HelpCircle size={12} className="text-slate-300 stroke-[2.5]" />
              {exam.questionCount} câu hỏi
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-300 stroke-[2.5]" />
              {exam.durationMinutes} phút
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
              {exam.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
            <span className="bg-slate-50 px-2 py-1 rounded-lg">Giáo viên: Nguyễn Văn An</span>
            <span className="bg-slate-50 px-2 py-1 rounded-lg">Cập nhật: 29/05/2025</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onStart(exam.id); }}
            className={`w-7.5 h-7.5 rounded-full flex items-center justify-center cursor-pointer transition-all ${theme.btn} shadow-sm shadow-indigo-100 hover:scale-105 active:scale-95`}
          >
            <ArrowRight size={13} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

const subjectCategories = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học', 'Công nghệ', 'Tin học', 'Lịch sử', 'Địa lý', 'Kinh tế pháp luật'];

const subjectIcons: Record<string, React.ReactNode> = {
  'Tất cả': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" /></svg>,
  'Toán học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h14M8 1l3 7-3 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  'Vật lý': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5" /><path d="M8 3v5l3 2" strokeLinecap="round" /></svg>,
  'Hóa học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h6v6l3 7H2l3-7V2z" strokeLinejoin="round" /></svg>,
  'Tiếng Anh': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="11" rx="2" /><path d="M4 7h8M4 10h5" strokeLinecap="round" /></svg>,
  'Sinh học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1c-4 0-6 3-6 6s2 6 6 6 6-3 6-6-2-6-6-6z" /><path d="M2 8h12M8 1c-2 3-2 9 0 14" strokeLinecap="round" /></svg>,
  'Công nghệ': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="1.5" /><path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15M3.05 3.05l1.77 1.77M11.18 11.18l1.77 1.77M3.05 12.95l1.77-1.77M11.18 4.82l1.77-1.77" strokeLinecap="round"/></svg>,
  'Tin học': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="10" rx="1.5" /><path d="M4 14h8M8 12v2" strokeLinecap="round"/></svg>,
  'Lịch sử': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14h12M4 14V6a2 2 0 012-2h4a2 2 0 012 2v8M6 8h4M6 11h4" strokeLinecap="round"/></svg>,
  'Địa lý': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2a11 11 0 000 12" strokeLinecap="round"/></svg>,
  'Kinh tế pháp luật': <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13V3a1 1 0 011-1h5l4 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1z" strokeLinejoin="round"/><path d="M7 6h2M6 9h4" strokeLinecap="round"/></svg>,
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

  const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học', 'Công nghệ', 'Tin học', 'Lịch sử', 'Địa lý', 'Kinh tế pháp luật'];
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
