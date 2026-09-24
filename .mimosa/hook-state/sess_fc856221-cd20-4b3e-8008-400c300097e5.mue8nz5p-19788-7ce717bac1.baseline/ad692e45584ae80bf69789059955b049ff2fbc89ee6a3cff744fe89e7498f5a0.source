import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, ChevronDown, Send, CheckCircle2, Globe } from 'lucide-react';
import { Select } from '../components/Select';

const faqItems = [
  { q: 'Làm thế nào để khôi phục mật khẩu?', a: 'Vào trang đăng nhập, nhấn "Quên mật khẩu" và nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại trong vòng vài phút.' },
  { q: 'Tôi không nhận được email xác nhận?', a: 'Kiểm tra thư mục Spam hoặc Junk Mail. Nếu vẫn không thấy, liên hệ hỗ trợ qua form hoặc email support@omniexam.edu.vn.' },
  { q: 'Làm sao để nâng cấp tài khoản Premium?', a: 'Vào "Hồ sơ cá nhân" → "Gói dịch vụ" → chọn gói Premium phù hợp và thanh toán trực tuyến.' },
  { q: 'Tôi có thể học trên nhiều thiết bị không?', a: 'Có, tài khoản của bạn được đồng bộ hóa thời gian thực trên cả máy tính, máy tính bảng và điện thoại di động.' },
  { q: 'Làm thế nào để hủy gia hạn Premium?', a: 'Bạn có thể hủy gia hạn gói bất cứ lúc nào trong mục "Hồ sơ cá nhân" -> "Gói dịch vụ" của mình mà không mất phí.' },
  { q: 'Kết quả làm bài thi có được lưu lại không?', a: 'Tất cả kết quả làm bài thi, thời gian hoàn thành và điểm số đều được lưu trữ tự động trong phần lịch sử của Lộ trình cá nhân.' },
];

