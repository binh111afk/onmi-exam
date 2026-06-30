import React, { useState } from 'react';
import { Search, Flame, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { User } from '../types';

interface HomeProps {
  user: User;
  onViewChange: (view: string) => void;
  onSelectDoc: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  onViewChange,
  onSelectDoc,
}) => {
  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  // Handle local query for redirecting to exams
  const [localQuery, setLocalQuery] = useState('');

  // Calendar logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Adjust Monday as start (Mon = 0, Sun = 6)
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const todayDate = new Date();
  const isToday = (day: number) => {
    return todayDate.getDate() === day && todayDate.getMonth() === month && todayDate.getFullYear() === year;
  };

  // Mock study days to highlight on calendar
  const highlightEvents: Record<number, { type: 'exam' | 'lesson'; title: string }> = {
    7: { type: 'exam', title: 'Thi thử Vật lý' },
    12: { type: 'exam', title: 'Kiểm tra tiếng Anh' },
    20: { type: 'lesson', title: 'Đọc tài liệu Giải tích' },
    29: { type: 'lesson', title: 'Bài tập Sinh học' }
  };

  // Formatted date string for dashboard header
  const getHeaderDateString = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date().toLocaleDateString('vi-VN', options);
  };

  // Top focus units data (Classes mockup style)
  const focusUnits = [
    {
      subject: 'Toán học - Giải tích 12',
      unit: 'Chương I: Đạo hàm & Khảo sát',
      teacher: 'Thầy Tiến Đạt',
      files: '32 tài liệu',
      gradient: 'from-[#4F46E5] to-[#7C3AED]',
      docId: 'doc-math-1',
      members: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40'
      ]
    },
    {
      subject: 'Vật lý - Dao động cơ',
      unit: 'Chuyên đề: Dao động điều hòa',
      teacher: 'Cô Chu Thảo',
      files: '14 tài liệu',
      gradient: 'from-[#6C5DD3] to-[#8F85F3]',
      docId: 'doc-phys-1',
      members: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=40&h=40',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=40&h=40',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=40&h=40'
      ]
    },
    {
      subject: 'Tiếng Anh - Ngữ pháp',
      unit: '20 Chủ điểm thi THPT Quốc gia',
      teacher: 'Ms. Hoa TOEIC',
      files: '45 tài liệu',
      gradient: 'from-[#FF758F] to-[#FF9EAF]',
      docId: 'doc-eng-1',
      members: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=40&h=40',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=40&h=40',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40'
      ]
    }
  ];

  // Practice progress table data (Lessons mockup style)
  const practiceHistory = [
    {
      subject: 'Toán học (Lớp 12)',
      teacher: 'Thầy Tiến Đạt',
      time: '29.06.2026',
      docName: 'Sổ tay Giải tích',
      docId: 'doc-math-1',
      status: 'completed',
      score: '9.0 điểm',
      members: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=24&h=24',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=24&h=24',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=24&h=24'
      ]
    },
    {
      subject: 'Vật lý (Lớp 12)',
      teacher: 'Cô Chu Thảo',
      time: '30.06.2026',
      docName: 'Sơ đồ tư duy Cơ học',
      docId: 'doc-phys-1',
      status: 'pending',
      score: 'Đang ôn',
      members: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=24&h=24',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=24&h=24'
      ]
    },
    {
      subject: 'Tiếng Anh (Lớp 12)',
      teacher: 'Ms. Hoa TOEIC',
      time: '25.06.2026',
      docName: '20 Chủ điểm Ngữ pháp',
      docId: 'doc-eng-1',
      status: 'completed',
      score: '8.5 điểm',
      members: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=24&h=24',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=24&h=24',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=24&h=24',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=24&h=24'
      ]
    }
  ];

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================= */}
        {/* CENTER COLUMN: Main dashboard elements (8/12 width)    */}
        {/* ======================================================= */}
        <div className="lg:col-span-8 space-y-7">
          
          {/* Header row: Search Bar & Live Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Pill Search bar matching reference */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4.5 top-3.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm đề thi, tài liệu hoặc môn học..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && localQuery.trim()) {
                    onViewChange('exams');
                  }
                }}
                className="w-full pl-11 pr-5 py-3 bg-[#E9EDF5]/60 hover:bg-[#E9EDF5]/90 border border-transparent rounded-full text-xs text-text-primary focus:bg-white focus:border-primary/40 focus:ring-0 transition-all placeholder:text-text-muted/80 font-medium"
              />
            </div>

            {/* Current Date in Vietnamese */}
            <div className="text-[11px] font-black text-text-secondary uppercase tracking-wider pl-2">
              {getHeaderDateString()}
            </div>

          </div>

          {/* Welcome back / Hero Banner */}
          <section className="bg-white border border-slate-100 rounded-card p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Grid graphic overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#e9edf5_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>

            <div className="flex-1 space-y-4 relative z-10 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-black text-text-primary leading-tight tracking-tight">
                Chào mừng quay trở lại,<br />
                <span className="text-primary">{user.name}!</span>
              </h1>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-[380px] mx-auto sm:mx-0">
                Các tài liệu ôn tập và đề thi thử THPT Quốc gia môn Toán, Lý, Anh mới nhất đã được cập nhật sẵn sàng. Hãy ôn luyện ngay để củng cố kiến thức!
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onViewChange('exams')}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-black rounded-full transition-all duration-200 shadow-[0_4px_12px_rgba(108,93,211,0.2)] hover:shadow-[0_6px_16px_rgba(108,93,211,0.3)] cursor-pointer"
                >
                  Luyện đề ngay
                </button>
              </div>
            </div>

            {/* Isometric Stacked Books SVG Graphic */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bottom Book (Blue) */}
                <path d="M40 120 L110 150 L170 120 L100 90 Z" fill="#4F46E5" />
                <path d="M40 120 L40 128 L110 158 L110 150 Z" fill="#3730A3" />
                <path d="M110 150 L110 158 L170 128 L170 120 Z" fill="#312E81" />
                <path d="M48 123 L110 150 L162 124" stroke="#818CF8" strokeWidth="2" fill="none" />
                <path d="M41 123 L41 127 L109 156 L109 152 Z" fill="#E2E8F0" />
                <path d="M110 152 L110 156 L169 127 L169 123 Z" fill="#CBD5E1" />

                {/* Middle Book (Pink/Rose) */}
                <path d="M30 90 L100 120 L160 90 L90 60 Z" fill="#FF758F" />
                <path d="M30 90 L30 98 L100 128 L100 120 Z" fill="#E0536C" />
                <path d="M100 120 L100 128 L160 98 L160 90 Z" fill="#B32B44" />
                <path d="M38 93 L100 120 L152 94" stroke="#FFA3B5" strokeWidth="2" fill="none" />
                <path d="M31 93 L31 97 L99 126 L99 122 Z" fill="#E2E8F0" />
                <path d="M100 122 L100 126 L159 97 L159 93 Z" fill="#CBD5E1" />

                {/* Top Book (Light Blue/Cyan) */}
                <path d="M50 60 L120 90 L180 60 L110 30 Z" fill="#0EA5E9" />
                <path d="M50 60 L50 68 L120 98 L120 90 Z" fill="#0284C7" />
                <path d="M120 90 L120 98 L180 68 L180 60 Z" fill="#0369A1" />
                <path d="M58 63 L120 90 L172 64" stroke="#38BDF8" strokeWidth="2" fill="none" />
                <path d="M51 63 L51 67 L119 96 L119 92 Z" fill="#E2E8F0" />
                <path d="M120 92 L120 96 L179 67 L179 63 Z" fill="#CBD5E1" />

                {/* Paper sheet on top of top book */}
                <path d="M75 52 L115 69 L155 52 L115 35 Z" fill="#FFFFFF" />
                <line x1="92" y1="47" x2="112" y2="55" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="97" y1="52" x2="120" y2="61" stroke="#94A3B8" strokeWidth="1.5" />
                <line x1="110" y1="43" x2="130" y2="51" stroke="#94A3B8" strokeWidth="1.5" />
                
                {/* Spark particles */}
                <circle cx="155" cy="25" r="2.5" fill="#FF758F" />
                <circle cx="135" cy="18" r="1.5" fill="#6C5DD3" />
                <circle cx="65" cy="115" r="2" fill="#10B981" />
              </svg>
            </div>

          </section>

          {/* Classes section (gradient cards layout) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-primary">
                Chuyên đề trọng tâm
              </h2>
              <button
                onClick={() => onViewChange('documents')}
                className="text-[10px] font-black text-primary hover:underline cursor-pointer"
              >
                Xem tất cả &rarr;
              </button>
            </div>

            {/* Gradient card row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {focusUnits.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectDoc(item.docId)}
                  className={`bg-gradient-to-br ${item.gradient} text-white rounded-card p-5 space-y-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 relative overflow-hidden`}
                >
                  {/* Subtle orb background graphics */}
                  <div className="absolute -top-12 -right-12 h-28 w-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded">
                      {item.subject.split(' - ')[0]}
                    </span>
                    <h3 className="text-xs font-black leading-snug pt-1 h-9 line-clamp-2">
                      {item.unit}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <div className="flex items-center -space-x-1.5">
                      {item.members.map((avatar, aIdx) => (
                        <img
                          key={aIdx}
                          src={avatar}
                          alt="member"
                          className="h-5.5 w-5.5 rounded-full border-2 border-white/90 object-cover"
                        />
                      ))}
                      <div className="h-5.5 w-5.5 rounded-full bg-white/20 border-2 border-white/90 flex items-center justify-center text-[7px] font-bold">
                        +5
                      </div>
                    </div>

                    <div className="text-right leading-none">
                      <div className="text-[8px] font-medium opacity-80">{item.files}</div>
                      <div className="text-[9px] font-extrabold mt-1">{item.teacher}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Lessons table section (Practice progress layout) */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-text-primary">
              Tiến độ ôn tập & kết quả
            </h2>

            {/* Custom styled table with card containment */}
            <div className="bg-white border border-slate-100 rounded-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-text-secondary uppercase tracking-wider">
                      <th className="py-4 px-5">Môn học / Chuyên đề</th>
                      <th className="py-4 px-4">Giáo viên</th>
                      <th className="py-4 px-4">Lượt ôn</th>
                      <th className="py-4 px-4">Ngày học</th>
                      <th className="py-4 px-4">Tài liệu</th>
                      <th className="py-4 px-5 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-text-primary">
                    {practiceHistory.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <button
                            onClick={() => onSelectDoc(row.docId)}
                            className="font-bold text-text-primary hover:text-primary transition-default text-left cursor-pointer"
                          >
                            {row.subject}
                            <span className="block text-[9px] text-text-secondary font-medium mt-0.5">{row.docName}</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-text-secondary font-bold">{row.teacher}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center -space-x-1">
                            {row.members.slice(0, 3).map((avatar, aIdx) => (
                              <img
                                key={aIdx}
                                src={avatar}
                                alt="member"
                                className="h-5 w-5 rounded-full border border-white object-cover"
                              />
                            ))}
                            {row.members.length > 3 && (
                              <div className="h-5 w-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[7px] font-bold text-text-secondary">
                                +{row.members.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-text-secondary font-medium">{row.time}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => onSelectDoc(row.docId)}
                            className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} /> Tải về
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-55 text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                            {row.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: Sidebar (User info, Calendar)            */}
        {/* ======================================================= */}
        <div className="lg:col-span-4 space-y-7">
          
          {/* 1. Student Profile Card */}
          <section className="bg-white border border-slate-100 rounded-card p-6 text-center space-y-4 flex flex-col items-center">
            
            {/* Avatar circle */}
            <div className="relative group cursor-pointer">
              <div className="h-20 w-20 rounded-full border-4 border-primary-light bg-primary text-white font-black text-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accent border-2 border-white rounded-full p-1 text-white shadow-sm flex items-center justify-center" title="Streak">
                <Flame size={12} className="fill-white stroke-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-text-primary">{user.name}</h3>
              <p className="text-[10px] text-text-secondary font-bold">Học sinh lớp 12</p>
            </div>

            {/* Streak and XP display */}
            <div className="w-full grid grid-cols-2 gap-3 py-3 border-y border-slate-100/80">
              <div className="text-center">
                <div className="text-[9px] font-extrabold text-text-secondary uppercase">Chuỗi ngày học</div>
                <div className="text-sm font-black text-accent mt-1 flex items-center justify-center gap-0.5">
                  <Flame size={14} className="fill-accent text-accent" />
                  <span>{user.streak} ngày</span>
                </div>
              </div>
              <div className="text-center border-l border-slate-100">
                <div className="text-[9px] font-extrabold text-text-secondary uppercase">Kinh nghiệm</div>
                <div className="text-sm font-black text-primary mt-1">
                  <span>{user.xp} XP</span>
                </div>
              </div>
            </div>

            {/* Level progression bar */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-[9px] text-text-secondary font-bold">
                <span>Cấp độ học tập: 1</span>
                <span>{user.xp} / 1500 XP</span>
              </div>
              <div className="w-full h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#8F85F3] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((user.xp / 1500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => onViewChange('profile')}
              className="w-full py-2.5 bg-primary-light hover:bg-[#E9EEFC] text-primary text-xs font-black rounded-xl transition-all duration-200 cursor-pointer"
            >
              Hồ sơ cá nhân
            </button>
          </section>

          {/* 2. Interactive Calendar */}
          <section className="bg-white border border-slate-100 rounded-card p-6 space-y-4">
            
            {/* Header of calendar */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-text-primary">
                {monthNames[month]} {year}
              </h3>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 border border-slate-100 rounded-lg text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 border border-slate-100 rounded-lg text-text-secondary hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-text-secondary uppercase">
              <div>T2</div>
              <div>T3</div>
              <div>T4</div>
              <div>T5</div>
              <div>T6</div>
              <div>T7</div>
              <div>CN</div>
            </div>

            {/* Calendar grid cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (cell === null) {
                  return <div key={idx} className="h-7"></div>;
                }

                const today = isToday(cell);
                const hasEvent = highlightEvents[cell];

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (hasEvent) {
                        alert(`Sự kiện ngày ${cell}/${month+1}: ${hasEvent.title}`);
                      }
                    }}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all relative cursor-pointer ${
                      today
                        ? 'bg-accent text-white font-black shadow-[0_3px_8px_rgba(255,117,143,0.3)]'
                        : hasEvent
                          ? 'bg-primary-light text-primary border border-primary/20 font-black'
                          : 'text-text-primary hover:bg-slate-50'
                    }`}
                  >
                    <span>{cell}</span>
                    {/* Small event indicator dot */}
                    {hasEvent && !today && (
                      <span className="absolute bottom-0.5 h-1 w-1 bg-primary rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
