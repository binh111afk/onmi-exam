import React, { useState } from 'react';
import { X, Copy, Check, Info, Code, FileText, Sparkles } from 'lucide-react';
import { OmlBlockRouter } from '../../ExamEditor/OmlRenderer/OmlBlockRouter';

interface OmlGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OmlGuideModal: React.FC<OmlGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('intro');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = [
    { id: 'intro', label: '1. Giới thiệu OML' },
    { id: 'structure', label: '2. Cấu trúc cơ bản' },
    { id: 'layout-blocks', label: '3. Các Block hỗ trợ' },
    { id: 'questions', label: '4. Các loại câu hỏi' },
    { id: 'image', label: '5. Chèn hình ảnh' },
    { id: 'table', label: '6. Cấu trúc Bảng' },
    { id: 'tips', label: '7. Mẹo sử dụng' },
    { id: 'full-example', label: '8. Đề thi mẫu hoàn chỉnh' },
  ];

  // Helper for copy button
  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="absolute top-3 right-3 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-primary transition flex items-center gap-1 text-[9px] font-black cursor-pointer shadow-sm"
      title="Sao chép JSON"
    >
      {copiedId === id ? (
        <>
          <Check size={11} className="text-emerald-500" />
          <span className="text-emerald-500 text-[8px]">Đã chép</span>
        </>
      ) : (
        <>
          <Copy size={11} />
          <span>Sao chép</span>
        </>
      )}
    </button>
  );

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
              <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Cẩm nang hướng dẫn soạn OML</h2>
              <p className="text-[9px] text-slate-400 font-bold -mt-0.5">Tìm hiểu chi tiết cấu trúc Open Markup Language v2.0</p>
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
          <aside className="w-56 bg-slate-50/50 border-r border-slate-100 flex flex-col shrink-0 min-h-0 p-4 space-y-1 overflow-y-auto">
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
          <main className="flex-1 min-h-0 overflow-y-auto p-6 text-left space-y-6 bg-white selection:bg-primary-light selection:text-primary">
            
            {/* ── TAB: INTRO ── */}
            {activeTab === 'intro' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">OML là gì?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Open Markup Language (OML)</strong> là một chuẩn dữ liệu dạng JSON được thiết kế bởi Onmi, giúp mô tả toàn bộ cấu trúc của một đề kiểm tra. OML hỗ trợ biên dịch và hiển thị trực quan các thành phần như đề bài, hình ảnh, bảng biểu, công thức toán học LaTeX, các block định dạng nâng cao và đặc biệt là hệ thống câu hỏi tương tác nhiều loại khác nhau.
                </p>
                <div className="p-4 border border-[#ECE9FE] bg-[#F5F3FF]/50 rounded-2xl flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow shadow-indigo-100 text-primary shrink-0">
                    <Info size={14} />
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    <span className="font-bold text-[#1E293B]">Quy trình biên dịch và hiển thị:</span>
                    <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                      <li>Giáo viên soạn mã JSON OML tại vùng làm việc bên trái.</li>
                      <li>Hệ thống chạy ngầm bộ kiểm tra thời gian thực (Debounce) để tự động hiển thị bản nháp tại cột Xem trước (Preview).</li>
                      <li>Nếu có lỗi xảy ra, trình hiển thị vẫn bảo toàn bản biên dịch thành công gần nhất giúp giao diện không bị gián đoạn hay crash.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: STRUCTURE ── */}
            {activeTab === 'structure' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Cấu trúc đề thi cơ bản</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Một tệp OML hợp lệ là một đối tượng JSON có các thuộc tính bắt buộc sau:
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                  <li><strong>version</strong>: Phiên bản OML định dạng (Hiện tại hỗ trợ <code>"1.0"</code> hoặc <code>"2.0"</code>).</li>
                  <li><strong>info</strong>: Một đối tượng chứa thông tin chung của đề thi (Tiêu đề, Môn học, Khối lớp, Thời gian làm bài).</li>
                  <li><strong>content</strong>: Một mảng chứa tất cả các block hiển thị và câu hỏi theo đúng thứ tự từ trên xuống dưới.</li>
                </ul>

                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-100 text-[10px] rounded-2xl font-mono overflow-x-auto">
{`{
  "version": "2.0",
  "info": {
    "title": "Đề khảo sát chất lượng học kỳ 2",
    "subject": "Sinh học",
    "grade": 10,
    "time": 45
  },
  "content": [
    // Các blocks hiển thị và câu hỏi đặt tại đây
  ]
}`}
                  </pre>
                  <CopyButton id="structure-code" text={`{\n  "version": "2.0",\n  "info": {\n    "title": "Đề khảo sát chất lượng học kỳ 2",\n    "subject": "Sinh học",\n    "grade": 10,\n    "time": 45\n  },\n  "content": []\n}`} />
                </div>
              </div>
            )}

            {/* ── TAB: LAYOUT BLOCKS ── */}
            {activeTab === 'layout-blocks' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Các Block định dạng hỗ trợ</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  OML hỗ trợ nhiều khối dữ liệu phi cấu trúc để giúp định dạng đề thi phong phú. Dưới đây là ví dụ mã nguồn và cách hiển thị tương ứng:
                </p>

                {/* heading */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Khối Heading (Tiêu đề mục)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "heading",
  "level": 2,
  "text": "PHẦN I: CÂU HỎI TRẮC NGHIỆM"
}`}
                      </pre>
                      <CopyButton id="block-heading" text={`{\n  "type": "heading",\n  "level": 2,\n  "text": "PHẦN I: CÂU HỎI TRẮC NGHIỆM"\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full">
                        <OmlBlockRouter block={{ type: 'heading', level: 2, text: 'PHẦN I: CÂU HỎI TRẮC NGHIỆM' }} idx={0} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* paragraph */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Khối Paragraph (Đoạn văn có Markdown)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "paragraph",
  "text": "Hãy điền đáp án thích hợp vào chỗ trống. **Lưu ý**: chỉ viết chữ số thường."
}`}
                      </pre>
                      <CopyButton id="block-p" text={`{\n  "type": "paragraph",\n  "text": "Hãy điền đáp án thích hợp vào chỗ trống. **Lưu ý**: chỉ viết chữ số thường."\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full text-xs">
                        <OmlBlockRouter block={{ type: 'paragraph', text: 'Hãy điền đáp án thích hợp vào chỗ trống. **Lưu ý**: chỉ viết chữ số thường.' }} idx={1} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* quote */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Khối Quote (Trích dẫn văn học)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "quote",
  "text": "Trải qua một cuộc bể dâu\\nNhững điều trông thấy mà đau đớn lòng.",
  "cite": "Nguyễn Du, Truyện Kiều"
}`}
                      </pre>
                      <CopyButton id="block-quote" text={`{\n  "type": "quote",\n  "text": "Trải qua một cuộc bể dâu\\nNhững điều trông thấy mà đau đớn lòng.",\n  "cite": "Nguyễn Du, Truyện Kiều"\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full">
                        <OmlBlockRouter block={{ type: 'quote', text: 'Trải qua một cuộc bể dâu\nNhững điều trông thấy mà đau đớn lòng.', cite: 'Nguyễn Du, Truyện Kiều' }} idx={2} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* callout */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Khối Callout (Gợi ý/Hộp thoại cảnh báo)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "callout",
  "variant": "warning",
  "title": "Cảnh báo bảo mật",
  "content": "Tuyệt đối không sử dụng công cụ hỗ trợ ngoại vi khi làm bài thi này."
}`}
                      </pre>
                      <CopyButton id="block-callout" text={`{\n  "type": "callout",\n  "variant": "warning",\n  "title": "Cảnh báo bảo mật",\n  "content": "Tuyệt đối không sử dụng công cụ hỗ trợ ngoại vi khi làm bài thi này."\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full">
                        <OmlBlockRouter block={{ type: 'callout', variant: 'warning', title: 'Cảnh báo bảo mật', content: 'Tuyệt đối không sử dụng công cụ hỗ trợ ngoại vi khi làm bài thi này.' }} idx={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: QUESTIONS ── */}
            {activeTab === 'questions' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Các định dạng câu hỏi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Khối câu hỏi trong OML được đặt <code>"type": "question"</code> và phân loại qua thuộc tính <code>"subType"</code>.
                </p>

                {/* Trắc nghiệm */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Câu trắc nghiệm (Choice)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "question",
  "id": "1",
  "subType": "choice",
  "question": "Tính đạo hàm hàm số $y = x^2$.",
  "options": [
    { "id": "A", "content": "$y' = x$" },
    { "id": "B", "content": "$y' = 2x$" }
  ],
  "answer": ["B"]
}`}
                      </pre>
                      <CopyButton id="q-choice" text={`{\n  "type": "question",\n  "id": "1",\n  "subType": "choice",\n  "question": "Tính đạo hàm hàm số $y = x^2$.",\n  "options": [\n    { "id": "A", "content": "$y\' = x$" },\n    { "id": "B", "content": "$y\' = 2x$" }\n  ],\n  "answer": ["B"]\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full">
                        <OmlBlockRouter block={{ type: 'question', id: '1', subType: 'choice', question: 'Tính đạo hàm hàm số $y = x^2$.', options: [{ id: 'A', content: "$y' = x$" }, { id: 'B', content: "$y' = 2x$" }], answer: ['B'] }} idx={4} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Đúng Sai */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Câu hỏi Đúng - Sai (True-False)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "question",
  "id": "2",
  "subType": "true-false",
  "question": "Hàm số $y = \\cos x$ là hàm số lẻ.",
  "options": [
    { "id": "A", "content": "Đúng" },
    { "id": "B", "content": "Sai" }
  ],
  "answer": ["B"]
}`}
                      </pre>
                      <CopyButton id="q-tf" text={`{\n  "type": "question",\n  "id": "2",\n  "subType": "true-false",\n  "question": "Hàm số $y = \\cos x$ là hàm số lẻ.",\n  "options": [\n    { "id": "A", "content": "Đúng" },\n    { "id": "B", "content": "Sai" }\n  ],\n  "answer": ["B"]\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full">
                        <OmlBlockRouter block={{ type: 'question', id: '2', subType: 'true-false', question: 'Hàm số $y = \\cos x$ là hàm số lẻ.', options: [{ id: 'A', content: 'Đúng' }, { id: 'B', content: 'Sai' }], answer: ['B'] }} idx={5} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Điền Khuyết */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wide">● Câu hỏi Điền khuyết (Fill-in-the-Blank)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "question",
  "id": "3",
  "subType": "fill-blank",
  "question": "Giá trị của biểu thức $\\log_2 8$ bằng ____.",
  "answer": ["3"]
}`}
                      </pre>
                      <CopyButton id="q-blank" text={`{\n  "type": "question",\n  "id": "3",\n  "subType": "fill-blank",\n  "question": "Giá trị của biểu thức $\\log_2 8$ bằng ____.",\n  "answer": ["3"]\n}`} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <div className="w-full">
                        <OmlBlockRouter block={{ type: 'question', id: '3', subType: 'fill-blank', question: 'Giá trị của biểu thức $\\log_2 8$ bằng ____.', answer: ['3'] }} idx={6} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ── TAB: IMAGE ── */}
            {activeTab === 'image' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Hình ảnh trong đề thi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  OML hỗ trợ chèn ảnh với kích thước tùy biến <code>size: "small" | "medium" | "full"</code> và chú thích bên dưới ảnh.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "image",
  "src": "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop",
  "alt": "Coordinate Plane",
  "caption": "Hình 2: Trục tọa độ Oxy",
  "size": "small"
}`}
                    </pre>
                    <CopyButton id="img-code" text={`{\n  "type": "image",\n  "src": "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop",\n  "alt": "Coordinate Plane",\n  "caption": "Hình 2: Trục tọa độ Oxy",\n  "size": "small"\n}`} />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                    <div className="w-full">
                      <OmlBlockRouter block={{
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop',
                        caption: 'Hình 2: Trục tọa độ Oxy',
                        size: 'small'
                      }} idx={8} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: TABLE ── */}
            {activeTab === 'table' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Định dạng bảng số liệu</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Các cột tiêu đề (<code>headers</code>) và các dòng dữ liệu (<code>rows</code>) đều hỗ trợ soạn thảo văn bản và LaTeX hoàn hảo, kèm chú thích bảng tự động căn giữa.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <pre className="p-3.5 bg-slate-900 text-slate-100 text-[9px] rounded-xl font-mono">
{`{
  "type": "table",
  "caption": "Bảng khảo sát sự biến thiên y' theo x",
  "headers": ["$x$", "$-\\infty$", "$0$", "$+\\infty$"],
  "rows": [
    ["$y'$", "", "$+$", "$0$", "$-$", ""],
    ["$y$", "$-\\infty$", "$\\nearrow$", "$1$", "$\\searrow$", "$-\\infty$"]
  ]
}`}
                    </pre>
                    <CopyButton id="table-code" text={`{\n  "type": "table",\n  "caption": "Bảng khảo sát sự biến thiên y' theo x",\n  "headers": ["$x$", "$-\\infty$", "$0$", "$+\\infty$"],\n  "rows": [\n    ["$y\'$", "", "$+$", "$0$", "$-$", ""],\n    ["$y$", "$-\\infty$", "$\\nearrow$", "$1$", "$\\searrow$", "$-\\infty$"]\n  ]\n}`} />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                    <div className="w-full">
                      <OmlBlockRouter block={{
                        type: 'table',
                        caption: "Bảng khảo sát sự biến thiên y' theo x",
                        headers: ["$x$", "$-\\infty$", "$0$", "$+\\infty$"],
                        rows: [
                          ["$y'$", "", "$+$", "$0$", "$-$", ""],
                          ["$y$", "$-\\infty$", "$\\nearrow$", "$1$", "$\\searrow$", "$-\\infty$"]
                        ]
                      }} idx={9} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: TIPS ── */}
            {activeTab === 'tips' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Mẹo sử dụng trình soạn thảo</h3>
                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0 font-bold text-xs">⌨</div>
                    <div className="text-xs">
                      <h4 className="font-bold text-slate-700">Tự động sao lưu bản nháp</h4>
                      <p className="text-slate-500">Mã nguồn của bạn sẽ được lưu nháp tự động dưới bộ nhớ trình duyệt sau 500ms dừng gõ phím.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                    <div className="text-xs">
                      <h4 className="font-bold text-slate-700">Yêu cầu Biên dịch thành công</h4>
                      <p className="text-slate-500">Preview đề thi và Danh sách câu hỏi Sidebar chỉ được làm mới khi toàn bộ JSON và định dạng Schema OML không chứa bất kỳ lỗi nào.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0 font-bold text-xs">🔴</div>
                    <div className="text-xs">
                      <h4 className="font-bold text-slate-700">Đọc chỉ số lỗi trên thanh trạng thái</h4>
                      <p className="text-slate-500">Khi xảy ra lỗi, bạn có thể click trực tiếp vào thanh màu đỏ cảnh báo dưới đáy editor để mở bảng liệt kê toàn bộ vị trí các dòng gây lỗi.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: FULL EXAMPLE ── */}
            {activeTab === 'full-example' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Tệp OML mẫu hoàn chỉnh</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Một tệp OML mô tả bài thi mẫu đầy đủ các khối tiêu đề, công thức, trích dẫn, hình ảnh và câu hỏi trắc nghiệm:
                </p>

                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-100 text-[9px] rounded-2xl font-mono overflow-y-auto max-h-[350px]">
{`{
  "version": "2.0",
  "info": {
    "title": "Đề Khảo Sát Sinh Học Kỳ 2 lớp 10",
    "subject": "Sinh học",
    "grade": 10,
    "time": 45
  },
  "content": [
    {
      "type": "heading",
      "level": 1,
      "text": "PHẦN I: TRẮC NGHIỆM ĐỀ BÀI"
    },
    {
      "type": "paragraph",
      "text": "Nghiên cứu quá trình quang hợp ở tế bào thực vật thông qua công thức tổng quát:"
    },
    {
      "type": "formula",
      "latex": "6CO_2 + 6H_2O \\xrightarrow{\\text{Ánh sáng, Diệp lục}} C_6H_{12}O_6 + 6O_2",
      "display": "block"
    },
    {
      "type": "divider"
    },
    {
      "type": "quote",
      "text": "Tất cả các sinh vật sống đều được cấu tạo từ một hoặc nhiều tế bào.",
      "cite": "Thuyết tế bào hiện đại"
    },
    {
      "type": "question",
      "id": "1",
      "subType": "choice",
      "question": "Bào quan nào sau đây thực hiện chức năng hô hấp tế bào?",
      "options": [
        { "id": "A", "content": "Lục lạp" },
        { "id": "B", "content": "Ti thể" },
        { "id": "C", "content": "Không bào" },
        { "id": "D", "content": "Ribosome" }
      ],
      "answer": ["B"]
    }
  ]
}`}
                  </pre>
                  <CopyButton id="full-oml-example" text={`{\n  "version": "2.0",\n  "info": {\n    "title": "Đề Khảo Sát Sinh Học Kỳ 2 lớp 10",\n    "subject": "Sinh học",\n    "grade": 10,\n    "time": 45\n  },\n  "content": [\n    {\n      "type": "heading",\n      "level": 1,\n      "text": "PHẦN I: TRẮC NGHIỆM ĐỀ BÀI"\n    },\n    {\n      "type": "paragraph",\n      "text": "Nghiên cứu quá trình quang hợp ở tế bào thực vật thông qua công thức tổng quát:"\n    },\n    {\n      "type": "formula",\n      "latex": "6CO_2 + 6H_2O \\\\xrightarrow{\\\\text{Ánh sáng, Diệp lục}} C_6H_{12}O_6 + 6O_2",\n      "display": "block"\n    },\n    {\n      "type": "divider"\n    },\n    {\n      "type": "quote",\n      "text": "Tất cả các sinh vật sống đều được cấu tạo từ một hoặc nhiều tế bào.",\n      "cite": "Thuyết tế bào hiện đại"\n    },\n    {\n      "type": "question",\n      "id": "1",\n      "subType": "choice",\n      "question": "Bào quan nào sau đây thực hiện chức năng hô hấp tế bào?",\n      "options": [\n        { "id": "A", "content": "Lục lạp" },\n        { "id": "B", "content": "Ti thể" },\n        { "id": "C", "content": "Không bào" },\n        { "id": "D", "content": "Ribosome" }\n      ],\n      "answer": ["B"]\n    }\n  ]\n}`} />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
