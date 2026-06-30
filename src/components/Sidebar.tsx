import React from 'react';
import { Home, FileText, BookOpen, Compass, Trophy, Users, Newspaper, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const sidebarItems = [
    { label: 'Trang chủ', view: 'home', icon: Home },
    { label: 'Đề thi trắc nghiệm', view: 'exams', icon: FileText },
    { label: 'Tài liệu tự học', view: 'documents', icon: BookOpen },
    { label: 'Lộ trình cá nhân', view: 'about', icon: Compass },
    { label: 'Bảng xếp hạng', view: 'leaderboard', icon: Trophy },
    { label: 'Blog tin tức', view: 'blog', icon: Newspaper, isNew: true },
    { label: 'Liên hệ hỗ trợ', view: 'contact', icon: Users },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 p-6 flex-col h-screen sticky top-0 overflow-y-auto shrink-0 select-none justify-between">
      
      <div className="space-y-8">
        {/* Logo at the top of the sidebar */}
        <div className="pb-2 border-b border-slate-100/60">
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
                className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={16} className={isActive ? 'text-primary' : 'text-text-secondary/80'} />
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

      {/* Support widget at the bottom */}
      <div className="mt-8 bg-slate-50 border border-slate-100 rounded-3xl p-5 relative overflow-hidden text-center flex flex-col items-center">
        {/* Support Vector Image or Icon */}
        <div className="relative mb-3.5 flex items-center justify-center bg-primary-light/50 h-12 w-12 rounded-full text-primary">
          <MessageSquare size={20} className="stroke-[2.5]" />
          <span className="absolute -top-1.5 -right-1.5 bg-accent text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full border border-white">
            24/7
          </span>
        </div>
        
        <h4 className="text-xs font-black text-text-primary mb-1">Cần hỗ trợ?</h4>
        <p className="text-[10px] text-text-secondary leading-normal mb-3.5 px-1">
          Bạn gặp khó khăn hay có thắc mắc trong quá trình học?
        </p>
        <button
          onClick={() => onViewChange('contact')}
          className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-[10px] font-black rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
        >
          Liên hệ ngay
        </button>
      </div>

    </aside>
  );
};
