import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, BookOpen, Star, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import type { Exam } from '../types';

interface ExamsProps {
  exams: Exam[];
  onSelectExam: (id: string) => void;
  onStartExam: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Subject themes for cards
const subjectThemes: Record<string, { bg: string; tag: string; badgeText: string; btn: string; illustration: string }> = {
  'Toán học': {
    bg: 'linear-gradient(135deg,#EEF2FF 60%,#C7D2FE 100%)',
    tag: '#4F46E5',
    badgeText: '#fff',
    btn: '#4F46E5',
    illustration: 'toán',
  },
  'Vật lý': {
    bg: 'linear-gradient(135deg,#ECFDF5 60%,#A7F3D0 100%)',
    tag: '#059669',
    badgeText: '#fff',
    btn: '#059669',
    illustration: 'lý',
  },
  'Hóa học': {
    bg: 'linear-gradient(135deg,#FFFBEB 60%,#FDE68A 100%)',
    tag: '#D97706',
    badgeText: '#fff',
    btn: '#D97706',
    illustration: 'hóa',
  },
  'Sinh học': {
    bg: 'linear-gradient(135deg,#F0FDF4 60%,#BBF7D0 100%)',
    tag: '#16A34A',
    badgeText: '#fff',
    btn: '#16A34A',
    illustration: 'sinh',
  },
  'Tiếng Anh': {
    bg: 'linear-gradient(135deg,#F5F3FF 60%,#DDD6FE 100%)',
    tag: '#7C3AED',
    badgeText: '#fff',
    btn: '#7C3AED',
    illustration: 'anh',
  },
};

const difficultyStyle: Record<string, { bg: string; color: string }> = {
  'Dễ': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Trung bình': { bg: '#D1FAE5', color: '#065F46' },
  'Khó': { bg: '#FEE2E2', color: '#DC2626' },
};

// Mini SVG illustrations per subject
const IllustrationSVG: React.FC<{ subject: string }> = ({ subject }) => {
  if (subject === 'Toán học') return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72 }} fill="none">
      <polygon points="40,8 72,62 8,62" fill="#C7D2FE" stroke="#6366F1" strokeWidth="2" />
      <polygon points="40,20 62,56 18,56" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
      <line x1="40" y1="20" x2="40" y2="56" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="3,2" />
    </svg>
  );
  if (subject === 'Vật lý') return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72 }} fill="none">
      <rect x="20" y="28" width="40" height="30" rx="6" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
      <line x1="20" y1="38" x2="60" y2="38" stroke="#059669" strokeWidth="1.5" />
      <path d="M30 38 Q40 22 50 38" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="48" r="5" fill="#059669" opacity="0.3" />
      <line x1="40" y1="58" x2="40" y2="66" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="66" x2="48" y2="66" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  if (subject === 'Hóa học') return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72 }} fill="none">
      <path d="M30 10 L30 40 L14 66 L66 66 L50 40 L50 10 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
      <rect x="26" y="8" width="28" height="6" rx="3" fill="#D97706" />
      <circle cx="38" cy="52" r="8" fill="#F59E0B" opacity="0.6" />
      <circle cx="28" cy="56" r="5" fill="#FCD34D" opacity="0.7" />
      <circle cx="48" cy="56" r="5" fill="#FCD34D" opacity="0.7" />
    </svg>
  );
  if (subject === 'Sinh học') return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72 }} fill="none">
      <path d="M40 10 C25 10 15 22 15 35 C15 55 40 72 40 72 C40 72 65 55 65 35 C65 22 55 10 40 10 Z" fill="#BBF7D0" stroke="#16A34A" strokeWidth="2" />
      <line x1="40" y1="10" x2="40" y2="72" stroke="#16A34A" strokeWidth="2" strokeDasharray="3,2" />
      <path d="M25 30 Q32 36 40 30 Q48 24 55 30" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M20 45 Q30 52 40 45 Q50 38 60 45" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
  if (subject === 'Tiếng Anh') return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72 }} fill="none">
      <rect x="10" y="14" width="60" height="45" rx="8" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="2" />
      <text x="40" y="44" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#7C3AED">ABC</text>
      <line x1="20" y1="52" x2="60" y2="52" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72 }} fill="none">
      <rect x="15" y="10" width="50" height="60" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      <line x1="25" y1="28" x2="55" y2="28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="40" x2="55" y2="40" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="52" x2="42" y2="52" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// Styled exam card matching the mockup
