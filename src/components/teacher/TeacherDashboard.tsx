import React, { useState } from 'react';
import { Select } from '../Select';
import { 
  ChevronRight, 
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  Eye, 
  Copy, 
  MoreVertical, 
  ChevronLeft, 
  HelpCircle, 
  Filter
} from 'lucide-react';

interface TeacherDashboardProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  onStartSelfCompose: () => void;
  onUploadFile: (file: File) => void;
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

const DocumentComposeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path opacity="0.5" d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" fill="currentColor" />
    <path d="M16.5189 16.5013C16.6939 16.3648 16.8526 16.2061 17.1701 15.8886L21.1275 11.9312C21.2231 11.8356 21.1793 11.6708 21.0515 11.6264C20.5844 11.4644 19.9767 11.1601 19.4083 10.5917C18.8399 10.0233 18.5356 9.41561 18.3736 8.94849C18.3292 8.82066 18.1644 8.77687 18.0688 8.87254L14.1114 12.8299C13.7939 13.1474 13.6352 13.3061 13.4987 13.4811C13.3377 13.6876 13.1996 13.9109 13.087 14.1473C12.9915 14.3476 12.9205 14.5606 12.7786 14.9865L12.5951 15.5368L12.3034 16.4118L12.0299 17.2323C11.9601 17.4419 12.0146 17.6729 12.1708 17.8292C12.3271 17.9854 12.5581 18.0399 12.7677 17.9701L13.5882 17.6966L14.4632 17.4049L15.0135 17.2214L15.0136 17.2214C15.4394 17.0795 15.6524 17.0085 15.8527 16.913C16.0891 16.8004 16.3124 16.6623 16.5189 16.5013Z" fill="currentColor" />
    <path d="M22.3665 10.6922C23.2112 9.84754 23.2112 8.47812 22.3665 7.63348C21.5219 6.78884 20.1525 6.78884 19.3078 7.63348L19.1806 7.76071C19.0578 7.88348 19.0022 8.05496 19.0329 8.22586C19.0522 8.33336 19.0879 8.49053 19.153 8.67807C19.2831 9.05314 19.5288 9.54549 19.9917 10.0083C20.4545 10.4712 20.9469 10.7169 21.3219 10.847C21.5095 10.9121 21.6666 10.9478 21.7741 10.9671C21.945 10.9978 22.1165 10.9422 22.2393 10.8194L22.3665 10.6922Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.25 9C7.25 8.58579 7.58579 8.25 8 8.25H14.5C14.9142 8.25 15.25 8.58579 15.25 9C15.25 9.41421 14.9142 9.75 14.5 9.75H8C7.58579 9.75 7.25 9.41421 7.25 9ZM7.25 13C7.25 12.5858 7.58579 12.25 8 12.25H11C11.4142 12.25 11.75 12.5858 11.75 13C11.75 13.4142 11.4142 13.75 11 13.75H8C7.58579 13.75 7.25 13.4142 7.25 13ZM7.25 17C7.25 16.5858 7.58579 16.25 8 16.25H9.5C9.91421 16.25 10.25 16.5858 10.25 17C10.25 17.4142 9.91421 17.75 9.5 17.75H8C7.58579 17.75 7.25 17.4142 7.25 17Z" fill="currentColor" />
  </svg>
);

const ExamComposeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path opacity="0.5" d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM7.25 8C7.25 7.58579 7.58579 7.25 8 7.25H16C16.4142 7.25 16.75 7.58579 16.75 8C16.75 8.41421 16.4142 8.75 16 8.75H8C7.58579 8.75 7.25 8.41421 7.25 8ZM7.25 16C7.25 15.5858 7.58579 15.25 8 15.25H13C13.4142 15.25 13.75 15.5858 13.75 16C13.75 16.4142 13.4142 16.75 13 16.75H8C7.58579 16.75 7.25 16.4142 7.25 16Z" fill="currentColor" />
  </svg>
);

const UploadDocumentIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
    <path opacity="0.5" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" fill="currentColor" />
    <path d="M8 7.75C7.58579 7.75 7.25 7.41421 7.25 7C7.25 6.58579 7.58579 6.25 8 6.25H16C16.4142 6.25 16.75 6.58579 16.75 7C16.75 7.41421 16.4142 7.75 16 7.75H8Z" fill="currentColor" />
    <path d="M12.75 17C12.75 17.4142 12.4142 17.75 12 17.75C11.5858 17.75 11.25 17.4142 11.25 17L11.25 11.8107L9.53033 13.5303C9.23744 13.8232 8.76256 13.8232 8.46967 13.5303C8.17678 13.2374 8.17678 12.7626 8.46967 12.4697L11.4697 9.46967C11.6103 9.32902 11.8011 9.25 12 9.25C12.1989 9.25 12.3897 9.32902 12.5303 9.46967L15.5303 12.4697C15.8232 12.7626 15.8232 13.2374 15.5303 13.5303C15.2374 13.8232 14.7626 13.8232 14.4697 13.5303L12.75 11.8107V17Z" fill="currentColor" />
  </svg>
);

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
  onStartSelfCompose,
  onUploadFile,
}) => {
  const [history, setHistory] = useState<ExamHistoryItem[]>(initialHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleHelpGuideClick = () => {
    alert('Tài liệu hướng dẫn sử dụng đang được tải...');
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['pdf', 'docx', 'doc', 'pptx'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        alert('Định dạng file không hợp lệ. Vui lòng tải lên file PDF, DOCX, DOC hoặc PPTX.');
        return;
      }
      onUploadFile(file);
    }
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

  const subjectOptions = subjects.map(sub => ({
    value: sub,
    label: sub === 'All' ? 'Tất cả môn học' : sub
  }));

  const sortOptions = [
    { value: 'newest', label: 'Sắp xếp: Mới nhất' },
    { value: 'oldest', label: 'Sắp xếp: Cũ nhất' },
    { value: 'questions', label: 'Sắp xếp: Số câu hỏi' },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Tự soạn tài liệu */}
        <div 
          onClick={onStartSelfCompose}
          className="bg-white border border-slate-100 hover:border-indigo-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-205 flex flex-col justify-between cursor-pointer group relative overflow-hidden h-full"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105 [&>svg]:h-7 [&>svg]:w-7">
              <DocumentComposeIcon />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">
                Tự soạn tài liệu
              </h2>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Tự soạn thảo tài liệu lý thuyết, công thức trọng tâm hoặc sơ đồ tư duy trực tiếp trên trình soạn thảo thông minh.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartSelfCompose();
              }}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              Bắt đầu soạn
            </button>
          </div>
        </div>

        {/* Card 2: Tải tài liệu */}
        <div 
          onClick={handleUploadClick}
          className="bg-white border border-slate-100 hover:border-indigo-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-205 flex flex-col justify-between cursor-pointer group relative overflow-hidden h-full"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx,.doc,.pptx"
          />
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105 [&>svg]:h-7 [&>svg]:w-7">
              <UploadDocumentIcon />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">
                Tải tài liệu
              </h2>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Tải lên tài liệu sẵn có (PDF, DOCX, DOC, PPTX...) để chia sẻ nhanh chóng mà không cần soạn thảo lại từ đầu.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <button
              onClick={handleUploadClick}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              Tải tài liệu
            </button>
          </div>
        </div>

        {/* Card 3: Soạn đề thi */}
        <div 
          onClick={() => setMode('exam-editor')}
          className="bg-white border border-slate-100 hover:border-indigo-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-205 flex flex-col justify-between cursor-pointer group relative overflow-hidden h-full"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105 [&>svg]:h-7 [&>svg]:w-7">
              <ExamComposeIcon />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">
                Soạn đề thi
              </h2>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Biên soạn ngân hàng câu hỏi trắc nghiệm, thiết kế đề thi thử THPT Quốc gia theo cấu trúc chuẩn của Bộ Giáo dục kèm lời giải và gợi ý chi tiết.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMode('exam-editor');
              }}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              Tạo đề mới
            </button>
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
            <div className="w-48">
              <Select
                value={subjectFilter}
                onChange={(val) => { setSubjectFilter(val); setCurrentPage(1); }}
                options={subjectOptions}
                size="sm"
              />
            </div>

            {/* Sort order */}
            <div className="w-48">
              <Select
                value={sortOrder}
                onChange={(val) => { setSortOrder(val); setCurrentPage(1); }}
                options={sortOptions}
                size="sm"
              />
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
                        <div className="text-primary shrink-0 select-none [&>svg]:h-6 [&>svg]:w-6">
                          <ExamComposeIcon />
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
