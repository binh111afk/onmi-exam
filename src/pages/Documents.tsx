import React, { useState, useMemo } from 'react';
import { RefreshCw, Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import type { Document } from '../types';
import { DocCard } from '../components/DocCard';

interface DocumentsProps {
  documents: Document[];
  onSelectDoc: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Documents: React.FC<DocumentsProps> = ({
  documents,
  onSelectDoc,
  searchQuery,
  onSearchChange,
}) => {
  // Mobile filter sidebar toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popular'); // 'popular', 'newest', 'pages'

  // Filter item lists
  const subjects = ['Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học'];
  const grades = ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'];
  const formats = ['PDF', 'DOCX', 'Slide', 'Tóm tắt', 'Đề cương'];

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

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(x => x !== format) : [...prev, format]
    );
  };

  const handleResetFilters = () => {
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setSelectedFormats([]);
    setSortBy('popular');
    onSearchChange('');
  };

  // Perform dynamic filtering and sorting
  const filteredDocs = useMemo(() => {
    let result = [...documents];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        doc =>
          doc.title.toLowerCase().includes(q) ||
          doc.subject.toLowerCase().includes(q) ||
          doc.author.toLowerCase().includes(q)
      );
    }

    // Filter by subject
    if (selectedSubjects.length > 0) {
      result = result.filter(doc => selectedSubjects.includes(doc.subject));
    }

    // Filter by grade
    if (selectedGrades.length > 0) {
      result = result.filter(doc => selectedGrades.includes(doc.grade));
    }

    // Filter by format
    if (selectedFormats.length > 0) {
      result = result.filter(doc => selectedFormats.includes(doc.format));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'newest':
          return b.updatedAt.localeCompare(a.updatedAt);
        case 'pages':
          return b.pageCount - a.pageCount;
        default:
          return 0;
      }
    });

    return result;
  }, [documents, searchQuery, selectedSubjects, selectedGrades, selectedFormats, sortBy]);

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Kho tài liệu học tập</h1>
          <p className="text-xs text-text-secondary mt-0.5">Tuyển tập tài liệu, bài giảng và đề cương tóm tắt chi tiết.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Main search bar inside content area */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu, giáo viên..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50/50"
            />
          </div>

          {/* Mobile filters toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2 border border-slate-200 rounded-btn text-text-secondary hover:bg-slate-50 transition-default"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-btn bg-white text-xs font-semibold text-text-primary focus:outline-none cursor-pointer transition-default"
          >
            <option value="popular">Lượt xem nhiều nhất</option>
            <option value="newest">Ngày cập nhật: Mới nhất</option>
            <option value="pages">Độ dài: Số trang giảm dần</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar filter (Desktop) */}
        <aside className="hidden lg:block space-y-6 self-start sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Bộ lọc tài liệu</span>
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
                  <input type="checkbox" checked={selectedSubjects.includes(subj)} onChange={() => toggleSubject(subj)} />
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
                  <input type="checkbox" checked={selectedGrades.includes(grade)} onChange={() => toggleGrade(grade)} />
                  <span>{grade}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format / Type Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-primary">Loại tài liệu</h4>
            <div className="space-y-1.5">
              {formats.map(fmt => (
                <label key={fmt} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                  <input type="checkbox" checked={selectedFormats.includes(fmt)} onChange={() => toggleFormat(fmt)} />
                  <span>{fmt}</span>
                </label>
              ))}
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
                <h4 className="text-xs font-semibold text-text-primary">Loại tài liệu</h4>
                {formats.map(fmt => (
                  <label key={fmt} className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
                    <input type="checkbox" checked={selectedFormats.includes(fmt)} onChange={() => toggleFormat(fmt)} />
                    <span>{fmt}</span>
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

        {/* Right Content Area: Document Cards Grid */}
        <main className="lg:col-span-3">
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDocs.map(doc => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onSelect={onSelectDoc}
                />
              ))}
            </div>
          ) : (
            /* Motivational Empty State */
            <div className="border border-dashed border-slate-200 rounded-card p-12 text-center max-w-[500px] mx-auto my-12 bg-white">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-text-secondary mx-auto mb-4">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Chưa tìm thấy tài liệu học</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Chúng tôi không tìm thấy tài liệu phù hợp với các tiêu chí lọc hiện tại. Bạn hãy thử đặt lại bộ lọc để tìm kiếm rộng hơn nhé.
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
