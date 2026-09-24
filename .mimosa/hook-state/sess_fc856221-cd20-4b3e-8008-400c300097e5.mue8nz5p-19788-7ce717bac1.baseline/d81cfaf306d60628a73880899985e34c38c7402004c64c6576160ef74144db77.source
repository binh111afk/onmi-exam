import React from 'react';
import { 
  Brain, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Map, 
  Clock, 
  FileCheck, 
  Lock, 
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';

interface OnboardingModalProps {
  onStart: () => void;
  onDismiss: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onStart,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* PPT Animations Keyframes Inject */}
      <style>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(-120px) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          0% {
            transform: translateX(120px) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeUp {
          0% {
            transform: translateY(40px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .ppt-left {
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .ppt-right {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .ppt-fadeup {
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Dark Overlay */}
      <div 
        className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md transition-opacity duration-500"
        onClick={onDismiss}
      />

      {/* Modal Box */}
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100/50 animate-scaleUp">
        
        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1">
          
          {/* LEFT PANEL: 3D Illustration SVG (40%) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#F5F3FF] via-[#EEF2FF] to-[#E0E7FF] p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 border-r border-slate-100 min-h-[300px] lg:min-h-[460px]">
            {/* Background grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

            <div className="relative w-full max-w-[280px] aspect-[4/5] flex items-center justify-center select-none ppt-left">
              {/* Premium Isometric SVG Illustration */}
              <svg viewBox="0 0 320 400" className="w-full h-full overflow-visible">
                {/* Subtle radial shadows */}
                <ellipse cx="160" cy="340" rx="100" ry="25" fill="#6366F1" opacity="0.12" filter="blur(8px)" />
                <ellipse cx="140" cy="220" rx="80" ry="20" fill="#000000" opacity="0.06" filter="blur(6px)" />
                
                {/* Floating paper path lines */}
                <path d="M 60,180 Q 90,140 160,130" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="5 5" opacity="0.4" />
                <path d="M 260,250 Q 230,290 160,300" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="5 5" opacity="0.4" />

                {/* Big Purple Compass */}
                <g transform="translate(40, 240)">
                  {/* Outer Ring */}
                  <circle cx="50" cy="50" r="44" fill="white" stroke="#6366F1" strokeWidth="5.5" filter="drop-shadow(0 8px 16px rgba(99,102,241,0.25))" />
                  <circle cx="50" cy="50" r="34" fill="#6366F1" opacity="0.06" />
                  {/* Compass markings */}
                  <line x1="50" y1="12" x2="50" y2="18" stroke="#6366F1" strokeWidth="2.5" />
                  <line x1="50" y1="88" x2="50" y2="82" stroke="#6366F1" strokeWidth="2.5" />
                  <line x1="12" y1="50" x2="18" y2="50" stroke="#6366F1" strokeWidth="2.5" />
                  <line x1="88" y1="50" x2="82" y2="50" stroke="#6366F1" strokeWidth="2.5" />
                  {/* Compass needle */}
                  <g transform="rotate(45, 50, 50)">
                    <path d="M 50,15 L 56,50 L 50,56 Z" fill="#6366F1" />
                    <path d="M 50,85 L 56,50 L 50,56 Z" fill="#8F94FB" />
                    <path d="M 50,15 L 44,50 L 50,56 Z" fill="#4F46E5" />
                    <path d="M 50,85 L 44,50 L 50,56 Z" fill="#C7D2FE" />
                  </g>
                  <circle cx="50" cy="50" r="4.5" fill="white" stroke="#6366F1" strokeWidth="2" />
                </g>

                {/* Card Stack Illustration */}
                {/* Card 1: Xây dựng lộ trình */}
                <g transform="translate(90, 250) rotate(-4)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.04))">
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="white" />
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <circle cx="24" cy="25" r="13" fill="#EEF2FF" />
                  <path d="M 20,28 L 24,22 L 28,28" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="46" y="24" fontSize="10" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">Xây dựng lộ trình</text>
                  {/* Progress Line */}
                  <line x1="46" y1="32" x2="116" y2="32" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                  <line x1="46" y1="32" x2="86" y2="32" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Card 2: Phát triển năng lực */}
                <g transform="translate(110, 185) rotate(-2)" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.05))">
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="white" />
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <circle cx="24" cy="25" r="13" fill="#FDF2F8" />
                  <path d="M 18,28 L 22,23 L 26,26 L 31,19" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="46" y="24" fontSize="10" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">Phát triển năng lực</text>
                  {/* Progress Line */}
                  <line x1="46" y1="32" x2="116" y2="32" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                  <line x1="46" y1="32" x2="102" y2="32" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Card 3: Định hướng ngành nghề */}
                <g transform="translate(100, 120) rotate(1)" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.06))">
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="white" />
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <circle cx="24" cy="25" r="13" fill="#F0FDF4" />
                  <circle cx="24" cy="25" r="7" fill="none" stroke="#10B981" strokeWidth="2" />
                  <line x1="24" y1="21" x2="24" y2="25" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <line x1="24" y1="25" x2="28" y2="25" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <text x="46" y="24" fontSize="10" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">Định hướng nghề</text>
                  {/* Progress Line */}
                  <line x1="46" y1="32" x2="116" y2="32" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                  <line x1="46" y1="32" x2="94" y2="32" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Card 4: Hiểu bản thân */}
                <g transform="translate(80, 55) rotate(3)" filter="drop-shadow(0 12px 24px rgba(99,102,241,0.08))">
                  <rect x="0" y="0" width="160" height="50" rx="14" fill="white" stroke="#6366F1" strokeWidth="1.5" />
                  <circle cx="24" cy="25" r="13" fill="#EEF2FF" />
                  <path d="M 21,21 Q 24,17 27,21 Q 24,25 21,21 Z" fill="none" stroke="#6366F1" strokeWidth="1.5" />
                  <circle cx="24" cy="21" r="1.5" fill="#6366F1" />
                  <text x="46" y="24" fontSize="10" fontWeight="bold" fill="#6366F1" fontFamily="sans-serif">Hiểu bản thân</text>
                  {/* Progress Line */}
                  <line x1="46" y1="32" x2="116" y2="32" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                  <line x1="46" y1="32" x2="110" y2="32" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Origami Paper Plane floating */}
                <g transform="translate(250, 60) rotate(-15)">
                  <path d="M 0,15 L 28,0 L 22,24 L 14,18 L 8,24 Z" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M 0,15 L 22,24" fill="none" stroke="#6366F1" strokeWidth="1.5" />
                  <path d="M 14,18 L 14,24 L 22,24" fill="#C7D2FE" opacity="0.7" />
                </g>

                {/* Small sparkles */}
                <g transform="translate(50, 40)" fill="#6366F1">
                  <circle cx="0" cy="0" r="2.5" />
                  <circle cx="8" cy="-5" r="1.5" />
                  <circle cx="-5" cy="8" r="1" />
                </g>
                <g transform="translate(270, 200)" fill="#6366F1">
                  <circle cx="0" cy="0" r="2" />
                  <circle cx="-6" cy="-4" r="1" />
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT PANEL: Features detail lists (60%) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8 bg-white ppt-right">
            
            {/* Header Text */}
            <div className="space-y-3.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                Khám phá tiềm năng,<br />
                <span className="bg-gradient-to-r from-primary to-[#8F85F3] bg-clip-text text-transparent">định hướng tương lai ✨</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-medium">
                Bài đánh giá năng lực sẽ giúp bạn hiểu rõ điểm mạnh, tính cách và xu hướng nghề nghiệp phù hợp nhất với bản thân.
              </p>
            </div>

            {/* Features details lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Item 1 */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-primary flex items-center justify-center shrink-0 shadow-sm border border-purple-100/50">
                  <Brain size={14} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Phân tích tính cách (MBTI)</h4>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed">Hiểu rõ nhóm tính cách và phong cách học tập của bạn.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
                  <Award size={14} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Đánh giá năng lực</h4>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed">Đo lường 8 nhóm năng lực cốt lõi khác nhau của bạn.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
                  <Compass size={14} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Định hướng ngành nghề</h4>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed">Gợi ý các ngành nghề phù hợp tiềm năng và sở thích.</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 shadow-sm border border-rose-100/50">
                  <Sparkles size={14} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Gợi ý phát triển</h4>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed">Nhận lời khuyên thiết thực để cải thiện và bứt phá.</p>
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-100/50">
                  <Map size={14} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Lộ trình cá nhân hóa</h4>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed">Hệ thống đề xuất lộ trình học tập phù hợp tối ưu nhất.</p>
                </div>
              </div>

              {/* Item 6 */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/50">
                  <BookOpen size={14} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Tài liệu & Đề thi phù hợp</h4>
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed">Đề xuất các tài liệu giúp bạn đạt kết quả học tập tốt hơn.</p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Overview stats and Action triggers */}
        <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col space-y-6 ppt-fadeup select-none">
          {/* Summary stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-150/50 justify-center">
              <Clock size={16} className="text-primary shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-800">15 phút</div>
                <div className="text-[8px] text-slate-400 font-bold">Thời gian hoàn thành</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-150/50 justify-center">
              <FileCheck size={16} className="text-indigo-500 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-800">30 câu hỏi</div>
                <div className="text-[8px] text-slate-400 font-bold">Trắc nghiệm khoa học</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-150/50 justify-center">
              <Lock size={16} className="text-emerald-500 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-800">Bảo mật</div>
                <div className="text-[8px] text-slate-400 font-bold">Thông tin được bảo vệ</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-150/50 justify-center">
              <RefreshCw size={16} className="text-rose-500 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-800">Làm lại bất cứ lúc nào</div>
                <div className="text-[8px] text-slate-400 font-bold">Theo dõi sự thay đổi</div>
              </div>
            </div>

          </div>

          {/* Action buttons row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              <Sparkles size={14} /> Bắt đầu bài đánh giá
            </button>
            <button
              onClick={onDismiss}
              className="w-full sm:w-auto text-slate-400 hover:text-slate-600 text-xs font-black flex items-center justify-center gap-0.5 py-2 cursor-pointer"
            >
              Để sau <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
