import React from 'react';
import { Home, Compass, FileText, BookOpen, Trophy, HelpCircle, Lightbulb, ChevronRight } from 'lucide-react';

interface NotFoundProps {
  onViewChange: (view: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onViewChange }) => {
  return (
    <div className="flex-1 w-full bg-white flex flex-col items-center justify-start py-12 px-6 sm:px-12 lg:px-24 overflow-y-auto animate-fadeIn select-none">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-4">
        
        {/* Left Column: Text + Action buttons */}
        <div className="flex-1 flex flex-col items-start text-left max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary text-[10px] font-black uppercase tracking-wider rounded-full mb-4">
            Oops! Không tìm thấy trang
          </div>
          
          <h1 className="text-8xl font-black text-primary tracking-tight select-none mb-6 relative">
            404
          </h1>

          <h2 className="text-xl font-bold text-slate-800 mb-3">
            Trang bạn đang tìm kiếm đã bay mất rồi!
          </h2>
          
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
            Có thể trang đã bị xóa, đổi tên hoặc tạm thời không khả dụng. 
            Đừng lo, hãy thử các gợi ý bên dưới hoặc quay về trang chủ nhé!
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onViewChange('home')}
              className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-black text-white shadow-md shadow-primary/10 transition cursor-pointer"
            >
              <Home size={14} />
              Về trang chủ
            </button>
            <button
              onClick={() => onViewChange('documents')}
              className="flex items-center gap-2 rounded-xl border border-primary text-primary hover:bg-primary-light px-5 py-3 text-xs font-black transition cursor-pointer"
            >
              <Compass size={14} />
              Khám phá tài liệu
            </button>
          </div>
        </div>

        {/* Right Column: Cute whale illustration */}
        <div className="flex-1 flex items-center justify-center max-w-md">
          <div className="relative">
            <img
              src="/whale_404.png"
              alt="404 - Không tìm thấy trang"
              className="w-full max-w-[360px] object-contain drop-shadow-sm select-none"
            />
          </div>
        </div>

      </div>

      {/* Suggestions Section */}
      <div className="max-w-6xl w-full mt-16 flex flex-col items-center">
        <div className="flex items-center gap-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">
          <span className="h-px w-6 bg-slate-200" />
          <span>Bạn có thể muốn</span>
          <span className="h-px w-6 bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Card 1: Tài liệu mới */}
          <button
            onClick={() => onViewChange('documents')}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-light hover:bg-slate-50/50 shadow-2xs hover:shadow-sm transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Tài liệu mới</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Khám phá tài liệu mới</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </button>

          {/* Card 2: Ôn tập */}
          <button
            onClick={() => onViewChange('exams')}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-light hover:bg-slate-50/50 shadow-2xs hover:shadow-sm transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BookOpen size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Ôn tập</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Luyện đề & tự kiểm tra</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </button>

          {/* Card 3: Bảng xếp hạng */}
          <button
            onClick={() => onViewChange('leaderboard')}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-light hover:bg-slate-50/50 shadow-2xs hover:shadow-sm transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Trophy size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Bảng xếp hạng</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Xem thành tích bạn bè</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </button>

          {/* Card 4: Trung tâm hỗ trợ */}
          <button
            onClick={() => onViewChange('contact')}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary-light hover:bg-slate-50/50 shadow-2xs hover:shadow-sm transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <HelpCircle size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Trung tâm hỗ trợ</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="max-w-6xl w-full mt-10 rounded-xl bg-primary-light/50 border border-primary-light p-4 flex items-center gap-3.5 select-none">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary shadow-3xs shrink-0">
          <Lightbulb size={16} className="stroke-[2.5]" />
        </div>
        <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
          "Mỗi sai lầm là một bài học, mỗi trang mới là một cơ hội." 
          <span className="text-primary ml-1.5 font-bold">— Onmi Exam luôn đồng hành cùng bạn trên hành trình chinh phục tri thức!</span>
        </p>
      </div>
    </div>
  );
};
