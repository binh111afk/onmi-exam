import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Info,
  Heading as HeadingIcon,
  Type,
  List,
  Quote,
  MessageSquare,
  Table as TableIcon,
  Binary,
  Code as CodeIcon,
  CreditCard,
  GitFork,
  CalendarRange,
  ArrowRight,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Columns,
  Grid,
  FileText,
  Settings,
  GripVertical
} from 'lucide-react';
import { LatexText } from './blocks/common/LatexText';

interface DocGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── REUSABLE SIMULATION LAYOUT TOOLBAR ──
const PreviewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-0 shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-white max-w-full">
    <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 border-b border-slate-200 text-[9px] font-black text-slate-400">
      <span className="uppercase tracking-wider select-none">Học liệu học sinh</span>
      <div className="flex items-center gap-1.5 select-none">
        <span className="text-[8px] font-bold text-slate-400">Thầy/Cô có thể tùy chỉnh thay đổi màu sắc trực tiếp trên thanh công cụ</span>
        <button type="button" className="p-0.5 hover:bg-slate-200 text-slate-500 rounded transition cursor-pointer">
          <Settings size={10} />
        </button>
      </div>
    </div>
    <div className="p-4 bg-slate-50/50">
      {children}
    </div>
  </div>
);

// ── MINI INTERACTIVE FLASHCARD COMPONENT ──
const MiniFlashcard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      className="w-[220px] h-[120px] cursor-pointer select-none [perspective:1000px] mx-auto"
    >
      <div className={`w-full h-full relative transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 bg-white rounded-2xl border-2 border-indigo-200 shadow-md flex flex-col items-center justify-center p-3 [backface-visibility:hidden]">
          <span className="text-[10px] font-black text-indigo-700 text-center">Định nghĩa quang phổ liên tục là gì?</span>
          <span className="absolute bottom-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-wide">Nhấp để xem mặt sau</span>
        </div>
        {/* Back */}
        <div className="absolute inset-0 bg-indigo-50 rounded-2xl border-2 border-indigo-300 shadow-md flex flex-col items-center justify-center p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="text-[10px] font-black text-indigo-800 text-center">Là dải màu liên tục từ đỏ đến tím, thu được khi phát ánh sáng từ chất rắn, lỏng, khí áp suất cao bị nung nóng.</span>
          <span className="absolute bottom-1.5 text-[8px] font-bold text-indigo-500 uppercase tracking-wide">Nhấp để lật lại</span>
        </div>
      </div>
    </div>
  );
};

// ── MINI INTERACTIVE TABS COMPONENT ──
const MiniTabs = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabData = [
    { title: 'Nhiệt học', content: 'Nghiên cứu về chuyển động của các phân tử và các trạng thái biến đổi nhiệt năng.' },
    { title: 'Quang học', content: 'Nghiên cứu về ánh sáng, các hiện tượng khúc xạ, phản xạ và giao thoa quang phổ.' },
    { title: 'Điện học', content: 'Nghiên cứu về dòng điện, điện tích và các hiện tượng cảm ứng điện từ trường.' }
  ];
  return (
    <div className="w-full bg-white border border-indigo-100 rounded-xl p-3 shadow-sm space-y-2">
      <div className="flex border-b border-slate-100 gap-2">
        {tabData.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`px-3 py-1 text-[10px] font-black border-b-2 transition cursor-pointer ${
              activeIdx === idx 
                ? 'border-indigo-600 text-indigo-700' 
                : 'border-transparent text-slate-400 hover:text-slate-655'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="text-[10px] font-bold text-slate-600 min-h-10 flex items-center leading-normal">
        {tabData[activeIdx].content}
      </div>
    </div>
  );
};

