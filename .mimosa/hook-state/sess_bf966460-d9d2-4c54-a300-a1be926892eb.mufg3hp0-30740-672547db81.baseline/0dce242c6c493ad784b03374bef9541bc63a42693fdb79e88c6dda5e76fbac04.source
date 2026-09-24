import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onViewChange: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-8 mt-auto text-xs text-text-secondary select-none">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: Brand Logo */}
        <Logo onViewChange={onViewChange} />

        {/* Middle: Menu text row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium">
          <button onClick={() => onViewChange('exams')} className="hover:text-primary transition-default">
            Đề thi trắc nghiệm
          </button>
          <button onClick={() => onViewChange('documents')} className="hover:text-primary transition-default">
            Tài liệu tự học
          </button>
          <button onClick={() => onViewChange('leaderboard')} className="hover:text-primary transition-default">
            Bảng xếp hạng
          </button>
          <button onClick={() => onViewChange('about')} className="hover:text-primary transition-default">
            Giới thiệu
          </button>
        </div>

        {/* Right: Copyright */}
        <div className="text-right flex flex-col gap-1 items-center sm:items-end">
          <p className="text-[10px] text-text-muted font-bold">
            &copy; {new Date().getFullYear()} Onmi Exam. Built for learning habit.
          </p>
          <div className="flex items-center gap-3 text-[10px] opacity-75 font-semibold">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-default">
              Facebook
            </a>
            <span>•</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-default">
              GitHub
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
