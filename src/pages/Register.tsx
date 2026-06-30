import React, { useState } from 'react';
import { StudyIllustration } from '../components/Illustration';

interface RegisterProps {
  onRegisterSuccess: (name: string, email: string) => void;
  onViewChange: (view: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onViewChange }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ các trường thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không trùng khớp.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    // Simulate successful registration
    onRegisterSuccess(name, email);
    onViewChange('home');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[950px] w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-slate-100 rounded-dialog p-6 sm:p-10 notion-shadow">
        
        {/* Left Column: Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center pr-6 border-r border-slate-100">
          <StudyIllustration />
          <div className="text-center mt-4">
            <h3 className="text-sm font-semibold text-text-primary">Kiến tạo thói quen</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-[280px]">
              Tích lũy XP, xây dựng chuỗi ngày học liên tục (streak) và tự tin chinh phục các kì thi sắp tới.
            </p>
          </div>
        </div>

        {/* Right Column: Register Card */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Tạo tài khoản học tập</h2>
            <p className="text-xs text-text-secondary mt-1">
              Bắt đầu hành trình học tập trực tuyến cao cấp tại Onmi Exam.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-danger-light border border-danger/10 text-danger rounded-btn text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-text-primary mb-1.5">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary mb-1.5">
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="ten@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-primary mb-1.5">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="Mật khẩu tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-primary mb-1.5">
                Nhập lại mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="Xác nhận lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Checkbox agreement */}
            <div className="flex items-start">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-xs text-text-secondary leading-normal">
                  Tôi đồng ý với các <span className="text-primary hover:underline">Điều khoản sử dụng</span> và{' '}
                  <span className="text-primary hover:underline">Chính sách bảo mật</span> của Onmi Exam.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default mt-2"
            >
              Đăng ký tài khoản
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Đã có tài khoản?{' '}
            <button onClick={() => onViewChange('login')} className="text-primary hover:underline font-semibold">
              Đăng nhập
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
