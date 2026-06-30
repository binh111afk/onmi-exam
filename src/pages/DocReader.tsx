import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Menu, ZoomIn, ZoomOut, Sun, Moon, Coffee, 
  Bookmark, Download, Share2, Save, FileText, Eye, Clock, MessageSquare, 
  BookOpen, Edit3, History, ArrowLeft, ArrowUpRight
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
  // 1. Component States
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [zoomSize, setZoomSize] = useState(16); // font size in px
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'comments' | 'bookmarks' | 'history'>('content');
  
  // Note edit state
  const [noteText, setNoteText] = useState(user.notes[doc.id] || '');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: '1', author: 'Nguyễn Văn Hùng', content: 'Tài liệu cực kì chi tiết luôn ạ, em học thuộc lòng chương 1 đã làm được khối bài tích phân đạo hàm rồi.', date: '3 giờ trước' },
    { id: '2', author: 'Lê Mỹ Duyên', content: 'Có công thức lượng giác nâng cao ở chương 2 không thầy ơi?', date: '1 ngày trước' }
  ]);

  // Reading history tracking
  const [historyLog] = useState([
    { event: 'Đã mở tài liệu', time: 'Vừa xong' },
    { event: 'Đã đọc Chương I: Khảo sát hàm số', time: '1 ngày trước' }
  ]);

  // 2. DOM Refs for table of contents extraction
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string; tag: string }[]>([]);

  const currentChapter = doc.chapters[activeChapterIdx] || doc.chapters[0];

  // Sync state if document changes
  useEffect(() => {
    setNoteText(user.notes[doc.id] || '');
    setIsNoteSaved(false);
  }, [doc, user]);

  // Extract h2 and h3 elements from current chapter content to build dynamic TOC
  useEffect(() => {
    if (!currentChapter) return;
    
    // Create a temporary parser div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentChapter.content;
    const foundHeadings = Array.from(tempDiv.querySelectorAll('h2, h3')).map((el, i) => {
      // Create a web-safe ID based on index if not present
      const id = el.id || `heading-${i}`;
      el.id = id;
      return {
        id,
        text: el.textContent || '',
        tag: el.tagName.toLowerCase()
      };
    });
    setHeadings(foundHeadings);
  }, [currentChapter, activeChapterIdx]);

  // Handle TOC heading jump (scroll-into-view)
  const handleHeadingClick = (id: string) => {
    if (!contentRef.current) return;
    
    // Find heading element by text inside our rendering pane
    const elements = contentRef.current.querySelectorAll('h2, h3');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      if (el.textContent === headings.find(h => h.id === id)?.text) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  const handleSaveNotesClick = () => {
    onSaveNotes(doc.id, noteText);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentsList(prev => [
      {
        id: Date.now().toString(),
        author: user.loggedIn ? user.name : 'Khách ẩn danh',
        content: newComment,
        date: 'Vừa xong'
      },
      ...prev
    ]);
    setNewComment('');
  };

  const isBookmarked = user.bookmarks[doc.id]?.includes(activeChapterIdx) || false;

  // Zoom handlers
  const zoomIn = () => setZoomSize(prev => Math.min(prev + 2, 24));
  const zoomOut = () => setZoomSize(prev => Math.max(prev - 2, 12));

  // Theme color maps specifically for reading body
  const themeColors = {
    light: 'bg-white text-slate-900 border-slate-100',
    dark: 'bg-slate-950 text-slate-100 border-slate-900',
    sepia: 'bg-[#FBF0D9] text-[#5B4636] border-[#F2E4C4]'
  };

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header Toolbar (Back button + meta actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-default group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Quay lại kho tài liệu
        </button>

        {/* Action button tools */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onBookmarkToggle(doc.id, activeChapterIdx)}
            className={`flex items-center gap-1 px-3 py-1.5 border rounded-btn font-semibold transition-default ${
              isBookmarked 
                ? 'border-primary text-primary bg-primary-light/40' 
                : 'border-slate-200 bg-white hover:border-slate-350 text-text-primary'
            }`}
            title="Đánh dấu chương này"
          >
            <Bookmark size={13} className={isBookmarked ? 'fill-primary' : ''} />
            <span>{isBookmarked ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
          </button>

          <button
            onClick={() => alert('Đã khởi chạy tải xuống tài liệu dưới dạng PDF.')}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-text-primary font-semibold rounded-btn hover:border-slate-350 transition-default"
          >
            <Download size={13} />
            Tải PDF
          </button>

          <button
            onClick={() => alert(`Đã sao chép liên kết chia sẻ: ${window.location.origin}/documents/${doc.id}`)}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-text-primary font-semibold rounded-btn hover:border-slate-350 transition-default"
          >
            <Share2 size={13} />
            Chia sẻ
          </button>
        </div>
      </div>

      {/* Title block */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-xs text-text-secondary">
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">{doc.subject}</span>
          <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded font-medium">{doc.grade}</span>
          <span>•</span>
          <span className="flex items-center gap-0.5"><Eye size={12} /> {doc.views.toLocaleString('vi-VN')} xem</span>
          <span>•</span>
          <span className="flex items-center gap-0.5"><Clock size={12} /> {doc.readingTimeMinutes} phút đọc</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight leading-snug">
          {doc.title}
        </h1>
        <p className="text-xs text-text-secondary mt-1.5">
          Biên soạn bởi: <span className="font-semibold text-text-primary">{doc.author}</span> (Cập nhật ngày {doc.updatedAt})
        </p>
      </div>

      {/* Main Notion Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Chapters Sidebar (Col span 3) */}
        <aside className={`${leftSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-1'} space-y-4`}>
          {/* Header toggle buttons */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-text-primary uppercase tracking-wider hover:text-primary transition-default"
            >
              <Menu size={16} />
              {leftSidebarOpen && <span>Mục chương</span>}
            </button>
            {leftSidebarOpen && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                {doc.chapters.length} chương
              </span>
            )}
          </div>

          {leftSidebarOpen ? (
            <div className="space-y-1 relative pl-2.5 border-l border-slate-200 ml-1.5">
              {doc.chapters.map((ch, idx) => {
                const isActive = activeChapterIdx === idx;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapterIdx(idx)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs transition-default leading-relaxed flex items-start gap-2 select-none relative ${
                      isActive
                        ? 'text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary font-medium'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -left-[14px] top-2.5 h-2 w-2 rounded-full bg-primary border border-white"></span>
                    )}
                    <FileText size={13} className="shrink-0 mt-0.5" />
                    <span>{ch.title}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              {doc.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterIdx(idx);
                    setLeftSidebarOpen(true);
                  }}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-default ${
                    activeChapterIdx === idx ? 'bg-primary text-white' : 'bg-slate-50 text-text-secondary hover:bg-slate-100'
                  }`}
                  title={ch.title}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Center Column: Reader content & tabs (Col span 7 or 9 based on sidebar) */}
        <main className={`${leftSidebarOpen ? 'lg:col-span-7' : 'lg:col-span-9'} space-y-6`}>
          
          {/* Document Content Controller Toolbar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-card px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={zoomSize <= 12}
                className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 transition-default"
                title="Thu nhỏ chữ"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-text-secondary select-none font-bold" title="Kích cỡ phông chữ">{zoomSize}px</span>
              <button
                onClick={zoomIn}
                disabled={zoomSize >= 24}
                className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-50 transition-default"
                title="Phóng to chữ"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Reading theme togglers */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-1 rounded transition-default ${theme === 'light' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                title="Nền sáng"
              >
                <Sun size={15} />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1 rounded transition-default ${theme === 'sepia' ? 'bg-[#F2E4C4] shadow-sm text-[#5B4636]' : 'text-text-secondary hover:text-text-primary'}`}
                title="Nền bảo vệ mắt (Sepia)"
              >
                <Coffee size={15} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1 rounded transition-default ${theme === 'dark' ? 'bg-slate-900 shadow-sm text-white' : 'text-text-secondary hover:text-text-primary'}`}
                title="Nền tối"
              >
                <Moon size={15} />
              </button>
            </div>
          </div>

          {/* Core Content Box with specific Reading CSS theme */}
          <div 
            ref={contentRef}
            className={`border rounded-card p-6 sm:p-10 transition-colors duration-200 shadow-sm overflow-hidden select-text ${themeColors[theme]}`}
            style={{ fontSize: `${zoomSize}px` }}
          >
            {/* Header info inside reader box */}
            <div className="border-b border-current/10 pb-4 mb-6 opacity-80 text-xs">
              <span className="font-bold">{doc.chapters[activeChapterIdx]?.title || 'Đang tải...'}</span>
            </div>

            <div 
              className="reader-content select-text"
              dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
            />

            {/* Chapter Pagination buttons inside reader */}
            <div className="flex items-center justify-between border-t border-current/10 pt-6 mt-8 text-xs">
              <button
                disabled={activeChapterIdx === 0}
                onClick={() => {
                  setActiveChapterIdx(activeChapterIdx - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 font-semibold disabled:opacity-40 transition-default"
              >
                <ChevronLeft size={16} />
                 Chương trước
              </button>
              <span className="opacity-80 font-bold">
                {activeChapterIdx + 1} / {doc.chapters.length}
              </span>
              <button
                disabled={activeChapterIdx === doc.chapters.length - 1}
                onClick={() => {
                  setActiveChapterIdx(activeChapterIdx + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 font-semibold disabled:opacity-40 transition-default"
              >
                Chương sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Tab lists under main reader */}
          <div className="border-b border-slate-100">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {[
                { id: 'content', label: 'Tài liệu bổ sung', icon: BookOpen },
                { id: 'notes', label: 'Ghi chú cá nhân', icon: Edit3 },
                { id: 'comments', label: `Thảo luận (${commentsList.length})`, icon: MessageSquare },
                { id: 'bookmarks', label: 'Dấu trang', icon: Bookmark },
                { id: 'history', label: 'Lịch sử đọc', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-default ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Tab Body content */}
          <div className="bg-white border border-slate-100 rounded-card p-6 notion-shadow min-h-[160px]">
            {activeTab === 'content' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-text-primary">Tài liệu học tập đi kèm</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Để ôn tập chương này hiệu quả nhất, Onmi Exam gợi ý bạn nên thực hành làm đề thi thử tương ứng dưới đây để củng cố trực tiếp kiến thức lý thuyết vừa đọc.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-success bg-success-light px-2 py-0.5 rounded">Gợi ý bài tập</span>
                  <button 
                    onClick={() => onSelectExam('exam-math-1')}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    Đề thi thử THPT Quốc gia 2026 - Môn Toán học - Đề số 1
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-text-primary">Ghi chú tự học của bạn</h4>
                  {isNoteSaved && (
                    <span className="text-[10px] text-success font-semibold">Đã lưu ghi chú!</span>
                  )}
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Gõ công thức, định lý quan trọng cần lưu ý ở đây... Ghi chú sẽ được tự động đồng bộ hóa với tài khoản học viên."
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-input text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotesClick}
                    className="flex items-center gap-1 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default"
                  >
                    <Save size={13} />
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-primary">Hỏi đáp & Thảo luận lớp học</h4>
                
                {/* Add new comment */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Gõ câu hỏi thắc mắc về kiến thức bài giảng..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-input"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default whitespace-nowrap"
                  >
                    Gửi bình luận
                  </button>
                </form>

                {/* List Comments */}
                <div className="space-y-3 divide-y divide-slate-50 pt-2">
                  {commentsList.map(c => (
                    <div key={c.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex justify-between text-[10px] text-text-secondary">
                        <span className="font-semibold text-text-primary">{c.author}</span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-text-primary">Danh sách chương đã đánh dấu</h4>
                {user.bookmarks[doc.id] && user.bookmarks[doc.id].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.bookmarks[doc.id].map(chIdx => (
                      <button
                        key={chIdx}
                        onClick={() => setActiveChapterIdx(chIdx)}
                        className="text-left px-3 py-2 border border-slate-100 rounded-btn text-xs font-medium text-text-primary hover:border-slate-300 bg-slate-50 hover:bg-white flex items-center justify-between transition-default"
                      >
                        <span>{doc.chapters[chIdx]?.title}</span>
                        <Bookmark size={11} className="fill-primary text-primary" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary">Bạn chưa đánh dấu chương nào. Bấm nút "Đánh dấu" ở trên cùng để lưu nhanh chương này.</p>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-text-primary">Lịch sử đọc tài liệu này</h4>
                <div className="space-y-2">
                  {historyLog.map((log, i) => (
                    <div key={i} className="flex justify-between items-center text-xs text-text-secondary py-1 border-b border-slate-50 last:border-0">
                       <span className="font-medium text-text-primary">{log.event}</span>
                      <span className="text-[10px] font-bold text-text-muted">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </main>

        {/* Right Column: Table of Contents (Col span 2) */}
        <aside className="lg:col-span-2 sticky top-24 space-y-4 border-l border-slate-200 pl-4 select-none">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-primary pb-1">
            Mục lục chương
          </h4>
          
          {headings.length > 0 ? (
            <div className="space-y-2.5 text-[10px] leading-relaxed text-text-secondary">
              {headings.map(h => (
                <button
                  key={h.id}
                  onClick={() => handleHeadingClick(h.id)}
                  className={`w-full text-left block hover:text-primary transition-default ${
                    h.tag === 'h3' ? 'pl-3 font-normal opacity-85' : 'font-bold text-text-primary/90'
                  }`}
                >
                  {h.text}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-text-secondary italic">Chương này không có tiểu mục phụ.</p>
          )}
        </aside>

      </div>

      {/* Related Section at the bottom */}
      <section className="border-t border-slate-100 pt-10 mt-16 space-y-8">
        {/* 1. Related Docs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary">Tài liệu liên quan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedDocs.slice(0, 4).map(rDoc => (
              <div 
                key={rDoc.id}
                onClick={() => onSelectDoc(rDoc.id)}
                className="bg-white border border-slate-100 hover:border-slate-350 p-4 rounded-card cursor-pointer flex flex-col justify-between notion-shadow transition-default"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{rDoc.subject}</span>
                  <h4 className="text-xs font-semibold text-text-primary line-clamp-2 pt-1">{rDoc.title}</h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-secondary mt-3 border-t border-slate-50 pt-2">
                  <span>{rDoc.pageCount} trang</span>
                  <span>{rDoc.format}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Related Exams */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary">Đề thi liên quan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedExams.slice(0, 4).map(rExam => (
              <div 
                key={rExam.id}
                onClick={() => onSelectExam(rExam.id)}
                className="bg-white border border-slate-100 hover:border-slate-350 p-4 rounded-card cursor-pointer flex flex-col justify-between notion-shadow transition-default"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{rExam.subject}</span>
                  <h4 className="text-xs font-semibold text-text-primary line-clamp-2 pt-1">{rExam.title}</h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-secondary mt-3 border-t border-slate-50 pt-2">
                  <span>{rExam.questionCount} câu hỏi</span>
                  <span className="font-semibold text-accent">{rExam.rating.toFixed(1)} ★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
