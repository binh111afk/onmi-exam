import React from 'react';
import { ChevronRight, GraduationCap } from 'lucide-react';
import {
  SidebarHomeIcon,
  SidebarExamsIcon,
  SidebarDocsIcon,
  SidebarRoadmapIcon,
  SidebarLeaderboardIcon,
  SidebarBlogIcon,
  SidebarContactIcon,
} from './AppIcons';
import { Logo } from './Logo';
import type { User } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user }) => {
  const sidebarItems = [
    { label: 'Trang chủ', view: 'home', icon: SidebarHomeIcon },
    { label: 'Đề thi trắc nghiệm', view: 'exams', icon: SidebarExamsIcon },
    { label: 'Tài liệu tự học', view: 'documents', icon: SidebarDocsIcon },
    { label: 'Lộ trình cá nhân', view: 'about', icon: SidebarRoadmapIcon },
    { label: 'Giáo viên', view: 'teacher', icon: GraduationCap },
    { label: 'Bảng xếp hạng', view: 'leaderboard', icon: SidebarLeaderboardIcon },
    { label: 'Blog', view: 'blog', icon: SidebarBlogIcon, isNew: true },
    { label: 'Liên hệ hỗ trợ', view: 'contact', icon: SidebarContactIcon },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 p-6 flex-col h-screen sticky top-0 overflow-y-auto shrink-0 select-none justify-between">

      <div className="space-y-[30px]">
        {/* Logo at the top of the sidebar */}
        <div className="pb-1 border-b border-slate-100/60">
          <Logo onViewChange={onViewChange} />
        </div>

        {/* Main Navigation Items */}
        <div className="space-y-1.5">
          {sidebarItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.view ||
              (item.view === 'exams' && currentView === 'exam-detail') ||
              (item.view === 'documents' && currentView === 'doc-reader');

            return (
              <button
                key={idx}
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
                {item.isNew && (
                  <span className="text-[8px] font-extrabold bg-[#FFF0F2] text-accent px-1.5 py-0.5 rounded border border-accent/20 scale-90">
                    MỚI
                  </span>
                )}
              </button>
            );
          })}
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
