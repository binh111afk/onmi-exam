import React from 'react';
import { Plus, FolderOpen, ChevronDown, ChevronRight, FileCode2 } from 'lucide-react';

interface DocSidebarProps {
  selectedPage: 'water' | 'macromolecules';
  setSelectedPage: (page: 'water' | 'macromolecules') => void;
  ch1Expanded: boolean;
  setCh1Expanded: (expanded: boolean) => void;
}

export const DocSidebar: React.FC<DocSidebarProps> = ({
  selectedPage,
  setSelectedPage,
  ch1Expanded,
  setCh1Expanded,
}) => {
  return (
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
  );
};
