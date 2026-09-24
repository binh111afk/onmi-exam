import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Award, Flame, CheckCircle2, Eye, EyeOff, Phone, Calendar, School, Milestone, Star, FileText, History, PenTool, Bookmark, LogOut } from 'lucide-react';
import type { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile, onViewChange, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [school, setSchool] = useState('Trường THPT Chuyên Lê Hồng Phong');
  const [grade, setGrade] = useState('Lớp 12');
  const [phone, setPhone] = useState('0972 123 456');
  const [joinDate, setJoinDate] = useState('12/03/2024');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 select-none">
      
      {/* Page Title Header */}
      <div className="pb-4 border-b border-slate-100 max-w-[900px] sm:max-w-none">
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
          Hồ sơ cá nhân
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Quản lý thông tin tài khoản, bảo mật và theo dõi hành trình học tập của bạn.
        </p>
      </div>

      {/* Success alert banner */}
      {showSuccessAlert && (
        <div className="p-4 bg-emerald-55 border border-emerald-100 rounded-card flex items-center gap-3 animate-fadeIn max-w-[900px] sm:max-w-none">
          <CheckCircle2 className="text-success shrink-0" size={18} />
          <span className="text-xs font-black text-success">
            Cập nhật thông tin tài khoản thành công!
          </span>
        </div>
      )}

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-4 bg-[#FFF0F2] border border-accent/25 rounded-card flex items-center gap-2 max-w-[900px] sm:max-w-none">
          <span className="text-xs font-black text-accent">
            {errorMsg}
          </span>
        </div>
      )}

      {/* Two-column layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================= */}
        {/* LEFT COLUMN: Profile Banner, Personal Info, Password   */}
        {/* ======================================================= */}
        <div className="lg:col-span-8 space-y-7">
          
          {/* Header Banner Card (Cosmic gradient + Saturn) */}
          <section className="bg-gradient-to-r from-[#6C5DD3] to-[#8E83FA] text-white rounded-card p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between h-64 sm:h-56 shadow-lg shadow-primary/10">
            
            {/* Saturn Orbit Illustration in vector SVG */}
            <div className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-36 sm:h-36 opacity-30 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="18" fill="url(#saturnBody)" />
                <ellipse cx="50" cy="50" rx="38" ry="8" stroke="url(#saturnRing)" strokeWidth="4.5" transform="rotate(-15, 50, 50)" />
                <defs>
                  <radialGradient id="saturnBody" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#C8C2FF" />
                    <stop offset="100%" stopColor="#5B4FBA" />
                  </radialGradient>
                  <linearGradient id="saturnRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#C8C2FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#5B4FBA" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Profile Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
              
              {/* Avatar block with pen edit */}
              <div className="relative cursor-pointer group">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white/20 bg-white/10 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md transition-all group-hover:scale-105">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white border border-primary text-primary rounded-full p-1.5 shadow-sm flex items-center justify-center hover:bg-slate-50 transition">
                  <PenTool size={10} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">{name}</h2>
                  <span className="text-[8px] font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-full uppercase border border-white/10">
                    👑 Premium
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-white/80 font-medium">
                  Học tập hôm nay, chinh phục ngày mai! 🚀
                </p>
                <button
                  onClick={onLogout}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-lg border border-white/20 transition-all cursor-pointer w-fit"
                >
                  <LogOut size={11} />
                  Đăng xuất
                </button>
              </div>
            </div>

            {/* Stats row at the bottom of the banner */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10 relative z-10 text-center sm:text-left">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg w-7 h-7 mx-auto sm:mx-0 flex items-center justify-center shrink-0">
                  <Bookmark size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black leading-none">1.248</div>
                  <div className="text-[8px] font-bold text-white/70 mt-1 uppercase tracking-wide">Tài liệu đã lưu</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 border-l border-white/10 pl-2">
                <div className="p-1.5 bg-white/10 rounded-lg w-7 h-7 mx-auto sm:mx-0 flex items-center justify-center shrink-0">
                  <FileText size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black leading-none">32</div>
                  <div className="text-[8px] font-bold text-white/70 mt-1 uppercase tracking-wide">Đề thi đã làm</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 border-l border-white/10 pl-2">
                <div className="p-1.5 bg-white/10 rounded-lg w-7 h-7 mx-auto sm:mx-0 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black leading-none">89%</div>
                  <div className="text-[8px] font-bold text-white/70 mt-1 uppercase tracking-wide">Tỉ lệ đúng TB</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 border-l border-white/10 pl-2">
                <div className="p-1.5 bg-white/10 rounded-lg w-7 h-7 mx-auto sm:mx-0 flex items-center justify-center shrink-0">
                  <Star size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[11px] font-black leading-none">5</div>
                  <div className="text-[8px] font-bold text-white/70 mt-1 uppercase tracking-wide">Huy hiệu</div>
                </div>
              </div>

            </div>

          </section>

          {/* Form wrapper */}
          <form onSubmit={handleSave} className="space-y-7">
            
            {/* Section: Thông tin cá nhân */}
            <div className="bg-white border border-slate-100 rounded-card p-6 space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-primary border-b border-slate-100 pb-3">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Họ và tên</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Họ và tên"
                    />
                    <div className="absolute right-4 top-3.5 text-text-secondary/70">
                      <PenTool size={12} />
                    </div>
                  </div>
                </div>

                {/* Trường học */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Trường học</label>
                  <div className="relative">
                    <School className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Trường học"
                    />
                    <div className="absolute right-4 top-3.5 text-text-secondary/70">
                      <PenTool size={12} />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Địa chỉ Email"
                    />
                    <div className="absolute right-4 top-3.5 text-text-secondary/70">
                      <PenTool size={12} />
                    </div>
                  </div>
                </div>

                {/* Khối lớp */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Khối lớp</label>
                  <div className="relative">
                    <Milestone className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Khối lớp"
                    />
                    <div className="absolute right-4 top-3.5 text-text-secondary/70">
                      <PenTool size={12} />
                    </div>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Số điện thoại"
                    />
                    <div className="absolute right-4 top-3.5 text-text-secondary/70">
                      <PenTool size={12} />
                    </div>
                  </div>
                </div>

                {/* Ngày tham gia */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Ngày tham gia</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Ngày tham gia"
                    />
                    <div className="absolute right-4 top-3.5 text-text-secondary/70">
                      <PenTool size={12} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Section: Thay đổi mật khẩu */}
            <div className="bg-white border border-slate-100 rounded-card p-6 space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-primary border-b border-slate-100 pb-3">
                Thay đổi mật khẩu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Mật khẩu cũ */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Mật khẩu cũ</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="pl-11 pr-10 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Nhập mật khẩu cũ"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-4 top-3.5 text-text-secondary/70 hover:text-text-primary transition cursor-pointer"
                    >
                      {showOldPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="px-4 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-3.5 text-text-secondary/70 hover:text-text-primary transition cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider pl-1">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="px-4 py-3 text-xs bg-slate-50/50 border border-slate-100 rounded-xl w-full focus:bg-white focus:border-primary/45 focus:ring-0 transition-all font-semibold"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-3.5 text-text-secondary/70 hover:text-text-primary transition cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom security note */}
              <div className="pt-2 flex items-center gap-2 text-[10px] text-text-secondary font-bold bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                <Shield size={14} className="text-primary" />
                <span>Mật khẩu của bạn được bảo mật bằng mã hóa <strong className="text-primary font-black">AES-256</strong></span>
              </div>

            </div>

            {/* Form actions buttons */}
            <div className="flex justify-end gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onViewChange('home')}
                className="px-6 py-3 border border-slate-100 bg-white hover:bg-slate-50 text-text-primary text-xs font-black rounded-xl transition-all duration-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20"
              >
                Lưu thay đổi
              </button>
            </div>

          </form>

        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: Learn Journey, Badges, History Logs       */}
        {/* ======================================================= */}
        <div className="lg:col-span-4 space-y-7">
          
          {/* 1. Hành trình học tập */}
          <section className="bg-white border border-slate-100 rounded-card p-6 space-y-4">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider border-b border-slate-100 pb-3">
              Hành trình học tập
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Streak box */}
              <div className="p-4 bg-[#FFF0F2] border border-[#FF758F]/10 rounded-2xl flex flex-col justify-between min-h-[90px] relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-accent uppercase tracking-wide">Chuỗi học tập</span>
                  <Flame size={15} className="text-accent fill-accent shrink-0" />
                </div>
                <div className="mt-2 text-slate-800 font-bold">
                  <div className="text-sm font-black text-accent">{user.streak} ngày</div>
                  <div className="text-[7.5px] text-text-secondary mt-1 font-semibold">Giữ vững phong độ!</div>
                </div>
              </div>

              {/* XP box */}
              <div className="p-4 bg-primary-light border border-primary/10 rounded-2xl flex flex-col justify-between min-h-[90px] relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-primary uppercase tracking-wide">Điểm kinh nghiệm</span>
                  <Award size={15} className="text-primary shrink-0" />
                </div>
                <div className="mt-2 text-slate-800 font-bold">
                  <div className="text-sm font-black text-primary">{user.xp} XP</div>
                  <div className="text-[7.5px] text-text-secondary mt-1 font-semibold">Cấp độ 12</div>
                </div>
              </div>

            </div>
          </section>

          {/* 2. Huy chương (Hexagons layout) */}
          <section className="bg-white border border-slate-100 rounded-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
                Huy chương
              </h3>
              <button
                onClick={() => onViewChange('home')}
                className="text-[9px] font-black text-primary hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              
              {/* Blue Hexagon (Siêu chiến binh) */}
              <div className="flex flex-col items-center">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-blue-50 fill-blue-50/60" stroke="#0091FF" strokeWidth="3">
                    <polygon points="50,5 93,30 93,80 50,95 7,80 7,30" />
                  </svg>
                  <Award size={18} className="text-[#0091FF] relative z-10" />
                </div>
                <div className="text-[8.5px] font-black text-text-primary mt-2">Siêu chiến binh</div>
                <div className="text-[7.5px] text-text-secondary mt-0.5">Top 10%</div>
              </div>

              {/* Red/Pink Hexagon (Lý thuyết gia) */}
              <div className="flex flex-col items-center">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-50 fill-red-50/60" stroke="#FF758F" strokeWidth="3">
                    <polygon points="50,5 93,30 93,80 50,95 7,80 7,30" />
                  </svg>
                  <Star size={18} className="text-[#FF758F] relative z-10 fill-[#FF758F]" />
                </div>
                <div className="text-[8.5px] font-black text-text-primary mt-2">Lý thuyết gia</div>
                <div className="text-[7.5px] text-text-secondary mt-0.5">Top 20%</div>
              </div>

              {/* Green Hexagon (Học tập bền bỉ) */}
              <div className="flex flex-col items-center">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-emerald-50 fill-emerald-50/60" stroke="#10B981" strokeWidth="3">
                    <polygon points="50,5 93,30 93,80 50,95 7,80 7,30" />
                  </svg>
                  <CheckCircle2 size={18} className="text-[#10B981] relative z-10" />
                </div>
                <div className="text-[8.5px] font-black text-text-primary mt-2">Học tập bền bỉ</div>
                <div className="text-[7.5px] text-text-secondary mt-0.5">Top 15%</div>
              </div>

            </div>
          </section>

          {/* 3. Lịch sử làm bài gần đây */}
          <section className="bg-white border border-slate-100 rounded-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
                Lịch sử làm bài gần đây
              </h3>
              <button
                onClick={() => onViewChange('exams')}
                className="text-[9px] font-black text-primary hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-3.5">
              
              {/* Practice 1 */}
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-blue-50 text-[#0091FF] rounded-xl shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-text-primary block truncate text-[11px]">
                      Đề thi thử THPT Toán 12
                    </span>
                    <span className="text-[9px] text-text-secondary block mt-0.5 font-medium">
                      29/06/2026
                    </span>
                  </div>
                </div>
                <span className="font-black shrink-0 px-2.5 py-0.5 rounded-md bg-emerald-55 text-success text-[10px]">
                  9.0 điểm
                </span>
              </div>

              {/* Practice 2 */}
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-text-primary block truncate text-[11px]">
                      Đề thi thử Hóa học 12
                    </span>
                    <span className="text-[9px] text-text-secondary block mt-0.5 font-medium">
                      26/06/2026
                    </span>
                  </div>
                </div>
                <span className="font-black shrink-0 px-2.5 py-0.5 rounded-md bg-emerald-55 text-success text-[10px]">
                  8.5 điểm
                </span>
              </div>

              {/* Practice 3 */}
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-text-primary block truncate text-[11px]">
                      Đề thi thử Vật lý 12
                    </span>
                    <span className="text-[9px] text-text-secondary block mt-0.5 font-medium">
                      24/06/2026
                    </span>
                  </div>
                </div>
                <span className="font-black shrink-0 px-2.5 py-0.5 rounded-md bg-[#FFF0F2] text-accent text-[10px]">
                  7.5 điểm
                </span>
              </div>

            </div>

            {/* Bottom history redirect button */}
            <button
              onClick={() => onViewChange('exams')}
              className="w-full mt-2 py-2.5 bg-white border border-slate-100 hover:bg-slate-50 text-text-primary text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-default"
            >
              <History size={12} />
              <span>Xem toàn bộ lịch sử</span>
            </button>
          </section>

        </div>

      </div>
    </div>
  );
};
export default Profile;
