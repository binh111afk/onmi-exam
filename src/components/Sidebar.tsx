import React from 'react';
import { Home, FileText, BookOpen, Compass, Trophy, Users, Newspaper } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const sidebarItems = [
    { label: 'Trang chủ', view: 'home', icon: Home },
    { label: 'Đề thi', view: 'exams', icon: FileText },
    { label: 'Tài liệu', view: 'documents', icon: BookOpen },
    { label: 'Lộ trình', view: 'about', icon: Compass },
    { label: 'Bảng xếp hạng', view: 'leaderboard', icon: Trophy },
    { label: 'Blog', view: 'blog', icon: Newspaper, isNew: true },
    { label: 'Liên hệ', view: 'contact', icon: Users },
  ];

  return (
    <aside className="hidden lg:flex w-56 bg-white border-r border-slate-200/80 p-4 flex-col h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto shrink-0 select-none">
      
      {/* 1. Main Navigation Items */}
      <div className="space-y-1">
        {sidebarItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentView === item.view || 
            (item.view === 'exams' && currentView === 'exam-detail') || 
            (item.view === 'documents' && currentView === 'doc-reader');

          return (
            <button
              key={idx}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-btn transition-default ${
                isActive
                  ? 'bg-primary-light/40 text-primary'
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={15} />
                <span>{item.label}</span>
              </div>
              {item.isNew && (
                <span className="text-[8px] font-bold bg-[#EFF6FF] text-primary px-1.5 py-0.5 rounded border border-primary/20 scale-90">
                  MỚI
                </span>
              )}
            </button>
          );
        })}
      </div>

    </aside>
  );
};
