import React, { useState } from 'react';

const faqItems = [
  { q: 'Làm thế nào để khôi phục mật khẩu?', a: 'Vào trang đăng nhập, nhấn "Quên mật khẩu" và nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại trong vòng vài phút.' },
  { q: 'Tôi không nhận được email xác nhận?', a: 'Kiểm tra thư mục Spam hoặc Junk Mail. Nếu vẫn không thấy, liên hệ hỗ trợ qua form hoặc email support@omniexam.edu.vn.' },
  { q: 'Làm sao để nâng cấp tài khoản Premium?', a: 'Vào "Hồ sơ cá nhân" → "Gói dịch vụ" → chọn gói Premium phù hợp và thanh toán trực tuyến.' },
];

const categories = [
  { bg: '#EEF2FF', color: '#6366F1', label: 'Hỗ trợ kỹ thuật', desc: 'Gặp sự cố khi sử dụng website hoặc ứng dụng', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round"/></svg> },
  { bg: '#EEF2FF', color: '#6366F1', label: 'Tài khoản học viên', desc: 'Đăng ký, đăng nhập hoặc thông tin tài khoản', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" strokeLinecap="round"/></svg> },
  { bg: '#ECFDF5', color: '#10B981', label: 'Đóng góp nội dung', desc: 'Gửi tài liệu, đề thi hoặc chia sẻ kiến thức', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="2" width="16" height="20" rx="3"/><line x1="8" y1="9" x2="16" y2="9" strokeLinecap="round"/><line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round"/><line x1="8" y1="17" x2="13" y2="17" strokeLinecap="round"/></svg> },
  { bg: '#FFF7ED', color: '#F59E0B', label: 'Góp ý & đề xuất', desc: 'Ý tưởng cải thiện sản phẩm và trải nghiệm', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg> },
  { bg: '#FFF0F2', color: '#F43F5E', label: 'Hợp tác & khác', desc: 'Hợp tác, truyền thông hoặc các vấn đề khác', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/></svg> },
];

const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  border: '1px solid rgba(226,232,240,0.7)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

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
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 1160, margin: '0 auto', padding: '32px 20px' }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          Liên hệ Onmi Exam
          <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, color: '#818CF8' }} fill="currentColor">
            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
          Bạn cần hỗ trợ kỹ thuật, tài khoản học viên hoặc đóng góp chuyên môn?<br />
          Hãy kết nối với chúng tôi qua các kênh dưới đây. Đội ngũ Onmi luôn sẵn sàng hỗ trợ bạn!
        </p>
      </div>

      {/* ── MAIN 3-COL GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20, alignItems: 'start', marginBottom: 24 }}>

        {/* ── COL 1: FORM ── */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" style={{ width: 14, height: 14, color: '#6366F1' }} fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Gửi tin nhắn cho chúng tôi</span>
          </div>

          {submitted && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, color: '#065F46', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg viewBox="0 0 20 20" style={{ width: 14, height: 14, flexShrink: 0 }} fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Cảm ơn bạn! Tin nhắn đã được gửi thành công.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1E293B', marginBottom: 6 }}>Họ và tên của bạn</label>
              <input type="text" required placeholder="Nhập họ và tên" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '9px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, color: '#1E293B', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1E293B', marginBottom: 6 }}>Địa chỉ Email</label>
              <input type="email" required placeholder="Nhập email của bạn" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, color: '#1E293B', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
            </div>

            {/* Request type */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1E293B', marginBottom: 6 }}>Loại yêu cầu</label>
              <div style={{ position: 'relative' }}>
                <select value={requestType} onChange={e => setRequestType(e.target.value)}
                  style={{ width: '100%', padding: '9px 36px 9px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, color: requestType ? '#1E293B' : '#94A3B8', outline: 'none', appearance: 'none', background: '#fff', cursor: 'pointer', boxSizing: 'border-box' }}>
                  <option value="">Chọn loại yêu cầu</option>
                  <option value="tech">Hỗ trợ kỹ thuật</option>
                  <option value="account">Tài khoản học viên</option>
                  <option value="content">Đóng góp nội dung</option>
                  <option value="feedback">Góp ý & đề xuất</option>
                  <option value="collab">Hợp tác & khác</option>
                </select>
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8', pointerEvents: 'none' }}>
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1E293B', marginBottom: 6 }}>Nội dung tin nhắn</label>
              <textarea required rows={4} placeholder={'Mô tả chi tiết vấn đề hoặc góp ý của bạn...\n(Chúng tôi sẽ phản hồi sớm nhất có thể)'} value={message} onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', padding: '9px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, color: '#1E293B', outline: 'none', resize: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }} />
            </div>

            {/* Attachment */}
            <div style={{ marginBottom: 16, padding: '12px', border: '1.5px dashed #C7D2FE', borderRadius: 10, background: '#F8FAFF', textAlign: 'center', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, color: '#6366F1', margin: '0 auto 4px' }} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 12, color: '#6366F1', fontWeight: 500, margin: 0 }}>Đính kèm tệp (nếu có)</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>Kéo thả hoặc chọn tệp từ máy tính (tối đa 10MB)</p>
            </div>

            {/* Submit */}
            <button type="submit" style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Gửi tin nhắn
            </button>
            <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <svg viewBox="0 0 20 20" style={{ width: 13, height: 13, color: '#10B981', flexShrink: 0 }} fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Thông tin của bạn được bảo mật tuyệt đối
            </p>
          </form>
        </div>

        {/* ── COL 2: ILLUSTRATION ── */}
        <div style={{ ...cardStyle, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* SVG Headset illustration */}
          <svg viewBox="0 0 260 200" style={{ width: '100%', maxWidth: 240, marginBottom: 20 }} fill="none">
            {/* Background blobs */}
            <ellipse cx="130" cy="105" rx="95" ry="80" fill="#EEF2FF" opacity="0.6" />
            <ellipse cx="175" cy="70" rx="45" ry="38" fill="#E0E7FF" opacity="0.5" />
            {/* Chat bubble */}
            <rect x="145" y="22" width="72" height="44" rx="12" fill="#6366F1" />
            <circle cx="161" cy="44" r="4.5" fill="white" />
            <circle cx="181" cy="44" r="4.5" fill="white" />
            <circle cx="201" cy="44" r="4.5" fill="white" />
            <path d="M150 66 L162 80 L168 66" fill="#6366F1" />
            {/* Envelope */}
            <rect x="148" y="118" width="68" height="48" rx="8" fill="#818CF8" opacity="0.75" />
            <path d="M148 126 L182 146 L216 126" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Headset arc */}
            <path d="M68 105 C68 72 88 52 115 52 C142 52 162 72 162 105" stroke="#4338CA" strokeWidth="6" strokeLinecap="round" />
            {/* Ear cups */}
            <rect x="56" y="100" width="20" height="30" rx="10" fill="#6366F1" />
            <rect x="154" y="100" width="20" height="30" rx="10" fill="#6366F1" />
            {/* Mic arm */}
            <path d="M76 130 Q62 144 67 158 L84 158" stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="82" y="153" width="22" height="10" rx="5" fill="#6366F1" />
            {/* Leaves */}
            <path d="M38 160 Q50 136 70 148" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            <path d="M26 170 Q44 142 65 156" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <path d="M44 172 Q56 150 72 160" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', textAlign: 'center', marginBottom: 8 }}>
            Chúng tôi luôn sẵn sàng đồng hành cùng bạn
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
            Mọi phản hồi của bạn đều rất quan trọng để Onmi ngày càng hoàn thiện và mang đến trải nghiệm học tập tốt hơn.
          </p>

          {/* 3 feature items */}
          {[
            { color: '#EEF2FF', ic: '#6366F1', title: 'Phản hồi nhanh chóng', sub: 'Chúng tôi cam kết phản hồi trong vòng 24 giờ', svg: <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /> },
            { color: '#EEF2FF', ic: '#6366F1', title: 'Hỗ trợ tận tâm', sub: 'Đội ngũ giàu kinh nghiệm luôn sẵn sàng giúp đỡ', svg: <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> },
            { color: '#FFF0F2', ic: '#F43F5E', title: 'Cải thiện không ngừng', sub: 'Lắng nghe để Onmi phục vụ bạn tốt hơn mỗi ngày', svg: <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /> },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', marginBottom: i < 2 ? 14 : 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 20 20" style={{ width: 15, height: 15, color: f.ic }} fill="currentColor">{f.svg}</svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: '0 0 2px' }}>{f.title}</p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── COL 3: INFO + FAQ ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Contact Info */}
          <div style={{ ...cardStyle, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>Thông tin liên hệ khác</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>, icon2: <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>, title: 'Email hỗ trợ', line1: 'support@omniexam.edu.vn', line2: 'Phản hồi trong 24h', accent: true },
                { icon: <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>, icon2: null, title: 'Số điện thoại', line1: '028 1234 5678', line2: 'Thứ 2 - Thứ 6: 08:00 – 17:30', accent: false },
                { icon: <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>, icon2: null, title: 'Văn phòng chính', line1: 'Tầng 4, Tòa nhà Innovation, Công viên phần mềm Quang Trung, Quận 12, TP. Hồ Chí Minh', line2: '', accent: false },
                { icon: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>, icon2: null, title: 'Giờ làm việc', line1: 'Thứ Hai – Thứ Sáu: 08:00 – 17:30', line2: 'Nghỉ Thứ 7, Chủ nhật và ngày lễ', accent: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 20 20" style={{ width: 14, height: 14, color: '#6366F1' }} fill="currentColor">
                      {item.icon}{item.icon2}
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: item.accent ? '#6366F1' : '#64748B', margin: '0 0 1px', lineHeight: 1.4 }}>{item.line1}</p>
                    {item.line2 && <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{item.line2}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', margin: 0 }}>Câu hỏi thường gặp</h3>
              <button style={{ fontSize: 12, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Xem tất cả</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {faqItems.map((item, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#1E293B', fontWeight: 500 }}
                  >
                    <span>{item.q}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: '#94A3B8', flexShrink: 0, marginLeft: 8, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 14px 12px', fontSize: 12, color: '#64748B', lineHeight: 1.5, borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM CATEGORY GRID ── */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 14 }}>Bạn muốn liên hệ về vấn đề gì?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {categories.map((cat, i) => (
            <button key={i} style={{ ...cardStyle, padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(226,232,240,0.7)', transition: 'box-shadow 0.2s', background: '#fff' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: cat.color }}>
                {cat.icon}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: '0 0 4px' }}>{cat.label}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Contact;
