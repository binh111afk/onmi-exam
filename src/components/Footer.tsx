import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onViewChange: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-12 mt-auto">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Logo onViewChange={onViewChange} />
            <p className="text-xs text-text-secondary leading-[1.6]">
              Nền tảng học tập trực tuyến cao cấp, kiến tạo hành trình tri thức lâu dài cho học sinh Việt Nam.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">Nền tảng</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onViewChange('exams')} className="text-text-secondary hover:text-primary transition-default">
                  Đề thi thử
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('documents')} className="text-text-secondary hover:text-primary transition-default">
                  Tài liệu học tập
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('leaderboard')} className="text-text-secondary hover:text-primary transition-default">
                  Bảng xếp hạng
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">Thông tin pháp lý</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onViewChange('about')} className="text-text-secondary hover:text-primary transition-default">
                  Giới thiệu
                </button>
              </li>
              <li>
                <span className="text-text-secondary hover:text-primary transition-default cursor-pointer">
                  Điều khoản dịch vụ
                </span>
              </li>
              <li>
                <span className="text-text-secondary hover:text-primary transition-default cursor-pointer">
                  Chính sách bảo mật
                </span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">Liên kết cộng đồng</h4>
            <div className="flex items-center gap-4 text-xs">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-primary transition-default"
              >
                Facebook
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-primary transition-default"
              >
                GitHub
              </a>
            </div>
            <p className="text-[10px] text-text-muted mt-4">
              &copy; {new Date().getFullYear()} Onmi Exam. Bảo lưu mọi quyền.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
