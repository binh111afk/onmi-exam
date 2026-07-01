import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Plus, 
  Save, 
  Eye, 
  Send, 
  RotateCcw, 
  Sparkles,
  Award, 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  AlignLeft, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Table, 
  Activity,
  Laptop,
  Tablet as TabletIcon,
  Smartphone,
  RefreshCw,
  FolderOpen,
  FileCheck2,
  FileCode2,
  Brain,
  HelpCircle,
  HelpCircle as QuizIcon,
  Video,
  Upload,
  X,
  File,
  Download,
  CheckCircle2,
  Settings,
  Search,
  Code,
  Database,
  Check,
  Edit,
  GripVertical,
  Cloud,
  Copy,
  Link,
  ExternalLink
} from 'lucide-react';

export const Teacher: React.FC = () => {
  // Mode: 'dashboard' (shows 2 cards), 'editor' (shows editor workspace), 'upload' (upload file layout), or 'exam-editor' (exam code editor)
  const [mode, setMode] = useState<'dashboard' | 'editor' | 'upload' | 'exam-editor'>('dashboard');

  // Sub-view within exam editor: 'edit' (edit JSON), 'config' (config info), 'publish' (view & publish)
  const [examSubView, setExamSubView] = useState<'edit' | 'config' | 'publish'>('edit');
  const [copied, setCopied] = useState(false);

  // Exam editor states
  const [examTab, setExamTab] = useState<'code' | 'quick' | 'bank'>('code');
  const [examJsonCode, setExamJsonCode] = useState(
`{
  "info": {
    "title": "Đề cương ôn tập Sinh học 10 học kỳ 2",
    "subject": "Sinh học",
    "grade": 10,
    "time": 90,
    "totalQuestion": 50,
    "type": "trac_nghiem"
  },
  "questions": [
    {
      "id": 1,
      "question": "Phát biểu nào sau đây đúng về nước?",
      "options": [
        { "key": "A", "content": "Nước là dung môi phân cực cực tốt" },
        { "key": "B", "content": "Nước không tham gia phản ứng sinh hóa" },
        { "key": "C", "content": "Nước được cấu tạo từ 3 nguyên tử H và 1 nguyên tử O" },
        { "key": "D", "content": "Nước không có khả năng điều hòa nhiệt độ" }
      ],
      "answer": "A",
      "explanation": "Nước là dung môi phân cực cực tốt nên hòa tan được nhiều chất phân cực trong tế bào.",
      "level": "easy",
      "tags": ["nước", "thành phần hóa học"]
    },
    {
      "id": 2,
      "question": "Cho hình vẽ cấu trúc của phân tử nước. Góc liên kết H-O-H là bao nhiêu?",
      "options": [
        { "key": "A", "content": "104.5°" },
        { "key": "B", "content": "90°" },
        { "key": "C", "content": "120°" },
        { "key": "D", "content": "180°" }
      ],
      "answer": "A",
      "explanation": "Do 2 cặp electron tự do trên nguyên tử O đẩy nhau làm góc liên kết nhỏ hơn 109.5°, giá trị thực tế là 104.5°.",
      "level": "medium",
      "tags": ["nước", "cấu trúc"]
    }
  ]
}`
  );
  
  // Selected question in the question list
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Modal selection state
  const [showMethodModal, setShowMethodModal] = useState(false);

  // Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: 'Đề cương ôn tập Sinh học 10 học kỳ 2.pdf',
    size: '2.45 MB'
  });

  // Upload form states
  const [docTitle, setDocTitle] = useState('Đề cương ôn tập Sinh học 10 học kỳ 2');
  const [docType, setDocType] = useState('Tài liệu đề thi');
  const [docSubject, setDocSubject] = useState('Sinh học');
  const [docSemester, setDocSemester] = useState('Học kỳ 2');
  const [docClass, setDocClass] = useState('Lớp 10');
  const [hasSolution, setHasSolution] = useState(true);
  const [docDescription, setDocDescription] = useState('');
  
  // Tag state
  const [tagInput, setTagInput] = useState('');
  const [docTags, setDocTags] = useState<string[]>(['ôn tập', 'sinh học 10', 'học kỳ 2', 'đề cương']);

  // PDF Preview states
  const [previewPage, setPreviewPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!docTags.includes(tagInput.trim())) {
        setDocTags([...docTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDocTags(docTags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
      if (docTitle === '' || docTitle === 'Đề cương ôn tập Sinh học 10 học kỳ 2') {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
      if (docTitle === '' || docTitle === 'Đề cương ôn tập Sinh học 10 học kỳ 2') {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
      }
    }
  };

  // Helper to update fields in the JSON string dynamically
  const updateJsonField = (key: string, value: any) => {
    try {
      const data = JSON.parse(examJsonCode);
      if (!data.info) data.info = {};
      data.info[key] = value;
      setExamJsonCode(JSON.stringify(data, null, 2));
    } catch (e) {
      // If JSON is currently invalid, ignore
    }
  };

  // Helper to convert text to URL-friendly Vietnamese slug
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Preview simulator visibility and viewport mode
  const [showPreview, setShowPreview] = useState(true);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  
  // Sidebar expansion states
  const [ch1Expanded, setCh1Expanded] = useState(true);
  const [selectedPage, setSelectedPage] = useState<'water' | 'macromolecules'>('water');

  // Editor states
  const [ch1Title, setCh1Title] = useState('1. Nguyên tố hóa học và Nước');
  const [ch1Text, setCh1Text] = useState(
    'Có khoảng 25 nguyên tố cần thiết cấu tạo nên cơ thể sống. Đại lượng carbon là nguyên tố cốt lõi vì cấu tạo liên kết hóa học đa dạng. Nước đóng vai trò dung môi hòa tan, môi trường phản ứng sinh hóa, giúp điều hòa nhiệt độ tế bào.'
  );
  const [ch1Callout, setCh1Callout] = useState(
    'Chiếm khoảng 70 - 90% khối lượng tế bào, tham gia vào hầu hết các quá trình sinh học quan trọng.'
  );

  const [ch2Title, setCh2Title] = useState('2. Các đại phân tử hữu cơ');
  const [ch2Text, setCh2Text] = useState('Tế bào gồm 4 nhóm đại phân tử chính:');
  const [ch2List, setCh2List] = useState([
    { id: 1, label: 'Carbohydrate (Đường): cung cấp năng lượng và cấu trúc thành tế bào.', color: 'bg-emerald-50 text-emerald-600', icon: '⚡' },
    { id: 2, label: 'Lipid (Chất béo): dự trữ năng lượng dài hạn, cấu tạo màng sinh chất.', color: 'bg-amber-50 text-amber-600', icon: '💧' },
    { id: 3, label: 'Protein: đảm nhiệm mọi chức năng sống (xúc tác, vận chuyển, cấu trúc).', color: 'bg-rose-50 text-rose-600', icon: '🧬' },
    { id: 4, label: 'Axit nucleic (DNA, RNA): lưu trữ và truyền đạt thông tin di truyền.', color: 'bg-purple-50 text-purple-600', icon: '🧬' }
  ]);

  const handleUpdateListLabel = (id: number, val: string) => {
    setCh2List(prev => prev.map(item => item.id === id ? { ...item, label: val } : item));
  };

  const handlePublish = () => {
    alert('Đăng tải tài liệu thành công!');
    setMode('dashboard');
  };

  if (mode === 'editor') {
    return (
      <div className="w-full flex flex-col h-screen bg-[#F8FAFC] select-none text-text-primary overflow-hidden font-sans animate-fadeIn">
        
        {/* ========================================== */}
        {/* TOP BAR                                    */}
        {/* ========================================== */}
        <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Back Button */}
            <button 
              onClick={() => setMode('dashboard')}
              className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              <ChevronLeft size={18} className="stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-xs font-black text-[#1E293B] truncate max-w-sm sm:max-w-md">
                Tóm tắt lý thuyết Sinh học 10 học kỳ 2 - Đề cương ôn tập
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-primary text-[8px] font-extrabold uppercase">Sinh học</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-extrabold uppercase">Lớp 10</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-extrabold uppercase">Tài liệu lý thuyết</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-extrabold uppercase">Nháp</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto save note */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              Đã lưu 10:30:45
            </div>

            {/* Toggle edit modes */}
            <div className="flex items-center gap-0.5 bg-slate-55 border border-slate-100 rounded-xl p-0.5 text-[10px] font-black text-slate-500">
              <button className="px-3 py-1 bg-white text-primary rounded-lg shadow-sm font-black">Soạn thảo</button>
              <button className="px-3 py-1 hover:text-slate-800 transition rounded-lg">Xem trước</button>
              <button className="px-3 py-1 hover:text-slate-800 transition rounded-lg">Responsive</button>
            </div>

            {/* Actions buttons */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer">
                <Save size={12} /> Lưu
              </button>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                  showPreview 
                    ? 'bg-primary-light border-primary/20 text-primary hover:bg-primary-light/80' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Eye size={12} /> Preview
              </button>
              <button 
                onClick={handlePublish}
                className="px-3 py-1.5 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100"
              >
                <Send size={12} /> Publish
              </button>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* MAIN BODY LAYOUT (Left, Center, Right)    */}
        {/* ========================================== */}
        <div className="flex-1 flex overflow-hidden w-full">
          
          {/* 1. LEFT SIDEBAR: Document Structure */}
          <aside className="w-56 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Cấu trúc tài liệu</span>
                <button className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer">
                  <Plus size={12} />
                </button>
              </div>

              {/* Folder list */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-text-primary">
                  <FolderOpen size={14} className="text-primary" />
                  <span>Sinh học 10</span>
                </div>

                <div className="pl-2 space-y-1.5">
                  {/* Chapter 1 */}
                  <div className="space-y-1">
                    <button 
                      onClick={() => setCh1Expanded(!ch1Expanded)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-text-secondary hover:text-text-primary text-left py-1"
                    >
                      <span className="truncate">Chương I. Thành phần hóa học...</span>
                      <ChevronDown size={12} className={`transition ${ch1Expanded ? '' : '-rotate-90'}`} />
                    </button>

                    {ch1Expanded && (
                      <div className="pl-3.5 border-l border-slate-100 space-y-1 pt-0.5">
                        <button 
                          onClick={() => setSelectedPage('water')}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition ${
                            selectedPage === 'water' 
                              ? 'bg-primary-light text-primary' 
                              : 'text-text-secondary hover:bg-slate-50'
                          }`}
                        >
                          <FileCode2 size={12} />
                          <span className="truncate">1. Nguyên tố hóa & Nước</span>
                        </button>

                        <button 
                          onClick={() => setSelectedPage('macromolecules')}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition ${
                            selectedPage === 'macromolecules' 
                              ? 'bg-primary-light text-primary' 
                              : 'text-text-secondary hover:bg-slate-50'
                          }`}
                        >
                          <FileCode2 size={12} />
                          <span className="truncate">2. Các đại phân tử hữu cơ</span>
                        </button>

                        <button className="w-full text-left px-2 py-1.5 text-text-secondary hover:bg-slate-50 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition">
                          <FileCode2 size={12} />
                          <span className="truncate">3. Enzyme và vai trò</span>
                        </button>

                        <button className="w-full text-left px-2 py-1.5 text-text-secondary hover:bg-slate-50 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition">
                          <FileCode2 size={12} />
                          <span className="truncate">4. Vitamin và khoáng chất</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Collapsed chapters */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary py-1 cursor-pointer hover:text-text-primary">
                    <span className="truncate">Chương II. Cấu trúc tế bào</span>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary py-1 cursor-pointer hover:text-text-primary">
                    <span className="truncate">Chương III. Chuyển hóa vật chất...</span>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary py-1 cursor-pointer hover:text-text-primary">
                    <span className="truncate">Chương IV. Sinh trưởng và phát...</span>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Add Chapter button */}
            <button className="w-full py-2 border border-dashed border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition rounded-xl text-[10px] font-black cursor-pointer">
              + Thêm chương
            </button>
          </aside>

          {/* 2. CENTER PANEL: Rich Editor Workspace */}
          <main className="flex-1 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
            
            {/* Rich Editor Toolbar */}
            <div className="h-11 border-b border-slate-100 px-4 flex items-center gap-1 overflow-x-auto shrink-0 select-none bg-slate-50/20">
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><RotateCcw size={13} /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition rotate-180"><RotateCcw size={13} /></button>
              
              <div className="h-4 w-px bg-slate-200 mx-1.5" />
              
              <button className="px-2 py-1 text-[10px] font-black text-slate-600 hover:bg-slate-100 rounded transition">H2 ▾</button>
              
              <div className="h-4 w-px bg-slate-200 mx-1.5" />

              <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Bold size={13} /></button>
              <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Italic size={13} /></button>
              <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Underline size={13} /></button>
              <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Type size={13} /></button>
              
              <div className="h-4 w-px bg-slate-200 mx-1.5" />

              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><AlignLeft size={13} /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><List size={13} /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><ListOrdered size={13} /></button>
              
              <div className="h-4 w-px bg-slate-200 mx-1.5" />

              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><Activity size={13} /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><ImageIcon size={13} /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><Table size={13} /></button>
              
              <div className="h-4 w-px bg-slate-200 mx-1.5" />

              <button 
                onClick={() => {
                  if (selectedPage === 'water') {
                    setCh1Text(ch1Text + ' Nước đóng vai trò là một dung môi vạn năng.');
                  } else {
                    setCh2Text(ch2Text + ' Hãy chú ý đến cấu trúc đặc biệt của mỗi nhóm đại phân tử.');
                  }
                }}
                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[9px] font-black rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer"
              >
                <Sparkles size={11} /> AI Gợi ý
              </button>
            </div>

            {/* Editable Content */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              {selectedPage === 'water' ? (
                <>
                  {/* Title */}
                  <input 
                    type="text"
                    value={ch1Title}
                    onChange={e => setCh1Title(e.target.value)}
                    className="w-full text-xl font-black text-primary border-none outline-none focus:ring-0 p-0 font-sans tracking-tight"
                  />
                  
                  {/* Paragraph */}
                  <textarea
                    rows={4}
                    value={ch1Text}
                    onChange={e => setCh1Text(e.target.value)}
                    className="w-full text-xs text-text-secondary border-none outline-none focus:ring-0 p-0 font-sans resize-none leading-relaxed"
                  />

                  {/* Callout box */}
                  <div className="p-4 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-2xl flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shadow-indigo-100/30 shrink-0 text-primary">
                      <span>💧</span>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="text-[10px] font-black text-primary uppercase">Nước trong tế bào</div>
                      <textarea
                        rows={2}
                        value={ch1Callout}
                        onChange={e => setCh1Callout(e.target.value)}
                        className="w-full text-xs text-text-secondary border-none outline-none bg-transparent focus:ring-0 p-0 font-sans resize-none leading-relaxed font-bold"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Title */}
                  <input 
                    type="text"
                    value={ch2Title}
                    onChange={e => setCh2Title(e.target.value)}
                    className="w-full text-xl font-black text-primary border-none outline-none focus:ring-0 p-0 font-sans tracking-tight"
                  />

                  {/* Intro */}
                  <textarea
                    rows={2}
                    value={ch2Text}
                    onChange={e => setCh2Text(e.target.value)}
                    className="w-full text-xs text-text-secondary border-none outline-none focus:ring-0 p-0 font-sans resize-none leading-relaxed"
                  />

                  {/* Structured List Inputs */}
                  <div className="space-y-3">
                    {ch2List.map((item) => (
                      <div key={item.id} className="p-4 border border-slate-100 rounded-2xl flex gap-3.5 items-center bg-white shadow-sm">
                        <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                          {item.icon}
                        </div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateListLabel(item.id, e.target.value)}
                          className="flex-1 text-xs font-bold text-text-primary border-none outline-none bg-transparent focus:ring-0 p-0 font-sans"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bottom editor hint bar */}
            <div className="h-8 border-t border-slate-50 px-6 flex items-center text-[10px] text-slate-400 font-bold select-none bg-white">
              Chọn / để chèn block hoặc @ để gợi ý AI
            </div>
          </main>

          {/* 3. RIGHT SIDEBAR: Live Student Preview Simulator */}
          {showPreview && (
            <aside className="w-[460px] bg-[#F8FAFC] border-r border-slate-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
            
            {/* Preview Simulator Header */}
            <div className="h-11 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white">
              <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Preview (Giao diện học sinh)</span>
              
              {/* Responsive viewport selector */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button 
                  onClick={() => setViewport('desktop')}
                  className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'desktop' ? 'bg-slate-100 text-primary' : ''}`}
                >
                  <Laptop size={12} />
                </button>
                <button 
                  onClick={() => setViewport('tablet')}
                  className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'tablet' ? 'bg-slate-100 text-primary' : ''}`}
                >
                  <TabletIcon size={12} />
                </button>
                <button 
                  onClick={() => setViewport('mobile')}
                  className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'mobile' ? 'bg-slate-100 text-primary' : ''}`}
                >
                  <Smartphone size={12} />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-0.5" />
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            {/* Preview Frame Container */}
            <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-slate-100/50">
              
              {/* Virtual Frame Simulator */}
              <div 
                className={`bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5 font-sans h-fit transition-all duration-300 ${
                  viewport === 'desktop' 
                    ? 'w-full' 
                    : viewport === 'tablet' 
                      ? 'w-[390px]' 
                      : 'w-[310px]'
                }`}
              >
                {/* Header Tag inside simulator */}
                <div className="inline-block px-2.5 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded mb-4">
                  Chương I
                </div>
                <h3 className="text-xs font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
                  Thành phần hóa học của tế bào
                </h3>

                {/* Simulated live page text */}
                <div className="space-y-4 text-[10px] leading-relaxed text-[#475569]">
                  {selectedPage === 'water' ? (
                    <>
                      <h4 className="text-[11px] font-black text-primary leading-tight">
                        {ch1Title}
                      </h4>
                      <p className="text-text-secondary leading-relaxed font-bold">
                        {ch1Text}
                      </p>
                      
                      {/* Callout box inside simulator */}
                      <div className="p-3 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-xl flex gap-2.5 items-center">
                        <span className="text-xs">💧</span>
                        <div className="flex-1 leading-normal text-text-secondary font-black">
                          {ch1Callout}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="text-[11px] font-black text-primary leading-tight">
                        {ch2Title}
                      </h4>
                      <p className="text-text-secondary leading-relaxed font-bold">
                        {ch2Text}
                      </p>

                      {/* List items inside simulator */}
                      <div className="space-y-2">
                        {ch2List.map(item => (
                          <div key={item.id} className="p-2 border border-slate-100 rounded-xl flex gap-2 items-center bg-[#FAF9FF] shadow-sm">
                            <span className="text-xs shrink-0">{item.icon}</span>
                            <span className="text-[9px] font-black text-text-secondary leading-normal">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </aside>
          )}

          {/* 4. FAR-RIGHT NARROW TOOLBAR */}
          <aside className="w-16 bg-white border-l border-slate-100 flex flex-col items-center py-4 justify-between shrink-0 select-none overflow-y-auto">
            <div className="w-full space-y-4 flex flex-col items-center">
              {[
                { icon: <FileCheck2 size={16} />, label: 'Block' },
                { icon: <Brain size={16} />, label: 'AI' },
                { icon: <ImageIcon size={16} />, label: 'Ảnh' },
                { icon: <Table size={16} />, label: 'Bảng' },
                { icon: <Activity size={16} />, label: 'Công thức' },
                { icon: <QuizIcon size={16} />, label: 'Quiz' },
                { icon: <Award size={16} />, label: 'Flashcard' },
                { icon: <FolderOpen size={16} />, label: 'Mindmap' },
                { icon: <Video size={16} />, label: 'Media' },
                { icon: <HelpCircle size={16} />, label: 'Khác' },
              ].map((tool, i) => (
                <button 
                  key={i} 
                  className="w-12 h-12 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer select-none"
                >
                  {tool.icon}
                  <span className="text-[7px] font-bold mt-1 text-slate-500">{tool.label}</span>
                </button>
              ))}
            </div>
          </aside>

        </div>

        {/* ========================================== */}
        {/* FOOTER STATUS BAR                          */}
        {/* ========================================== */}
        <footer className="h-8 bg-white border-t border-slate-100 px-4 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wide shrink-0">
          <div className="flex items-center gap-6">
            <span>Tổng số block: <strong>48</strong></span>
            <span>Số chữ: <strong>2,450</strong></span>
            <span>Số công thức: <strong>12</strong></span>
            <span>Số hình ảnh: <strong>8</strong></span>
          </div>

          <div>Lần sửa cuối: 10:30 30/05/2024</div>

          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
            Tự động lưu
          </div>
        </footer>

      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <div className="w-full min-h-screen bg-bg-base select-none text-text-primary font-sans animate-fadeIn flex flex-col pb-12">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <h1 className="text-lg font-black text-text-primary">
              Tải file tài liệu lên
            </h1>
            <p className="text-xs text-[#7E8B9B] font-bold mt-1">
              Tải lên tài liệu để chia sẻ với học sinh và cộng đồng Onmi Exam.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMode('dashboard')}
              className="px-5 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={() => {
                alert('Tải lên và lưu tài liệu thành công!');
                setMode('dashboard');
              }}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100"
            >
              <Upload size={14} /> Tải lên và lưu
            </button>
          </div>
        </header>

        {/* Content Layout */}
        <div className="max-w-[1400px] mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI (60% width on desktop) */}
          <div className="w-full lg:w-[55%] space-y-6">
            
            {/* 1. TẢI FILE TÀI LIỆU */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-text-primary flex items-center gap-2">
                1. Tải file tài liệu
              </h2>
              
              {/* Drag drop zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-100 hover:border-primary/40 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-primary-light/10 transition cursor-pointer group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.docx,.doc,.pptx,.zip"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm shadow-indigo-100/50">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-black text-text-primary text-center">
                  Kéo thả file vào đây
                </p>
                <p className="text-[10px] text-[#7E8B9B] font-bold text-center mt-1">
                  hoặc
                </p>
                <span className="mt-2.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-black rounded-xl transition cursor-pointer shadow-sm">
                  Chọn file từ máy tính
                </span>
                <p className="text-[9px] text-slate-400 font-bold text-center mt-3">
                  Hỗ trợ: PDF, DOCX, DOC, PPTX, ZIP (tối đa 50MB)
                </p>
              </div>

              {/* Uploaded file indicator */}
              {uploadedFile ? (
                <div className="p-3 border border-emerald-100 bg-emerald-50/20 rounded-2xl flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex flex-col items-center justify-center text-[9px] font-black font-sans shrink-0">
                      <File size={16} className="stroke-[2.5]" />
                      <span className="-mt-0.5">PDF</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-text-primary truncate max-w-[200px] sm:max-w-md">
                        {uploadedFile.name}
                      </h4>
                      <p className="text-[9px] text-[#7E8B9B] font-bold mt-0.5">
                        {uploadedFile.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                    >
                      <X size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-text-muted font-bold">
                  Chưa có file nào được chọn. Hãy chọn một file tài liệu.
                </div>
              )}
            </div>

            {/* 2. THÔNG TIN TÀI LIỆU */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-text-primary">
                2. Thông tin tài liệu
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên tài liệu */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Tên tài liệu <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="text-xs font-bold text-text-primary"
                    placeholder="Nhập tên tài liệu..."
                  />
                </div>

                {/* Loại tài liệu */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Loại tài liệu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                    >
                      <option value="Tài liệu đề thi">Tài liệu đề thi</option>
                      <option value="Tài liệu lý thuyết">Tài liệu lý thuyết</option>
                      <option value="Sổ tay công thức">Sổ tay công thức</option>
                      <option value="Khác">Khác</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Môn học */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={docSubject}
                      onChange={(e) => setDocSubject(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                    >
                      <option value="Sinh học">Sinh học</option>
                      <option value="Toán học">Toán học</option>
                      <option value="Vật lý">Vật lý</option>
                      <option value="Hóa học">Hóa học</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Học kỳ */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Học kỳ
                  </label>
                  <div className="relative">
                    <select 
                      value={docSemester}
                      onChange={(e) => setDocSemester(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                    >
                      <option value="Học kỳ 1">Học kỳ 1</option>
                      <option value="Học kỳ 2">Học kỳ 2</option>
                      <option value="Cả năm">Cả năm</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Lớp */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Lớp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={docClass}
                      onChange={(e) => setDocClass(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                    >
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Có lời giải Toggle */}
                <div className="sm:col-span-2 flex items-center justify-between py-2 border-t border-slate-50 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-text-primary">Có lời giải</span>
                    <span className="cursor-help" title="Tài liệu đính kèm có chứa hướng dẫn giải chi tiết">
                      <HelpCircle size={14} className="text-slate-400" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {hasSolution ? 'Có' : 'Không'}
                    </span>
                    <button 
                      onClick={() => setHasSolution(!hasSolution)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer outline-none ${
                        hasSolution ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          hasSolution ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. THÔNG TIN BỔ SUNG */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-text-primary">
                3. Thông tin bổ sung <span className="text-slate-400 font-bold text-xs">(không bắt buộc)</span>
              </h2>

              <div className="space-y-4">
                {/* Mô tả */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Mô tả tài liệu
                  </label>
                  <textarea 
                    rows={4}
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    className="w-full p-3.5 border border-[#E2E8F0] rounded-xl text-xs font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none outline-none"
                    placeholder="Nhập mô tả về tài liệu..."
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Tags
                  </label>
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="text-xs font-bold text-text-primary"
                    placeholder="Thêm tag và nhấn Enter"
                  />
                  
                  {/* Tag display list */}
                  {docTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {docTags.map((tag) => (
                        <span 
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X size={10} className="stroke-[2.5]" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (45% width on desktop) */}
          <div className="w-full lg:w-[45%]">
            
            {/* 4. XEM TRƯỚC FILE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col h-full min-h-[600px]">
              <h2 className="text-sm font-black text-text-primary">
                4. Xem trước file
              </h2>

              {uploadedFile ? (
                <div className="flex-1 flex flex-col space-y-4">
                  {/* File header status */}
                  <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex flex-col items-center justify-center text-[7px] font-black font-sans shrink-0">
                        <File size={12} className="stroke-[2.5]" />
                        <span className="-mt-0.5">PDF</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-black text-text-primary truncate max-w-[140px] sm:max-w-xs">
                          {uploadedFile.name}
                        </h4>
                        <p className="text-[9px] text-[#7E8B9B] font-bold mt-0.5">
                          {uploadedFile.size}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Đang tải file gốc...')}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Download size={12} /> Tải file gốc
                    </button>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between px-2 select-none">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                        disabled={previewPage <= 1}
                        className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded transition cursor-pointer text-slate-600"
                      >
                        <ChevronLeft size={16} className="stroke-[2.5]" />
                      </button>
                      <span className="text-xs font-bold text-slate-700 px-2 min-w-16 text-center font-sans">
                        {previewPage} / 32
                      </span>
                      <button 
                        onClick={() => setPreviewPage(p => Math.min(32, p + 1))}
                        disabled={previewPage >= 32}
                        className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded transition cursor-pointer text-slate-600"
                      >
                        <ChevronRight size={16} className="stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 font-sans">
                      <button 
                        onClick={() => setPreviewZoom(z => Math.max(50, z - 10))}
                        className="w-6 h-6 hover:bg-slate-100 rounded-lg text-xs font-black text-slate-500 flex items-center justify-center transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-black text-slate-600 min-w-10 text-center">
                        {previewZoom}%
                      </span>
                      <button 
                        onClick={() => setPreviewZoom(z => Math.min(200, z + 10))}
                        className="w-6 h-6 hover:bg-slate-100 rounded-lg text-xs font-black text-slate-500 flex items-center justify-center transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Mock Paper View */}
                  <div className="flex-1 bg-slate-100/40 border border-slate-200/50 rounded-2xl p-4 overflow-auto flex justify-center items-start min-h-[450px]">
                    <div 
                      style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                      className="bg-white border border-slate-200/50 p-6 shadow-sm w-full max-w-[500px] text-text-primary text-[10px] leading-relaxed select-text space-y-4 font-serif transition-transform duration-100"
                    >
                      {/* Document Header */}
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3 font-sans">
                        <div className="space-y-0.5 font-bold uppercase tracking-tight text-[#1F2C3F] text-[8px]">
                          <div>SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
                          <div>TRƯỜNG THPT CHUYÊN LÊ HỒNG PHONG</div>
                        </div>
                        <div className="text-right space-y-0.5 font-bold uppercase tracking-tight text-[#1F2C3F] text-[8px]">
                          <div>ĐỀ KHẢO SÁT CHẤT LƯỢNG LỚP 12</div>
                          <div>MÔN: TOÁN HỌC - GIẢI TÍCH</div>
                          <div className="inline-block border border-slate-800 px-1 py-0.2 mt-0.5 font-sans font-black text-[7px]">
                            MÃ ĐỀ: 101
                          </div>
                        </div>
                      </div>

                      <div className="text-center font-bold italic mt-1 text-slate-600 font-sans text-[8px]">
                        (Đề thi gồm 06 trang)
                      </div>

                      {/* Part 1 */}
                      <div className="space-y-3 font-sans text-[9px]">
                        <div className="font-bold text-[#1E293B] text-[9.5px]">
                          PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN.
                        </div>

                        {/* Question 1 */}
                        <div className="space-y-1.5">
                          <div>
                            <span className="font-bold">Câu 1.</span> Cho hàm số f(x) = x³ - 3x². Đạo hàm f'(x) bằng:
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-slate-700 font-medium pl-2">
                            <div>A. 3x² - 6x.</div>
                            <div>B. x² - 6x.</div>
                            <div>C. 3x² - 3x.</div>
                            <div>D. x³ - 6x.</div>
                          </div>
                        </div>

                        {/* Question 2 */}
                        <div className="space-y-3">
                          <div>
                            <span className="font-bold">Câu 2.</span> Cho khối chóp S.ABC có đáy ABC là tam giác đều cạnh a. SA vuông góc với đáy và SA = a√2. Thể tích khối chóp bằng:
                          </div>

                          {/* Geometry SVG diagram */}
                          <div className="flex justify-center py-2 bg-slate-50/50 rounded-xl border border-slate-100">
                            <svg width="220" height="150" viewBox="0 0 220 150" className="overflow-visible select-none">
                              {/* Hidden/Dashed Line AC */}
                              <line x1="40" y1="120" x2="180" y2="120" stroke="#64748B" strokeWidth="1.2" strokeDasharray="4 3" />
                              
                              {/* Dashed Line SA */}
                              <line x1="40" y1="20" x2="40" y2="120" stroke="#64748B" strokeWidth="1.2" strokeDasharray="4 3" />

                              {/* Solid line AB */}
                              <line x1="40" y1="120" x2="110" y2="140" stroke="#1E293B" strokeWidth="1.5" />
                              
                              {/* Solid line BC */}
                              <line x1="110" y1="140" x2="180" y2="120" stroke="#1E293B" strokeWidth="1.5" />

                              {/* Solid Line SB */}
                              <line x1="40" y1="20" x2="110" y2="140" stroke="#1E293B" strokeWidth="1.5" />

                              {/* Solid Line SC */}
                              <line x1="40" y1="20" x2="180" y2="120" stroke="#1E293B" strokeWidth="1.5" />

                              {/* Right-angle indicator at A for SA perpendicular to base */}
                              <path d="M 40,110 L 48,110 L 48,120" fill="none" stroke="#64748B" strokeWidth="0.8" />
                              <path d="M 40,114 L 45,116 L 45,122" fill="none" stroke="#64748B" strokeWidth="0.8" strokeDasharray="1 1" />

                              {/* Vertex Labels */}
                              {/* S */}
                              <text x="35" y="15" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">S</text>
                              {/* A */}
                              <text x="25" y="125" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">A</text>
                              {/* B */}
                              <text x="108" y="152" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">B</text>
                              {/* C */}
                              <text x="186" y="125" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">C</text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                    <File size={20} />
                  </div>
                  <p className="text-xs font-bold text-text-secondary max-w-[200px]">
                    Hãy tải lên một file tài liệu để xem trước nội dung hiển thị tại đây.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (mode === 'exam-editor') {
    // Parse the JSON code
    let parsedData: any = null;
    let parseError: string | null = null;
    try {
      parsedData = JSON.parse(examJsonCode);
    } catch (e: any) {
      parseError = e.message;
    }

    const previewQuestions = parsedData?.questions || [
      {
        id: 1,
        question: "Phát biểu nào sau đây đúng về nước?",
        options: [
          { key: "A", content: "Nước là dung môi phân cực cực tốt" },
          { key: "B", content: "Nước không tham gia phản ứng sinh hóa" },
          { key: "C", content: "Nước được cấu tạo từ 3 nguyên tử H và 1 nguyên tử O" },
          { key: "D", content: "Nước không có khả năng điều hòa nhiệt độ" }
        ],
        answer: "A",
        explanation: "Nước là dung môi phân cực cực tốt nên hòa tan được nhiều chất phân cực trong tế bào.",
        level: "easy",
        tags: ["nước", "thành phần hóa học"]
      },
      {
        id: 2,
        question: "Cho hình vẽ cấu trúc của phân tử nước. Góc liên kết H-O-H là bao nhiêu?",
        options: [
          { key: "A", content: "104.5°" },
          { key: "B", content: "90°" },
          { key: "C", content: "120°" },
          { key: "D", content: "180°" }
        ],
        answer: "A",
        explanation: "Do 2 cặp electron tự do trên nguyên tử O đẩy nhau làm góc liên kết nhỏ hơn 109.5°, giá trị thực tế là 104.5°.",
        level: "medium",
        tags: ["nước", "cấu trúc"]
      }
    ];

    const infoMeta = parsedData?.info || {
      title: 'Đề cương ôn tập Sinh học 10 học kỳ 2',
      subject: "Sinh học",
      grade: 10,
      time: 90,
      totalQuestion: 50,
      type: "trac_nghiem"
    };

    const codeLines = examJsonCode.split('\n');

    const handleCheckCode = () => {
      try {
        JSON.parse(examJsonCode);
        alert('Cú pháp JSON hoàn toàn hợp lệ!');
      } catch (e: any) {
        alert('Lỗi cú pháp JSON: ' + e.message);
      }
    };

    const handleSaveExam = () => {
      alert('Đã lưu nháp đề thi thành công!');
    };

    const handlePublishExam = () => {
      alert('Đăng tải đề thi thành công!');
      setMode('dashboard');
    };

    const questionsList = Array.from({ length: 12 }, (_, i) => i + 1);
    const filteredQuestions = questionsList.filter(qNum => 
      examSearchQuery === '' || `Câu ${qNum}`.toLowerCase().includes(examSearchQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex overflow-hidden font-sans text-text-primary select-none animate-fadeIn">
        {/* ========================================== */}
        {/* LEFT SIDEBAR: Created Exam Outline         */}
        {/* ========================================== */}
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-5 flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm">
                O
              </div>
              <span className="font-black text-sm tracking-tight text-[#1E293B]">Onmi <span className="text-primary">EXAM</span></span>
            </div>

            {/* Back Button */}
            <button 
              onClick={() => setMode('dashboard')}
              className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft size={16} /> Quay lại
            </button>

            {/* Tạo đề thi menu */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider px-2">Tạo đề thi</div>
              <button 
                onClick={() => setExamSubView('edit')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${
                  examSubView === 'edit' 
                    ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]' 
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                }`}
              >
                <Edit size={16} />
                <span>Soạn đề</span>
              </button>
              <button 
                onClick={() => setExamSubView('config')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${
                  examSubView === 'config' 
                    ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]' 
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                }`}
              >
                <Settings size={16} />
                <span>Cấu hình đề thi</span>
              </button>
              <button 
                onClick={() => setExamSubView('publish')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${
                  examSubView === 'publish' 
                    ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]' 
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                }`}
              >
                <FileCheck2 size={16} />
                <span>Xem và xuất bản</span>
              </button>
            </div>

            {/* Danh sách câu hỏi */}
            {examSubView === 'edit' && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider px-2">Danh sách câu hỏi</div>
                
                {/* Search */}
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Tìm câu hỏi..."
                    value={examSearchQuery}
                    onChange={(e) => setExamSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-text-primary outline-none focus:bg-white focus:border-primary transition"
                  />
                  <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Question list items */}
                <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                  {filteredQuestions.map((qNum) => {
                    const isSelected = selectedQuestionId === qNum;
                    return (
                      <div 
                        key={qNum}
                        onClick={() => setSelectedQuestionId(qNum)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition ${
                          isSelected 
                            ? 'bg-slate-50 text-primary border border-slate-100' 
                            : 'text-text-secondary hover:bg-slate-50/55 hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-success'}`} />
                          <span>Câu {qNum}</span>
                        </div>
                        <GripVertical size={12} className="text-slate-300" />
                      </div>
                    );
                  })}
                </div>

                {/* Add question button */}
                <button className="w-full py-2 border border-dashed border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition rounded-xl text-[10px] font-black cursor-pointer">
                  + Thêm câu hỏi
                </button>
              </div>
            )}
          </div>

          {/* User profile footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                QB
              </div>
              <div>
                <p className="text-xs font-black text-text-primary">Quang Bình</p>
                <span className="inline-block px-1.5 py-0.2 mt-0.5 rounded bg-purple-50 text-primary border border-purple-100 text-[8px] font-extrabold uppercase">PRO</span>
              </div>
            </div>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
              <Settings size={14} />
            </button>
          </div>
        </aside>

        {/* ========================================== */}
        {/* MAIN WORKSPACE AREA                        */}
        {/* ========================================== */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black text-[#1E293B] truncate max-w-xs sm:max-w-md">
                  Tạo đề: {infoMeta.title}
                </h1>
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer font-sans">
                  <Edit size={12} />
                </button>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-sans">
                <Cloud size={14} className="stroke-[2.5]" />
                <span>Chưa lưu</span>
              </div>
            </div>

            {/* Actions buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveExam}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
              >
                <Save size={12} /> Lưu
              </button>
              <button 
                onClick={() => setExamSubView('edit')}
                className={`px-3.5 py-1.5 border text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                  examSubView === 'edit' 
                    ? 'bg-primary-light border-primary/20 text-primary hover:bg-primary-light/80' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Eye size={12} /> Xem thử đề
              </button>
              <button 
                onClick={() => setExamSubView('config')}
                className={`px-3.5 py-1.5 border text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                  examSubView === 'config' 
                    ? 'bg-primary-light border-primary/20 text-primary hover:bg-primary-light/80' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings size={12} /> Cấu hình đề thi
              </button>
              <button 
                onClick={examSubView === 'publish' ? handlePublishExam : () => setExamSubView('publish')}
                className={`px-3.5 py-1.5 text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100 ${
                  examSubView === 'publish'
                    ? 'bg-primary-hover text-white'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                <Send size={12} /> Xuất bản
              </button>
            </div>
          </header>

          {/* Sub-header Tab Bar */}
          <div className="h-12 bg-white border-b border-slate-100 px-6 flex items-center gap-6 shrink-0 select-none z-10">
            <button 
              onClick={() => { setExamSubView('edit'); setExamTab('code'); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${
                examSubView === 'edit' && examTab === 'code' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Code size={14} /> Soạn bằng mã
            </button>
            <button 
              onClick={() => { setExamSubView('edit'); setExamTab('quick'); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${
                examSubView === 'edit' && examTab === 'quick' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Edit size={14} /> Soạn nhanh
            </button>
            <button 
              onClick={() => { setExamSubView('edit'); setExamTab('bank'); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${
                examSubView === 'edit' && examTab === 'bank' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Database size={14} /> Ngân hàng câu hỏi
            </button>
          </div>

          {/* Main workspace layout */}
          {examSubView === 'edit' && (
            <div className="flex-1 flex overflow-hidden animate-fadeIn">
              
              {/* LEFT COLUMN: Code Editor */}
              <div className="w-1/2 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
                <div className="h-10 px-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/20">
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">Soạn đề bằng mã</span>
                  <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 transition">
                    <HelpCircle size={12} /> Hướng dẫn
                  </button>
                </div>

                {/* Editor Workspace */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="flex font-mono text-[11px] bg-slate-50/70 border border-slate-100 rounded-2xl overflow-hidden min-h-[480px]">
                    {/* Line numbers */}
                    <div className="bg-slate-100/50 text-[#A3AED0] select-none text-right px-3 py-4 border-r border-slate-200/50 flex flex-col font-mono leading-[20px] tracking-wide shrink-0">
                      {codeLines.map((_, idx) => (
                        <span key={idx} className="min-w-6">{idx + 1}</span>
                      ))}
                    </div>

                    {/* Textarea */}
                    <textarea
                      value={examJsonCode}
                      onChange={(e) => setExamJsonCode(e.target.value)}
                      className="flex-1 p-4 bg-transparent outline-none border-none resize-none leading-[20px] font-mono text-slate-800 focus:ring-0 focus:outline-none"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Editor Footer Status */}
                <div className="h-11 border-t border-slate-50 px-4 flex items-center justify-between shrink-0 bg-white">
                  <button 
                    onClick={handleCheckCode}
                    className="px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-success text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans"
                  >
                    <Check size={12} /> Kiểm tra mã
                  </button>
                  
                  {parseError ? (
                    <span className="text-[10px] font-black text-red-500 truncate max-w-[200px] font-sans">
                      Lỗi cú pháp JSON!
                    </span>
                  ) : (
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold font-sans">
                      <span>{infoMeta.totalQuestion || 50} câu hỏi</span>
                      <span>{infoMeta.time || 90} phút</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-extrabold uppercase">Trắc nghiệm</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Live Preview */}
              <div className="w-1/2 bg-[#F8FAFC] flex flex-col overflow-hidden">
                <div className="h-10 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                  <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Xem trước đề thi</span>
                  
                  {/* Viewport controls */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1.5 rounded-lg transition ${viewportMode === 'desktop' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
                    >
                      <Laptop size={12} />
                    </button>
                    <button 
                      onClick={() => setViewportMode('tablet')}
                      className={`p-1.5 rounded-lg transition ${viewportMode === 'tablet' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
                    >
                      <TabletIcon size={12} />
                    </button>
                    <button 
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1.5 rounded-lg transition ${viewportMode === 'mobile' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
                    >
                      <Smartphone size={12} />
                    </button>
                    <div className="h-4 w-px bg-slate-200 mx-0.5" />
                    <button 
                      onClick={() => alert('Đang tải lại bản xem trước...')}
                      className="p-1.5 text-slate-400 hover:text-[#1E293B] rounded-lg transition"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>

                {/* Rendering Viewport */}
                <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-slate-100/40">
                  <div className={`bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm flex flex-col h-fit transition-all duration-300 ${
                    viewportMode === 'desktop' 
                      ? 'w-full max-w-[650px]' 
                      : viewportMode === 'tablet' 
                        ? 'w-[420px]' 
                        : 'w-[320px]'
                  }`}>
                    {/* Paper Header */}
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-xs font-black text-text-primary uppercase tracking-wide">
                        {infoMeta.title}
                      </h2>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mt-1.5 font-sans">
                        <span className="flex items-center gap-1">
                          <FileCode2 size={12} /> {infoMeta.totalQuestion || 50} câu hỏi
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle size={12} /> {infoMeta.time || 90} phút
                        </span>
                      </div>
                    </div>

                    {/* Questions List Render */}
                    <div className="space-y-6">
                      {previewQuestions.map((q: any, qIdx: number) => {
                        const isActive = selectedQuestionId === q.id;
                        return (
                          <div 
                            key={q.id || qIdx}
                            id={`q-${q.id}`}
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`p-4 border rounded-2xl transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'border-primary/20 bg-primary-light/10 shadow-sm' 
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="text-[11px] leading-relaxed">
                              <span className="font-black text-primary">Câu {q.id}.</span> {q.question}
                            </div>

                            {/* Water molecule SVG */}
                            {q.id === 2 && (
                              <div className="flex justify-center py-4 my-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible select-none">
                                  {/* Covalent bonds */}
                                  <line x1="110" y1="50" x2="60" y2="96" stroke="#1E293B" strokeWidth="2.5" />
                                  <line x1="110" y1="50" x2="160" y2="96" stroke="#1E293B" strokeWidth="2.5" />

                                  {/* Oxygen atom (O) */}
                                  <circle cx="110" cy="50" r="18" fill="white" stroke="#6C5DD3" strokeWidth="2.5" />
                                  <text x="110" y="54" textAnchor="middle" fontSize="12" fontWeight="black" fill="#6C5DD3" fontFamily="sans-serif">O</text>

                                  {/* Hydrogen atom left (H) */}
                                  <circle cx="60" cy="96" r="12" fill="white" stroke="#1E293B" strokeWidth="2" />
                                  <text x="60" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">H</text>

                                  {/* Hydrogen atom right (H) */}
                                  <circle cx="160" cy="96" r="12" fill="white" stroke="#1E293B" strokeWidth="2" />
                                  <text x="160" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">H</text>

                                  {/* Lone electron pairs (dots) */}
                                  <circle cx="102" cy="26" r="2.2" fill="#6C5DD3" />
                                  <circle cx="108" cy="22" r="2.2" fill="#6C5DD3" />

                                  <circle cx="118" cy="22" r="2.2" fill="#6C5DD3" />
                                  <circle cx="124" cy="26" r="2.2" fill="#6C5DD3" />

                                  {/* Angle indicator curve and text label */}
                                  <path d="M 98,62 A 16,16 0 0,0 122,62" fill="none" stroke="#6C5DD3" strokeWidth="1" strokeDasharray="2 1.5" />
                                  <text x="110" y="78" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6C5DD3" fontFamily="sans-serif">104.5°</text>
                                </svg>
                              </div>
                            )}

                            {/* Options grid */}
                            <div className={`mt-3 space-y-2 font-sans ${q.id === 2 ? 'grid grid-cols-2 gap-3 space-y-0' : ''}`}>
                              {q.options?.map((opt: any) => {
                                const isChecked = q.answer === opt.key;
                                return (
                                  <div 
                                    key={opt.key}
                                    className={`p-2.5 border rounded-xl flex items-center gap-2.5 text-[10px] font-bold transition ${
                                      isChecked 
                                        ? 'border-primary/20 bg-primary-light/20 text-primary' 
                                        : 'border-slate-100 bg-white hover:bg-slate-50/50'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      isChecked ? 'border-primary bg-primary' : 'border-slate-300'
                                    }`}>
                                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span>
                                      <span className="text-slate-400 font-black">{opt.key}.</span> {opt.content}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation and difficulty */}
                            <div className="mt-4 p-3 bg-slate-50 border border-slate-100/50 rounded-xl space-y-1.5 text-[10px]">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-primary">Giải thích:</span>
                                <span className={`font-black text-[9px] ${q.level === 'easy' ? 'text-success' : 'text-amber-500'}`}>
                                  Độ khó: {q.level === 'easy' ? 'Dễ' : 'Trung bình'}
                                </span>
                              </div>
                              <p className="text-text-secondary leading-relaxed font-bold">
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Cấu hình đề thi */}
          {examSubView === 'config' && (
            <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
              <h2 className="text-sm font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-3 mb-6 font-sans">
                Cấu hình đề thi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form fields card */}
                <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-2 font-sans">Thông tin cơ bản</h3>
                  
                  {/* Tên đề thi */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                      Tên đề thi
                    </label>
                    <input 
                      type="text" 
                      value={infoMeta.title || ''}
                      onChange={(e) => updateJsonField('title', e.target.value)}
                      className="text-xs font-bold text-text-primary"
                      placeholder="Nhập tên đề thi..."
                    />
                  </div>

                  {/* Tên môn học */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                      Tên môn học
                    </label>
                    <div className="relative">
                      <select 
                        value={infoMeta.subject || 'Sinh học'}
                        onChange={(e) => updateJsonField('subject', e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                      >
                        <option value="Sinh học">Sinh học</option>
                        <option value="Toán học">Toán học</option>
                        <option value="Vật lý">Vật lý</option>
                        <option value="Hóa học">Hóa học</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Thời gian làm bài & Độ khó */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Thời gian */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                        Thời gian làm bài (phút)
                      </label>
                      <input 
                        type="number" 
                        value={infoMeta.time || 90}
                        onChange={(e) => updateJsonField('time', parseInt(e.target.value) || 0)}
                        className="text-xs font-bold text-text-primary"
                        placeholder="Nhập thời gian..."
                      />
                    </div>

                    {/* Độ khó */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                        Độ khó đề thi
                      </label>
                      <div className="relative">
                        <select 
                          value={infoMeta.level || 'trung_binh'}
                          onChange={(e) => updateJsonField('level', e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                        >
                          <option value="easy">Dễ (Easy)</option>
                          <option value="medium">Trung bình (Medium)</option>
                          <option value="hard">Khó (Hard)</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setExamSubView('edit')}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
                    >
                      Quay lại soạn đề
                    </button>
                  </div>
                </div>

                {/* Score Stats card */}
                <div className="bg-gradient-to-br from-primary to-[#8F85F3] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between h-fit min-h-[300px]">
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <Database size={22} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-black tracking-wider uppercase opacity-75">Thống kê điểm số</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">{previewQuestions.length}</span>
                        <span className="text-xs font-bold opacity-75">câu hỏi</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/20" />

                    <div className="space-y-1">
                      <span className="text-[10px] font-black tracking-wider uppercase opacity-75">Điểm mỗi câu</span>
                      <div className="text-lg font-black font-mono">
                        {(10 / previewQuestions.length).toFixed(2)} điểm
                      </div>
                      <p className="text-[9px] opacity-75 font-medium leading-relaxed pt-1 font-sans">
                        Hệ thống tự động phân chia đều điểm số của tất cả các câu hỏi trên thang điểm 10 chuẩn.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 text-[9px] font-extrabold uppercase bg-white/10 px-3.5 py-2 rounded-xl text-center backdrop-blur-sm mt-4">
                    Thang điểm: 10 • Điểm chuẩn hóa
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Xem và xuất bản */}
          {examSubView === 'publish' && (
            <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
              <h2 className="text-sm font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-3 mb-6 font-sans">
                Xem và xuất bản đề thi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Publish Info summary */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-[#10B981] uppercase tracking-wider">Đề thi sẵn sàng xuất bản</span>
                  </div>

                  <div className="space-y-3.5">
                    <h3 className="text-sm font-black text-text-primary leading-tight">
                      {infoMeta.title}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-text-secondary font-sans border-t border-b border-slate-50 py-3">
                      <div>Môn học: <span className="text-text-primary">{infoMeta.subject}</span></div>
                      <div>Khối lớp: <span className="text-text-primary">Khối {infoMeta.grade || 10}</span></div>
                      <div>Thời gian: <span className="text-text-primary">{infoMeta.time || 90} phút</span></div>
                      <div>Số câu hỏi: <span className="text-text-primary">{previewQuestions.length} câu</span></div>
                      <div>Độ khó: <span className="text-text-primary font-black uppercase text-primary text-[8px] px-1.5 py-0.5 rounded bg-primary-light border border-primary/10">{infoMeta.level === 'easy' ? 'Dễ' : infoMeta.level === 'hard' ? 'Khó' : 'Trung bình'}</span></div>
                      <div>Điểm mỗi câu: <span className="text-text-primary font-mono">{(10 / previewQuestions.length).toFixed(2)} đ</span></div>
                    </div>

                    <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                      Nhấp vào nút **Xuất bản** ở góc trên cùng bên phải để lưu tất cả dữ liệu đề thi lên máy chủ và kích hoạt liên kết cho học sinh tham gia kiểm tra.
                    </p>
                  </div>
                </div>

                {/* Share link card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between min-h-[250px]">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-primary flex items-center justify-center shadow-sm">
                      <Link size={18} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Đường liên kết tới đề thi</h4>
                      <p className="text-[10px] text-slate-400 font-bold leading-normal font-sans">
                        Học sinh có thể truy cập liên kết này để làm bài kiểm tra trực tuyến.
                      </p>
                    </div>

                    {/* Copy Link field container */}
                    <div className="flex gap-2 items-center bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                      <input 
                        type="text" 
                        readOnly
                        value={`http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`}
                        className="bg-transparent border-none text-[10px] font-mono text-primary font-bold focus:ring-0 p-0 flex-1 select-all cursor-text overflow-x-auto"
                      />
                      <button 
                        onClick={() => {
                          const linkText = `http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`;
                          navigator.clipboard.writeText(linkText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`p-2 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                          copied 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                            : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm'
                        }`}
                        title="Sao chép liên kết"
                      >
                        {copied ? <Check size={14} className="stroke-[2.5]" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a 
                      href={`http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100 font-sans"
                    >
                      <ExternalLink size={14} /> Mở liên kết đề thi
                    </a>
                  </div>
                </div>
              </div>

              {/* Copy toast indicator */}
              {copied && (
                <div className="fixed bottom-6 right-6 bg-[#10B981] text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-100/20 text-xs font-black flex items-center gap-2 animate-bounce z-50">
                  <CheckCircle2 size={16} className="stroke-[2.5]" />
                  <span>Đã sao chép liên kết vào bộ nhớ tạm!</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }




  // Dashboard landing view (2 primary action cards)
  return (
    <div className="w-full py-10 px-6 sm:px-10 lg:px-12 select-none min-h-[calc(100vh-4rem)] flex flex-col justify-center max-w-4xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex p-3.5 bg-primary-light text-primary rounded-3xl animate-bounce-subtle">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
          Khu vực Giáo viên
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary font-bold max-w-md mx-auto leading-relaxed">
          Không gian làm việc chuyên nghiệp dành cho Giáo viên. Lựa chọn các công cụ dưới đây để bắt đầu biên soạn nội dung.
        </p>
      </div>

      {/* Two Premium Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: Soạn tài liệu (Triggers selection modal) */}
        <div 
          onClick={() => setShowMethodModal(true)}
          className="bg-white border border-slate-100 hover:border-primary/20 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          {/* Subtle glow background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-[#8F85F3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Icon badge */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100/40 shrink-0 transition-transform duration-300 group-hover:scale-110">
              <BookOpen size={24} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#1E293B] group-hover:text-primary transition-colors">
                Soạn tài liệu
              </h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Tải lên và biên soạn tóm tắt lý thuyết, sổ tay giải nhanh, công thức trọng tâm hoặc sơ đồ tư duy cho các khối lớp học viên ôn tập.
              </p>
            </div>
          </div>

          <div className="pt-8 relative z-10 flex items-center justify-between">
            <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Bắt đầu soạn thảo <ChevronRight size={14} />
            </span>
          </div>
        </div>

        {/* Card 2: Soạn đề thi */}
        <div 
          onClick={() => setMode('exam-editor')}
          className="bg-white border border-slate-100 hover:border-primary/20 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          {/* Subtle glow background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-[#8F85F3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Icon badge */}
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-primary flex items-center justify-center shadow-md shadow-indigo-100/40 shrink-0 transition-transform duration-300 group-hover:scale-110">
              <FileText size={24} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#1E293B] group-hover:text-primary transition-colors">
                Soạn đề thi
              </h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Biên soạn ngân hàng câu hỏi trắc nghiệm, thiết kế đề thi thử THPT Quốc gia theo cấu trúc chuẩn của Bộ Giáo dục kèm lời giải và gợi ý chi tiết.
              </p>
            </div>
          </div>

          <div className="pt-8 relative z-10 flex items-center justify-between">
            <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Tạo đề thi mới <ChevronRight size={14} />
            </span>
          </div>
        </div>

      </div>

      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full mx-4 shadow-2xl border border-slate-100 relative animate-fadeIn">
            {/* Close button */}
            <button 
              onClick={() => setShowMethodModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-[#1E293B] mb-2 text-center">
              Chọn phương thức soạn thảo
            </h3>
            <p className="text-[11px] text-slate-500 font-bold text-center mb-6 max-w-sm mx-auto">
              Hãy chọn cách thức tạo tài liệu phù hợp nhất với nhu cầu của bạn.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Tự soạn */}
              <div 
                onClick={() => {
                  setMode('editor');
                  setShowMethodModal(false);
                }}
                className="border border-slate-100 hover:border-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center group bg-slate-50/30 hover:bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-xs font-black text-[#1E293B] group-hover:text-primary transition-colors mb-1">
                  Tự soạn tài liệu
                </h4>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">
                  Soạn lý thuyết trực tuyến với trình biên tập mạnh mẽ, hỗ trợ công thức và AI.
                </p>
              </div>

              {/* Option 2: Tải file */}
              <div 
                onClick={() => {
                  setMode('upload');
                  setShowMethodModal(false);
                }}
                className="border border-slate-100 hover:border-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center text-center group bg-slate-50/30 hover:bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Upload size={20} />
                </div>
                <h4 className="text-xs font-black text-[#1E293B] group-hover:text-primary transition-colors mb-1">
                  Tải file tài liệu
                </h4>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">
                  Tải lên tài liệu sẵn có (PDF, DOCX, DOC, PPTX...) để chia sẻ nhanh chóng.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowMethodModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] rounded-xl cursor-pointer transition"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
