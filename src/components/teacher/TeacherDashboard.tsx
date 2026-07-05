import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  Eye, 
  Copy, 
  MoreVertical, 
  ChevronLeft, 
  HelpCircle, 
  Filter, 
  BarChart2 
} from 'lucide-react';

interface TeacherDashboardProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  setShowMethodModal: (show: boolean) => void;
}

interface ExamHistoryItem {
  id: number;
  title: string;
  category: string;
  subject: string;
  grade: string;
  questionsCount: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastUpdated: string;
}

const initialHistory: ExamHistoryItem[] = [
  {
    id: 1,
    title: 'Đề khảo sát năng lực Toán & Khoa học tự nhiên',
    category: 'Đề thi thử',
    subject: 'Toán & KHTN',
    grade: 'Khối 10',
    questionsCount: 50,
    duration: '60 phút',
    difficulty: 'easy',
    lastUpdated: '28/06/2025 22:35'
  },
  {
    id: 2,
    title: 'Đề thi thử THPTQG 2025 - Lần 1',
    category: 'Đề thi thử',
    subject: 'Toán',
    grade: 'Khối 12',
    questionsCount: 50,
    duration: '90 phút',
    difficulty: 'medium',
    lastUpdated: '27/06/2025 19:12'
  },
  {
    id: 3,
    title: '25 đề luyện tập Hàm số',
    category: 'Đề luyện tập',
    subject: 'Toán',
    grade: 'Khối 12',
    questionsCount: 25,
    duration: '45 phút',
    difficulty: 'hard',
    lastUpdated: '26/06/2025 16:45'
  },
  {
    id: 4,
    title: 'Đề kiểm tra 15 phút - Đại số',
    category: 'Đề kiểm tra',
    subject: 'Toán',
    grade: 'Khối 10',
    questionsCount: 15,
    duration: '15 phút',
    difficulty: 'easy',
    lastUpdated: '25/06/2025 10:20'
  },
  {
    id: 5,
    title: 'Đề ôn tập Học kì 2 - Vật lí',
    category: 'Đề ôn tập',
    subject: 'Vật lí',
    grade: 'Khối 11',
    questionsCount: 40,
    duration: '60 phút',
    difficulty: 'medium',
    lastUpdated: '24/06/2025 21:05'
  },
  {
    id: 6,
    title: 'Đề thi học kì 1 - Hóa học 10',
    category: 'Đề thi thử',
    subject: 'Hóa học',
    grade: 'Khối 10',
    questionsCount: 40,
    duration: '45 phút',
    difficulty: 'medium',
    lastUpdated: '23/06/2025 14:30'
  },
  {
    id: 7,
    title: 'Đề luyện thi chuyên Toán 9',
    category: 'Đề luyện tập',
    subject: 'Toán',
    grade: 'Khối 9',
    questionsCount: 30,
    duration: '120 phút',
    difficulty: 'hard',
    lastUpdated: '22/06/2025 09:15'
  },
  {
    id: 8,
    title: 'Đề kiểm tra Sinh học 11 - Chương 2',
    category: 'Đề kiểm tra',
    subject: 'Sinh học',
    grade: 'Khối 11',
    questionsCount: 20,
    duration: '30 phút',
    difficulty: 'easy',
    lastUpdated: '21/06/2025 15:45'
  },
  {
    id: 9,
    title: 'Đề khảo sát đầu năm Tiếng Anh 12',
    category: 'Đề thi thử',
    subject: 'Tiếng Anh',
    grade: 'Khối 12',
    questionsCount: 50,
    duration: '60 phút',
    difficulty: 'medium',
    lastUpdated: '20/06/2025 08:00'
  },
  {
    id: 10,
    title: 'Đề thi HSG Lịch sử 12',
    category: 'Đề thi thử',
    subject: 'Lịch sử',
    grade: 'Khối 12',
    questionsCount: 40,
    duration: '150 phút',
    difficulty: 'hard',
    lastUpdated: '19/06/2025 14:00'
  },
  {
    id: 11,
    title: 'Đề kiểm tra 1 tiết Địa lý 10',
    category: 'Đề kiểm tra',
    subject: 'Địa lý',
    grade: 'Khối 10',
    questionsCount: 30,
    duration: '45 phút',
    difficulty: 'easy',
    lastUpdated: '18/06/2025 10:30'
  },
  {
    id: 12,
    title: 'Đề ôn thi giữa kì Ngữ văn 11',
    category: 'Đề ôn tập',
    subject: 'Ngữ văn',
    grade: 'Khối 11',
    questionsCount: 10,
    duration: '90 phút',
    difficulty: 'medium',
    lastUpdated: '17/06/2025 16:20'
  }
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  setMode,
  setShowMethodModal,
}) => {
  const [history, setHistory] = useState<ExamHistoryItem[]>(initialHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleHelpGuideClick = () => {
    alert('Tài liệu hướng dẫn sử dụng đang được tải...');
  };

  const handleStatisticsClick = () => {
    alert('Tính năng Thống kê & Bảng xếp hạng đang được tải dữ liệu...');
  };

  const handleCloneItem = (item: ExamHistoryItem) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: ExamHistoryItem = {
      ...item,
      id: Math.max(...history.map(h => h.id), 0) + 1,
      title: `${item.title} (Bản sao)`,
      lastUpdated: formattedDate,
    };
    setHistory([newItem, ...history]);
    alert('Nhân bản đề thi thành công!');
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đề thi này khỏi lịch sử?')) {
      setHistory(history.filter(item => item.id !== id));
    }
  };

  // Helper date parser: DD/MM/YYYY HH:mm
  const parseDate = (dateStr: string): number => {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute).getTime();
  };

  // Filter subject list dynamically
  const subjects = ['All', ...Array.from(new Set(initialHistory.map(item => item.subject)))];

  // Filtering
  const filtered = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || item.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') return parseDate(b.lastUpdated) - parseDate(a.lastUpdated);
    if (sortOrder === 'oldest') return parseDate(a.lastUpdated) - parseDate(b.lastUpdated);
    if (sortOrder === 'questions') return b.questionsCount - a.questionsCount;
    return 0;
  });

  // Pagination calculations
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Guard current page boundaries
  const activePage = Math.min(currentPage, totalPages);
  
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full py-8 px-6 sm:px-8 lg:px-10 select-none max-w-7xl mx-auto animate-fadeIn space-y-8 font-sans">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
            Khu vực Giáo viên
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1 font-sans">
            Không gian làm việc chuyên nghiệp dành cho Giáo viên. Lựa chọn công cụ bên dưới để bắt đầu.
          </p>
        </div>
        <button
          onClick={handleHelpGuideClick}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-[#6C5DD3] rounded-xl flex items-center gap-2 transition cursor-pointer font-sans bg-white shadow-sm self-start sm:self-auto"
        >
          <HelpCircle size={13} className="stroke-[2.5]" />
          Hướng dẫn sử dụng
        </button>
      </div>

      {/* Row of Three Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Soạn tài liệu */}
        <div 
          onClick={() => setShowMethodModal(true)}
          className="bg-white border border-slate-100 hover:border-[#6C5DD3]/25 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-205 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105">
              <BookOpen size={20} className="stroke-[2.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-slate-800 group-hover:text-[#6C5DD3] transition-colors">
                Soạn tài liệu
              </h2>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Tải lên và biên soạn tóm tắt lý thuyết, sổ tay giải nhanh, công thức trọng tâm hoặc sơ đồ tư duy cho các khối lớp học viên ôn tập.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center justify-between">
            <span className="text-[10px] font-black text-[#6C5DD3] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Bắt đầu soạn thảo <ChevronRight size={12} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Card 2: Soạn đề thi */}
        <div 
          onClick={() => setMode('exam-editor')}
          className="bg-white border border-slate-100 hover:border-[#6C5DD3]/25 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-205 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C5DD3] flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105">
              <FileText size={20} className="stroke-[2.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-slate-800 group-hover:text-[#6C5DD3] transition-colors">
                Soạn đề thi
              </h2>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Biên soạn ngân hàng câu hỏi trắc nghiệm, thiết kế đề thi thử THPT Quốc gia theo cấu trúc chuẩn của Bộ Giáo dục kèm lời giải và gợi ý chi tiết.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center justify-between">
            <span className="text-[10px] font-black text-[#6C5DD3] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Tạo đề thi mới <ChevronRight size={12} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Card 3: Thống kê & Bảng xếp hạng */}
        <div 
          onClick={handleStatisticsClick}
          className="bg-white border border-slate-100 hover:border-[#6C5DD3]/25 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-205 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105">
              <BarChart2 size={20} className="stroke-[2.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-slate-800 group-hover:text-[#6C5DD3] transition-colors">
                Thống kê & Bảng xếp hạng
              </h2>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Xem thống kê kết quả làm bài của học sinh, bảng xếp hạng và phân tích chi tiết.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center justify-between">
            <span className="text-[10px] font-black text-[#6C5DD3] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Xem ngay <ChevronRight size={12} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

      </div>

      {/* History Log Section */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm space-y-6">
        
        {/* Section Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 select-none">
          <div>
            <h2 className="text-sm font-black text-slate-800 tracking-wide font-sans">
              Lịch sử tạo đề
            </h2>
            <p className="text-[10px] text-slate-400 font-bold font-sans">
              Danh sách các đề thi đã tạo gần đây
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm đề thi..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-3 pr-9 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#6C5DD3] w-48 transition"
              />
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Subject filter */}
            <div className="relative">
              <select
                value={subjectFilter}
                onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white appearance-none outline-none focus:border-[#6C5DD3] transition cursor-pointer"
              >
                <option value="All">Tất cả môn học</option>
                {subjects.filter(s => s !== 'All').map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Filter size={12} />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={12} />
              </div>
            </div>

            {/* Sort order */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white appearance-none outline-none focus:border-[#6C5DD3] transition cursor-pointer"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="oldest">Sắp xếp: Cũ nhất</option>
                <option value="questions">Sắp xếp: Số câu hỏi</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ArrowUpDown size={12} />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto w-full border border-slate-100 rounded-2xl select-text">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none bg-slate-50/50">
                <th className="py-3 px-4">Tên đề thi</th>
                <th className="py-3 px-4">Môn học</th>
                <th className="py-3 px-4">Khối lớp</th>
                <th className="py-3 px-4">Số câu</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Độ khó</th>
                <th className="py-3 px-4">Cập nhật lần cuối</th>
                <th className="py-3 px-4 text-right select-none">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100/60 hover:bg-slate-50/20 transition duration-150">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6C5DD3] flex items-center justify-center shrink-0 select-none">
                          <FileText size={14} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5 font-sans uppercase">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-600">{item.subject}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-600">{item.grade}</td>
                    <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-655">{item.questionsCount}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-600">{item.duration}</td>
                    <td className="py-3.5 px-4 select-none">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        item.difficulty === 'easy' ? 'bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]' :
                        item.difficulty === 'hard' ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]' :
                        'bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5]'
                      }`}>
                        {item.difficulty === 'easy' ? 'Dễ' : item.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-400 font-sans">{item.lastUpdated}</td>
                    <td className="py-3.5 px-4 text-right select-none">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setMode('exam-editor');
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-[#6C5DD3] rounded-lg transition cursor-pointer"
                          title="Xem trước đề"
                        >
                          <Eye size={13} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => handleCloneItem(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-[#6C5DD3] rounded-lg transition cursor-pointer"
                          title="Nhân bản đề"
                        >
                          <Copy size={13} className="stroke-[2.5]" />
                        </button>
                        <div className="relative group/menu inline-block text-left">
                          <button
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                            title="Tùy chọn khác"
                          >
                            <MoreVertical size={13} className="stroke-[2.5]" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-slate-150 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition duration-150 z-20 overflow-hidden">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-full text-left px-3.5 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 transition cursor-pointer font-sans"
                            >
                              Xóa đề thi
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-xs font-bold text-slate-400">
                    Không tìm thấy đề thi phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400 font-sans select-none">
          {/* Left */}
          <div>
            Hiển thị <span className="text-slate-700 font-black">{totalItems > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, totalItems)}</span> trong <span className="text-slate-700 font-black">{totalItems}</span> đề thi
          </div>

          {/* Center Pagination */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`p-1.5 rounded-lg border transition ${
                activePage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-50 text-slate-555 cursor-pointer'
              }`}
            >
              <ChevronLeft size={12} className="stroke-[2.5]" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg text-center text-xs font-black transition cursor-pointer ${
                  activePage === idx + 1
                    ? 'bg-[#6C5DD3] text-white shadow-md shadow-indigo-100'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-555 bg-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`p-1.5 rounded-lg border transition ${
                activePage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-50 text-slate-555 cursor-pointer'
              }`}
            >
              <ChevronRight size={12} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Right: Items per page selector */}
          <div className="flex items-center gap-1.5">
            <span>Hiển thị</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(parseInt(e.target.value) || 5); setCurrentPage(1); }}
                className="pl-2.5 pr-6 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-750 bg-white appearance-none outline-none focus:border-[#6C5DD3] transition cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={10} />
              </div>
            </div>
            <span>trang</span>
          </div>
        </div>

      </div>

    </div>
  );
};
