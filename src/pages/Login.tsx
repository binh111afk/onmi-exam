import React, { useState } from 'react';
import { StudyIllustration } from '../components/Illustration';
import { Checkbox } from '../components/Checkbox';

interface LoginProps {
  onLoginSuccess: (name: string, email: string) => void;
  onViewChange: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onViewChange }) => {
  const [email, setEmail] = useState('khoi.dang@omniexam.edu.vn');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    // Simulate successful login
    // We default to the initial user's details or whatever they typed
    const defaultName = email.includes('admin') ? 'Quản trị viên' : 'Đặng Minh Khôi';
    onLoginSuccess(defaultName, email);
  };

  const handleThirdPartyLogin = (provider: string) => {
    onLoginSuccess(`Học viên ${provider}`, `${provider.toLowerCase()}@omniexam.edu.vn`);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[950px] w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-slate-100 rounded-dialog p-6 sm:p-10 notion-shadow">
        
        {/* Left Column: Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center pr-6 border-r border-slate-100">
          <StudyIllustration />
          <div className="text-center mt-4">
            <h3 className="text-sm font-semibold text-text-primary">Kiến thức rộng mở</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-[280px]">
              Tham gia làm bài thi thử trực tuyến chất lượng và đọc tài liệu độc quyền từ đội ngũ giáo viên giàu kinh nghiệm.
            </p>
          </div>
        </div>

        {/* Right Column: Login Card */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Đăng nhập tài khoản</h2>
            <p className="text-xs text-text-secondary mt-1">
              Trải nghiệm môi trường tự học tập tập trung và không quảng cáo.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-danger-light border border-danger/10 text-danger rounded-btn text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Checkbox and link */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={rememberMe}
                onChange={setRememberMe}
                label={<span className="text-xs text-text-secondary font-semibold">Ghi nhớ đăng nhập</span>}
              />
              
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => alert('Chức năng khôi phục mật khẩu đang được bảo trì.')}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default mt-2"
            >
              Đăng nhập
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-text-muted">Hoặc đăng nhập bằng</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleThirdPartyLogin('Google')}
              className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-btn text-xs font-semibold text-text-primary hover:bg-slate-50 transition-default"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleThirdPartyLogin('Microsoft')}
              className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-btn text-xs font-semibold text-text-primary hover:bg-slate-50 transition-default"
            >
              <svg className="h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                <rect x="0" y="0" width="11" height="11" fill="#F25022" />
                <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
                <rect x="0" y="12" width="11" height="11" fill="#00A1F1" />
                <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Chưa có tài khoản?{' '}
            <button onClick={() => onViewChange('register')} className="text-primary hover:underline font-semibold">
              Đăng ký ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