export const DocGuideModal: React.FC<DocGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('intro');

  const tabs = [
    { id: 'intro', label: '1. Giới thiệu Trình soạn thảo' },
    { id: 'basic-blocks', label: '2. Khối Nội dung Cơ bản' },
    { id: 'table-formula', label: '3. Bảng & Công thức' },
    { id: 'interactive-learning', label: '4. Học liệu Tương tác' },
    { id: 'media-block', label: '5. Đa phương tiện' },
    { id: 'quiz-assessment', label: '6. Câu hỏi & Khảo thí' },
    { id: 'code-block', label: '7. Khối Mã nguồn (Code)' },
    { id: 'tips-shortcuts', label: '8. Mẹo & Phím tắt' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="bg-white rounded-3xl w-[92vw] h-[88vh] max-w-6xl shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp">
        
        {/* Header */}
        <header className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 bg-slate-50/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Sparkles size={15} />
            </div>
            <div>
              <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Cẩm nang biên soạn tài liệu</h2>
              <p className="text-[9px] text-slate-400 font-bold -mt-0.5">Chi tiết cấu trúc và hướng dẫn sử dụng các khối nội dung của Onmi</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </header>

        {/* Workspace Columns */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* LEFT SIDEBAR */}
          <aside className="w-60 bg-slate-50/50 border-r border-slate-100 flex flex-col shrink-0 min-h-0 p-4 space-y-1 overflow-y-auto">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 pb-2">Danh mục</span>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </aside>

          {/* RIGHT CONTENT COLUMN */}
          <main className="flex-1 min-h-0 overflow-y-auto p-6 text-left space-y-6 bg-white selection:bg-primary-light selection:text-primary scrollbar-thin">
            
            {/* ── TAB: INTRO ── */}
            {activeTab === 'intro' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Tổng quan Trình soạn thảo</h3>
                <p className="text-xs text-slate-655 leading-relaxed">
                  Hệ thống quản lý tài liệu học tập của Onmi được thiết kế dưới dạng các <strong>Khối nội dung (DocBlock)</strong> độc lập. Điều này giúp giáo viên tự do sáng tạo bài giảng bằng cách kết hợp nhiều loại học cụ trực quan.
                </p>

                {/* Document structure preview mock */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Cấu trúc hiển thị của bài giảng</span>
                  
                  <div className="space-y-2 text-[10px] font-bold text-slate-700">
                    <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
                      <div className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px]">1</div>
                      <span>Chương học (Chapter) — Mục lục chính của tài liệu.</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-sm ml-6">
                      <div className="w-5 h-5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px]">2</div>
                      <span>Bài học (Lesson) — Các bài lý thuyết con.</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-sm ml-12 border-dashed">
                      <div className="w-5 h-5 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-[9px]">3</div>
                      <span>Các Khối nội dung (Blocks) — Dòng chữ, hình ảnh, bảng biểu...</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-[#ECE9FE] bg-[#F5F3FF]/50 rounded-2xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow shadow-indigo-100 text-primary shrink-0">
                    <Info size={14} />
                  </div>
                  <div className="text-[11px] text-slate-655 leading-relaxed font-medium">
                    Hãy bấm vào các danh mục bên vách trái để tìm hiểu chi tiết về cách biên soạn và hình ảnh hiển thị thực tế của từng loại khối nội dung tương ứng.
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: BASIC BLOCKS ── */}
            {activeTab === 'basic-blocks' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Các Khối Nội dung Cơ bản</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Các khối định dạng văn bản tiêu chuẩn dùng để xây dựng sườn bài giảng</p>
                </div>

                <div className="space-y-6">
                  {/* Heading */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <HeadingIcon size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Tiêu đề (Heading)</span>
                    </div>
                    
                    <PreviewWrapper>
                      <div className="space-y-2">
                        <h1 className="text-sm font-black text-indigo-900">Cấp độ 1: Tiêu đề chương học lớn</h1>
                        <h2 className="text-xs font-black text-indigo-700">Cấp độ 2: Các mục lý thuyết chính</h2>
                        <h3 className="text-[11px] font-black text-indigo-650">Cấp độ 3: Tiểu mục hoặc chú ý phụ</h3>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Dùng để thiết lập tiêu đề phân cấp rõ ràng cho các đề mục chính trong bài viết.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Gõ ký tự <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/heading</kbd> hoặc click chọn Tiêu đề trên thanh công cụ.</li>
                        <li>Bước 2: Click vào biểu tượng H1, H2 hoặc H3 trên thanh định dạng nhanh để thay đổi cấp độ.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Paragraph */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Type size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Đoạn văn (Paragraph)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Văn bản thông thường trong bài giảng. Giáo viên có thể bôi đen để chọn <strong className="text-indigo-900 font-extrabold">in đậm</strong>, <em className="text-indigo-850 italic">in nghiêng</em>, hoặc chèn <span className="text-indigo-600 underline cursor-pointer">đường liên kết</span> phục vụ học tập.
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Khối văn bản cơ bản chứa nội dung bài giảng thuyết trình.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Gõ trực tiếp văn bản. Hệ thống tự động khởi tạo khối đoạn văn mới khi nhấn Enter xuống dòng.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Lists */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <List size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Danh sách (Lists & Checklist)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="space-y-2 text-[11px] text-slate-600 font-medium">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Dòng ý thứ nhất (Bullet list)</li>
                          <li>Dòng ý thứ hai</li>
                        </ul>
                        <ol className="list-decimal pl-4 space-y-1 pt-1.5 border-t border-indigo-100 mt-1">
                          <li>Các bước thực hiện (Numbered list)</li>
                          <li>Bước tiếp theo</li>
                        </ol>
                        <div className="space-y-1 pt-1.5 border-t border-indigo-100 mt-1">
                          <div className="flex items-center gap-1.5 text-slate-400 line-through">
                            <input type="checkbox" checked readOnly className="rounded border-indigo-300 animate-none" />
                            <span>Mục tiêu đã hoàn thành (Checklist)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input type="checkbox" checked={false} readOnly className="rounded border-indigo-300 animate-none" />
                            <span>Mục tiêu đang triển khai</span>
                          </div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Giúp phân tách và liệt kê các điều kiện, mục tiêu học tập theo trình tự logic rõ ràng.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Để tạo Checklist: Gõ dấu ngoặc vuông <kbd className="px-1 py-0.5 bg-slate-100 rounded border">[]</kbd> kèm phím cách hoặc gõ <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/todo</kbd>.</li>
                        <li>Để tạo danh sách thường: Gõ <kbd className="px-1 py-0.5 bg-slate-100 rounded border">-</kbd> kèm dấu cách cho bullet, hoặc <kbd className="px-1 py-0.5 bg-slate-100 rounded border">1.</kbd> kèm dấu cách cho đánh số.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Quote & Callout */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Quote size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Trích dẫn & Hộp chú ý (Quote & Callout)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="space-y-3">
                        <blockquote className="border-l-4 border-indigo-650 pl-3 text-[11px] italic text-indigo-900 bg-white p-2.5 rounded-r-xl shadow-sm font-medium">
                          "Lý thuyết là khi ta biết mọi thứ nhưng không gì hoạt động. Thực hành là khi mọi thứ hoạt động nhưng không ai biết tại sao."
                          <span className="block text-[9px] font-black text-slate-400 mt-1 not-italic">— Albert Einstein</span>
                        </blockquote>
                        
                        <div className="border-l-4 border-indigo-500 bg-indigo-50/50 p-2.5 rounded-r-xl flex gap-2 items-start text-[10px] text-slate-655 font-bold">
                          <MessageSquare size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-indigo-850 block uppercase tracking-wider text-[9px] mb-0.5">Lưu ý quan trọng</span>
                            Không nên bỏ qua các điều kiện biên của bài toán lực hấp dẫn Newton.
                          </div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Quote biểu diễn trích dẫn lý thuyết nổi bật. Callout biểu diễn hộp lưu ý có viền bên trái dày tạo điểm nhấn.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/quote</kbd> hoặc <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/callout</kbd> để kích hoạt hộp chọn tương ứng.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: TABLE & FORMULA ── */}
            {activeTab === 'table-formula' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Bảng biểu & Công thức Toán học</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Các cấu cụ nâng cao hỗ trợ biểu diễn dữ liệu khoa học chuyên nghiệp</p>
                </div>

                <div className="space-y-6">
                  {/* Table */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <TableIcon size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Bảng dữ liệu (Table)</span>
                    </div>

                    <PreviewWrapper>
                      <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm text-[10px] border border-indigo-100 font-bold">
                        <thead>
                          <tr className="bg-indigo-50/70 text-indigo-900 border-b border-indigo-100">
                            <th className="p-2 border-r border-indigo-100 text-left">Đại lượng</th>
                            <th className="p-2 border-r border-indigo-100 text-center">Ký hiệu</th>
                            <th className="p-2 text-center">Đơn vị</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-indigo-100 text-slate-600">
                            <td className="p-2 border-r border-indigo-100">Vận tốc</td>
                            <td className="p-2 border-r border-indigo-100 text-center">v</td>
                            <td className="p-2 text-center">m/s</td>
                          </tr>
                          <tr className="text-slate-655">
                            <td className="p-2 border-r border-indigo-100">Gia tốc</td>
                            <td className="p-2 border-r border-indigo-100 text-center">a</td>
                            <td className="p-2 text-center">m/s²</td>
                          </tr>
                        </tbody>
                      </table>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Cho phép thiết lập hệ thống lưới so sánh, liệt kê thông số trực quan. Có thể điều chỉnh số lượng dòng, cột và màu nền từng ô tùy chỉnh.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn biểu tượng Bảng ở thanh điều hướng bên phải hoặc gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/table</kbd>.</li>
                        <li>Bước 2: Nhập số dòng và số cột cần tạo trong hộp thoại.</li>
                        <li>Bước 3: Click chọn ô bất kỳ để căn lề hoặc tô màu nền bằng thanh công cụ nhỏ đi kèm bảng.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Formula */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Binary size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Công thức LaTeX (Formula)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="flex items-center justify-center bg-white border border-indigo-100 rounded-xl py-6 select-none shadow-sm">
                        <LatexText value="$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$" />
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Kết xuất các ký tự và tổ hợp công thức toán học chuyên sâu dưới dạng đồ họa vector mượt mà bằng thư viện KaTeX.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/formula</kbd> hoặc gõ ký tự phím <kbd className="px-1 py-0.5 bg-slate-100 rounded border">$$</kbd> để kích hoạt hộp nhập.</li>
                        <li>Bước 2: Soạn thảo công thức theo cú pháp LaTeX tiêu chuẩn (ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{"\\int_a^b f(x)dx"}</code>).</li>
                      </ul>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CodeIcon size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Khối Mã nguồn (Code)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="p-4 bg-slate-900 rounded-xl text-[10px] font-mono text-slate-100 space-y-1">
                        <span className="text-indigo-400 font-bold">def</span> <span className="text-blue-400">solve_quadratic</span>(a, b, c):<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;delta = b**<span className="text-purple-400">2</span> - <span className="text-purple-400">4</span>*a*c<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400 font-bold">return</span> delta
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Khối hiển thị các chương trình code lập trình của môn Tin học với màu sáng cú pháp tự động theo ngôn ngữ.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Gõ <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/code</kbd> hoặc chọn biểu tượng Code ở góc phải.</li>
                        <li>Bước 2: Viết hoặc dán đoạn mã lập trình của bài giảng vào khung soạn thảo.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: INTERACTIVE LEARNING ── */}
            {activeTab === 'interactive-learning' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Khối Học liệu Tương tác</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Các học cụ động giúp học sinh trực quan hóa nội dung một cách chủ động</p>
                </div>

                <div className="space-y-6">
                  {/* Flashcard */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CreditCard size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Thẻ ghi nhớ (Flashcard)</span>
                    </div>

                    <PreviewWrapper>
                      <MiniFlashcard />
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Tạo bộ thẻ ôn tập thông minh chứa câu hỏi ở mặt trước và đáp án ở mặt sau. Nhấp chuột trực tiếp lên thẻ để lật mặt nhanh 3D.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Flashcard ở thanh công cụ hoặc gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/flashcard</kbd>.</li>
                        <li>Bước 2: Điền thông tin mặt trước (Front) và mặt sau (Back) của từng thẻ. Nhấn nút thêm thẻ để mở rộng bộ ôn tập.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Mindmap */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <GitFork size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Bản đồ tư duy (Mindmap)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="flex items-center justify-center py-6 bg-white border border-indigo-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-700">
                          <div className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl shadow-sm">Thực vật</div>
                          <ArrowRight size={12} className="text-indigo-400" />
                          <div className="flex flex-col gap-2">
                            <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">Cây hạt trần</div>
                            <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">Cây hạt kín</div>
                          </div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Khối sơ đồ phân nhánh giúp học sinh phân tích cấu trúc bài giảng dưới dạng sơ đồ hình cây logic dễ nhớ.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/mindmap</kbd> để hiển thị sơ đồ.</li>
                        <li>Bước 2: Chọn nút bất kỳ, gõ tiêu đề và dùng phím tắt trên sơ đồ để tạo nhanh nút con.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Timeline & Flow */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CalendarRange size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Trục thời gian & Tiến trình (Timeline & Flow)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="flex justify-center py-5 bg-white border border-indigo-100 rounded-xl shadow-sm">
                        <div className="flex items-center text-[9px] font-black text-indigo-850">
                          <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-center shadow-sm">
                            <div className="text-indigo-650">Bước 1</div>
                            <span>Thu thập mẫu vật</span>
                          </div>
                          <div className="w-6 h-0.5 bg-indigo-300" />
                          <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-center shadow-sm">
                            <div className="text-indigo-650">Bước 2</div>
                            <span>Phân tích mẫu thử</span>
                          </div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Biểu diện quy trình hoặc sự kiện theo thứ tự thời gian tuyến tính từ trái qua phải hoặc từ trên xuống dưới một cách khoa học.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Khác ở thanh công cụ bên phải và chọn Timeline hoặc Flow.</li>
                        <li>Bước 2: Điền tên sự kiện, nội dung mô tả chi tiết và các mốc thời gian quy ước tương ứng.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Grid size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Khối chuyển đổi Tabs (Tabs)</span>
                    </div>

                    <PreviewWrapper>
                      <MiniTabs />
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Gộp nhiều phần kiến thức có chung nhóm phân loại vào các thẻ tab ngang, giúp rút ngắn độ dài hiển thị của bài học.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Khác &gt; Tabs trên thanh công cụ hoặc gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/tabs</kbd>.</li>
                        <li>Bước 2: Tạo các tiêu đề tab mới và nhập nội dung tương ứng cho từng tab.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Compare */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Columns size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Bảng so sánh (Compare)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-indigo-100 bg-white rounded-xl shadow-sm overflow-hidden font-bold">
                          <div className="bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-900 border-b border-indigo-100 text-center">Nhiệt lượng tỏa ra</div>
                          <div className="p-3 text-[9px] text-slate-600 leading-normal space-y-1">
                            <div>• Q_toa = m * c * delta_t</div>
                            <div className="text-slate-400 font-medium">Lượng nhiệt truyền từ vật ra môi trường.</div>
                          </div>
                        </div>
                        <div className="border border-indigo-100 bg-white rounded-xl shadow-sm overflow-hidden font-bold">
                          <div className="bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-900 border-b border-indigo-100 text-center">Nhiệt lượng thu vào</div>
                          <div className="p-3 text-[9px] text-slate-600 leading-normal space-y-1">
                            <div>• Q_thu = m * c * delta_t</div>
                            <div className="text-slate-400 font-medium">Năng lượng hấp thụ làm tăng nhiệt của vật.</div>
                          </div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Dùng để trình bày đối chiếu song song các khái niệm, định lý khác nhau một cách dễ hiểu.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/compare</kbd> hoặc chọn Compare từ bảng học cụ.</li>
                        <li>Bước 2: Phân chia tiêu đề cột so sánh trái/phải và điền nội dung văn bản chi tiết bên dưới.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: MEDIA BLOCK ── */}
            {activeTab === 'media-block' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Khối Đa phương tiện (Media)</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Nhúng hình ảnh, âm thanh hoặc video trực tiếp vào bài học</p>
                </div>

                <div className="space-y-6">
                  {/* Image */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <ImageIcon size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Hình ảnh (Image)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="border border-indigo-100 bg-white p-1 rounded-2xl shadow-sm w-full max-w-[280px]">
                          <div className="aspect-video bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-400 border border-dashed border-indigo-200">
                            <ImageIcon size={30} />
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 italic select-none">Hình 1.1: Đồ thị vận tốc chuyển động theo thời gian</span>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Khối chèn tệp hình ảnh đồ thị, sơ đồ thí nghiệm kèm theo dòng ghi chú chú thích chân trang bên dưới.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Ảnh trên thanh công cụ bên phải hoặc gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/image</kbd>.</li>
                        <li>Bước 2: Tải ảnh lên và điền văn bản chú thích hiển thị ở ô nhập tương ứng.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Video & Audio */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Video size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Khối Đa phương tiện (Video & Audio)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="flex items-center justify-center py-6">
                        <div className="w-[260px] aspect-video bg-slate-900 rounded-2xl shadow-md flex flex-col items-center justify-center text-slate-400 p-4 relative border border-slate-800">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition">
                            <Video size={16} className="fill-white ml-0.5 text-white" />
                          </div>
                          <span className="text-[8px] font-black tracking-wider uppercase text-slate-500 absolute bottom-3 select-none">Mô phỏng trình phát học liệu video</span>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Nhúng và trình phát các học liệu video từ tệp tải lên máy tính cá nhân hoặc thông qua liên kết nhúng YouTube và Drive bên ngoài.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/media</kbd> hoặc chọn biểu tượng Media ở thanh công cụ bên phải.</li>
                        <li>Bước 2: Chọn tải tệp tin từ máy lên hoặc nhập địa chỉ liên kết URL video từ YouTube/Drive để nhúng trực tiếp.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: QUIZ & ASSESSMENT ── */}
            {activeTab === 'quiz-assessment' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Khối Câu hỏi & Khảo thí</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Các bài tập tự động hóa giúp kiểm tra kiến thức của học sinh ngay trong tài liệu</p>
                </div>

                <div className="space-y-6">
                  {/* Quiz */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <HelpCircle size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Khối Trắc nghiệm (Quiz)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="p-4 bg-white border border-indigo-100 rounded-xl space-y-2 text-[10px] text-slate-700 font-bold shadow-sm">
                        <div className="text-indigo-950 font-black">Câu hỏi 1: Lực cản không khí phụ thuộc vào yếu tố nào?</div>
                        <div className="space-y-1.5 pt-1.5">
                          <div className="flex items-center gap-2 p-2 bg-indigo-50/50 border border-indigo-150 rounded-xl shadow-sm">
                            <input type="radio" checked readOnly className="text-indigo-600 focus:ring-indigo-500 animate-none" />
                            <span className="text-indigo-900">Hình dạng và vận tốc của vật thể.</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white border border-slate-250 rounded-xl shadow-sm">
                            <input type="radio" checked={false} readOnly className="text-indigo-600 focus:ring-indigo-500 animate-none" />
                            <span>Màu sắc của vật thể chuyển động.</span>
                          </div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Khối kiểm tra trắc nghiệm một hoặc nhiều lựa chọn, hỗ trợ xáo trộn thứ tự câu hỏi và hiển thị đáp án đúng tự động.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Quiz trên thanh công cụ hoặc gõ lệnh <kbd className="px-1 py-0.5 bg-slate-100 rounded border">/quiz</kbd>.</li>
                        <li>Bước 2: Nhập câu hỏi kiểm tra, tạo các phương án lựa chọn và click chọn phương án đúng tương ứng.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Matching */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Columns size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Khối Nối cặp (Matching)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="grid grid-cols-2 gap-4 text-[9px] font-black text-slate-655">
                        <div className="space-y-1.5">
                          <div className="p-2 bg-white border border-indigo-150 rounded-xl text-center shadow-sm">Cơ năng</div>
                          <div className="p-2 bg-white border border-indigo-150 rounded-xl text-center shadow-sm">Thế năng</div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="p-2 bg-indigo-55 bg-indigo-50/50 border-2 border-indigo-500 text-indigo-700 rounded-xl text-center shadow-sm">W = Wt + Wd</div>
                          <div className="p-2 bg-white border border-indigo-150 rounded-xl text-center shadow-sm">W = m * g * h</div>
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Thiết lập dạng bài ghép đôi cột trái và cột phải tương ứng. Học sinh click lần lượt hai ô ở hai cột để kết nối chúng.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Khác &gt; Matching từ thanh công cụ bên phải.</li>
                        <li>Bước 2: Điền nội dung vế trái và vế phải tương ứng theo đúng cặp đáp án chuẩn. Hệ thống sẽ tự động xáo trộn ngẫu nhiên khi hiển thị cho học sinh.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Fill blank */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <FileText size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Khối Điền chỗ trống (Fillblank)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="p-4 bg-white border border-indigo-100 rounded-xl text-[10px] text-slate-600 leading-relaxed font-bold shadow-sm">
                        Nước sôi ở nhiệt độ{' '}
                        <input type="text" placeholder="Nhập đáp án..." disabled className="inline-block border border-indigo-300 bg-indigo-50/30 rounded-lg px-2 py-0.5 w-[90px] text-[9px] text-center" />
                        {' '} độ C ở áp suất thường.
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Học sinh nhập trực tiếp câu trả lời vào các ô trống bị thiếu đặt bên trong văn bản bài tập của giáo viên.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn Khác &gt; Fillblank và gõ đoạn văn bản bài tập.</li>
                        <li>Bước 2: Bôi đen từ khóa muốn đặt làm ô trống và bấm nút Tạo ô trống để chỉ định đáp án cùng gợi ý đi kèm.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Drag drop */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Grid size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Kéo thả thẻ (Dragdrop)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="space-y-4 text-[9px] font-bold">
                        <div className="flex gap-2 justify-center">
                          <div className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl shadow-sm cursor-grab">Lực ma sát</div>
                          <div className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl shadow cursor-grab">Lực đàn hồi</div>
                        </div>
                        
                        <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-3 bg-indigo-50/20 text-center text-indigo-400">
                          Thả vào đây (Vùng Lực cản trở chuyển động)
                        </div>
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Học sinh kéo các thẻ từ bên ngoài và thả vào đúng vùng chứa kiến thức tương thích mà giáo viên đã thiết lập.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn bài tập Dragdrop trong bảng chọn loại khối nâng cao.</li>
                        <li>Bước 2: Thiết lập danh sách các thẻ từ (Cards) và liên kết chúng đến vùng thả (Zones) hợp lệ.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Sort order */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <List size={14} className="text-primary" />
                      <span className="text-xs font-black text-slate-850">Sắp xếp thứ tự (Sortorder)</span>
                    </div>

                    <PreviewWrapper>
                      <div className="space-y-1.5 max-w-[280px] mx-auto select-none">
                        {[
                          { step: 1, text: "Thả quỳ tím vào dung dịch kiểm tra" },
                          { step: 2, text: "Quan sát màu sắc quỳ tím biến đổi" },
                          { step: 3, text: "Đo nồng độ pH tương ứng thang đo" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl p-2 shadow-sm text-[9px] font-bold text-slate-655">
                            <div className="cursor-grab text-slate-350 hover:text-indigo-650 transition flex items-center pr-1 border-r border-slate-100">
                              <GripVertical size={11} />
                            </div>
                            <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-black shrink-0 text-[8px]">{item.step}</div>
                            <span className="flex-1 text-slate-700">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </PreviewWrapper>

                    <div className="text-xs text-slate-655 space-y-2">
                      <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                      <p>Khối bài tập hoán đổi vị trí thẻ từ để sắp xếp theo chuỗi quy trình chuẩn xác hoặc chuỗi thời gian tăng/giảm dần.</p>
                      <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Bước 1: Chọn bài tập Sortorder trong bảng chọn loại khối nâng cao.</li>
                        <li>Bước 2: Điền thứ tự thẻ tăng dần/giảm dần theo mong muốn.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: CODE BLOCK ── */}
            {activeTab === 'code-block' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Khối Mã nguồn (Code Block)</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Chèn và hiển thị mã nguồn lập trình với đánh dấu cú pháp màu sắc chuyên nghiệp</p>
                </div>

                {/* Preview */}
                <PreviewWrapper>
                  <div className="rounded-xl overflow-hidden text-[9px] font-mono leading-[1.5]" style={{ background: '#272822', border: '1px solid #3d3d3d' }}>
                    <div className="flex items-center justify-between px-3 py-1.5 text-[8px] font-black uppercase tracking-widest" style={{ background: '#1e1e1b', color: '#75715e', borderBottom: '1px solid #3d3d3d' }}>
                      <span>typescript</span>
                      <span className="opacity-60">6 dòng</span>
                    </div>
                    <div className="flex">
                      <div className="select-none text-right pr-2 pt-2 pb-2 pl-2 shrink-0" style={{ background: '#1e1e1b', color: '#75715e', borderRight: '1px solid #3d3d3d', minWidth: '2rem' }}>
                        {[1,2,3,4,5,6].map(n => <div key={n}>{n}</div>)}
                      </div>
                      <pre className="flex-1 p-2 m-0 overflow-x-auto" style={{ color: '#f8f8f2', background: 'transparent' }}>
                        <code style={{ color: '#f8f8f2' }}>
                          <span style={{ color: '#66d9e8' }}>function</span>{' '}
                          <span style={{ color: '#a6e22e' }}>tinhTong</span>
                          <span style={{ color: '#f8f8f2' }}>(</span>
                          <span style={{ color: '#fd971f' }}>a</span>
                          <span style={{ color: '#f8f8f2' }}>: </span>
                          <span style={{ color: '#66d9e8' }}>number</span>
                          <span style={{ color: '#f8f8f2' }}>, </span>
                          <span style={{ color: '#fd971f' }}>b</span>
                          <span style={{ color: '#f8f8f2' }}>: </span>
                          <span style={{ color: '#66d9e8' }}>number</span>
                          <span style={{ color: '#f8f8f2' }}>){' }{'}</span>
                          {`
  `}<span style={{ color: '#66d9e8' }}>return</span>{' '}
                          <span style={{ color: '#fd971f' }}>a</span>{' + '}
                          <span style={{ color: '#fd971f' }}>b</span>;
                          {`
}`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </PreviewWrapper>

                <div className="text-xs text-slate-655 space-y-3">
                  <p className="font-bold text-slate-700">Mô tả & Chức năng:</p>
                  <p>Khối Mã nguồn cho phép chèn đoạn code với đánh dấu cú pháp màu sắc tự động, phù hợp cho tài liệu môn <strong>Tin học, Toán ứng dụng, Khoa học Máy tính</strong>.</p>

                  <p className="font-bold text-slate-700 pt-1">Tính năng nổi bật:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>14 ngôn ngữ</strong> được hỗ trợ: TypeScript, JavaScript, Python, Java, C++, C, C#, HTML, CSS, SQL, Bash, JSON, Markdown, Plaintext.</li>
                    <li><strong>4 giao diện màu</strong> (Theme): Tối Okaidia, Monokai, Sáng, GitHub — đổi bằng dropdown trên toolbar.</li>
                    <li><strong>Số thứ tự dòng</strong> (Line Numbers): Bật/tắt nhanh bằng nút trên toolbar.</li>
                    <li><strong>Xuống dòng</strong> (Wrap Line): Tự động bẻ xuống dòng khi code quá dài.</li>
                    <li>Phím <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">Tab</kbd> chèn <strong>2 dấu cách</strong> thụt lề (không chuyển focus ra ngoài).</li>
                  </ul>

                  <p className="font-bold text-slate-700 pt-1">Cách biên soạn:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Bước 1: Nhấn nút <strong>Code</strong> trên thanh công cụ bên phải, hoặc gõ <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">/code</kbd> trong block trống.</li>
                    <li>Bước 2: Nhập code vào vùng soạn thảo. Đánh dấu màu sẽ cập nhật trong Preview.</li>
                    <li>Bước 3: Dùng toolbar để chọn ngôn ngữ, đổi theme, bật/tắt số dòng.</li>
                    <li>Bước 4: Nhấn <strong>Cấu hình</strong> để mở dialog cài đặt nâng cao đầy đủ hơn.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── TAB: TIPS & SHORTCUTS ── */}
            {activeTab === 'tips-shortcuts' && (
              <div className="space-y-6 animate-fadeIn text-slate-655 text-xs leading-relaxed">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Mẹo & Phím tắt thao tác nhanh</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Cải thiện tốc độ biên soạn tài liệu cho giáo viên đạt năng suất tối đa</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-bold text-slate-800">Phím tắt bàn phím</h4>
                    <ul className="list-disc pl-4 space-y-1.5 font-medium text-slate-600 text-[11px]">
                      <li><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">Enter</kbd> : Tạo một khối Paragraph mới nằm ngay bên dưới.</li>
                      <li><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">/</kbd> : Kích hoạt nhanh danh sách lựa chọn các Block tại con trỏ dòng trống hiện thời.</li>
                      <li><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">Backspace</kbd> (ở đầu dòng trống) : Xóa khối hiện thời và đưa con trỏ lên khối phía trước.</li>
                      <li><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">Shift + Tab</kbd> : Tăng/Giảm mức thụt lề đầu dòng của văn bản hoặc di chuyển chọn ô bảng.</li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-bold text-slate-800">Thao tác kéo thả khối</h4>
                    <ul className="list-disc pl-4 space-y-1.5 font-medium text-slate-600 text-[11px]">
                      <li>Giữ biểu tượng tay nắm 6 dấu chấm ở góc trái mỗi khối để kéo thả, sắp xếp lại vị trí thứ tự tùy ý trong bài học.</li>
                      <li>Trình soạn thảo hỗ trợ kéo thả cả các khối lớn như Sơ đồ tư duy, Flashcard mà không làm mất dữ liệu bên trong.</li>
                      <li>Tự động lưu tiến trình (Autosave) sau mỗi thao tác kéo thả thành công để phòng tránh sự cố mất mạng đột ngột.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