const categories = [
  { bg: 'bg-indigo-50/70', color: 'text-indigo-600', label: 'Hỗ trợ kỹ thuật', desc: 'Gặp sự cố khi sử dụng website hoặc ứng dụng', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" /></svg> },
  { bg: 'bg-indigo-50/70', color: 'text-indigo-600', label: 'Tài khoản học viên', desc: 'Đăng ký, đăng nhập hoặc thông tin tài khoản', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" strokeLinecap="round" /></svg> },
  { bg: 'bg-emerald-50/70', color: 'text-emerald-600', label: 'Đóng góp nội dung', desc: 'Gửi tài liệu, đề thi hoặc chia sẻ kiến thức', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="3" /><line x1="8" y1="9" x2="16" y2="9" strokeLinecap="round" /><line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" /><line x1="8" y1="17" x2="13" y2="17" strokeLinecap="round" /></svg> },
  { bg: 'bg-amber-50/70', color: 'text-amber-600', label: 'Góp ý & đề xuất', desc: 'Ý tưởng cải thiện sản phẩm và trải nghiệm', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" /><circle cx="12" cy="16" r="0.5" fill="currentColor" /></svg> },
  { bg: 'bg-rose-50/70', color: 'text-rose-600', label: 'Hợp tác & khác', desc: 'Hợp tác, truyền thông hoặc các vấn đề khác', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" /></svg> },
];

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName(''); setEmail(''); setRequestType(''); setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] flex items-center gap-2">
          Liên hệ Onmi Exam
          <span className="text-[#818CF8]">★</span>
        </h1>
        <p className="text-[#64748B] text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl">
          Hãy kết nối với chúng tôi qua các kênh dưới đây. Đội ngũ Onmi luôn sẵn sàng hỗ trợ bạn!
        </p>
      </header>

      {/* ── MAIN RESPONSIVE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr] gap-6 mb-8">

        {/* ── COL 1: FORM ── */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0]/70 p-6 shadow-sm h-full flex flex-col">
          <div className="flex items-center gap-2.5 mb-5 pb-2 border-b border-slate-50">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Mail size={15} className="text-[#6366F1]" />
            </div>
            <span className="font-black text-xs sm:text-sm text-[#1E293B] uppercase tracking-wider">
              Gửi tin nhắn cho chúng tôi
            </span>
          </div>

          {submitted && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              Cảm ơn bạn! Tin nhắn đã được gửi thành công.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Họ và tên của bạn</label>
              <input type="text" required placeholder="Nhập họ và tên" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-[#1E293B] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6366F1] bg-white transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Địa chỉ Email</label>
              <input type="email" required placeholder="Nhập email của bạn" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-[#1E293B] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6366F1] bg-white transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Loại yêu cầu</label>
              <Select
                value={requestType}
                onChange={setRequestType}
                variant="default"
                placeholder="Chọn loại yêu cầu"
                options={[
                  { value: 'tech', label: 'Hỗ trợ kỹ thuật' },
                  { value: 'account', label: 'Tài khoản học viên' },
                  { value: 'content', label: 'Đóng góp nội dung' },
                  { value: 'feedback', label: 'Góp ý & đề xuất' },
                  { value: 'collab', label: 'Hợp tác & khác' },
                ]}
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[120px]">
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Nội dung tin nhắn</label>
              <textarea required placeholder="Mô tả chi tiết vấn đề hoặc góp ý của bạn..." value={message} onChange={e => setMessage(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-[#1E293B] outline-none resize-none bg-white focus:ring-2 focus:ring-indigo-100 focus:border-[#6366F1] transition-all font-sans flex-1" />
            </div>

            {/* Attachment */}
            <div className="p-3 border border-dashed border-indigo-100 rounded-xl bg-slate-50/30 text-center cursor-pointer hover:bg-indigo-50/20 transition-colors shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6366F1] mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[11px] font-bold text-[#6366F1]">Đính kèm tệp (nếu có)</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Hỗ trợ PDF, PNG, JPG (tối đa 10MB)</p>
            </div>

            <button type="submit" className="w-full py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-100 shrink-0">
              <Send size={13} /> Gửi tin nhắn
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1 font-medium shrink-0">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Thông tin của bạn được bảo mật tuyệt đối
            </p>
          </form>
        </div>

        {/* ── COL 2: ILLUSTRATION & TOPICS STACK ── */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-white rounded-3xl border border-[#E2E8F0]/70 p-6 flex flex-col items-center justify-center text-center shadow-sm flex-1">
            <svg viewBox="0 0 260 200" className="w-full max-w-[180px] mb-4" fill="none">
              <ellipse cx="130" cy="105" rx="95" ry="80" fill="#EEF2FF" opacity="0.6" />
              <ellipse cx="175" cy="70" rx="45" ry="38" fill="#E0E7FF" opacity="0.5" />
              <rect x="145" y="22" width="72" height="44" rx="12" fill="#6366F1" />
              <circle cx="161" cy="44" r="4.5" fill="white" />
              <circle cx="181" cy="44" r="4.5" fill="white" />
              <circle cx="201" cy="44" r="4.5" fill="white" />
              <path d="M150 66 L162 80 L168 66" fill="#6366F1" />
              <rect x="148" y="118" width="68" height="48" rx="8" fill="#818CF8" opacity="0.75" />
              <path d="M148 126 L182 146 L216 126" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M68 105 C68 72 88 52 115 52 C142 52 162 72 162 105" stroke="#4338CA" strokeWidth="6" strokeLinecap="round" />
              <rect x="56" y="100" width="20" height="30" rx="10" fill="#6366F1" />
              <rect x="154" y="100" width="20" height="30" rx="10" fill="#6366F1" />
              <path d="M76 130 Q62 144 67 158 L84 158" stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="82" y="153" width="22" height="10" rx="5" fill="#6366F1" />
            </svg>
            <h3 className="text-xs font-black text-[#1E293B] mb-1.5">Chúng tôi luôn sẵn sàng hỗ trợ bạn</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4 max-w-xs">Mọi phản hồi của bạn đều rất quan trọng để Onmi ngày càng hoàn thiện.</p>
            <div className="w-full space-y-3.5 text-left">
              {[ { icon: <Clock size={13} />, title: 'Phản hồi nhanh chóng', desc: 'Cam kết trong vòng 24 giờ' }, { icon: <MessageSquare size={13} />, title: 'Hỗ trợ tận tâm', desc: 'Giải đáp mọi thắc mắc' } ].map((f, i) => (
                <div key={i} className="flex gap-2.5"><div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[#6366F1] shrink-0 shadow-sm">{f.icon}</div><div><h4 className="text-[11px] font-black text-[#1E293B] leading-none mb-0.5">{f.title}</h4><p className="text-[9px] text-slate-400 font-medium leading-relaxed">{f.desc}</p></div></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-[#E2E8F0]/70 p-5 shadow-sm">
            <h3 className="text-xs font-black text-[#1E293B] mb-3 uppercase tracking-wider">Bạn muốn liên hệ vấn đề nào?</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {categories.slice(0, 4).map((cat, i) => {
                const reqTypes = ['tech', 'account', 'content', 'feedback'];
                const isSelected = requestType === reqTypes[i];
                return (
                  <button key={i} type="button" onClick={() => setRequestType(reqTypes[i])} className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer bg-slate-50/10 shadow-sm ${isSelected ? 'border-[#6366F1] bg-indigo-50/30 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-[#6366F1]/55 hover:bg-slate-50/40'}`}>
                    <div className={`w-8 h-8 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-1.5 shrink-0 shadow-inner`}>{cat.icon}</div>
                    <h4 className="text-[10px] font-black text-[#1E293B] leading-tight">{cat.label}</h4>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── COL 3: INFO & FAQ ── */}
        <div className="flex flex-col gap-6 h-full md:col-span-2 lg:col-span-1">
          <div className="bg-white rounded-3xl border border-[#E2E8F0]/70 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider pb-1.5 border-b border-slate-50">Thông tin liên hệ khác</h3>
            <div className="space-y-4">
              {[
                { icon: <Mail size={14} />, title: 'Email hỗ trợ', info: 'support@omniexam.edu.vn', label: 'Phản hồi trong 24h', highlight: true },
                { icon: <Phone size={14} />, title: 'Số điện thoại', info: '028 1234 5678', label: 'T2 - T6: 08:00 – 17:30' },
                { icon: <Globe size={14} />, title: 'Cộng đồng học tập', info: 'community.omniexam.edu.vn', label: 'Thảo luận và chia sẻ tài liệu cùng bạn bè' },
                { icon: <MapPin size={14} />, title: 'Văn phòng chính', info: 'Tòa nhà Innovation, CV PM Quang Trung, Q.12, TP.HCM', label: '' }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start"><div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 shadow-sm">{item.icon}</div><div className="min-w-0"><h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{item.title}</h4><p className={`text-xs font-bold leading-normal truncate ${item.highlight ? 'text-[#6366F1]' : 'text-[#1E293B]'}`}>{item.info}</p>{item.label && <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{item.label}</span>}</div></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-[#E2E8F0]/70 p-5 shadow-sm space-y-3 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-50">
              <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">Hỏi đáp nhanh</h3>
            </div>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-3 py-2.5 flex justify-between items-center text-left text-xs font-bold text-[#1E293B] bg-slate-50/20 hover:bg-slate-50/50 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-3 pb-3 pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-50 animate-fadeIn">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Contact;
