import React, { useState } from 'react';
import { Search, LogOut, Award, Flame, Menu, X, User as UserIcon, LogIn } from 'lucide-react';
import type { User } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: User;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  user,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="lg:hidden sticky top-0 z-40 w-full bg-white border-b border-slate-100 h-14 select-none">
      <div className="px-4 h-full flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggler */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border border-slate-100 rounded-xl text-text-secondary hover:bg-slate-50 transition-default cursor-pointer"
          title="Mở menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Center: Brand Logo */}
        <Logo onViewChange={handleNavClick} />

        {/* Right: Quick Action / Profile */}
        <div className="flex items-center gap-2">
          {user.loggedIn ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="h-8 w-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="p-2 border border-slate-100 rounded-xl text-primary hover:bg-primary-light transition-default cursor-pointer"
              title="Đăng nhập"
            >
              <LogIn size={18} />
            </button>
          )}
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-white border-b border-slate-200 shadow-lg p-5 space-y-4 z-50 animate-fadeIn">
          {/* Quick Search on Mobile */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'exams' && currentView !== 'documents') {
                  onViewChange('exams');
                }
              }}
              className="pl-9 pr-4 py-2.5 bg-slate-55 border border-slate-100 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Trang chủ', view: 'home' },
              { label: 'Đề thi', view: 'exams' },
              { label: 'Tài liệu', view: 'documents' },
              { label: 'Lộ trình', view: 'about' },
              { label: 'Xếp hạng', view: 'leaderboard' },
              { label: 'Blog', view: 'blog' },
              { label: 'Liên hệ', view: 'contact' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.view)}
                className={`text-left px-4 py-3 text-xs font-bold rounded-xl transition-default cursor-pointer ${
                  currentView === item.view ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {user.loggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-primary leading-none">{user.name}</span>
                    <span className="text-[9px] text-text-secondary mt-1">Cấp độ 1 • {user.xp} XP</span>
                  </div>
                  
                  {/* Streak & XP info */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-accent flex items-center gap-0.5">
                      <Flame size={12} className="fill-accent text-accent" /> {user.streak}đ
                    </span>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                      <Award size={12} /> {user.xp} XP
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-text-primary text-[10px] font-black rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserIcon size={12} /> HỒ SƠ
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                      onViewChange('home');
                    }}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-danger text-[10px] font-black rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut size={12} /> ĐĂNG XUẤT
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl text-center cursor-pointer"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
