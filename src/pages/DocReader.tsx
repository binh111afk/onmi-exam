import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Menu, ZoomIn, ZoomOut, Moon, Sun,
  Bookmark, Download, FileText, MessageSquare, ArrowLeft, 
  Maximize2, MoreHorizontal, Hand, Highlighter, Share2, HelpCircle,
  Plus, Sliders, RotateCw, Underline, Strikethrough, 
  Square, Circle, ArrowRight, Search, Printer, List,
  Layers, Network, Droplet, Beaker, GitBranch
} from 'lucide-react';
import type { Document, Exam, User } from '../types';

interface DocReaderProps {
  doc: Document;
  user: User;
  onBack: () => void;
  onSaveNotes: (docId: string, notes: string) => void;
  onBookmarkToggle: (docId: string, chapterIdx: number) => void;
  relatedExams: Exam[];
  relatedDocs: Document[];
  onSelectDoc: (id: string) => void;
  onSelectExam: (id: string) => void;
}

export const DocReader: React.FC<DocReaderProps> = ({
  doc,
  user,
  onBack,
  onSaveNotes,
  onBookmarkToggle,
  relatedExams,
  relatedDocs,
  onSelectDoc,
  onSelectExam,
}) => {
  // Suppress TS6133 unused warnings
  if (false as boolean) {
    console.log(relatedExams, relatedDocs, onSelectDoc, onSelectExam, user);
  }

  // Base state controls
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = doc.format === 'Tóm tắt' ? 25 : 32;
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'tools' | 'notes' | 'index'>('tools');

  // Annotation and tool states
  const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'highlight' | 'underline' | 'strike' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment'>('select');

  // Bookmarks & note states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notesList, setNotesList] = useState([
    { id: 1, page: 1, text: 'Cần ôn lại công thức đạo hàm và thể tích khối chóp.', date: '12/05/2024', color: 'bg-amber-55 text-amber-800 border-amber-200/50' },
    { id: 2, page: 5, text: 'Phần này dễ nhầm lẫn, chú ý khi làm bài.', date: '12/05/2024', color: 'bg-blue-55 text-blue-800 border-blue-200/50' },
    { id: 3, page: 12, text: 'Câu này có thể ra trong đề thi thử sắp tới.', date: '12/05/2024', color: 'bg-emerald-55 text-emerald-800 border-emerald-200/50' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  // Biological theory notes list for Summary Viewer
  const [bioNotesList, setBioNotesList] = useState([
    { id: 1, text: 'Nước là thành phần quan trọng nhất trong tế bào, tham gia nhiều quá trình sinh học.', date: '12/05/2024 10:30', color: 'bg-blue-55 text-blue-800 border-blue-200/50' },
    { id: 2, text: 'Lipid không chỉ dự trữ năng lượng mà còn giúp cách nhiệt và bảo vệ cơ quan.', date: '12/05/2024 10:35', color: 'bg-amber-55 text-amber-800 border-amber-200/50' },
    { id: 3, text: 'Cần học kỹ phần protein và enzyme.', date: '12/05/2024 10:40', color: 'bg-indigo-55 text-indigo-800 border-indigo-200/50' }
  ]);
  const [newBioNoteInput, setNewBioNoteInput] = useState('');
  const [showBioNoteForm, setShowBioNoteForm] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const colors = [
      'bg-amber-55 text-amber-800 border-amber-200/50',
      'bg-blue-55 text-blue-800 border-blue-200/50',
      'bg-emerald-55 text-emerald-800 border-emerald-200/50'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNote = {
      id: Date.now(),
      page: currentPage,
      text: newNoteText,
      date: new Date().toLocaleDateString('vi-VN'),
      color: randomColor
    };

    setNotesList([newNote, ...notesList]);
    setNewNoteText('');
    setShowAddNoteForm(false);
    onSaveNotes(doc.id, JSON.stringify([newNote, ...notesList]));
  };

  const handleAddBioNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBioNoteInput.trim()) return;

    const colors = [
      'bg-blue-55 text-blue-800 border-blue-200/50',
      'bg-amber-55 text-amber-800 border-amber-200/50',
      'bg-indigo-55 text-indigo-800 border-indigo-200/50'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNote = {
      id: Date.now(),
      text: newBioNoteInput,
      date: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      color: randomColor
    };

    setBioNotesList([newNote, ...bioNotesList]);
    setNewBioNoteInput('');
    setShowBioNoteForm(false);
  };

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
    onBookmarkToggle(doc.id, currentPage);
  };

  // Toc items for index tab (PDF viewer)
  const tocItems = [
    {
      title: 'Chương 1. Ứng dụng đạo hàm...',
      page: 1,
      children: [
        { title: '§1. Tính đơn điệu của hàm số', page: 2 },
        { title: '§2. Cực trị của hàm số', page: 7 },
        { title: '§3. Giá trị lớn nhất và nhỏ nhất...', page: 12 },
        { title: '§4. Đường tiệm cận', page: 19 },
      ]
    },
    {
      title: 'Chương 2. Hàm số lũy thừa...',
      page: 31,
    },
    {
      title: 'Chương 3. Nguyên hàm, tích phân...',
      page: 61,
    }
  ];

  // Toc items for Biology Summary Reader
  const bioTocItems = [
    {
      title: 'Chương I: Thành phần hóa học...',
      page: 1,
      children: [
        { title: '1. Nguyên tố hóa học và Nước', page: 1 },
        { title: '2. Các đại phân tử hữu cơ', page: 2 },
        { title: '3. Enzyme và vai trò', page: 3 },
        { title: '4. Vitamin và khoáng chất', page: 4 },
      ]
    },
    {
      title: 'Chương II: Cấu trúc tế bào',
      page: 5,
    },
    {
      title: 'Chương III: Chuyển hóa vật chất...',
      page: 10,
    }
  ];

  const summaryToc = doc.subject === 'Sinh học' ? bioTocItems : tocItems;

  // =========================================================================
  // RENDER METHOD A: PDF/DOCX Viewer (Keep as before - with thumbnails/tools)
  // =========================================================================
  const renderPdfViewer = () => {
    return (
      <div className={`min-h-screen flex flex-col font-sans select-none ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-55 text-text-primary'}`}>
        
        {/* TOP NAVBAR HEADER */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-30">
          
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={onBack}
              className="p-2 border border-slate-100 bg-white hover:bg-slate-50 text-text-primary rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 mr-1.5 shadow-sm"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={13} className="stroke-[2.5]" />
            </button>
            <div className="h-9 w-9 bg-red-55 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={18} className="stroke-[2.5]" />
            </div>
            <div className="truncate">
              <h1 className="text-xs font-black text-text-primary truncate">
                {doc.title}
              </h1>
              <div className="flex items-center gap-2 text-[9px] text-text-secondary font-bold mt-0.5">
                <span className="text-primary font-black uppercase">{doc.format}</span>
                <span>•</span>
                <span>2.4 MB</span>
                <span>•</span>
                <span>{totalPages} trang</span>
                <span>•</span>
                <span>Cập nhật 12/05/2024</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => alert('Đang chuẩn bị tải tài liệu PDF xuống máy.')}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-100 bg-white hover:bg-slate-50 text-text-primary text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
            >
              <Download size={13} />
              <span>Tải xuống</span>
            </button>

            <button
              onClick={handleBookmarkClick}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isBookmarked 
                  ? 'border-primary/20 bg-primary-light text-primary' 
                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-400'
              }`}
              title="Đánh dấu tài liệu"
            >
              <Bookmark size={13} className={isBookmarked ? 'fill-primary' : ''} />
            </button>
          </div>

        </header>

        {/* SUB-TOOLBAR PANEL */}
        <section className="bg-white border-b border-slate-100/80 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-20">
          
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className={`p-2 rounded-lg transition cursor-pointer ${isLeftSidebarOpen ? 'bg-primary-light text-primary' : 'text-slate-400 hover:bg-slate-55'}`}
              title="Ẩn/Hiện thumbnail sidebar"
            >
              <Menu size={14} />
            </button>

            <button
              onClick={() => setActiveTool('hand')}
              className={`p-2 rounded-lg transition cursor-pointer ${activeTool === 'hand' ? 'bg-primary-light text-primary' : 'text-slate-400 hover:bg-slate-55'}`}
              title="Công cụ kéo trang"
            >
              <Hand size={14} className="stroke-[2.5]" />
            </button>

            <div className="h-4 w-px bg-slate-100"></div>

            {/* Zoom */}
            <div className="flex items-center border border-slate-100 rounded-xl bg-white p-0.5 text-xs text-text-secondary font-bold">
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
                className="p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <ZoomOut size={13} />
              </button>
              <span className="px-2 select-none text-[10px] tracking-wider">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
                className="p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <ZoomIn size={13} />
              </button>
            </div>

          </div>

          {/* Page nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>

            <div className="flex items-center text-xs text-text-secondary font-bold gap-1 bg-slate-55 border border-slate-100 rounded-xl px-2.5 py-1">
              <input
                type="text"
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    setCurrentPage(val);
                  }
                }}
                className="w-7 text-center bg-transparent border-none text-text-primary font-black focus:outline-none focus:ring-0 p-0 text-xs"
              />
              <span>/ {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-100 bg-white rounded-xl p-0.5">
              <button className="p-1.5 rounded-lg bg-primary-light text-primary cursor-pointer" title="Trang đơn">
                <FileText size={13} />
              </button>
              <button
                onClick={() => alert('Xoay tài liệu 90 độ.')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-text-primary cursor-pointer"
                title="Xoay trang"
              >
                <RotateCw size={13} />
              </button>
              <button
                onClick={() => alert('Phóng to toàn màn hình chế độ đọc.')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-text-primary cursor-pointer"
                title="Toàn màn hình"
              >
                <Maximize2 size={13} />
              </button>
            </div>

            <button
              onClick={() => alert('Tùy chọn hiển thị tài liệu.')}
              className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-400 rounded-xl cursor-pointer"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>

        </section>

        {/* WORKSPACE */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Sidebar: Thumbnails list */}
          {isLeftSidebarOpen && (
            <aside className="w-48 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-10">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} className="text-primary" /> Thu nhỏ
                </span>
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="text-slate-400 hover:text-text-primary transition cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[1, 2, 3, 4].map((pageIndex) => {
                  const isActive = currentPage === pageIndex;
                  return (
                    <div
                      key={pageIndex}
                      onClick={() => setCurrentPage(pageIndex)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div className={`w-28 aspect-[1/1.41] bg-slate-50 border rounded-lg p-2 overflow-hidden flex flex-col justify-between select-none transition-all shadow-sm ${
                        isActive ? 'border-primary ring-2 ring-primary/20 bg-white scale-[1.02]' : 'border-slate-100 group-hover:border-slate-300'
                      }`}>
                        <div className="space-y-1.5 scale-75 origin-top-left">
                          <div className="h-1 w-10 bg-slate-300 rounded"></div>
                          <div className="h-0.5 w-16 bg-slate-200 rounded"></div>
                          {(pageIndex === 1 || pageIndex === 2) && (
                            <div className="my-1.5 flex justify-center">
                              <svg viewBox="0 0 100 70" className="h-8 text-slate-300 fill-none" stroke="currentColor" strokeWidth="0.8">
                                <path d="M50 5 L15 55 L85 55 Z" />
                                <path d="M50 5 L40 60 L85 55" strokeDasharray="1.5 1.5" />
                              </svg>
                            </div>
                          )}
                          <div className="h-0.5 w-14 bg-slate-200 rounded"></div>
                        </div>
                        <span className="text-[6px] font-bold text-text-muted text-center block">{pageIndex}</span>
                      </div>
                      <span className={`text-[9px] font-black ${isActive ? 'text-primary' : 'text-text-secondary'}`}>{pageIndex}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="w-full py-2 border border-slate-100 bg-white text-text-secondary text-[9px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders size={11} />
                  <span>Thu nhỏ</span>
                </button>
              </div>
            </aside>
          )}

          {/* Middle Workspace Paper Sheet */}
          <main className="flex-1 overflow-y-auto p-8 flex justify-center relative bg-slate-100/50">
            <div
              className={`w-[680px] bg-white border border-slate-200 rounded-2xl shadow-lg p-8 sm:p-12 relative flex flex-col justify-between select-text aspect-[1/1.41] origin-top transition-transform duration-200 ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white text-text-primary'
              }`}
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div>
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2 mb-4 text-[10px] font-black text-text-secondary uppercase">
                  <div>
                    SỞ GIÁO DỤC VÀ ĐÀO TẠO<br />
                    TRƯỜNG THPT CHUYÊN LÊ HỒNG PHONG
                  </div>
                  <div className="text-right">
                    ĐỀ KHẢO SÁT CHẤT LƯỢNG LỚP 12<br />
                    MÔN: TOÁN HỌC - GIẢI TÍCH<br />
                    <span className="text-[9px] font-black text-slate-800 border border-slate-300 px-1 py-0.5 rounded mt-1 inline-block">
                      MÃ ĐỀ: 101
                    </span>
                  </div>
                </div>

                <div className="text-center italic text-[9px] text-text-secondary mb-4">(Đề thi gồm 06 trang)</div>

                <div className="space-y-4 text-[10.5px]">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase">
                      PHẦN I. Câu hỏi trắc nghiệm nhiều phương án lựa chọn.
                    </h3>
                  </div>

                  {/* Câu 1 */}
                  <div>
                    <span className="font-extrabold text-primary">Câu 1.</span> Cho hàm số f(x) = x³ - 3x². Đạo hàm f'(x) bằng:
                    <div className="grid grid-cols-4 gap-2 pt-1 font-semibold text-text-secondary pl-4">
                      <span>A. 3x² - 6x.</span>
                      <span>B. x² - 6x.</span>
                      <span>C. 3x² - 3x.</span>
                      <span>D. x³ - 6x.</span>
                    </div>
                  </div>

                  {/* Câu 3 */}
                  <div>
                    <span className="font-extrabold text-primary">Câu 3.</span> Cho khối chóp S.ABC có đáy ABC là tam giác đều cạnh a. SA vuông góc với đáy và SA = a√2. Thể tích khối chóp bằng:
                    <div className="my-4 flex justify-center bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                      <svg viewBox="0 0 150 110" className="h-36 text-[#6C5DD3] fill-none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M75 12 L25 80 L125 80 Z" strokeWidth="1.5" />
                        <path d="M75 12 L65 85 L125 80" strokeWidth="1" />
                        <line x1="25" y1="80" x2="65" y2="85" strokeWidth="1" />
                        <line x1="75" y1="12" x2="65" y2="85" strokeDasharray="3 3" />
                        <line x1="25" y1="80" x2="65" y2="85" strokeDasharray="3 3" />
                        <text x="72" y="8" fill="#6C5DD3" fontSize="9" fontWeight="bold">S</text>
                        <text x="17" y="84" fill="#475569" fontSize="8">A</text>
                        <text x="128" y="84" fill="#475569" fontSize="8">C</text>
                        <text x="63" y="94" fill="#475569" fontSize="8">B</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-center text-[10px] font-black text-text-secondary">
                {currentPage}
              </div>
            </div>
          </main>

          {/* Right Column: Tools Sidebar */}
          <aside className="w-80 bg-white border-l border-slate-100 flex flex-col p-6 space-y-6 shrink-0 z-10 hidden xl:flex">
            <div className="border border-slate-100 rounded-card p-4 space-y-4 bg-white/50">
              <div className="flex border-b border-slate-100 text-[10px] font-black pb-0.5">
                <button onClick={() => setActiveRightTab('tools')} className={`flex-1 pb-2 border-b-2 text-center transition ${activeRightTab === 'tools' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>Công cụ</button>
                <button onClick={() => setActiveRightTab('notes')} className={`flex-1 pb-2 border-b-2 text-center transition ${activeRightTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>Ghi chú</button>
                <button onClick={() => setActiveRightTab('index')} className={`flex-1 pb-2 border-b-2 text-center transition ${activeRightTab === 'index' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>Mục lục</button>
              </div>

              {activeRightTab === 'tools' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-text-primary uppercase tracking-wider block">Chú thích</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button onClick={() => setActiveTool('highlight')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'highlight' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><Highlighter size={13} className="text-amber-500 stroke-[2.5]" /><span className="mt-1 font-bold">Highlight</span></button>
                      <button onClick={() => setActiveTool('underline')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'underline' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><Underline size={13} className="text-blue-500 stroke-[2.5]" /><span className="mt-1 font-bold">Gạch chân</span></button>
                      <button onClick={() => setActiveTool('strike')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'strike' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><Strikethrough size={13} className="text-red-500 stroke-[2.5]" /><span className="mt-1 font-bold">Gạch ngang</span></button>
                      <button onClick={() => setActiveTool('comment')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'comment' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><MessageSquare size={13} className="text-indigo-500 stroke-[2.5]" /><span className="mt-1 font-bold">Ghi chú</span></button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-text-primary uppercase tracking-wider block">Vẽ & đánh dấu</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button onClick={() => setActiveTool('pen')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'pen' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><Highlighter size={13} className="text-blue-500 stroke-[2.5]" /><span className="mt-1 font-bold">Vẽ tự do</span></button>
                      <button onClick={() => setActiveTool('rect')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'rect' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><Square size={13} className="text-slate-500 stroke-[2.5]" /><span className="mt-1 font-bold">Hình chữ nhật</span></button>
                      <button onClick={() => setActiveTool('circle')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'circle' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><Circle size={13} className="text-slate-500 stroke-[2.5]" /><span className="mt-1 font-bold">Hình tròn</span></button>
                      <button onClick={() => setActiveTool('arrow')} className={`py-3.5 border rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition ${activeTool === 'arrow' ? 'border-primary bg-primary-light/50 text-primary' : 'border-slate-100 bg-slate-50/50 text-text-secondary'}`}><ArrowRight size={13} className="text-slate-500 stroke-[2.5] rotate-45" /><span className="mt-1 font-bold">Mũi tên</span></button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-text-primary uppercase tracking-wider block">Xem thêm</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button onClick={() => alert('Mở thanh tìm kiếm.')} className="py-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center text-[8px] font-black text-text-secondary"><Search size={13} /><span className="mt-1 font-bold">Tìm kiếm</span></button>
                      <button onClick={() => alert('In tài liệu.')} className="py-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center text-[8px] font-black text-text-secondary"><Printer size={13} /><span className="mt-1 font-bold">In</span></button>
                      <button onClick={() => setIsDarkMode(!isDarkMode)} className="py-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center text-[8px] font-black text-text-secondary"><Moon size={13} /><span className="mt-1 font-bold">Màn tối</span></button>
                    </div>
                  </div>
                </div>
              )}

              {activeRightTab === 'notes' && (
                <div className="space-y-2 pt-1 text-[9px] font-bold text-text-secondary">
                  {notesList.map(n => (
                    <div key={n.id} className={`p-2 border rounded-lg ${n.color}`}><p>{n.text}</p></div>
                  ))}
                </div>
              )}
            </div>

            {/* Ghi chú của bạn */}
            <div className="border border-slate-100 rounded-card p-4 space-y-4 bg-white/50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-wider">Ghi chú của bạn</h3>
                <button onClick={() => setShowAddNoteForm(!showAddNoteForm)} className="text-[9px] font-black text-primary hover:underline flex items-center gap-0.5"><Plus size={10} /> Thêm ghi chú</button>
              </div>

              {showAddNoteForm && (
                <form onSubmit={handleAddNote} className="space-y-2.5 p-2 border border-slate-100 rounded-xl bg-slate-55">
                  <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Viết ghi chú..." className="w-full p-2 border border-slate-200 rounded-lg text-[9px] bg-white focus:outline-none" />
                  <div className="flex justify-end gap-1.5">
                    <button type="submit" className="px-2.5 py-1 text-[8px] font-bold text-white bg-primary rounded">Lưu</button>
                  </div>
                </form>
              )}

              <div className="space-y-3.5">
                {notesList.map((item) => (
                  <div key={item.id} className={`p-3 border.5 rounded-xl text-[10px] leading-relaxed relative ${item.color}`}>
                    <div className="flex items-center justify-between border-b border-current/10 pb-1 mb-1 text-[8px] opacity-75">
                      <span className="font-extrabold uppercase">Trang {item.page} • {item.date}</span>
                    </div>
                    <p className="font-semibold">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-inner z-20">
          <div className="flex items-center gap-3 text-[10px] font-black text-text-primary">
            <span>Tiến độ đọc</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: '37%' }}></div></div>
            <span className="text-text-secondary">37%</span>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-bold text-text-secondary">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="text-[10px] font-black hover:text-text-primary cursor-pointer">&lt; Trang trước</button>
            <span className="text-text-primary font-black text-[10px]">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="text-[10px] font-black hover:text-text-primary cursor-pointer">Trang sau &gt;</button>
          </div>

          <button onClick={onBack} className="flex items-center gap-1 px-4 py-2 border border-slate-100 hover:bg-slate-50 text-text-primary text-[10px] font-black rounded-xl cursor-pointer">
            <List size={12} className="stroke-[2.5]" />
            <span>Quay lại danh sách</span>
          </button>
        </footer>

      </div>
    );
  };

  // =========================================================================
  // RENDER METHOD B: Tóm tắt / Lý thuyết Viewer (New mockup 3 layout)
  // =========================================================================
  const renderSummaryViewer = () => {
    return (
      <div className={`min-h-screen flex flex-col font-sans select-none ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-text-primary'}`}>
        
        {/* TOP NAVBAR HEADER */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-30">
          
          {/* Left info: Title, tags, subject */}
          <div className="flex items-center gap-3.5 min-w-0">
            
            {/* Back button */}
            <button
              onClick={onBack}
              className="p-2 border border-slate-100 bg-white hover:bg-slate-50 text-text-primary rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 mr-1.5 shadow-sm"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={13} className="stroke-[2.5]" />
            </button>

            {/* Document type pill */}
            <div className="h-9 w-9 bg-purple-55 text-primary rounded-xl flex items-center justify-center shrink-0">
              <FileText size={18} className="stroke-[2.5]" />
            </div>

            <div className="truncate">
              <h1 className="text-xs font-black text-text-primary truncate">
                {doc.title}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] font-black mt-1">
                <span className="text-primary uppercase bg-primary-light px-1.5 py-0.5 rounded">
                  {doc.subject.toUpperCase()}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-text-secondary">{doc.grade}</span>
                <span className="text-text-muted">•</span>
                <span className="text-text-secondary">Lý thuyết</span>
                <span className="text-text-muted">•</span>
                <span className="text-success bg-emerald-55 px-1.5 py-0.5 rounded">Đã lưu</span>
              </div>
            </div>

          </div>

          {/* Right info: Progress bar, Download, Bookmark, Darkmode, Options */}
          <div className="flex items-center gap-3.5">
            
            {/* Learning progress bar */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-black text-text-primary border-r border-slate-100 pr-4">
              <span className="text-text-secondary">Tiến độ học tập</span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '42%' }}></div>
              </div>
              <span>42%</span>
            </div>

            <button
              onClick={() => alert('Đang tải bản tóm tắt lý thuyết về máy...')}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-primary/10"
            >
              <Download size={13} />
              <span>Tải xuống</span>
            </button>

            <button
              onClick={handleBookmarkClick}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isBookmarked 
                  ? 'border-primary/20 bg-primary-light text-primary' 
                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-400'
              }`}
              title="Đánh dấu chương"
            >
              <Bookmark size={13} className={isBookmarked ? 'fill-primary' : ''} />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer"
            >
              {isDarkMode ? <Sun size={13} className="text-amber-500" /> : <Moon size={13} />}
            </button>

            <button
              onClick={() => alert('Tùy chọn khác')}
              className="p-2.5 border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 rounded-xl cursor-pointer"
            >
              <MoreHorizontal size={13} />
            </button>

          </div>

        </header>

        {/* SUB-TOOLBAR PANEL */}
        <section className="bg-white border-b border-slate-100/80 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-20">
          
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className={`p-2 rounded-lg transition cursor-pointer ${isLeftSidebarOpen ? 'bg-primary-light text-primary' : 'text-slate-400 hover:bg-slate-55'}`}
              title="Ẩn/Hiện mục lục"
            >
              <Menu size={14} />
            </button>

            <div className="h-4 w-px bg-slate-100"></div>

            {/* Zoom */}
            <div className="flex items-center border border-slate-100 rounded-xl bg-white p-0.5 text-xs text-text-secondary font-bold">
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
                className="p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <ZoomOut size={13} />
              </button>
              <span className="px-2 select-none text-[10px] tracking-wider">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
                className="p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>

            <div className="flex items-center text-xs text-text-secondary font-bold gap-1 bg-slate-55 border border-slate-100 rounded-xl px-2.5 py-1">
              <input
                type="text"
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    setCurrentPage(val);
                  }
                }}
                className="w-7 text-center bg-transparent border-none text-text-primary font-black focus:outline-none focus:ring-0 p-0 text-xs"
              />
              <span>/ {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Phóng to toàn màn hình.')}
              className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-400 rounded-xl cursor-pointer"
              title="Toàn màn hình"
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={() => alert('Chia sẻ tài liệu.')}
              className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-400 rounded-xl cursor-pointer"
              title="Chia sẻ"
            >
              <Share2 size={13} />
            </button>
          </div>

        </section>

        {/* THREE-COLUMN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* 3.1 Left Column: Table of Contents */}
          {isLeftSidebarOpen && (
            <aside className="w-60 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-10">
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">Mục lục</span>
                  <button
                    onClick={() => setIsLeftSidebarOpen(false)}
                    className="text-[9px] font-bold text-text-muted hover:underline"
                  >
                    Ẩn
                  </button>
                </div>

                <div className="space-y-4">
                  {summaryToc.map((chapter, cIdx) => (
                    <div key={cIdx} className="space-y-1.5">
                      <div className="text-[10px] font-black text-text-primary flex justify-between items-baseline">
                        <span className="truncate pr-1">{chapter.title}</span>
                        <span className="text-[9px] text-text-muted shrink-0">{chapter.page}</span>
                      </div>

                      {chapter.children && (
                        <div className="space-y-1 pl-2 border-l border-slate-100 ml-1">
                          {chapter.children.map((sub, sIdx) => {
                            const isCurrentPage = currentPage === sub.page;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => setCurrentPage(sub.page)}
                                className={`w-full flex justify-between items-center text-[10px] font-bold text-left py-1 px-2 rounded-lg transition-default cursor-pointer ${
                                  isCurrentPage 
                                    ? 'bg-primary-light text-primary font-black' 
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                <span className="truncate pr-1">• {sub.title}</span>
                                <span className={isCurrentPage ? 'text-primary font-black' : 'text-text-muted'}>{sub.page}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom total document overview */}
              <div className="p-4 border-t border-slate-100 shrink-0 space-y-3 bg-slate-50/50">
                
                <div className="flex items-center justify-between text-[10px] font-black text-text-primary border-b border-slate-100 pb-2 mb-2">
                  <span className="flex items-center gap-1"><FileText size={12} className="text-primary" /> Tổng quan tài liệu</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-black text-text-primary">
                  <div className="p-1.5 bg-white border border-slate-100 rounded-lg">
                    <div className="text-primary text-[10px]">25</div>
                    <div className="text-[7.5px] text-text-secondary mt-0.5">Trang</div>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-100 rounded-lg">
                    <div className="text-primary text-[10px]">8 phút</div>
                    <div className="text-[7.5px] text-text-secondary mt-0.5">Đọc</div>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-100 rounded-lg">
                    <div className="text-primary text-[10px]">4</div>
                    <div className="text-[7.5px] text-text-secondary mt-0.5">Chương</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-primary" style={{ width: '42%' }}></div>
                  </div>
                  <span className="text-[8px] text-text-secondary font-bold block mt-1.5">
                    Bạn đã học <strong className="text-primary">42%</strong> tài liệu
                  </span>
                </div>

              </div>

            </aside>
          )}

          {/* 3.2 Middle Column: Large Reading Page */}
          <main className="flex-1 overflow-y-auto p-8 flex justify-center relative bg-slate-100/50">
            
            <div
              className={`w-[660px] bg-white border border-slate-200 rounded-2xl shadow-lg p-8 sm:p-12 relative flex flex-col justify-between select-text aspect-[1/1.41] origin-top transition-transform duration-200 ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white text-text-primary'
              }`}
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              
              <div>
                
                {/* Chapter header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <span className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded uppercase">Chương I</span>
                  <h2 className="text-base font-black text-slate-800 tracking-tight leading-tight uppercase">
                    THÀNH PHẦN HÓA HỌC CỦA TẾ BÀO
                  </h2>
                </div>

                {/* Subheading 1 */}
                <h3 className="text-xs font-black text-primary mb-3">
                  1. Nguyên tố hóa học và Nước
                </h3>

                <p className="text-[11px] leading-relaxed text-slate-700 font-semibold mb-5">
                  Có khoảng 25 nguyên tố cần thiết cấu tạo nên cơ thể sống. Đại lượng carbon là nguyên tố cốt lõi vì cấu tạo liên kết hóa học đa dạng. Nước đóng vai trò dung môi hòa tan, môi trường phản ứng sinh hóa, giúp điều hòa nhiệt độ tế bào.
                </p>

                {/* Droplet warning box */}
                <div className="bg-primary-light/40 border border-primary/10 p-4 rounded-xl flex items-start gap-3.5 mb-6">
                  <div className="h-8 w-8 bg-white text-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Droplet size={16} className="fill-primary text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800 leading-none mb-1">Nước trong tế bào</h4>
                    <p className="text-[10px] leading-relaxed text-slate-600 font-semibold">
                      Chiếm khoảng 70 - 90% khối lượng tế bào, tham gia vào hầu hết các quá trình sinh học quan trọng.
                    </p>
                  </div>
                </div>

                {/* Subheading 2 */}
                <h3 className="text-xs font-black text-primary mb-3">
                  2. Các đại phân tử hữu cơ
                </h3>

                <p className="text-[11px] leading-relaxed text-slate-700 font-semibold mb-4">
                  Tế bào gồm 4 nhóm đại phân tử chính:
                </p>

                {/* Macromolecules List Cards */}
                <div className="space-y-2.5 max-w-md">
                  
                  {/* Carbohydrate */}
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-primary/20 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 bg-emerald-55 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                        <Beaker size={13} />
                      </div>
                      <span className="text-[10px] font-bold text-text-primary">
                        <strong className="font-black text-slate-800">Carbohydrate (Đường):</strong> cung cấp năng lượng và cấu trúc thành tế bào.
                      </span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                  {/* Lipid */}
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-primary/20 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 bg-amber-55 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                        <Droplet size={13} />
                      </div>
                      <span className="text-[10px] font-bold text-text-primary">
                        <strong className="font-black text-slate-800">Lipid (Chất béo):</strong> dự trữ năng lượng dài hạn, cấu tạo màng sinh chất.
                      </span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                  {/* Protein */}
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-primary/20 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 bg-pink-55 text-accent rounded-lg flex items-center justify-center shrink-0">
                        <GitBranch size={13} />
                      </div>
                      <span className="text-[10px] font-bold text-text-primary">
                        <strong className="font-black text-slate-800">Protein:</strong> đảm nhiệm mọi chức năng sống (xúc tác, vận chuyển, cấu trúc).
                      </span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                  {/* Nucleic Acid */}
                  <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-primary/20 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 bg-purple-55 text-primary rounded-lg flex items-center justify-center shrink-0">
                        <Network size={13} />
                      </div>
                      <span className="text-[10px] font-bold text-text-primary">
                        <strong className="font-black text-slate-800">Axit nucleic (DNA, RNA):</strong> lưu trữ và truyền đạt thông tin di truyền.
                      </span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                </div>

              </div>

              {/* Page footer */}
              <div className="border-t border-slate-100 pt-3 text-center text-[10px] font-black text-text-secondary">
                {currentPage}
              </div>

            </div>

          </main>

          {/* 3.3 Right Column: Sidebar Panels */}
          <aside className="w-80 bg-white border-l border-slate-100 flex flex-col p-6 space-y-6 shrink-0 z-10 hidden xl:flex">
            
            {/* CÔNG CỤ HỌC TẬP */}
            <div className="border border-slate-100 rounded-card p-4 space-y-3.5 bg-white/50">
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
                Công cụ học tập
              </h3>

              <div className="grid grid-cols-2 gap-2">
                
                <button
                  onClick={() => alert('Mở bảng ghi chú học tập.')}
                  className="py-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-[9px] font-black text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <FileText size={14} className="text-primary stroke-[2.5]" />
                  <span className="mt-1">Ghi chú</span>
                </button>

                <button
                  onClick={() => alert('Đánh dấu nội dung lý thuyết.')}
                  className="py-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-[9px] font-black text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <Highlighter size={14} className="text-amber-500 stroke-[2.5]" />
                  <span className="mt-1">Đánh dấu</span>
                </button>

                <button
                  onClick={() => alert('Mở Flashcard học tập.')}
                  className="py-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-[9px] font-black text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <Layers size={14} className="text-emerald-500 stroke-[2.5]" />
                  <span className="mt-1">Flashcard</span>
                </button>

                <button
                  onClick={() => alert('Xem tóm tắt rút gọn lý thuyết.')}
                  className="py-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-[9px] font-black text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <Sliders size={14} className="text-blue-500 stroke-[2.5]" />
                  <span className="mt-1">Tóm tắt</span>
                </button>

                <button
                  onClick={() => alert('Hiển thị sơ đồ tư duy Mindmap.')}
                  className="py-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-[9px] font-black text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <Network size={14} className="text-purple-500 stroke-[2.5]" />
                  <span className="mt-1">Sơ đồ tư duy</span>
                </button>

                <button
                  onClick={() => alert('Bắt đầu làm bài trắc nghiệm nhanh Quiz.')}
                  className="py-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-[9px] font-black text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <HelpCircle size={14} className="text-indigo-500 stroke-[2.5]" />
                  <span className="mt-1">Quiz</span>
                </button>

              </div>
            </div>

            {/* GHI CHÚ CỦA BẠN */}
            <div className="border border-slate-100 rounded-card p-4 space-y-4 bg-white/50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-wider">
                  Ghi chú của bạn
                </h3>
                <button
                  onClick={() => setShowBioNoteForm(!showBioNoteForm)}
                  className="text-[9px] font-black text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={10} /> Thêm ghi chú
                </button>
              </div>

              {/* Bio Note form */}
              {showBioNoteForm && (
                <form onSubmit={handleAddBioNote} className="space-y-2.5 p-2 border border-slate-100 rounded-xl bg-slate-50">
                  <textarea
                    value={newBioNoteInput}
                    onChange={(e) => setNewBioNoteInput(e.target.value)}
                    placeholder="Viết ghi chú bài học..."
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-[9px] bg-white focus:outline-none"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[8px] font-bold text-white bg-primary rounded"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {bioNotesList.map((item) => (
                  <div key={item.id} className={`p-3 border.5 rounded-xl text-[10px] leading-relaxed relative ${item.color}`}>
                    <div className="flex items-center justify-between border-b border-current/10 pb-1 mb-1 text-[8px] opacity-75">
                      <span>{item.date}</span>
                      <span className="text-[10px] cursor-pointer">•••</span>
                    </div>
                    <p className="font-semibold">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TÀI LIỆU LIÊN QUAN */}
            <div className="border border-slate-100 rounded-card p-4 space-y-4 bg-white/50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-wider">
                  Tài liệu liên quan
                </h3>
              </div>

              <div className="space-y-3">
                
                <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-50">
                  <div className="p-1.5 bg-purple-55 text-primary rounded-lg shrink-0 mt-0.5">
                    <FileText size={12} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-text-primary hover:text-primary cursor-pointer line-clamp-2 leading-tight">
                      Bảng hệ thống kiến thức Sinh học 10
                    </h4>
                    <span className="text-[8px] text-text-muted mt-0.5 block">Chương I  •  Lớp 10</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-50">
                  <div className="p-1.5 bg-pink-55 text-accent rounded-lg shrink-0 mt-0.5">
                    <Network size={12} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-text-primary hover:text-primary cursor-pointer line-clamp-2 leading-tight">
                      Sơ đồ tư duy Sinh học 10 học kỳ 2
                    </h4>
                    <span className="text-[8px] text-text-muted mt-0.5 block">Học kỳ II  •  Lớp 10</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-50">
                  <div className="p-1.5 bg-blue-55 text-blue-600 rounded-lg shrink-0 mt-0.5">
                    <FileText size={12} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-text-primary hover:text-primary cursor-pointer line-clamp-2 leading-tight">
                      Đề ôn tập học kỳ 2 Sinh 10
                    </h4>
                    <span className="text-[8px] text-text-muted mt-0.5 block">Đề cương  •  Lớp 10</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-slate-55 text-slate-650 rounded-lg shrink-0 mt-0.5">
                    <FileText size={12} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-text-primary hover:text-primary cursor-pointer line-clamp-2 leading-tight">
                      DOCX - Hóa học 10
                    </h4>
                    <span className="text-[8px] text-text-muted mt-0.5 block">DOCX  •  Hóa học</span>
                  </div>
                </div>

              </div>

              <button
                onClick={onBack}
                className="w-full mt-2 py-2 border border-slate-100 hover:bg-slate-50 text-text-primary text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-default"
              >
                <span>Xem thêm tài liệu</span>
                <ArrowRight size={12} />
              </button>

            </div>

          </aside>

        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        <footer className="bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-inner z-20">
          <div className="flex items-center gap-3 text-[10px] font-black text-text-primary">
            <span>Tiến độ đọc</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '42%' }}></div>
            </div>
            <span className="text-text-secondary">42%</span>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-bold text-text-secondary">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="text-[10px] font-black hover:text-text-primary cursor-pointer">&lt; Trang trước</button>
            <span className="text-text-primary font-black text-[10px]">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="text-[10px] font-black hover:text-text-primary cursor-pointer">Trang sau &gt;</button>
          </div>

          <button onClick={onBack} className="flex items-center gap-1 px-4 py-2 border border-slate-100 hover:bg-slate-50 text-text-primary text-[10px] font-black rounded-xl cursor-pointer">
            <List size={12} className="stroke-[2.5]" />
            <span>Quay lại danh sách</span>
          </button>
        </footer>

      </div>
    );
  };

  // Determine reader format layout
  const isSummaryDoc = doc.format === 'Tóm tắt';
  
  if (isSummaryDoc) {
    return renderSummaryViewer();
  } else {
    return renderPdfViewer();
  }
};
export default DocReader;
