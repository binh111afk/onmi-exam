import React from 'react';
import { GraduationCap, BookOpen, FileText, ChevronRight } from 'lucide-react';

interface TeacherDashboardProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  setShowMethodModal: (show: boolean) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  setMode,
  setShowMethodModal,
}) => {
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
    </div>
  );
};
