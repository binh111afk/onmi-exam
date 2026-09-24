import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, BookOpen, LayoutGrid, Calculator, Atom, Beaker, PenTool, Globe, Grid, List, FileText, Eye, Download, Bookmark, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Document } from '../types';
import { DocCard } from '../components/DocCard';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';

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
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest', 'popular', 'pages'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Available filters
  const subjects = [
    { label: 'Tất cả', count: 1248, value: 'All', icon: LayoutGrid, bg: 'bg-[#6C5DD3]/10 text-[#6C5DD3] border-[#6C5DD3]/20' },
    { label: 'Toán học', count: 1024, value: 'Toán học', icon: Calculator, bg: 'bg-[#0091FF]/10 text-[#0091FF] border-[#0091FF]/20' },
    { label: 'Vật lý', count: 718, value: 'Vật lý', icon: Atom, bg: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' },
    { label: 'Hóa học', count: 634, value: 'Hóa học', icon: Beaker, bg: 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20' },
    { label: 'Ngữ văn', count: 512, value: 'Ngữ văn', icon: PenTool, bg: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' },
    { label: 'Tiếng Anh', count: 897, value: 'Tiếng Anh', icon: Globe, bg: 'bg-[#FF758F]/10 text-[#FF758F] border-[#FF758F]/20' },
  ];

  const grades = [
    { label: 'Lớp 10', count: 245, value: 'Lớp 10' },
    { label: 'Lớp 11', count: 312, value: 'Lớp 11' },
    { label: 'Lớp 12', count: 467, value: 'Lớp 12' },
    { label: 'Ôn thi đại học', count: 156, value: 'Đại học' },
  ];

  const documentTypes = [
    { label: 'Tóm tắt', count: 245, value: 'Tóm tắt' },
    { label: 'Bài giảng', count: 312, value: 'Slide' },
    { label: 'Đề thi', count: 467, value: 'PDF' },
    { label: 'Đề cương', count: 156, value: 'Đề cương' },
    { label: 'Bài tập', count: 287, value: 'DOCX' },
  ];

  const formatButtons = [
    { label: 'PDF', value: 'PDF', color: 'text-red-500 hover:bg-red-50 hover:text-red-650' },
    { label: 'DOCX', value: 'DOCX', color: 'text-blue-500 hover:bg-blue-50 hover:text-blue-650' },
    { label: 'PPT', value: 'Slide', color: 'text-amber-500 hover:bg-amber-50 hover:text-amber-650' },
    { label: 'TẤT CẢ', value: 'All', color: 'text-slate-500 hover:bg-slate-50' },
  ];

  const toggleSubject = (subj: string) => {
    if (subj === 'All') {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(prev =>
        prev.includes(subj) ? prev.filter(x => x !== subj) : [subj] // Single subject selection matching mockup tabs
      );
    }
    setCurrentPage(1);
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev =>
      prev.includes(grade) ? prev.filter(x => x !== grade) : [...prev, grade]
    );
    setCurrentPage(1);
  };

  const toggleFormat = (format: string) => {
    if (format === 'All') {
      setSelectedFormats([]);
    } else {
      setSelectedFormats(prev =>
        prev.includes(format) ? prev.filter(x => x !== format) : [...prev, format]
      );
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setSelectedFormats([]);
    setSortBy('newest');
    onSearchChange('');
    setCurrentPage(1);
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

    // Filter by format/type
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

  // Compute number of active filters
  const activeFiltersCount = (selectedGrades.length > 0 ? 1 : 0) + (selectedFormats.length > 0 ? 1 : 0);

  // Pagination bounds
  const docsPerPage = 6;
  const totalPages = Math.ceil(filteredDocs.length / docsPerPage) || 1;
  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * docsPerPage;
    return filteredDocs.slice(startIndex, startIndex + docsPerPage);
  }, [filteredDocs, currentPage]);

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ======================================================= */}
        {/* LEFT COLUMN: Tabs, grid cards, pagination (9/12 width)  */}
        {/* ======================================================= */}
        <div className="lg:col-span-9 space-y-6">

          {/* Horizontal scroll subject tabs matching mockup */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-3.5 min-w-max pr-4">
              {subjects.map((sub, idx) => {
                const IconComponent = sub.icon;
                const isActive = (sub.value === 'All' && selectedSubjects.length === 0) ||
                  (selectedSubjects.includes(sub.value));

                return (
                  <button
                    key={idx}
                    onClick={() => toggleSubject(sub.value)}
                    className={`flex items-center gap-3.5 px-5 py-3 rounded-2xl border transition-all duration-200 cursor-pointer ${isActive
                        ? `${sub.bg} bg-white shadow-[0_4px_16px_rgba(108,93,211,0.08)] border-slate-200/50 scale-[1.02]`
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? 'bg-current/10' : 'bg-slate-50'}`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-xs font-black">{sub.label}</div>
                      <div className="text-[9px] font-semibold text-text-secondary mt-0.5">
                        {sub.count.toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-header Row: document counts, view mode, sort */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-black text-text-primary">
                {selectedSubjects.length > 0 ? `Tài liệu ${selectedSubjects[0]}` : 'Tất cả tài liệu'}
              </h2>
              <span className="text-[10px] font-bold text-text-secondary bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredDocs.length.toLocaleString('vi-VN')} tài liệu
              </span>
            </div>

            <div className="flex items-center gap-3">

              {/* View switcher buttons */}
              <div className="flex items-center border border-slate-100 bg-white rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-default cursor-pointer ${viewMode === 'grid' ? 'bg-primary-light text-primary' : 'text-slate-400 hover:text-text-primary'
                    }`}
                  title="Xem dạng lưới"
                >
                  <Grid size={13} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-default cursor-pointer ${viewMode === 'list' ? 'bg-primary-light text-primary' : 'text-slate-400 hover:text-text-primary'
                    }`}
                  title="Xem dạng danh sách"
                >
                  <List size={13} />
                </button>
              </div>

              {/* Mobile Filter toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden p-2.5 border border-slate-100 bg-white rounded-xl text-text-secondary hover:bg-slate-50 transition cursor-pointer"
              >
                <SlidersHorizontal size={14} />
              </button>

              {/* Quick sort label */}
              <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-text-secondary font-bold">
                <span>Sắp xếp:</span>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  variant="ghost"
                  size="sm"
                  options={[
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'popular', label: 'Tải nhiều nhất' },
                    { value: 'pages', label: 'Số trang lớn nhất' },
                  ]}
                />
              </div>

            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden bg-white border border-slate-100 rounded-card p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-text-primary">BỘ LỌC TÀI LIỆU</span>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-text-secondary hover:text-primary font-bold transition"
                >
                  Đặt lại
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <h4 className="text-[11px] font-black text-text-primary mb-1">Khối lớp</h4>
                  {grades.map(g => (
                    <Checkbox
                      key={g.value}
                      checked={selectedGrades.includes(g.value)}
                      onChange={() => toggleGrade(g.value)}
                      label={g.label}
                      className="text-text-secondary py-1"
                    />
                  ))}
                </div>

                <div className="space-y-2 flex flex-col">
                  <h4 className="text-[11px] font-black text-text-primary mb-1">Loại tài liệu</h4>
                  {documentTypes.map(t => (
                    <Checkbox
                      key={t.value}
                      checked={selectedFormats.includes(t.value)}
                      onChange={() => toggleFormat(t.value)}
                      label={t.label}
                      className="text-text-secondary py-1"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          )}

          {/* Documents viewport grid / list */}
          {filteredDocs.length > 0 ? (
            <div className="space-y-8">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedDocs.map(doc => (
                    <DocCard
                      key={doc.id}
                      doc={doc}
                      onSelect={onSelectDoc}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {paginatedDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => onSelectDoc(doc.id)}
                      className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-primary/20 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 bg-primary-light text-primary rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-text-primary group-hover:text-primary transition-colors">
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-text-secondary font-bold mt-1">
                            <span className="text-primary font-black uppercase">{doc.format}</span>
                            <span>•</span>
                            <span>{doc.grade}</span>
                            <span>•</span>
                            <span>{doc.subject}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 text-[10px] font-bold text-text-secondary">
                        <span>{doc.pageCount} trang</span>
                        <span>{doc.downloads.toLocaleString('vi-VN')} lượt tải</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Clickable Pagination matching mockup */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer ${isActive
                          ? 'bg-primary text-white shadow-[0_3px_8px_rgba(108,93,211,0.25)]'
                          : 'border border-slate-100 bg-white hover:bg-slate-50 text-text-secondary'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-center text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>
          ) : (
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
                className="mt-5 px-5 py-2.5 border border-slate-100 text-xs font-black text-primary rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}

        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: Filters Panel & Platform Stats (3/12 width)*/}
        {/* ======================================================= */}
        <div className="lg:col-span-3 space-y-6">

          {/* Filter Panel matching mockup */}
          <section className="bg-white border border-slate-100 rounded-card p-6 space-y-6">

            {/* Header: Title & Reset */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[11px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-primary" /> Bộ lọc tài liệu
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Đặt lại
              </button>
            </div>

             {/* Checkbox: Grade */}
             <div className="space-y-2.5">
               <h4 className="text-xs font-black text-text-primary">Khối lớp</h4>
               <div className="space-y-2 flex flex-col">
                 {grades.map((g) => (
                   <div key={g.value} className="flex items-center justify-between">
                     <Checkbox
                       checked={selectedGrades.includes(g.value)}
                       onChange={() => toggleGrade(g.value)}
                       label={
                         <span className={selectedGrades.includes(g.value) ? 'font-bold text-text-primary' : 'font-medium text-text-secondary group-hover:text-text-primary'}>
                           {g.label}
                         </span>
                       }
                     />
                     <span className="text-[10px] font-bold text-text-muted/80">{g.count}</span>
                   </div>
                 ))}
               </div>
             </div>

             {/* Checkbox: Types */}
             <div className="space-y-2.5">
               <h4 className="text-xs font-black text-text-primary">Loại tài liệu</h4>
               <div className="space-y-2 flex flex-col">
                 {documentTypes.map((t) => (
                   <div key={t.value} className="flex items-center justify-between">
                     <Checkbox
                       checked={selectedFormats.includes(t.value)}
                       onChange={() => toggleFormat(t.value)}
                       label={
                         <span className={selectedFormats.includes(t.value) ? 'font-bold text-text-primary' : 'font-medium text-text-secondary group-hover:text-text-primary'}>
                           {t.label}
                         </span>
                       }
                     />
                     <span className="text-[10px] font-bold text-text-muted/80">{t.count}</span>
                   </div>
                 ))}
               </div>
             </div>

            {/* Format quick buttons */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-text-primary">Định dạng</h4>
              <div className="grid grid-cols-4 gap-2">
                {formatButtons.map((btn) => {
                  const isActive = (btn.value === 'All' && selectedFormats.length === 0) ||
                    (selectedFormats.includes(btn.value));

                  return (
                    <button
                      key={btn.value}
                      onClick={() => toggleFormat(btn.value)}
                      className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[10px] font-black transition-all cursor-pointer ${isActive
                          ? 'border-primary bg-primary-light/50 text-primary font-black shadow-[0_2px_8px_rgba(108,93,211,0.06)]'
                          : 'border-slate-100 bg-white text-text-secondary hover:bg-slate-50'
                        }`}
                    >
                      <FileText size={14} className={isActive ? 'text-primary' : 'text-slate-400'} />
                      <span className="mt-1 text-[8px] tracking-wider">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-text-primary">Sắp xếp theo</h4>
              <Select
                value={sortBy}
                onChange={setSortBy}
                variant="filled"
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'popular', label: 'Tải nhiều nhất' },
                  { value: 'pages', label: 'Số trang lớn nhất' },
                ]}
              />
            </div>

            {/* Apply Filter Button */}
            <button
              onClick={() => setCurrentPage(1)}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20"
            >
              <span>Áp dụng bộ lọc</span>
              {activeFiltersCount > 0 && (
                <span className="h-5 w-5 bg-white text-primary text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

          </section>

          {/* Stats widget panel matching mockup */}
          <section className="bg-white border border-slate-100 rounded-card p-6 space-y-5">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
              Thống kê học tập
            </h3>

            <div className="grid grid-cols-2 gap-3.5">

              <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Eye size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-text-primary leading-none">1.248</div>
                  <div className="text-[8px] font-bold text-text-secondary mt-1">Tài liệu</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Download size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-text-primary leading-none">32.4K</div>
                  <div className="text-[8px] font-bold text-text-secondary mt-1">Lượt tải</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Bookmark size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-text-primary leading-none">8.7K</div>
                  <div className="text-[8px] font-bold text-text-secondary mt-1">Đã lưu</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="h-8 w-8 bg-pink-50 text-accent rounded-xl flex items-center justify-center shrink-0">
                  <Users size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-text-primary leading-none">2.1K</div>
                  <div className="text-[8px] font-bold text-text-secondary mt-1">Đang học</div>
                </div>
              </div>

            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
