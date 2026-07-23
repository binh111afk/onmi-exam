import React from 'react';
import { ChevronLeft, Search, GripVertical } from 'lucide-react';
import { QuickComposeIcon, SettingsIcon, ViewPublishIcon } from './ExamEditorIcons';

interface ExamSidebarProps {
  examSubView: 'edit' | 'config' | 'publish';
  setExamSubView: (v: 'edit' | 'config' | 'publish') => void;
  onBack: () => void;
  selectedQuestionId: number;
  setSelectedQuestionId: (id: number) => void;
  examSearchQuery: string;
  setExamSearchQuery: (q: string) => void;
  filteredQuestions: number[];
}

export const ExamSidebar: React.FC<ExamSidebarProps> = ({
  examSubView,
  setExamSubView,
  onBack,
  selectedQuestionId,
  setSelectedQuestionId,
  examSearchQuery,
  setExamSearchQuery,
  filteredQuestions,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-0 h-full overflow-hidden">
      <div className="p-5 flex flex-col gap-6 flex-1 min-h-0">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>

        {/* Tạo đề thi menu */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider px-2">Tạo đề thi</div>
          <button
            onClick={() => setExamSubView('edit')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${examSubView === 'edit'
                ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
          >
            <QuickComposeIcon size={16} />
            <span>Soạn đề</span>
          </button>
          <button
            onClick={() => setExamSubView('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${examSubView === 'config'
                ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
          >
            <SettingsIcon size={16} />
            <span>Cấu hình đề thi</span>
          </button>
          <button
            onClick={() => setExamSubView('publish')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${examSubView === 'publish'
                ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
          >
            <ViewPublishIcon size={16} />
            <span>Xem và xuất bản</span>
          </button>
        </div>

        {/* Danh sách câu hỏi - chỉ hiện ở tab Soạn đề */}
        {examSubView === 'edit' && (
          <div className="flex-1 min-h-0 flex flex-col space-y-3 pt-2 animate-fadeIn">
            <div className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider px-2 shrink-0">Danh sách câu hỏi</div>

            {/* Search */}
            <div className="relative shrink-0">
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
            <div className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1">
              {filteredQuestions.map((qNum) => {
                const isSelected = selectedQuestionId === qNum;
                return (
                  <div
                    key={qNum}
                    onClick={() => {
                      setSelectedQuestionId(qNum);
                      setExamSubView('edit');
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition ${isSelected
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
            <button className="w-full py-2 border border-dashed border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition rounded-xl text-[10px] font-black cursor-pointer shrink-0">
              + Thêm câu hỏi
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
