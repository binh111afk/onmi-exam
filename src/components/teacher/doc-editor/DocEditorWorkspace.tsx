import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Send, 
  FileCheck2, 
  Brain, 
  Image as ImageIcon, 
  Table, 
  Activity, 
  HelpCircle, 
  Award, 
  FolderOpen, 
  Video
} from 'lucide-react';
import { DocSidebar } from './DocSidebar';
import { DocToolbar } from './DocToolbar';
import { DocPreviewSimulator } from './DocPreviewSimulator';

interface DocEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
}

export const DocEditorWorkspace: React.FC<DocEditorWorkspaceProps> = ({ setMode }) => {
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

  const handleAiSuggest = () => {
    if (selectedPage === 'water') {
      setCh1Text(prev => prev + ' Nước đóng vai trò là một dung môi vạn năng.');
    } else {
      setCh2Text(prev => prev + ' Hãy chú ý đến cấu trúc đặc biệt của mỗi nhóm đại phân tử.');
    }
  };

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
          <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-100 rounded-xl p-0.5 text-[10px] font-black text-slate-500">
            <button className="px-3 py-1 bg-white text-primary rounded-lg shadow-sm font-black">Soạn thảo</button>
            <button className="px-3 py-1 hover:text-slate-800 transition rounded-lg">Xem trước</button>
            <button className="px-3 py-1 hover:text-slate-800 transition rounded-lg">Responsive</button>
          </div>

          {/* Actions buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert('Đã lưu nháp tài liệu thành công!')}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
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
        <DocSidebar 
          selectedPage={selectedPage} 
          setSelectedPage={setSelectedPage} 
          ch1Expanded={ch1Expanded} 
          setCh1Expanded={setCh1Expanded} 
        />

        {/* 2. CENTER PANEL: Rich Editor Workspace */}
        <main className="flex-1 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
          
          {/* Rich Editor Toolbar */}
          <DocToolbar onAiSuggest={handleAiSuggest} />

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
          <DocPreviewSimulator 
            viewport={viewport}
            setViewport={setViewport}
            selectedPage={selectedPage}
            ch1Title={ch1Title}
            ch1Text={ch1Text}
            ch1Callout={ch1Callout}
            ch2Title={ch2Title}
            ch2Text={ch2Text}
            ch2List={ch2List}
          />
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
              { icon: <HelpCircle size={16} />, label: 'Quiz' },
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
};
