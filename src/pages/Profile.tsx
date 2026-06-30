import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Award, Flame, Save, CheckCircle2 } from 'lucide-react';
import type { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onViewChange: (view: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile, onViewChange }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [school, setSchool] = useState('Trường THPT Chuyên Lê Hồng Phong');
  const [grade, setGrade] = useState('Lớp 12');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [selectedBg, setSelectedBg] = useState('bg-blue-600');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const avatarBgs = [
    { name: 'Xanh dương', class: 'bg-blue-600' },
    { name: 'Xanh lá', class: 'bg-emerald-600' },
    { name: 'Cam', class: 'bg-amber-600' },
    { name: 'Tím', class: 'bg-purple-600' },
    { name: 'Teal', class: 'bg-teal-600' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Họ và tên không được bỏ trống.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Địa chỉ email không hợp lệ.');
      return;
    }

    if (newPassword || oldPassword || confirmPassword) {
      if (!oldPassword) {
        setErrorMsg('Vui lòng nhập mật khẩu cũ.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Xác nhận mật khẩu mới không khớp.');
        return;
      }
    }

    // Trigger state save
    onUpdateProfile({
      name,
      email,
    });

    setShowSuccessAlert(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
          Cài đặt tài khoản
        </h1>
        <p className="text-xs text-text-secondary">
          Quản lý thông tin cá nhân, cập nhật mật khẩu bảo mật và theo dõi hồ sơ học tập của bạn.
        </p>
      </div>

      {/* Success alert banner */}
      {showSuccessAlert && (
        <div className="p-4 bg-success-light border border-success/20 rounded-card flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="text-success shrink-0" size={18} />
          <span className="text-xs font-bold text-success-hover">
            Cập nhật thông tin tài khoản thành công!
          </span>
        </div>
      )}

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-4 bg-danger-light border border-danger/25 rounded-card flex items-center gap-2">
          <span className="text-xs font-bold text-danger">
            {errorMsg}
          </span>
        </div>
      )}

      {/* Two-column main sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Forms (Col 8/12) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Personal info */}
          <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
              Thông tin cá nhân
            </h3>

            {/* Avatar picker container */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-3">
              <div className={`h-16 w-16 rounded-full text-white font-black text-2xl flex items-center justify-center border-2 border-white shadow-sm shrink-0 transition-colors duration-300 ${selectedBg}`}>
                {name.trim() ? name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Chọn màu ảnh đại diện</span>
                <div className="flex flex-wrap items-center gap-2">
                  {avatarBgs.map((bg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBg(bg.class)}
                      className={`h-6 w-6 rounded-full border transition-all ${bg.class} ${
                        selectedBg === bg.class ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Họ và tên</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-8.5 focus:border-primary"
                    placeholder="Nhập họ tên"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8.5 focus:border-primary"
                    placeholder="name@school.edu.vn"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Trường học</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="focus:border-primary"
                  placeholder="Nhập tên trường học"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Khối lớp</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-btn px-3 py-2 text-xs font-semibold focus:border-primary focus:ring-0 focus:outline-none"
                >
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Đại học">Đại học / Khác</option>
                </select>
              </div>
            </div>

          </div>

          {/* Section 2: Password change */}
          <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
              Thay đổi mật khẩu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Mật khẩu cũ</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="pl-8.5 focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="focus:border-primary"
                  placeholder="Từ 6 ký tự"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:border-primary"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions Form Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onViewChange('home')}
              className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-text-primary text-xs font-bold rounded-btn transition-default"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-btn flex items-center gap-1.5 shadow-sm transition-default"
            >
              <Save size={13} />
              Lưu thay đổi
            </button>
          </div>

        </form>

        {/* Right Side: Learn Accomplishments (Col 4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Badge Achievements */}
          <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
              Hồ sơ rèn luyện
            </h3>

            {/* Streak & XP row */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-accent-light/35 border border-accent/20 rounded text-accent flex flex-col items-center">
                <Flame size={18} className="fill-accent mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wide">Chuỗi streak</span>
                <span className="text-sm font-black mt-1 leading-none">{user.streak} Ngày</span>
              </div>
              <div className="p-3 bg-primary-light/45 border border-primary/20 rounded text-primary flex flex-col items-center">
                <Award size={18} className="mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wide">Điểm kinh nghiệm</span>
                <span className="text-sm font-black mt-1 leading-none">{user.xp} XP</span>
              </div>
            </div>

            {/* Accomplished Badges list */}
            <div className="space-y-2 pt-1">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">Huy chương học tập</span>
              {user.badges && user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {user.badges.map((badge) => {
                    let theme = 'bg-slate-50 border-slate-200 text-slate-700';
                    let emoji = '🏅';

                    if (badge.includes('Lý thuyết')) {
                      theme = 'bg-blue-50 border-blue-200/50 text-blue-700';
                      emoji = '📖';
                    } else if (badge.includes('chiến binh') || badge.includes('Chiến binh')) {
                      theme = 'bg-red-50 border-red-200/50 text-red-700';
                      emoji = '🔥';
                    } else if (badge.includes('bền bỉ') || badge.includes('Chăm chỉ')) {
                      theme = 'bg-emerald-50 border-emerald-200/50 text-emerald-700';
                      emoji = '⚡';
                    } else if (badge.includes('Vô địch') || badge.includes('Top')) {
                      theme = 'bg-amber-50 border-amber-250/50 text-amber-700';
                      emoji = '🏆';
                    } else if (badge.includes('Sáng tạo')) {
                      theme = 'bg-purple-50 border-purple-200/50 text-purple-700';
                      emoji = '💡';
                    }

                    return (
                      <span
                        key={badge}
                        className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-full flex items-center gap-1 shadow-sm transition-all duration-200 hover:scale-[1.02] ${theme}`}
                      >
                        <span>{emoji}</span>
                        <span>{badge}</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[10px] text-text-muted italic block">Chưa sở hữu huy chương nào.</span>
              )}
            </div>
          </div>

          {/* User History Logs */}
          <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
              Lịch sử làm bài
            </h3>

            {user.completedExams && Object.keys(user.completedExams).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(user.completedExams).map(([examId, data], idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="truncate pr-2">
                      <span className="font-semibold text-text-primary block truncate">
                        {examId === 'exam-math-1' ? 'Đề thi thử THPT Toán 12' : 'Đề luyện tập trắc nghiệm'}
                      </span>
                      <span className="text-[9px] text-text-muted block mt-0.5">
                        {new Date(data.completedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className={`font-black shrink-0 px-2 py-0.5 rounded ${
                      data.score >= 8.0 
                        ? 'bg-success-light text-success' 
                        : data.score >= 5.0 
                          ? 'bg-amber-light text-accent' 
                          : 'bg-danger-light text-danger'
                    }`}>
                      {data.score.toFixed(1)} đ
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-text-secondary italic">Bạn chưa hoàn thành đề thi nào.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default Profile;
