import React, { useState } from 'react';
import { Search, Flame, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import type { User } from '../types';
import { Checkbox } from '../components/Checkbox';

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'notes' | 'summary'>('plan');
  const [noteText, setNoteText] = useState('Đã hoàn thành các bài ôn tập lý thuyết phần Đạo hàm và Giải tích 12.');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Đề thi');
  const [newTaskDuration, setNewTaskDuration] = useState('30 phút');
  const [modalTasks, setModalTasks] = useState<{ id: string; text: string; category: string; duration: string; done: boolean }[]>([
    { id: '1', text: 'Làm đề Toán THPT số 3', category: 'Đề thi', duration: '60 phút', done: true },
    { id: '2', text: 'Đọc Chương 2 - Tâm lý học', category: 'Tài liệu', duration: '45 phút', done: true },
    { id: '3', text: 'Ôn Flashcard Sinh học', category: 'Flashcard', duration: '30 phút', done: false }
  ]);

  const getSelectedDayOfWeekAndFullDate = () => {
    if (!selectedDay) return { dayOfWeek: '', fullDate: '' };
    const date = new Date(year, month, selectedDay);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = dayNames[date.getDay()];
    const pad = (n: number) => String(n).padStart(2, '0');
    const fullDate = `${pad(selectedDay)}/${pad(month + 1)}/${year}`;
    return { dayOfWeek, fullDate };
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: String(Date.now()),
      text: newTaskText,
      category: newTaskCategory,
      duration: newTaskDuration,
      done: false
    };
    setModalTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
    setIsAddingTask(false);
  };

  const handleToggleTask = (id: string) => {
    setModalTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

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

            {/* Isometric Stacked Books 3D Image */}
            <div className="relative w-44 h-40 shrink-0 flex items-center justify-center select-none pointer-events-none">
              <img 
                src="/books3d.png" 
                alt="3D Stacked Books" 
                className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md" 
              />
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
                      setSelectedDay(cell);
                      setIsModalOpen(true);
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
                    {hasEvent && !today && <span className="absolute bottom-0.5 h-1 w-1 bg-primary rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      {/* ── CALENDAR EVENT DETAILS MODAL ── */}
      {isModalOpen && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Box */}
          <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl relative overflow-hidden flex flex-col z-50 border border-slate-100 animate-scaleUp">
            {/* Header section with background grid and illustrations */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-[#ECEAFE] p-6 relative overflow-hidden shrink-0 border-b border-slate-100">
              {/* Background dots grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#e9edf5_1.5px,transparent_1.5px)] [background-size:15px_15px] opacity-40"></div>
              
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 flex items-center justify-center transition shadow-sm cursor-pointer z-20"
              >
                <X size={14} className="stroke-[2.5]" />
              </button>

              <div className="flex justify-between items-start relative z-10">
                {/* Left Header info */}
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md shadow-indigo-100/40 shrink-0 text-primary">
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-black text-primary tracking-wide uppercase">
                      {getSelectedDayOfWeekAndFullDate().dayOfWeek}
                    </div>
                    <h2 className="text-xl font-black text-[#1E293B] tracking-tight mt-0.5">
                      {getSelectedDayOfWeekAndFullDate().fullDate}
                    </h2>
                    <p className="text-[10px] text-text-secondary font-bold flex items-center gap-1 mt-1">
                      <span>☀️</span> Một ngày tốt để học và tiến bộ.
                    </p>
                  </div>
                </div>

                {/* Right Illustration: Calendar with Pencil */}
                <div className="w-24 h-24 relative select-none hidden sm:block shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Sparkles */}
                    <path d="M15 20 L18 25 L23 26 L18 27 L15 32 L12 27 L7 26 L12 25 Z" fill="#FBBF24" opacity="0.8" />
                    <path d="M85 70 L87 73 L90 74 L87 75 L85 78 L83 75 L80 74 L83 73 Z" fill="#FBBF24" opacity="0.8" />
                    {/* Calendar body */}
                    <rect x="25" y="30" width="50" height="50" rx="12" fill="white" stroke="#6C5DD3" strokeWidth="3" />
                    <rect x="25" y="30" width="50" height="15" rx="6" fill="#6C5DD3" />
                    {/* Spiral rings */}
                    <circle cx="35" cy="30" r="3" fill="#E2E8F0" />
                    <circle cx="45" cy="30" r="3" fill="#E2E8F0" />
                    <circle cx="55" cy="30" r="3" fill="#E2E8F0" />
                    <circle cx="65" cy="30" r="3" fill="#E2E8F0" />
                    {/* Grid cells mock */}
                    <rect x="33" y="52" width="8" height="8" rx="2" fill="#E2E8F0" />
                    <rect x="46" y="52" width="8" height="8" rx="2" fill="#E2E8F0" />
                    <rect x="59" y="52" width="8" height="8" rx="2" fill="#E2E8F0" />
                    <rect x="33" y="65" width="8" height="8" rx="2" fill="#E2E8F0" />
                    <rect x="46" y="65" width="8" height="8" rx="2" fill="#E2E8F0" />
                    <rect x="59" y="65" width="8" height="8" rx="2" fill="#E2E8F0" />
                    {/* Pencil */}
                    <path d="M78 40 L88 30 L93 35 L83 45 Z" fill="#8F85F3" />
                    <path d="M88 30 L93 35 L95 33 L90 28 Z" fill="#312E81" />
                    <path d="M78 40 L75 48 L83 45 Z" fill="#FCA5A5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-slate-100 bg-[#FAF9FF] shrink-0 text-center text-xs font-bold text-slate-500">
              <button 
                onClick={() => setActiveTab('plan')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer select-none ${
                  activeTab === 'plan' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                  <line x1="9" y1="19" x2="15" y2="19" />
                  <line x1="9" y1="11" x2="11" y2="11" />
                </svg>
                Kế hoạch
              </button>

              <button 
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer select-none ${
                  activeTab === 'notes' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Ghi chú
              </button>

              <button 
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer select-none ${
                  activeTab === 'summary' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Tổng kết
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 max-h-[350px] space-y-5">
              {activeTab === 'plan' && (
                <div className="space-y-4">
                  {/* Subheader */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-[#1E293B]">Nhiệm vụ hôm nay</span>
                    <button 
                      onClick={() => setIsAddingTask(true)}
                      className="font-black text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer transition select-none"
                    >
                      + Thêm nhiệm vụ
                    </button>
                  </div>

                  {/* Inline adding form */}
                  {isAddingTask && (
                    <div className="p-3 border border-indigo-100 bg-[#FAF9FF] rounded-2xl space-y-3 animate-fadeIn">
                      <input 
                        type="text"
                        placeholder="Tên nhiệm vụ..."
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddTask();
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <select 
                            value={newTaskCategory}
                            onChange={e => setNewTaskCategory(e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none cursor-pointer"
                          >
                            <option value="Đề thi">Đề thi</option>
                            <option value="Tài liệu">Tài liệu</option>
                            <option value="Flashcard">Flashcard</option>
                          </select>
                          <input 
                            type="text"
                            placeholder="Thời gian"
                            value={newTaskDuration}
                            onChange={e => setNewTaskDuration(e.target.value)}
                            className="w-28 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => setIsAddingTask(false)} className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 cursor-pointer">Hủy</button>
                          <button onClick={handleAddTask} className="px-2.5 py-1 bg-primary text-white rounded-lg text-[10px] font-bold cursor-pointer">Lưu</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task list */}
                  <div className="space-y-2.5">
                    {modalTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="p-3.5 border border-slate-100 rounded-2xl flex items-center justify-between bg-white shadow-sm hover:shadow hover:border-slate-250 transition"
                      >
                          <Checkbox
                            checked={task.done}
                            onChange={() => handleToggleTask(task.id)}
                            label={
                              <span className={`text-xs font-bold text-text-primary ${task.done ? 'line-through text-slate-400' : ''}`}>
                                {task.text}
                              </span>
                            }
                          />

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            task.category === 'Đề thi' 
                              ? 'bg-purple-50 text-primary' 
                              : task.category === 'Tài liệu' 
                                ? 'bg-indigo-50 text-indigo-600' 
                                : 'bg-emerald-50 text-success'
                          }`}>
                            {task.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{task.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Orbit suggestion banner */}
                  <div className="bg-[#F5F3FF]/70 border border-indigo-50/40 rounded-2xl p-4 flex gap-3.5 items-center">
                    <div className="w-12 h-12 relative select-none shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="25" y="35" width="50" height="45" rx="20" fill="white" stroke="#6C5DD3" strokeWidth="4" />
                        <rect x="30" y="42" width="40" height="26" rx="10" fill="#1E293B" />
                        <ellipse cx="42" cy="55" rx="3.5" ry="3.5" fill="#38BDF8" />
                        <ellipse cx="58" cy="55" rx="3.5" ry="3.5" fill="#38BDF8" />
                        <path d="M46 62 Q50 65 54 62" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <circle cx="21" cy="58" r="4.5" fill="#6C5DD3" />
                        <circle cx="79" cy="58" r="4.5" fill="#6C5DD3" />
                        <rect x="47" y="18" width="6" height="15" rx="3" fill="#6C5DD3" />
                        <circle cx="50" cy="18" r="5" fill="#8F85F3" />
                        <rect x="18" y="48" width="5" height="14" rx="2.5" fill="#E2E8F0" />
                        <rect x="77" y="48" width="5" height="14" rx="2.5" fill="#E2E8F0" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 space-y-0.5">
                      <h4 className="text-[11px] font-black text-primary flex items-center gap-1 leading-none">
                        AI Orbit gợi ý <span className="animate-pulse">✨</span>
                      </h4>
                      <p className="text-[10px] text-text-secondary leading-normal font-bold">
                        Bạn đã học rất đều đặn tuần này! Hôm nay thử dành 20 phút ôn lại Toán nhé.
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        setIsModalOpen(false);
                        onViewChange('exams');
                      }}
                      className="px-3 py-1.5 border border-primary hover:bg-primary-light text-primary text-[10px] font-black rounded-xl cursor-pointer transition shrink-0"
                    >
                      Bắt đầu ôn ngay
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3.5 h-full flex flex-col">
                  <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Ghi chú học tập</h3>
                  <textarea 
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Nhập ghi chú học tập cho ngày hôm nay..."
                    rows={6}
                    className="w-full p-4 border border-slate-205 rounded-2xl text-xs text-[#1E293B] outline-none resize-none bg-slate-50/20 focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary transition font-sans flex-1"
                  />
                  <p className="text-[9px] text-slate-400 font-bold text-right italic">Tự động lưu vào hệ thống</p>
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Tổng kết hiệu quả</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-slate-100 bg-[#FAF9FF] rounded-2xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Thời gian học</div>
                      <div className="text-lg font-black text-primary">2.5 giờ</div>
                      <div className="text-[9px] font-bold text-emerald-500 leading-none">+25% so với T2 trước</div>
                    </div>
                    <div className="p-4 border border-slate-100 bg-[#FAF9FF] rounded-2xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Đề thi đã làm</div>
                      <div className="text-lg font-black text-accent">2 đề thi</div>
                      <div className="text-[9px] font-bold text-slate-400 leading-none">Hoàn thành 100% mục tiêu</div>
                    </div>
                  </div>
                  <div className="p-4 border border-slate-100 rounded-2xl bg-white space-y-2">
                    <h4 className="text-[11px] font-black text-text-primary">Đánh giá ngày học</h4>
                    <p className="text-[10px] text-text-secondary leading-normal font-bold">
                      Một ngày học tập tuyệt vời! Bạn đã hoàn thành hầu hết các nhiệm vụ và duy trì được chuỗi ngày học tốt. Hãy duy trì phong độ này nhé!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with close button */}
            <div className="p-5 border-t border-slate-50 bg-[#FAF9FF] shrink-0 flex justify-center">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary hover:to-[#8F85F3]/90 text-white text-xs font-black rounded-2xl cursor-pointer shadow-md shadow-indigo-100 transition-all select-none text-center"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
