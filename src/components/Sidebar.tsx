import React from 'react';
import { BookOpen, ChevronRight, Compass, GraduationCap, Home, Target, TrendingUp } from 'lucide-react';
import { Logo } from './Logo';
import type { User } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: User;
}

const sidebarGroups: { label: string; items: { label: string; view: string; icon: React.ElementType }[] }[] = [
  {
    label: 'HỌC TẬP',
    items: [
      { label: 'Tổng quan', view: 'home', icon: Home },
      { label: 'Khóa học', view: 'courses', icon: BookOpen },
      { label: 'Luyện tập', view: 'practice', icon: Target },
    ],
  },
  {
    label: 'TIẾN ĐỘ',
    items: [
      { label: 'Tiến độ', view: 'progress', icon: TrendingUp },
    ],
  },
  {
    label: 'KHÁM PHÁ',
    items: [
      { label: 'Khám phá', view: 'discover', icon: Compass },
    ],
  },
];

const activeViews: Record<string, string> = {
  home: 'home',
  courses: 'courses',
  'course-detail': 'courses',
  practice: 'practice',
  'practice-exams': 'practice',
  'practice-topics': 'practice',
  'practice-mistakes': 'practice',
  'practice-quick': 'practice',
  'practice-detail': 'practice',
  'practice-take': 'practice',
  progress: 'progress',
  discover: 'discover',
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user }) => {
  const activeItem = activeViews[currentView] || currentView;

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 p-6 flex-col h-screen sticky top-0 overflow-y-auto shrink-0 select-none justify-between">

      <div className="space-y-[30px]">
        {/* Logo at the top of the sidebar */}
        <div className="pb-1 border-b border-slate-100/60">
          <Logo onViewChange={onViewChange} />
        </div>

        {/* Main Navigation Groups */}
        <div className="space-y-5">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              <p className="px-4 text-[9px] font-extrabold tracking-widest text-text-muted mb-2">{group.label}</p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.view;

                  return (
                    <button
                      key={item.view}
                      onClick={() => onViewChange(item.view)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold rounded-2xl transition-all duration-200 cursor-pointer ${isActive
                          ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                          : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="px-4 text-[9px] font-extrabold tracking-widest text-text-muted mb-2">GIÁO VIÊN</p>
            <div className="space-y-1.5">
              <button
                onClick={() => onViewChange('teacher')}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-bold rounded-2xl transition-all duration-200 cursor-pointer ${currentView === 'teacher'
                    ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                  }`}
              >
                <GraduationCap size={18} className={currentView === 'teacher' ? 'text-primary' : 'text-slate-400'} />
                <span>Teacher Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Card at the bottom */}
      <button
        onClick={() => onViewChange('profile')}
        className="mt-4 w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-primary-light border border-slate-100 hover:border-primary/20 rounded-2xl transition-all duration-200 cursor-pointer group"
      >
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
          {user.loggedIn ? user.name.charAt(0).toUpperCase() : '?'}
        </div>

        {/* Name + status */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-black text-text-primary truncate group-hover:text-primary transition-colors">
            {user.loggedIn ? user.name : 'Khách'}
          </p>
          <p className="text-[10px] text-text-secondary font-medium truncate">
            {user.loggedIn ? `${user.xp} XP • Streak ${user.streak} 🔥` : 'Đăng nhập để tiếp tục'}
          </p>
        </div>

        <ChevronRight size={14} className="text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
      </button>

    </aside>
  );
};
