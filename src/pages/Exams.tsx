import React, { useState, useMemo } from 'react';
import { RefreshCw, Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import type { Exam } from '../types';
import { ExamCard } from '../components/ExamCard';

interface ExamsProps {
  exams: Exam[];
  onSelectExam: (id: string) => void;
  onStartExam: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Exams: React.FC<ExamsProps> = ({
  exams,
  onSelectExam,
  onStartExam,
  searchQuery,
  onSearchChange,
}) => {
  // Mobile filter sidebar toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]); // 'free', 'premium'
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest', 'popular', 'rating', 'hardest', 'easiest'

  // Available filter lists
  const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học'];
  const grades = ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'];
  const difficulties = ['Dễ', 'Trung bình', 'Khó'];

  const toggleSubject = (subj: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subj) ? prev.filter(x => x !== subj) : [...prev, subj]
    );
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev =>
      prev.includes(grade) ? prev.filter(x => x !== grade) : [...prev, grade]
    );
  };

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(diff) ? prev.filter(x => x !== diff) : [...prev, diff]
    );
  };

  const togglePrice = (price: string) => {
    setSelectedPrices(prev =>
      prev.includes(price) ? prev.filter(x => x !== price) : [...prev, price]
    );
  };

  const handleResetFilters = () => {
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setSelectedDifficulties([]);
    setSelectedPrices([]);
    setSortBy('newest');
    onSearchChange('');
  };

  // Perform dynamic client-side filtering and sorting
  const filteredExams = useMemo(() => {
    let result = [...exams];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        exam =>
          exam.title.toLowerCase().includes(q) ||
          exam.subject.toLowerCase().includes(q)
      );
    }

    // Filter by Subjects
    if (selectedSubjects.length > 0) {
      result = result.filter(exam => selectedSubjects.includes(exam.subject));
    }

    // Filter by Grades
    if (selectedGrades.length > 0) {
      result = result.filter(exam => selectedGrades.includes(exam.grade));
    }

    // Filter by Difficulties
    if (selectedDifficulties.length > 0) {
      result = result.filter(exam => selectedDifficulties.includes(exam.difficulty));
    }

    // Filter by Price
    if (selectedPrices.length > 0) {
      result = result.filter(exam => {
        const isPremium = exam.isPremium;
        if (selectedPrices.includes('free') && !isPremium) return true;
        if (selectedPrices.includes('premium') && isPremium) return true;
        return false;
      });
    }

    // Sort Results
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // For demo, sort by ID or tag
          return a.id.localeCompare(b.id);
        case 'popular':
          return b.tries - a.tries;
        case 'rating':
          return b.rating - a.rating;
        case 'hardest': {
          const diffMap = { 'Khó': 3, 'Trung bình': 2, 'Dễ': 1 };
          return diffMap[b.difficulty] - diffMap[a.difficulty];
        }
        case 'easiest': {
          const diffMap = { 'Khó': 3, 'Trung bình': 2, 'Dễ': 1 };
          return diffMap[a.difficulty] - diffMap[b.difficulty];
        }
        default:
          return 0;
      }
    });

    return result;
  }, [exams, searchQuery, selectedSubjects, selectedGrades, selectedDifficulties, selectedPrices, sortBy]);

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header (Row) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Kho đề thi trắc nghiệm</h1>
          <p className="text-xs text-text-secondary mt-0.5">Tập trung luyện tập với hàng ngàn đề thi thử chọn lọc.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Main search bar inside content area */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm tên đề, môn học..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50/50"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2 border border-slate-200 rounded-btn text-text-secondary hover:bg-slate-50 transition-default"
            title="Bộ lọc"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-btn bg-white text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-default cursor-pointer"
          >
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="hardest">Độ khó: Tăng dần</option>
            <option value="easiest">Độ khó: Giảm dần</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filter + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar - Desktop */}
        <aside className={`hidden lg:block space-y-6 self-start sticky top-24`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Bộ lọc đề thi</span>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-text-secondary hover:text-primary flex items-center gap-1 transition-default font-semibold"
            >
              <RefreshCw size={10} /> Đặt lại bộ lọc
            </button>
          </div>

          {/* Subject Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-primary">Môn học</h4>
            <div className="space-y-1.5">
              {subjects.map(subj => (
                <label key={subj} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subj)}
                    onChange={() => toggleSubject(subj)}
                  />
                  <span>{subj}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Grade Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-primary">Khối lớp</h4>
            <div className="space-y-1.5">
              {grades.map(grade => (
                <label key={grade} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedGrades.includes(grade)}
                    onChange={() => toggleGrade(grade)}
                  />
                  <span>{grade}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-primary">Độ khó</h4>
            <div className="space-y-1.5">
              {difficulties.map(diff => (
                <label key={diff} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(diff)}
                    onChange={() => toggleDifficulty(diff)}
                  />
                  <span>{diff}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-primary">Gói học tập</h4>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedPrices.includes('free')}
                  onChange={() => togglePrice('free')}
                />
                <span>Miễn phí (Free)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedPrices.includes('premium')}
                  onChange={() => togglePrice('premium')}
                />
                <span>Hội viên (Premium)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Slide Down */}
        {showMobileFilters && (
          <div className="lg:hidden bg-slate-50/50 border border-slate-100 rounded-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-text-primary">Bộ lọc</span>
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-text-secondary hover:text-primary flex items-center gap-1 transition-default font-semibold"
              >
                <RefreshCw size={10} /> Đặt lại
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-text-primary">Môn học</h4>
                {subjects.map(subj => (
                  <label key={subj} className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
                    <input type="checkbox" checked={selectedSubjects.includes(subj)} onChange={() => toggleSubject(subj)} />
                    <span>{subj}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-text-primary">Khối lớp</h4>
                {grades.map(grade => (
                  <label key={grade} className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
                    <input type="checkbox" checked={selectedGrades.includes(grade)} onChange={() => toggleGrade(grade)} />
                    <span>{grade}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full py-1.5 bg-primary text-white text-xs font-semibold rounded-btn"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        )}

        {/* Right Content Area: Exams list Grid */}
        <main className="lg:col-span-3">
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredExams.map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onSelect={onSelectExam}
                  onStartExam={onStartExam}
                />
              ))}
            </div>
          ) : (
            /* Motivational Empty State */
            <div className="border border-dashed border-slate-200 rounded-card p-12 text-center max-w-[500px] mx-auto my-12 bg-white">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-text-secondary mx-auto mb-4">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Chưa tìm thấy đề thi phù hợp</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Chúng tôi không tìm thấy đề thi khớp với bộ lọc hiện tại của bạn. Bạn hãy thử tắt bớt hộp kiểm lọc hoặc bấm nút đặt lại nhé.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-4 py-2 border border-slate-200 text-xs font-semibold rounded-btn hover:bg-slate-50 transition-default"
              >
                Nhập lại bộ lọc
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