const NewExamCard: React.FC<{ exam: Exam; onSelect: (id: string) => void; onStart: (id: string) => void }> = ({ exam, onSelect, onStart }) => {
  const theme = subjectThemes[exam.subject] || { bg: '#F8FAFC', tag: '#6366F1', badgeText: '#fff', btn: '#6366F1', illustration: '' };
  const diff = difficultyStyle[exam.difficulty] || { bg: '#E2E8F0', color: '#475569' };

  return (
    <div
      onClick={() => onSelect(exam.id)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      {/* Card header with gradient bg + illustration */}
      <div style={{ background: theme.bg, padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 96 }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: theme.tag, color: theme.badgeText }}>{exam.subject}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6, background: diff.bg, color: diff.color }}>{exam.difficulty}</span>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', lineHeight: 1.4, margin: 0, maxWidth: 180 }}>{exam.title}</h3>
        </div>
        <div style={{ flexShrink: 0, marginTop: -4 }}>
          <IllustrationSVG subject={exam.subject} />
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Info row */}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B', marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HelpCircle size={13} style={{ color: '#94A3B8' }} /> {exam.questionCount} câu
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} style={{ color: '#94A3B8' }} /> {exam.durationMinutes} phút
          </span>
        </div>

        {/* Bottom row: views + rating + arrow btn */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {exam.tries >= 1000 ? `${(exam.tries / 1000).toFixed(1)}K` : exam.tries} lượt làm
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: '#1E293B' }}>
              <Star size={13} style={{ fill: '#FBBF24', color: '#FBBF24' }} /> {exam.rating.toFixed(1)}
            </span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onStart(exam.id); }}
            style={{ width: 34, height: 34, borderRadius: '50%', background: theme.btn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const subjectCategories = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học'];

const subjectIcons: Record<string, React.ReactNode> = {
  'Tất cả': <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="currentColor"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/></svg>,
  'Toán học': <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h14M8 1l3 7-3 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  'Vật lý': <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5"/><path d="M8 3v5l3 2" strokeLinecap="round"/></svg>,
  'Hóa học': <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h6v6l3 7H2l3-7V2z" strokeLinejoin="round"/></svg>,
  'Tiếng Anh': <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="11" rx="2"/><path d="M4 7h8M4 10h5" strokeLinecap="round"/></svg>,
  'Sinh học': <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1c-4 0-6 3-6 6s2 6 6 6 6-3 6-6-2-6-6-6z"/><path d="M2 8h12M8 1c-2 3-2 9 0 14" strokeLinecap="round"/></svg>,
};

const ITEMS_PER_PAGE = 6;

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

  const cardStyle = { background: '#fff', borderRadius: 16, border: '1px solid rgba(226,232,240,0.7)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  // Checkbox component
  const Checkbox: React.FC<{ checked: boolean; label: string; onChange: () => void }> = ({ checked, label, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer', padding: '2px 0' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: 14, height: 14, accentColor: '#6366F1', cursor: 'pointer' }}
      />
      <span>{label}</span>
    </label>
  );

  const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        <svg viewBox="0 0 20 20" style={{ width: 14, height: 14, color: '#94A3B8' }} fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>

      {/* ── HEADER ROW ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px' }}>
            Kho đề thi trắc nghiệm
            <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, color: '#818CF8' }} fill="currentColor">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
            </svg>
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Tập trung luyện tập với hàng ngàn đề thi thử chọn lọc, cập nhật liên tục.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Tìm kiếm tên đề, môn học..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, color: '#1E293B', outline: 'none', width: 240, background: '#F8FAFC' }}
            />
          </div>
          {/* Sort */}
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '9px 32px 9px 14px', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 500, color: '#1E293B', background: '#fff', appearance: 'none', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="hardest">Độ khó: Tăng dần</option>
              <option value="easiest">Độ khó: Giảm dần</option>
            </select>
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8', pointerEvents: 'none' }}>
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {subjectCategories.map(cat => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: active ? '#6366F1' : '#fff',
                color: active ? '#fff' : '#64748B',
                boxShadow: active ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                outline: active ? 'none' : '1px solid rgba(226,232,240,0.8)',
              }}
            >
              {subjectIcons[cat]} {cat}
            </button>
          );
        })}
      </div>

      {/* ── MAIN LAYOUT: Cards (left) + Filter Sidebar (right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: EXAM CARDS GRID ── */}
        <div>
          {pagedExams.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {pagedExams.map(exam => (
                <NewExamCard key={exam.id} exam={exam} onSelect={onSelectExam} onStart={onStartExam} />
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 48, textAlign: 'center', marginBottom: 24 }}>
              <BookOpen size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', margin: '0 0 6px' }}>Chưa tìm thấy đề thi phù hợp</h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.6 }}>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              <button onClick={handleReset} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#1E293B' }}>Đặt lại bộ lọc</button>
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 32 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                <svg viewBox="0 0 16 16" style={{ width: 12, height: 12 }} fill="currentColor"><path d="M15 8a.5.5 0 00-.5-.5H2.707l3.147-3.146a.5.5 0 10-.708-.708l-4 4a.5.5 0 000 .708l4 4a.5.5 0 00.708-.708L2.707 8.5H14.5A.5.5 0 0015 8z"/></svg>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{ width: 36, height: 36, borderRadius: 10, border: currentPage === page ? 'none' : '1px solid #E2E8F0', background: currentPage === page ? '#6366F1' : '#fff', color: currentPage === page ? '#fff' : '#1E293B', fontWeight: 500, fontSize: 13, cursor: 'pointer', boxShadow: currentPage === page ? '0 4px 10px rgba(99,102,241,0.3)' : 'none' }}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span style={{ color: '#94A3B8', fontSize: 13 }}>...</span>}
              {totalPages > 5 && (
                <button onClick={() => setCurrentPage(totalPages)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', color: '#1E293B', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>{totalPages}</button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                <svg viewBox="0 0 16 16" style={{ width: 12, height: 12 }} fill="currentColor"><path d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/></svg>
              </button>
            </div>
          )}

          {/* ── STATS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { icon: <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: '#6366F1' }} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, bg: '#EEF2FF', value: '2,548+', label: 'Đề thi chất lượng' },
              { icon: <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: '#10B981' }} fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, bg: '#D1FAE5', value: '96,842+', label: 'Lượt làm bài' },
              { icon: <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: '#F59E0B' }} fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, bg: '#FEF3C7', value: '4.7/5', label: 'Đánh giá trung bình' },
              { icon: <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: '#6366F1' }} fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, bg: '#EEF2FF', value: '12,450+', label: 'Học sinh đang luyện tập' },
            ].map((stat, i) => (
              <div key={i} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 2px' }}>{stat.value}</p>
                  <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: FILTER SIDEBAR ── */}
        <aside style={{ ...cardStyle, padding: 20, position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>Bộ lọc đề thi</span>
            <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
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
            style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Áp dụng bộ lọc
          </button>
        </aside>

      </div>
    </div>
  );
};

export default Exams;
