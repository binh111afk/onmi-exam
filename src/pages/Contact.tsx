import React, { useState } from 'react';
import { Mail, MapPin, Clock, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate contact form submission
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-[850px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
      
      {/* Left Column: Form */}
      <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-card notion-shadow space-y-5">
        <div>
          <h2 className="text-base font-bold text-text-primary">Gửi tin nhắn phản hồi</h2>
          <p className="text-[11px] text-text-secondary mt-1">Chúng tôi luôn lắng nghe ý kiến đóng góp để hoàn thiện sản phẩm học tập tốt hơn.</p>
        </div>

        {submitted && (
          <div className="p-3 bg-success-light border border-success/15 text-success rounded-btn text-xs font-semibold">
            Cảm ơn bạn! Thông tin liên hệ đã được gửi đi thành công.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-1">
              Họ tên của bạn
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              placeholder="ten@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-1">
              Nội dung góp ý
            </label>
            <textarea
              required
              placeholder="Góp ý về lỗi đề thi, giao diện hoặc tính năng mới..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-input text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-default"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default flex items-center justify-center gap-1.5"
          >
            <Send size={12} />
            Gửi liên hệ
          </button>
        </form>
      </div>

      {/* Right Column: Contact info details */}
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Liên hệ Onmi Exam</h1>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Bạn cần hỗ trợ kỹ thuật về tài khoản học viên hoặc đóng góp chuyên môn? Hãy kết nối với chúng tôi qua các kênh dưới đây.
          </p>
        </div>

        <div className="space-y-4 text-xs text-text-secondary">
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary">Hỗ trợ Học viên</h4>
              <p className="mt-0.5">support@omniexam.edu.vn</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary">Văn phòng chính</h4>
              <p className="mt-0.5 leading-relaxed">
                Tầng 4, Tòa nhà Innovation, Công viên phần mềm Quang Trung, Quận 12, TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary">Giờ làm việc</h4>
              <p className="mt-0.5">Thứ Hai - Thứ Sáu: 08:00 - 17:30</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
