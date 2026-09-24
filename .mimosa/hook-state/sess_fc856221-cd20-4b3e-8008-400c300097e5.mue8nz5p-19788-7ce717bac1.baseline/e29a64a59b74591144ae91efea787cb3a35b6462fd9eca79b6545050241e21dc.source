import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  List, 
  Image, 
  Sigma, 
  SlidersHorizontal, 
  PlusCircle, 
  CheckCircle,
  MoreVertical,
  Undo2,
  Redo2,
  Subscript,
  Superscript
} from 'lucide-react';

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  answer: number; // Index of the correct option (0 = A, 1 = B, etc.)
  level: 'easy' | 'medium' | 'hard';
  subject: string;
  type: string;
  tags: string[];
  explanation: string;
}

export const QuestionBankWorkspace: React.FC = () => {
  const [bankQuestions, setBankQuestions] = useState<QuestionItem[]>([
    {
      id: 1,
      question: "Phát biểu nào sau đây đúng về nước?",
      options: [
        "Nước là dung môi phân cực cực tốt",
        "Nước không tham gia phản ứng sinh hóa",
        "Nước được cấu tạo từ 3 nguyên tử H và 1 nguyên tử O",
        "Nước không có khả năng điều hòa nhiệt độ"
      ],
      answer: 0,
      level: "easy",
      subject: "Sinh học tế bào",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["nước", "tính chất của nước"],
      explanation: "Nước là dung môi phân cực cực tốt nên hòa tan được nhiều chất phân cực trong tế bào."
    },
    {
      id: 2,
      question: "Cho hình vẽ cấu trúc của phân tử nước. Góc liên kết H-O-H là bao nhiêu?",
      options: [
        "104.5°",
        "90°",
        "120°",
        "180°"
      ],
      answer: 0,
      level: "medium",
      subject: "Sinh học tế bào",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["nước", "cấu trúc"],
      explanation: "Do 2 cặp electron tự do trên nguyên tử O đẩy nhau làm góc liên kết nhỏ hơn 109.5°, giá trị thực tế là 104.5°."
    },
    {
      id: 3,
      question: "Enzyme là gì?",
      options: [
        "Chất xúc tác sinh học cấu tạo chủ yếu từ protein",
        "Chất vô cơ xúc tác phản ứng",
        "Năng lượng tế bào ATP",
        "Một loại hoóc-môn kích thích sinh trưởng"
      ],
      answer: 0,
      level: "easy",
      subject: "Sinh học tế bào",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["enzyme", "tế bào"],
      explanation: "Enzyme là chất xúc tác sinh học được tổng hợp trong các tế bào sống, có bản chất là protein."
    },
    {
      id: 4,
      question: "Đặc điểm nào sau đây không phải của ARN?",
      options: [
        "Có cấu trúc mạch xoắn kép",
        "Thường có cấu trúc một mạch đơn",
        "Chứa đường ribôzơ",
        "Chứa bazơ nitơ Uraxin thay cho Timin"
      ],
      answer: 0,
      level: "easy",
      subject: "Di truyền học",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["arn", "di truyền"],
      explanation: "ARN thường có cấu trúc một mạch đơn, còn ADN mới có cấu trúc xoắn kép hai mạch song song."
    },
    {
      id: 5,
      question: "Quá trình nhân đôi ADN diễn ra theo nguyên tắc nào?",
      options: [
        "Nguyên tắc bổ sung và bán bảo tồn",
        "Nguyên tắc một chiều",
        "Nguyên tắc tự do",
        "Nguyên tắc gián đoạn"
      ],
      answer: 0,
      level: "medium",
      subject: "Di truyền học",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["adn", "nhân đôi"],
      explanation: "Nhân đôi ADN diễn ra theo hai nguyên tắc cơ bản là nguyên tắc bổ sung và nguyên tắc bán bảo tồn."
    },
    {
      id: 6,
      question: "Một quần thể có tần số alen A là 0,6. Tần số alen a là bao nhiêu?",
      options: [
        "0,4",
        "0,6",
        "0,2",
        "0,8"
      ],
      answer: 0,
      level: "hard",
      subject: "Di truyền học",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["quần thể", "tần số alen"],
      explanation: "Tổng tần số alen trong quần thể luôn bằng 1. Tần số alen a = 1 - p(A) = 1 - 0.6 = 0.4."
    }
  ]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'detail' | 'history'>('detail');

  const selectedQuestion = bankQuestions.find(q => q.id === selectedQuestionId) || bankQuestions[0];

  // Helper to update a field in the selected question
  const updateSelectedQuestionField = (field: keyof QuestionItem, value: any) => {
    setBankQuestions(prev => prev.map(q => {
      if (q.id === selectedQuestionId) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  // Helper to update specific option text
  const updateOptionText = (index: number, text: string) => {
    const updatedOptions = [...selectedQuestion.options];
    updatedOptions[index] = text;
    updateSelectedQuestionField('options', updatedOptions);
  };

  // Helper to add option
  const handleAddOption = () => {
    const defaultLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLabel = defaultLabels[selectedQuestion.options.length] || 'Option';
    const updatedOptions = [...selectedQuestion.options, `Lựa chọn mới ${nextLabel}`];
    updateSelectedQuestionField('options', updatedOptions);
  };

  // Helper to add tag
  const handleAddTag = () => {
    const tag = prompt('Nhập tên tag mới:');
    if (tag && tag.trim()) {
      const updatedTags = [...selectedQuestion.tags, tag.trim()];
      updateSelectedQuestionField('tags', updatedTags);
    }
  };

  // Helper to remove tag
  const handleRemoveTag = (indexToRemove: number) => {
    const updatedTags = selectedQuestion.tags.filter((_, idx) => idx !== indexToRemove);
    updateSelectedQuestionField('tags', updatedTags);
  };

  const handleCreateQuestion = () => {
    const newId = bankQuestions.length > 0 ? Math.max(...bankQuestions.map(q => q.id)) + 1 : 1;
    const newQuestion: QuestionItem = {
      id: newId,
      question: "Câu hỏi mới tạo chưa nhập nội dung?",
      options: [
        "Lựa chọn A",
        "Lựa chọn B",
        "Lựa chọn C",
        "Lựa chọn D"
      ],
      answer: 0,
      level: "easy",
      subject: "Sinh học tế bào",
      type: "Trắc nghiệm 1 đáp án",
      tags: ["tag"],
      explanation: "Giải thích câu trả lời tại đây."
    };
    setBankQuestions(prev => [...prev, newQuestion]);
    setSelectedQuestionId(newId);
  };

  const handleDuplicateQuestion = () => {
    const newId = bankQuestions.length > 0 ? Math.max(...bankQuestions.map(q => q.id)) + 1 : 1;
    const duplicated: QuestionItem = {
      ...selectedQuestion,
      id: newId,
      question: `${selectedQuestion.question} (Bản sao)`
    };
    setBankQuestions(prev => [...prev, duplicated]);
    setSelectedQuestionId(newId);
  };

  const handleDeleteQuestion = () => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      const remaining = bankQuestions.filter(q => q.id !== selectedQuestionId);
      setBankQuestions(remaining);
      if (remaining.length > 0) {
        setSelectedQuestionId(remaining[0].id);
      }
    }
  };

  const handleNavigateQuestion = (dir: 'prev' | 'next') => {
    const currentIndex = bankQuestions.findIndex(q => q.id === selectedQuestionId);
    if (dir === 'prev' && currentIndex > 0) {
      setSelectedQuestionId(bankQuestions[currentIndex - 1].id);
    } else if (dir === 'next' && currentIndex < bankQuestions.length - 1) {
      setSelectedQuestionId(bankQuestions[currentIndex + 1].id);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white border-t border-slate-200 animate-fadeIn select-text">
      
      {/* LEFT COLUMN: Questions List & Filters (45%) */}
      <div className="w-[45%] border-r border-slate-200 flex flex-col justify-between shrink-0 bg-slate-50/15 overflow-hidden">
        {/* Header bar */}
        <div className="h-14 border-b border-slate-200 px-5 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ngân hàng câu hỏi</h2>
            <span className="text-[10px] text-slate-400 font-bold">({bankQuestions.length} câu)</span>
          </div>
          <button 
            onClick={handleCreateQuestion}
            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
          >
            <Plus size={12} /> Thêm câu hỏi
          </button>
        </div>

        {/* Search and Filters row */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
          {/* Search */}
          <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5">
            <Search size={14} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-text-primary focus:ring-0 p-0 flex-1 outline-none w-full"
            />
          </div>

          {/* Filters Select boxes */}
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-600 outline-none cursor-pointer">
                <option>Môn: Sinh học</option>
                <option>Môn: Toán học</option>
                <option>Môn: Hóa học</option>
              </select>

              <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-600 outline-none cursor-pointer">
                <option>Độ khó</option>
                <option>Dễ</option>
                <option>Trung bình</option>
                <option>Khó</option>
              </select>

              <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-600 outline-none cursor-pointer">
                <option>Dạng câu hỏi</option>
                <option>Trắc nghiệm</option>
                <option>Tự luận</option>
              </select>

              <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-600 outline-none cursor-pointer">
                <option>Khác</option>
              </select>
            </div>

            <button className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer shrink-0">
              <SlidersHorizontal size={12} />
            </button>
          </div>
        </div>

        {/* Scrollable Questions list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
          {bankQuestions
            .filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((q) => {
              const isSelected = q.id === selectedQuestionId;
              const difficultyText = q.level === 'easy' ? 'Dễ' : q.level === 'hard' ? 'Khó' : 'Trung bình';
              const difficultyColor = q.level === 'easy' ? 'text-emerald-500' : q.level === 'hard' ? 'text-red-500' : 'text-amber-500';

              return (
                <div 
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`p-4 bg-white border rounded-xl transition duration-150 cursor-pointer relative flex gap-3 ${
                    isSelected 
                      ? 'border-[#6366F1] ring-1 ring-[#6366F1]/10' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-white/80'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className="pt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-[#6366F1] bg-[#6366F1] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-[4.5]" fill="none" stroke="currentColor">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Question details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary uppercase">Câu {q.id}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-500">{q.level === 'easy' ? 'Nhận biết' : q.level === 'medium' ? 'Thông hiểu' : 'Vận dụng'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400">{q.options.length} lựa chọn</span>
                        <button className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer">
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[11px] font-bold text-text-primary leading-relaxed break-words pr-2">
                      {q.question}
                    </h4>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {q.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-50 text-[8px] font-bold text-slate-500 border border-slate-100">{t}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase">
                        <span className={`w-1.5 h-1.5 rounded-full ${q.level === 'easy' ? 'bg-emerald-500' : q.level === 'hard' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <span className={difficultyColor}>{difficultyText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer pagination */}
        <div className="h-12 border-t border-slate-200 px-5 flex items-center justify-between shrink-0 bg-white font-sans">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
            <span>Hiển thị</span>
            <select className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold outline-none cursor-pointer">
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <button className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer">
              <ChevronLeft size={12} />
            </button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-50 cursor-pointer">1</button>
            <button className="w-5 h-5 rounded flex items-center justify-center bg-primary text-white shadow-sm cursor-pointer">2</button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-50 cursor-pointer">3</button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-50 cursor-pointer">4</button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-50 cursor-pointer">5</button>
            <span className="px-0.5 text-slate-400">...</span>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-50 cursor-pointer">45</button>
            <button className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer">
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Detailed Question Editor Form (55%) */}
      <div className="flex-1 flex flex-col justify-between bg-white overflow-hidden">
        {/* Header bar */}
        <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setActiveTab('detail')}
              className={`h-14 flex items-center text-xs font-black border-b-2 px-1 transition cursor-pointer ${
                activeTab === 'detail' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Chi tiết câu hỏi
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`h-14 flex items-center text-xs font-black border-b-2 px-1 transition cursor-pointer ${
                activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Lịch sử chỉnh sửa
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDuplicateQuestion}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer bg-white"
            >
              <Copy size={12} /> Nhân bản
            </button>
            <button 
              onClick={handleDeleteQuestion}
              className="px-2.5 py-1.5 border border-red-100 hover:bg-red-50 text-red-500 text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer bg-white"
            >
              <Trash2 size={12} /> Xóa
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleNavigateQuestion('prev')}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition cursor-pointer bg-white"
                title="Câu trước"
              >
                <ChevronLeft size={12} />
              </button>
              <button 
                onClick={() => handleNavigateQuestion('next')}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition cursor-pointer bg-white"
                title="Câu sau"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white font-sans text-xs">
          
          {/* Question Text block */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
              <span className="text-red-500">*</span> Nội dung câu hỏi
            </label>

            {/* Rich text toolbar */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div className="h-9 px-3 border-b border-slate-150 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Bold size={11} /></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Italic size={11} /></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Underline size={11} /></button>
                  <div className="w-px h-3.5 bg-slate-200" />
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Subscript size={11} /></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Superscript size={11} /></button>
                  <div className="w-px h-3.5 bg-slate-200" />
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><AlignLeft size={11} /></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><List size={11} /></button>
                  <div className="w-px h-3.5 bg-slate-200" />
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><span className="text-[10px] font-bold font-serif">fx</span></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Image size={11} /></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition cursor-pointer"><Sigma size={11} /></button>
                </div>
                
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"><Undo2 size={11} /></button>
                  <button className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"><Redo2 size={11} /></button>
                </div>
              </div>

              <textarea 
                value={selectedQuestion.question}
                onChange={(e) => updateSelectedQuestionField('question', e.target.value)}
                className="w-full min-h-[90px] p-3 text-[11px] text-slate-700 font-medium leading-relaxed bg-white border-none outline-none focus:ring-0 resize-y"
                placeholder="Nhập nội dung câu hỏi tại đây..."
              />
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT FORM SECTION (7 cols): Options */}
            <div className="md:col-span-7 space-y-4">
              {/* Question Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Loại câu hỏi
                </label>
                <select 
                  value={selectedQuestion.type}
                  onChange={(e) => updateSelectedQuestionField('type', e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                >
                  <option value="Trắc nghiệm 1 đáp án">Trắc nghiệm 1 đáp án</option>
                  <option value="Trắc nghiệm nhiều đáp án">Trắc nghiệm nhiều đáp án</option>
                  <option value="Tự luận ngắn">Tự luận ngắn</option>
                </select>
              </div>

              {/* Choices Options List */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Các lựa chọn
                </label>
                
                <div className="space-y-2.5">
                  {selectedQuestion.options.map((optText, oIdx) => {
                    const isChecked = selectedQuestion.answer === oIdx;
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <div 
                        key={oIdx}
                        className={`flex items-center gap-2.5 p-2 px-3 border rounded-xl transition ${
                          isChecked ? 'border-primary/20 bg-primary-light/5' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {/* Radio Checkbox bubble */}
                        <button 
                          onClick={() => updateSelectedQuestionField('answer', oIdx)}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                            isChecked ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>

                        {/* Input text */}
                        <div className="flex-1 flex items-center min-w-0">
                          <span className="text-slate-400 font-extrabold text-[10px] mr-1">{letter}.</span>
                          <input 
                            type="text"
                            value={optText}
                            onChange={(e) => updateOptionText(oIdx, e.target.value)}
                            className="bg-transparent border-none p-0 focus:ring-0 text-[11px] font-bold text-slate-700 leading-normal flex-1 outline-none min-w-0"
                          />
                        </div>

                        {/* Status Check badge */}
                        {isChecked && (
                          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        )}

                        {/* Drag indicator icon */}
                        <div className="text-slate-350 cursor-grab hover:text-slate-500 select-none flex flex-col gap-0.5 pb-0.5 justify-center">
                          <div className="flex gap-0.5"><div className="w-0.5 h-0.5 rounded-full bg-current" /><div className="w-0.5 h-0.5 rounded-full bg-current" /></div>
                          <div className="flex gap-0.5"><div className="w-0.5 h-0.5 rounded-full bg-current" /><div className="w-0.5 h-0.5 rounded-full bg-current" /></div>
                          <div className="flex gap-0.5"><div className="w-0.5 h-0.5 rounded-full bg-current" /><div className="w-0.5 h-0.5 rounded-full bg-current" /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={handleAddOption}
                  className="mt-1 px-4 py-2 border border-dashed border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-[10px] font-black text-primary flex items-center justify-center gap-1 transition cursor-pointer bg-white"
                >
                  <PlusCircle size={12} /> Thêm lựa chọn
                </button>
              </div>
            </div>

            {/* RIGHT FORM SECTION (5 cols): parameters */}
            <div className="md:col-span-5 space-y-4">
              {/* Correct answer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Đáp án đúng
                </label>
                <select 
                  value={selectedQuestion.answer}
                  onChange={(e) => updateSelectedQuestionField('answer', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                >
                  {selectedQuestion.options.map((_, idx) => (
                    <option key={idx} value={idx}>{String.fromCharCode(65 + idx)}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Độ khó
                </label>
                <select 
                  value={selectedQuestion.level}
                  onChange={(e) => updateSelectedQuestionField('level', e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                >
                  <option value="easy">🟢 Dễ</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="hard">🔴 Khó</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Chủ đề
                </label>
                <select 
                  value={selectedQuestion.subject}
                  onChange={(e) => updateSelectedQuestionField('subject', e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                >
                  <option value="Sinh học tế bào">Sinh học tế bào</option>
                  <option value="Di truyền học">Di truyền học</option>
                  <option value="Tiến hóa & Sinh thái">Tiến hóa & Sinh thái</option>
                </select>
              </div>

              {/* Knowledge type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Dạng kiến thức
                </label>
                <select 
                  value={selectedQuestion.type}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                >
                  <option>Lý thuyết</option>
                  <option>Bài tập thực hành</option>
                </select>
              </div>

              {/* Tags block */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <span className="text-red-500">*</span> Tags
                </label>
                <div className="border border-[#E2E8F0] rounded-xl p-3 bg-white space-y-2 min-h-[76px] flex flex-col justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuestion.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[8px] font-black text-primary flex items-center gap-1 select-none"
                      >
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:text-red-500 font-extrabold text-[9px] cursor-pointer"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleAddTag}
                    className="text-[9px] font-black text-primary hover:underline text-left cursor-pointer flex items-center gap-0.5 mt-1"
                  >
                    + Thêm tag
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Explanation block */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Giải thích đáp án <span className="text-[9px] font-bold text-slate-400 lowercase">(không bắt buộc)</span>
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden p-3.5 flex flex-col bg-white">
              <textarea 
                value={selectedQuestion.explanation}
                onChange={(e) => updateSelectedQuestionField('explanation', e.target.value)}
                maxLength={1000}
                className="w-full min-h-[70px] text-[11px] text-slate-700 font-medium leading-relaxed bg-white border-none outline-none focus:ring-0 resize-y"
                placeholder="Nhập giải thích chi tiết câu trả lời tại đây..."
              />
              <div className="text-right text-[8px] font-bold text-slate-400 pt-1 border-t border-slate-50 mt-1 shrink-0">
                {selectedQuestion.explanation.length}/1000
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="h-14 border-t border-slate-200 px-6 flex items-center justify-end gap-3 shrink-0 bg-white">
          <button 
            onClick={() => alert('Đã hủy bỏ thay đổi')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => alert('Đã lưu thành công câu hỏi vào Ngân hàng!')}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-indigo-150"
          >
            Lưu câu hỏi
          </button>
        </div>
      </div>

    </div>
  );
};
