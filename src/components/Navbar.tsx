import React from 'react';
import { Search, LogIn, LogOut, Award, Flame, Menu, X } from 'lucide-react';
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

  const menuItems = [
    { label: 'Trang chủ', view: 'home' },
    { label: 'Đề thi', view: 'exams' },
    { label: 'Tài liệu', view: 'documents' },
    { label: 'Bảng xếp hạng', view: 'leaderboard' },
    { label: 'Giới thiệu', view: 'about' },
    { label: 'Liên hệ', view: 'contact' },
  ];

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 border-b border-slate-100 backdrop-blur-sm">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <Logo onViewChange={handleNavClick} />

          {/* Middle: Menu Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`text-sm font-medium transition-default ${
                  currentView === item.view || (item.view === 'exams' && currentView === 'exam-detail') || (item.view === 'documents' && currentView === 'doc-reader')
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Tìm đề thi, tài liệu..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'exams' && currentView !== 'documents') {
                    onViewChange('exams');
                  }
                }}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-input text-xs focus:bg-white transition-default"
              />
            </div>

            {/* Auth section */}
            {user.loggedIn ? (
              <div className="flex items-center gap-4">
                {/* Streak */}
                <div className="flex items-center gap-1 text-accent text-xs font-semibold bg-accent-light px-2.5 py-1 rounded-btn" title="Số ngày học liên tiếp">
                  <Flame size={14} className="fill-accent" />
                  <span>{user.streak} ngày</span>
                </div>
                {/* XP */}
                <div className="flex items-center gap-1 text-primary text-xs font-semibold bg-primary-light px-2.5 py-1 rounded-btn" title="Điểm kinh nghiệm (XP)">
                  <Award size={14} />
                  <span>{user.xp} XP</span>
                </div>
                {/* User avatar and logout */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-text-primary">{user.name}</span>
                    <button onClick={onLogout} className="text-[10px] text-text-secondary hover:text-danger flex items-center justify-end gap-0.5 transition-default">
                      <LogOut size={10} /> Đăng xuất
                    </button>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 text-text-primary font-medium text-xs rounded-btn hover:border-slate-300 hover:bg-slate-50 transition-default"
              >
                <LogIn size={13} />
                Đăng nhập
              </button>
            )}
          </div>

          {/* Mobile hamburger icon */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Search Input for Mobile/Tablet */}
            <div className="relative w-40 md:hidden">
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
                className="pl-3 pr-8 py-1 bg-slate-50 border border-slate-200 rounded-input text-xs w-full"
              />
              <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-text-secondary" />
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-btn text-text-secondary hover:bg-slate-100 hover:text-text-primary transition-default"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-btn transition-default ${
                currentView === item.view
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-100">
            {user.loggedIn ? (
              <div className="space-y-3 px-3">
                <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                  <span>Học viên: {user.name}</span>
                  <div className="flex gap-2">
                    <span className="text-accent bg-accent-light px-2 py-0.5 rounded">{user.streak}đ</span>
                    <span className="text-primary bg-primary-light px-2 py-0.5 rounded">{user.xp} XP</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-danger-light border border-danger/10 text-danger rounded-btn text-xs font-medium hover:bg-danger/10 transition-default flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2 bg-primary text-white rounded-btn text-xs font-medium hover:bg-primary-hover transition-default flex items-center justify-center gap-1.5"
              >
                <LogIn size={13} />
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
