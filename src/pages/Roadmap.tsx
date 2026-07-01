import React, { useState, useMemo } from 'react';
import { Compass, BookOpen, Trophy, CheckCircle2, ChevronDown, ChevronUp, Flame, Clock, Award, Star, ArrowRight } from 'lucide-react';
import type { User } from '../types';
import { mockExams } from '../data/mockData';
import { Select } from '../components/Select';

interface RoadmapProps {
  user: User;
  onStartExam: (id: string) => void;
}

export const Roadmap: React.FC<RoadmapProps> = ({ user, onStartExam }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'history' | 'achievements'>('overview');
  const [statsTimeRange, setStatsTimeRange] = useState('7days');

  // Overview states
  const [expandedPhase, setExpandedPhase] = useState<number | null>(2); // Phase 2 expanded by default

  // Plan states
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean; day: string }[]>([
    { id: '1', text: 'Làm đề thi thử Toán số 1', done: true, day: 'Thứ Hai' },
    { id: '2', text: 'Đọc tài liệu Sinh học lớp 10 chương 2', done: false, day: 'Thứ Hai' },
    { id: '3', text: 'Ôn tập 20 từ vựng Tiếng Anh chủ đề Giáo dục', done: false, day: 'Thứ Ba' },
    { id: '4', text: 'Giải bài tập tự luyện Vật lý 12 phần Dao động', done: true, day: 'Thứ Tư' },
    { id: '5', text: 'Xem giải thích chi tiết đáp án Hóa học đề số 2', done: false, day: 'Thứ Năm' },
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedDay, setSelectedDay] = useState('Thứ Hai');

  // Toggle tasks
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  // Add task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        done: false,
        day: selectedDay,
      }
    ]);
    setNewTaskText('');
  };

  const currentDayTasks = tasks.filter(t => t.day === selectedDay);

  // Recommended exams (from mockData, filter first 3 math/science exams)
  const recommendedExams = useMemo(() => {
    return mockExams.slice(0, 3);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SUB-TABS NAVIGATION ── */}
      <nav className="flex border-b border-slate-100 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-8">
        {[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'plan', label: 'Kế hoạch học tập' },
          { id: 'history', label: 'Lịch sử học tập' },
          { id: 'achievements', label: 'Mục tiêu & Thành tích' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all relative ${activeTab === tab.id
                ? 'border-[#6366F1] text-[#6366F1]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── 1. OVERVIEW TAB (Tổng quan) ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* LEFT AREA: Progress & Timeline */}
          <div className="space-y-6">

            {/* Overall Progress Box */}
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-black text-[#1E293B] mb-5">Tiến trình tổng quan</h2>

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Circular indicator */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="50" className="stroke-[#EEF2FF]" strokeWidth="8" fill="none" />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-[#6366F1]"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 * (1 - 0.68)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-[#1E293B]">68%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Hoàn thành</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#475569] mt-3 flex items-center gap-1">
                    Bạn đang học rất tốt! 💪
                  </span>
                </div>

                {/* Details and stats cards */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mục tiêu hiện tại</span>
                    <h3 className="text-sm font-black text-[#1E293B] mt-0.5">Đạt 8+ môn Toán trong kỳ thi THPTQG 2026</h3>

                    {/* Linear progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3 mb-1.5 relative">
                      <div className="h-full bg-[#6366F1] rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#6366F1]">Còn 32% để hoàn thành mục tiêu</span>
                      <span className="text-[#475569]">68%</span>
                    </div>
                  </div>

                  {/* 4 small stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { icon: <Clock size={14} className="text-indigo-500" />, val: '120 ngày', label: 'Thời gian còn lại', bg: 'bg-[#EEF2FF]/60' },
                      { icon: <CheckCircle2 size={14} className="text-[#6366F1]" />, val: '42/62', label: 'Chủ đề hoàn thành', bg: 'bg-indigo-50/40' },
                      { icon: <BookOpen size={14} className="text-emerald-500" />, val: '356 câu', label: 'Đã luyện tập', bg: 'bg-emerald-50/40' },
                      { icon: <Compass size={14} className="text-amber-500" />, val: '89.2%', label: 'Độ chính xác TB', bg: 'bg-amber-50/40' },
                    ].map((card, i) => (
                      <div key={i} className={`p-3 rounded-2xl border border-slate-100 ${card.bg} flex flex-col justify-between`}>
                        <div className="flex items-center gap-1.5">
                          {card.icon}
                          <span className="text-[11px] font-bold text-[#1E293B]">{card.val}</span>
                        </div>
                        <span className="text-[9px] font-medium text-slate-400 mt-1.5 leading-tight">{card.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Roadmap timeline */}
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-black text-[#1E293B] mb-5">Lộ trình học tập</h2>

              <div className="relative border-l border-slate-100 ml-3.5 pl-6 space-y-6">

                {/* Phase 1 */}
                <div className="relative">
                  {/* Timeline circle badge */}
                  <span className="absolute -left-[35px] top-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={12} className="fill-emerald-500 text-white" />
                  </span>

                  <div className="border border-[#E2E8F0]/40 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all shadow-sm">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPhase(expandedPhase === 1 ? null : 1)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-[#1E293B]">Giai đoạn 1: Nền tảng</h3>
                          <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">Hoàn thành</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Ôn tập và nắm vững kiến thức cơ bản</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-500">100%</span>
                        {expandedPhase === 1 ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>

                    {expandedPhase === 1 && (
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                        <div className="text-[11px] text-[#475569] leading-relaxed">
                          Bạn đã xuất sắc hoàn thành tất cả 15 chủ đề nền tảng lớp 10 & 11 môn Toán học và Vật lý với tỷ lệ chính xác trên 80%.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-0 w-5 h-5 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    2
                  </span>

                  <div className="border border-[#E2E8F0]/40 rounded-2xl p-4 bg-white hover:border-[#6366F1]/50 transition-all shadow-sm">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPhase(expandedPhase === 2 ? null : 2)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-[#1E293B]">Giai đoạn 2: Tăng tốc</h3>
                          <span className="bg-indigo-55 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">Đang học</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Luyện tập chuyên sâu và nâng cao kỹ năng</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#6366F1]">68%</span>
                        {expandedPhase === 2 ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>

                    {expandedPhase === 2 && (
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-3.5 animate-fadeIn">
                        {[
                          { title: 'Hàm số và đồ thị', progress: 100, status: 'Hoàn thành', statusBg: 'bg-emerald-50 text-emerald-600' },
                          { title: 'Mũ và logarit', progress: 75, status: 'Đang học', statusBg: 'bg-indigo-55 text-primary' },
                          { title: 'Nguyên hàm – Tích phân', progress: 40, status: 'Đang học', statusBg: 'bg-indigo-55 text-primary' },
                          { title: 'Số phức', progress: 0, status: 'Chưa bắt đầu', statusBg: 'bg-slate-50 text-slate-400' },
                        ].map((sub, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-[150px_1fr_90px] gap-4 items-center text-xs">
                            <span className="font-semibold text-slate-700">{sub.title}</span>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${sub.progress}%` }}></div>
                            </div>
                            <span className={`text-[9px] font-bold text-center px-1.5 py-0.5 rounded-md uppercase ${sub.statusBg}`}>
                              {sub.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-0 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] shadow-sm">
                    3
                  </span>

                  <div className="border border-[#E2E8F0]/40 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all shadow-sm">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPhase(expandedPhase === 3 ? null : 3)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-[#1E293B]">Giai đoạn 3: Về đích</h3>
                          <span className="bg-slate-50 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">Chưa bắt đầu</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Luyện đề tổng hợp – Rèn kỹ năng làm bài</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">0%</span>
                        {expandedPhase === 3 ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>

                    {expandedPhase === 3 && (
                      <div className="mt-4 pt-4 border-t border-slate-50">
                        <p className="text-[11px] text-slate-400 italic">Mở khóa sau khi hoàn thành giai đoạn 2.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-0 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] shadow-sm">
                    4
                  </span>

                  <div className="border border-[#E2E8F0]/40 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all shadow-sm">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPhase(expandedPhase === 4 ? null : 4)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-[#1E293B]">Giai đoạn 4: Tăng tốc cuối</h3>
                          <span className="bg-slate-50 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">Chưa bắt đầu</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Ôn tập trọng điểm – Tối ưu kết quả</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">0%</span>
                        {expandedPhase === 4 ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>

                    {expandedPhase === 4 && (
                      <div className="mt-4 pt-4 border-t border-slate-50">
                        <p className="text-[11px] text-slate-400 italic">Mở khóa sau khi hoàn thành giai đoạn 3.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT AREA: Daily Streak & Stats */}
          <div className="space-y-6">

            {/* Streak Box */}
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-1">
                  Chuỗi ngày học tập
                  <span className="text-rose-500">🔥</span>
                </h3>
              </div>

              <div className="mt-4 text-center">
                <p className="text-2xl font-black text-[#1E293B]">{user.streak || 15} ngày</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">ngày liên tiếp</p>

                {/* Streak row checkmarks */}
                <div className="flex justify-between items-center gap-1.5 mt-5">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, dIdx) => {
                    const isSunday = day === 'CN';
                    return (
                      <div key={dIdx} className="flex flex-col items-center gap-2 flex-1">
                        <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all ${isSunday
                            ? 'bg-[#EEF2FF] border border-[#6366F1]/20 text-[#6366F1]'
                            : 'bg-emerald-500 text-white'
                          }`}>
                          {isSunday ? (
                            <Flame size={14} className="fill-[#6366F1] text-[#6366F1]" />
                          ) : (
                            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{day}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3 justify-between text-left">
                  <p className="text-[10px] text-[#64748B] font-medium leading-relaxed">
                    Học liên tục 30 ngày để nhận huy hiệu đặc biệt!
                  </p>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50/50 border border-[#6366F1]/10 flex items-center justify-center text-[#6366F1] shrink-0 shadow-sm">
                    <Award size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats list Box */}
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50 mb-4">
                <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Thống kê học tập</h3>
                <Select
                  value={statsTimeRange}
                  onChange={setStatsTimeRange}
                  variant="default"
                  size="sm"
                  className="w-auto min-w-[90px]"
                  options={[
                    { value: '7days', label: '7 ngày qua' },
                    { value: '30days', label: '30 ngày qua' },
                  ]}
                />
              </div>

              <div className="space-y-3.5">
                {[
                  { icon: <Clock size={13} />, title: 'Thời gian học', val: '12h 45m', trend: '+18%' },
                  { icon: <CheckCircle2 size={13} />, title: 'Số câu đã luyện', val: '256 câu', trend: '+24%' },
                  { icon: <Star size={13} className="fill-amber-400 text-amber-400" />, title: 'Độ chính xác', val: '88.7%', trend: '+6%' },
                  { icon: <BookOpen size={13} />, title: 'Chủ đề đã hoàn thành', val: '8 chủ đề', trend: '+2' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        {stat.icon}
                      </div>
                      <span className="font-semibold text-[#475569]">{stat.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#1E293B]">{stat.val}</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-md">
                        ▲ {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Exams Box */}
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Đề thi gợi ý cho bạn</h3>
                <button className="text-[#6366F1] text-[10px] font-bold hover:underline cursor-pointer">Xem tất cả</button>
              </div>

              <div className="space-y-3">
                {recommendedExams.map((ex, i) => (
                  <div key={ex.id} className="p-3 border border-slate-100 bg-slate-50/30 rounded-2xl flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-[#1E293B] truncate">{ex.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{ex.questionCount} câu • {ex.durationMinutes} phút</p>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${i === 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {i === 0 ? 'Khó' : 'Trung bình'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onStartExam(recommendedExams[0].id)}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Luyện thêm đề thi
                <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 2. STUDY PLAN TAB (Kế hoạch học tập) ── */}
      {activeTab === 'plan' && (
        <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-[#1E293B] mb-5">Kế hoạch ôn luyện hàng tuần</h2>

          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-start">
            {/* Left selector */}
            <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
              {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border ${selectedDay === day
                      ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-sm'
                      : 'bg-slate-50/50 text-[#475569] border-slate-100 hover:bg-slate-100'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Checklist content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Danh sách việc cần làm - {selectedDay}</span>
                <span className="text-xs font-black text-[#6366F1]">
                  {currentDayTasks.filter(t => t.done).length}/{currentDayTasks.length} hoàn thành
                </span>
              </div>

              {/* Tasks mapping */}
              <div className="space-y-2">
                {currentDayTasks.length > 0 ? (
                  currentDayTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t.id)}
                      className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50/30 rounded-2xl flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                          }`}>
                          {t.done && (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${t.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {t.text}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Chưa có nhiệm vụ học tập nào được thêm vào cho {selectedDay}.</p>
                )}
              </div>

              {/* Form add task */}
              <form onSubmit={handleAddTask} className="flex gap-2 pt-4 border-t border-slate-50">
                <input
                  type="text"
                  placeholder="Thêm nhiệm vụ học tập mới..."
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6366F1]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Thêm
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. STUDY HISTORY TAB (Lịch sử học tập) ── */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <h2 className="text-sm font-black text-[#1E293B]">Lịch sử ôn luyện và đọc tài liệu</h2>
            <button className="text-slate-400 text-xs font-bold hover:text-[#6366F1]">Xóa lịch sử</button>
          </div>

          <div className="space-y-4">
            {[
              { type: 'exam', title: 'Đề thi thử THPTQG 2026 - Môn Toán học - Đề số 1', info: 'Hoàn thành với điểm số: 8.5/10.0 • 45 phút', time: '14:24 - Hôm nay', score: '8.5' },
              { type: 'doc', title: 'Cẩm nang ôn thi Sinh học 10 - Tế bào học', info: 'Đã đọc chương: Cấu trúc tế bào & Trao đổi chất', time: 'Hôm qua • Thời gian đọc: 18 phút', score: null },
              { type: 'exam', title: 'Khảo sát chất lượng Vật lý 12 - Chuyên đề Dao động cơ học', info: 'Hoàn thành với điểm số: 7.8/10.0 • 30 phút', time: '29/06/2026', score: '7.8' },
              { type: 'doc', title: 'Cẩm nang Toán học 12 - Các phương pháp tính tích phân', info: 'Đã đọc chương: Phương pháp đổi biến số', time: '28/06/2026 • Thời gian đọc: 25 phút', score: null },
            ].map((item, i) => (
              <div key={i} className="p-4 border border-slate-100 hover:border-slate-200/80 rounded-2xl flex items-center justify-between gap-4 transition-all bg-slate-50/20">
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'exam' ? 'bg-indigo-50 text-[#6366F1]' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {item.type === 'exam' ? <Trophy size={16} /> : <BookOpen size={16} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#1E293B]">{item.title}</h3>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.info}</p>
                    <span className="text-[9px] font-bold text-slate-400 block mt-1.5">{item.time}</span>
                  </div>
                </div>
                {item.score && (
                  <span className="text-sm font-black text-[#6366F1] bg-indigo-50/60 px-3 py-1.5 rounded-xl shrink-0">
                    {item.score}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. GOALS & ACHIEVEMENTS TAB (Mục tiêu & Thành tích) ── */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Badge shelf */}
          <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-[#1E293B] mb-5">Huy hiệu học tập của bạn</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5">
              {[
                { title: 'Tân binh', desc: 'Đăng ký tài khoản thành công', unlocked: true, color: 'bg-indigo-50 text-[#6366F1]' },
                { title: 'Chăm chỉ', desc: 'Streak học tập đạt 5 ngày', unlocked: true, color: 'bg-emerald-50 text-emerald-600' },
                { title: 'Chiến thần Toán', desc: 'Đạt điểm 9.0+ đề thi Toán học', unlocked: false, color: 'bg-slate-100 text-slate-400' },
                { title: 'Kiên trì', desc: 'Luyện tập liên tục trong 15 ngày', unlocked: true, color: 'bg-amber-50 text-amber-600' },
                { title: 'Bất bại', desc: 'Độ chính xác trung bình trên 90%', unlocked: false, color: 'bg-slate-100 text-slate-400' },
                { title: 'Thông thái', desc: 'Đã hoàn thành 50 chủ đề', unlocked: false, color: 'bg-slate-100 text-slate-400' },
              ].map((b, i) => (
                <div key={i} className={`p-4 border border-slate-100 rounded-2xl text-center flex flex-col items-center justify-between h-36 ${b.unlocked ? 'bg-white shadow-sm' : 'bg-slate-50/50 opacity-60'
                  }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${b.color} shrink-0 mb-3`}>
                    <Award size={22} className={b.unlocked ? 'fill-current' : ''} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#1E293B] leading-none mb-1">{b.title}</h4>
                    <p className="text-[9px] text-slate-400 leading-normal">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Goal checklist progress */}
          <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-[#1E293B] mb-5">Danh sách mục tiêu</h2>

            <div className="space-y-4">
              {[
                { title: 'Ôn thi THPT Quốc gia môn Toán học - Mục tiêu 8+', target: 'Hoàn thành 62 chủ đề trọng tâm', progress: 68, label: '42/62 chủ đề' },
                { title: 'Tăng tốc Vật lý phần Dao động cơ học', target: 'Luyện tập tối thiểu 10 đề thi thử chuyên sâu', progress: 40, label: '4/10 đề thi' },
                { title: 'Xây dựng thói quen tự học hàng ngày', target: 'Duy trì chuỗi streak học liên tục 30 ngày', progress: 50, label: '15/30 ngày' },
              ].map((g, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-xs font-black text-[#1E293B]">{g.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{g.target}</p>
                    </div>
                    <span className="text-xs font-bold text-[#6366F1] bg-indigo-50/50 px-2.5 py-1 rounded-lg shrink-0">
                      {g.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
                    <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${g.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
