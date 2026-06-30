import React from 'react';
import { Search, LogOut, Award, Flame, Moon, Menu, X, User as UserIcon } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 h-14 select-none">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          
          {/* Left: Brand Logo */}
          <Logo onViewChange={handleNavClick} />

          {/* Right: Actions, Search, and Dark Mode */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Search Input with Ctrl+K */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm đề thi, tài liệu, chủ đề..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'exams' && currentView !== 'documents') {
                    onViewChange('exams');
                  }
                }}
                className="pl-8.5 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:bg-white focus:border-primary focus:ring-0 transition-default placeholder:text-text-muted/80"
              />
              <div className="absolute right-3 top-2.5 flex items-center px-1.5 py-0.5 border border-slate-200 bg-white rounded text-[8px] text-text-muted select-none pointer-events-none font-bold">
                Ctrl K
              </div>
            </div>

            {/* Moon Icon (Dark Mode preview trigger) */}
            <button 
              onClick={() => alert('Chức năng giao diện tối sẽ sớm được hoàn thiện.')}
              className="p-1.5 border border-slate-200 rounded-full text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-default"
              title="Chuyển chế độ tối"
            >
              <Moon size={15} />
            </button>

            {/* Auth / Account Status */}
            {user.loggedIn ? (
              <div className="flex items-center gap-3">
                {/* Mini stats */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-accent font-bold text-xs" title="Streak">
                    <Flame size={14} className="fill-accent" />
                    <span>{user.streak}đ</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-primary font-bold text-xs" title="XP">
                    <Award size={14} />
                    <span>{user.xp} XP</span>
                  </div>
                </div>

                {/* Profile block with Hover Dropdown */}
                <div className="relative group flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer py-1">
                  <div className="flex flex-col text-right leading-none">
                    <span className="text-[11px] font-bold text-text-primary">{user.name}</span>
                    <span className="text-[9px] text-text-secondary mt-1">Học sinh</span>
                  </div>
                  <div className="h-7 w-7 rounded-full border border-slate-200 bg-primary text-white font-bold text-xs flex items-center justify-center transition-all group-hover:ring-2 group-hover:ring-primary/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Dropdown Card */}
                  <div className="absolute right-0 top-9 w-36 bg-white border border-slate-200/80 rounded-card shadow-lg py-1 hidden group-hover:block z-50 animate-fadeIn">
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full text-left px-3.5 py-2 text-[10px] font-bold text-text-primary hover:bg-slate-50 flex items-center gap-2 transition-default uppercase"
                    >
                      <UserIcon size={12} className="text-slate-400" />
                      Tài khoản
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        onLogout();
                        handleNavClick('home');
                      }}
                      className="w-full text-left px-3.5 py-2 text-[10px] font-bold text-danger hover:bg-red-50 flex items-center gap-2 transition-default uppercase"
                    >
                      <LogOut size={12} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full transition-default shadow-sm flex items-center gap-1"
              >
                Đăng nhập
              </button>
            )}

          </div>

          {/* Mobile menu hamburger toggler */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 border border-slate-200 rounded-full text-text-secondary hover:bg-slate-50 transition-default ml-2"
            title="Danh mục menu"
          >
            {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 w-full bg-white border-b border-slate-200 shadow-md p-4 space-y-2.5 z-50">
          {[
            { label: 'Trang chủ', view: 'home' },
            { label: 'Đề thi', view: 'exams' },
            { label: 'Tài liệu', view: 'documents' },
            { label: 'Lộ trình', view: 'about' },
            { label: 'Bảng xếp hạng', view: 'leaderboard' },
            { label: 'Blog', view: 'blog' },
            { label: 'Liên hệ', view: 'contact' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-btn transition-default ${
                currentView === item.view ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          
          <div className="pt-3 border-t border-slate-150">
            {user.loggedIn ? (
              <div className="flex items-center justify-between px-3 text-xs">
                <span className="font-semibold text-text-secondary">{user.name}</span>
                <button 
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }} 
                  className="text-danger font-bold"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2 bg-primary text-white text-xs font-bold rounded-btn text-center"
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
