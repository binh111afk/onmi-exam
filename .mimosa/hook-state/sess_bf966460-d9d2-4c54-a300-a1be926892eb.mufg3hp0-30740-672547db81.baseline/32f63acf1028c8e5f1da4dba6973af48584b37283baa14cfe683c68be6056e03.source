import React from 'react';
import { Home, Compass, FileText, BookOpen, Trophy, HelpCircle, Lightbulb, ChevronRight } from 'lucide-react';

interface NotFoundProps {
  onViewChange: (view: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onViewChange }) => {
  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] bg-white flex flex-col items-center justify-between py-6 px-6 sm:px-12 lg:px-24 overflow-hidden animate-fadeIn select-none">
      
      {/* Upper Section: Text content & Cute whale */}
      <div className="max-w-6xl w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 mt-2">
        
        {/* Left Column: Text + Action buttons */}
        <div className="flex-1 flex flex-col items-start text-left max-w-lg">
          <div className="relative inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary-light/60 border border-primary-light/80 text-primary text-xs font-black uppercase tracking-wider rounded-full mb-4">
            Oops! Không tìm thấy trang
            {/* 2 nét gạch trang trí góc trên bên phải */}
            <span className="absolute -top-1 -right-3 text-[10px] text-primary/40 font-bold transform rotate-12 select-none font-sans">//</span>
          </div>
          
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#8E80F9] to-primary select-none mb-4 relative">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
            Trang bạn đang tìm kiếm đã bay mất rồi!
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6">
            Có thể trang đã bị xóa, đổi tên hoặc tạm thời không khả dụng.<br />
            Đừng lo, hãy thử các gợi ý bên dưới hoặc quay về trang chủ nhé!
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onViewChange('home')}
              className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-black text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Home size={14} className="stroke-[2.5]" />
              Về trang chủ
            </button>
            <button
              onClick={() => onViewChange('documents')}
              className="flex items-center gap-2 rounded-xl border border-primary text-primary bg-white hover:bg-primary-light/40 px-5 py-3 text-xs font-black transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Compass size={14} className="stroke-[2.5]" />
              Khám phá tài liệu
            </button>
          </div>
        </div>

        {/* Right Column: Cute whale illustration */}
        <div className="flex-1 flex items-center justify-center max-w-sm lg:max-w-md">
          <div className="relative w-full max-h-[200px] sm:max-h-[250px] lg:max-h-[300px] transition-transform duration-500 hover:scale-[1.02] flex items-center justify-center">
            <img
              src="/whale_404.png"
              alt="404 - Không tìm thấy trang"
              className="w-auto max-h-[200px] sm:max-h-[240px] lg:max-h-[280px] object-contain select-none"
            />
          </div>
        </div>

      </div>

      {/* Suggestions Section */}
      <div className="max-w-6xl w-full mt-4 flex flex-col items-center">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6 select-none">
          <span className="text-primary/40 font-bold transform rotate-12">//</span>
          <span className="text-slate-800 font-black text-xs sm:text-sm tracking-wide normal-case">Bạn có thể muốn:</span>
          <span className="text-primary/40 font-bold transform rotate-12">//</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Card 1: Tài liệu mới */}
          <button
            onClick={() => onViewChange('documents')}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100/80 bg-white hover:border-primary-light hover:shadow-[0_12px_24px_rgba(108,93,211,0.05)] shadow-[0_6px_20px_rgb(0,0,0,0.015)] transition-all duration-300 text-left cursor-pointer group transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50/80 text-indigo-600">
                <FileText size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Tài liệu mới</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-normal">Khám phá các tài liệu mới nhất</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </button>

          {/* Card 2: Ôn tập */}
          <button
            onClick={() => onViewChange('exams')}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100/80 bg-white hover:border-primary-light hover:shadow-[0_12px_24px_rgba(108,93,211,0.05)] shadow-[0_6px_20px_rgb(0,0,0,0.015)] transition-all duration-300 text-left cursor-pointer group transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50/80 text-purple-600">
                <BookOpen size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Ôn tập</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-normal">Luyện đề và kiểm tra kiến thức</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </button>

          {/* Card 3: Bảng xếp hạng */}
          <button
            onClick={() => onViewChange('leaderboard')}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100/80 bg-white hover:border-primary-light hover:shadow-[0_12px_24px_rgba(108,93,211,0.05)] shadow-[0_6px_20px_rgb(0,0,0,0.015)] transition-all duration-300 text-left cursor-pointer group transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50/80 text-blue-600">
                <Trophy size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Bảng xếp hạng</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-normal">Xem thành tích bạn và bạn bè</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </button>

          {/* Card 4: Trung tâm hỗ trợ */}
          <button
            onClick={() => onViewChange('contact')}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100/80 bg-white hover:border-primary-light hover:shadow-[0_12px_24px_rgba(108,93,211,0.05)] shadow-[0_6px_20px_rgb(0,0,0,0.015)] transition-all duration-300 text-left cursor-pointer group transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50/80 text-violet-600">
                <HelpCircle size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Trung tâm hỗ trợ</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-normal">Cần trợ giúp? Chúng tôi luôn sẵn sàng</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="max-w-6xl w-full mt-4 rounded-2xl bg-slate-50/85 border border-slate-100 p-4 flex items-center justify-between gap-4 select-none shadow-[0_4px_20px_rgba(0,0,0,0.005)] relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-[0_4px_10px_rgba(108,93,211,0.06)] shrink-0 border border-slate-100">
            <Lightbulb size={16} className="stroke-[2.5] text-primary" />
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-relaxed">
            "Mỗi sai lầm là một bài học, mỗi trang mới là một cơ hội." 
            <span className="text-primary ml-2 font-bold">— Onmi Exam luôn đồng hành cùng bạn trên hành trình chinh phục tri thức!</span>
          </p>
        </div>
        
        {/* Heart shaped decorative line drawing */}
        <div className="hidden sm:block shrink-0 ml-4 opacity-75">
          <svg width="80" height="25" viewBox="0 0 80 30" fill="none" className="text-primary/30">
            <path d="M5 25 C 20 25, 25 15, 35 15 C 45 15, 50 5, 57 5 C 62 5, 65 10, 60 15 C 55 20, 50 12, 57 5 C 64 -2, 75 10, 75 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
