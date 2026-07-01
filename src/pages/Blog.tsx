import React, { useState } from 'react';
import { ArrowLeft, Share2, Clock, Calendar } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  views: string;
  thumbnailBg: string;
  thumbnailType: 'calendar' | 'brain' | 'checklist';
}

const mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Làm thế nào để duy trì chuỗi ngày tự học liên tục?',
    category: 'Kinh nghiệm',
    date: '30/06/2026',
    readTime: '5 phút đọc',
    views: '1.2K lượt đọc',
    thumbnailBg: 'bg-[#EEF2FF]',
    thumbnailType: 'calendar',
    excerpt: 'Xây dựng thói quen tự học hằng ngày thông qua các bước nhỏ, thiết lập phần thưởng trực quan và sử dụng streak học tập để duy trì động lực bền bỉ.',
    content: [
      'Tự học không phải là một đích đến mà là một hành trình rèn luyện thói quen. Để không bị nản lòng sau những ngày đầu hào hứng, bạn cần thiết lập một hệ thống nhắc nhở trực quan.',
      'Sử dụng tính năng Streak (chuỗi ngày học liên tục) trên Onmi Exam giúp kích hoạt tâm lý duy trì thói quen. Khi nhìn thấy số ngày tích lũy tăng lên, bộ não sẽ tự động sản sinh cảm giác muốn bảo vệ chuỗi thành tích đó.',
      'Hãy bắt đầu với mục tiêu nhỏ: mỗi ngày chỉ cần làm 5 câu trắc nghiệm hoặc đọc 2 trang tài liệu ôn tập. Sự kiên trì tích lũy quan trọng hơn việc học dồn dập trong một ngày rồi bỏ bẵng cả tuần tiếp theo.',
      'Đặt lịch học vào một khung giờ cố định trong ngày, ví dụ như 20h00 tối ngay sau khi ăn tối xong. Sau 21 ngày liên tục, hành động này sẽ trở thành một phản xạ tự nhiên của bạn.'
    ]
  },
  {
    id: 'post-2',
    title: 'Phương pháp Active Recall trong việc ôn thi trắc nghiệm Toán',
    category: 'Phương pháp',
    date: '28/06/2026',
    readTime: '7 phút đọc',
    views: '2.1K lượt đọc',
    thumbnailBg: 'bg-[#FCE7F3]',
    thumbnailType: 'brain',
    excerpt: 'Chủ động gợi nhớ kiến thức thay vì đọc thụ động. Hướng dẫn áp dụng Active Recall vào ngân hàng đề thi trắc nghiệm Toán để đạt hiệu quả tối đa.',
    content: [
      'Nhiều bạn học sinh có thói quen đọc đi đọc lại lời giải chi tiết hoặc công thức trong sổ tay. Tuy nhiên, nghiên cứu khoa học chỉ ra rằng đây là phương pháp kém hiệu quả nhất vì nó tạo ra "ảo tưởng về tri thức".',
      'Active Recall (chủ động gợi nhớ) yêu cầu bộ não của bạn phải hoạt động để tự tìm ra câu trả lời trước khi xem đáp án. Cách áp dụng rất đơn giản: khi làm đề thi thử trên Onmi Exam, hãy tự tóm tắt công thức giải nhanh ra nháp trước khi chọn đáp án.',
      'Khi làm sai một câu hỏi, đừng vội đọc ngay lời giải. Hãy đánh dấu câu đó lại, tự làm lại một lần nữa dựa trên gợi ý từ Trợ lý gia sư AI. Chỉ khi thực sự bế tắc bạn mới nên xem lời giải chi tiết.',
      'Lặp lại khoảng cách (Spaced Repetition) kết hợp với Active Recall bằng cách làm lại chính đề thi đó sau 3 ngày, rồi 7 ngày. Việc này giúp chuyển hóa kiến thức từ trí nhớ ngắn hạn sang trí nhớ dài hạn một cách vững chắc.'
    ]
  },
  {
    id: 'post-3',
    title: 'Cập nhật cấu trúc đề thi thử THPT Quốc gia năm 2026',
    category: 'Tin tức',
    date: '25/06/2026',
    readTime: '4 phút đọc',
    views: '3.4K lượt đọc',
    thumbnailBg: 'bg-[#D1FAE5]',
    thumbnailType: 'checklist',
    excerpt: 'Phân tích xu hướng ra đề thi trắc nghiệm của các môn Toán, Lý, Hóa năm nay và những điểm mới quan trọng học sinh cần đặc biệt lưu ý.',
    content: [
      'Đề thi THPT Quốc gia năm nay tiếp tục ghi nhận sự thay đổi trong cấu trúc câu hỏi định tính và ứng dụng thực tiễn. Tỷ lệ các câu hỏi yêu cầu kỹ năng đọc hiểu bảng biểu và xử lý tình huống thực tế tăng nhẹ.',
      'Đối với môn Toán học, phần hình học không gian và tích phân ứng dụng có xu hướng lồng ghép các bài toán tối ưu hóa chi phí sản xuất hoặc thiết kế thực tế.',
      'Đối với môn Vật lý và Hóa học, các câu hỏi lý thuyết thí nghiệm thực hành đòi hỏi học sinh phải nắm rõ bản chất hiện tượng thay vì chỉ học thuộc lòng sơ đồ phản ứng hay công thức tính nhanh.',
      'Để chuẩn bị tốt nhất, các bạn nên đa dạng hóa nguồn tài liệu đọc hiểu bên cạnh việc luyện đề thi truyền thống. Hãy sử dụng thư mục Tài liệu của Onmi Exam để cập nhật các tóm tắt chuyên đề mới nhất.'
    ]
  },
  {
    id: 'post-4',
    title: 'Chiến thuật phân bổ thời gian làm bài thi trắc nghiệm đạt điểm tối đa',
    category: 'Phương pháp',
    date: '22/06/2026',
    readTime: '6 phút đọc',
    views: '1.9K lượt đọc',
    thumbnailBg: 'bg-[#EEF2FF]',
    thumbnailType: 'calendar',
    excerpt: 'Chia sẻ chiến thuật làm bài 3 lượt giúp bạn kiểm soát thời gian tốt hơn, giảm thiểu áp lực phòng thi và tránh các bẫy thường gặp trong đề thi.',
    content: [
      'Áp lực thời gian là một trong những nguyên nhân lớn nhất khiến học sinh mất điểm đáng tiếc ở các câu hỏi dễ. Để khắc phục điều này, bạn cần áp dụng chiến thuật làm bài 3 lượt.',
      'Lượt đầu tiên kéo dài khoảng 15-20 phút, hãy giải quyết nhanh các câu hỏi nhận biết và thông hiểu có thể chọn ngay đáp án trong vòng 30 giây. Gặp câu hỏi tính toán phức tạp, hãy bỏ qua ngay.',
      'Lượt thứ hai tập trung vào các câu hỏi vận dụng cần tính toán từ 1 đến 2 phút. Lúc này bạn đã có một số điểm nền tảng vững chắc từ lượt một, tâm lý sẽ thoải mái hơn rất nhiều.',
      'Lượt cuối cùng dành cho các câu hỏi vận dụng cao và rà soát lại phiếu trả lời. Hãy nhớ tuyệt đối không để trống bất kỳ câu trả lời nào, ngay cả những câu bạn không biết cách làm.'
    ]
  }
];

const mockTopics = [
  { name: 'Ôn thi THPT Quốc gia', count: 24, icon: '🎓', color: 'bg-indigo-50 text-indigo-500', hoverColor: 'group-hover:bg-indigo-500 group-hover:text-white' },
  { name: 'Phương pháp học tập', count: 18, icon: '⚡', color: 'bg-indigo-50 text-indigo-500', hoverColor: 'group-hover:bg-indigo-500 group-hover:text-white' },
  { name: 'Lập kế hoạch học tập', count: 12, icon: '📅', color: 'bg-indigo-50 text-indigo-500', hoverColor: 'group-hover:bg-indigo-500 group-hover:text-white' },
  { name: 'Tâm lý học đường', count: 9, icon: '❤️', color: 'bg-pink-50 text-pink-500', hoverColor: 'group-hover:bg-pink-500 group-hover:text-white' },
];

const mockPopularPosts = [
  {
    id: 'pop-1',
    title: 'Bí quyết ghi nhớ công thức nhanh và lâu cho môn Hóa học',
    views: '2.5K lượt đọc',
    thumbnailType: 'calendar' as const,
    thumbnailBg: 'bg-[#EEF2FF]',
  },
  {
    id: 'pop-2',
    title: 'Tự học Toán từ con số 0: Lộ trình cho người mất gốc',
    views: '2.1K lượt đọc',
    thumbnailType: 'brain' as const,
    thumbnailBg: 'bg-[#FCE7F3]',
  }
];

// Mini thumbnail for popular posts sidebar
const MiniThumbnail: React.FC<{ type: 'calendar' | 'brain' | 'checklist'; bg: string }> = ({ type, bg }) => (
  <div className={`w-11 h-11 rounded-lg shrink-0 ${bg} flex items-center justify-center overflow-hidden`}>
    {type === 'calendar' && (
      <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none" stroke="#6366F1" strokeWidth="2">
        <rect x="4" y="8" width="40" height="36" rx="6" strokeWidth="2" />
        <line x1="4" y1="18" x2="44" y2="18" />
        <circle cx="16" cy="28" r="2" fill="#6366F1" />
        <circle cx="24" cy="28" r="2" fill="#6366F1" />
        <circle cx="32" cy="28" r="2" fill="#6366F1" />
        <line x1="16" y1="10" x2="16" y2="6" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="10" x2="32" y2="6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )}
    {type === 'brain' && (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <path d="M24 38 C14 38 8 30 8 22 C8 14 15 8 24 8 C33 8 40 14 40 22 C40 30 34 38 24 38 Z" fill="#BE185D" opacity="0.15" stroke="#BE185D" strokeWidth="1.5" />
        <path d="M24 8 L24 38" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18 C10 22 12 28 16 30" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M36 18 C38 22 36 28 32 30" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="22,12 24,6 26,12 32,10 28,15 30,21 24,18 18,21 20,15 16,10" fill="#F59E0B" transform="translate(-4,-4) scale(0.6)" />
      </svg>
    )}
    {type === 'checklist' && (
      <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
        <rect x="8" y="6" width="32" height="38" rx="4" fill="#047857" opacity="0.1" stroke="#047857" strokeWidth="1.5" />
        <line x1="16" y1="18" x2="32" y2="18" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="26" x2="32" y2="26" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="34" x2="26" y2="34" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <circle cx="11" cy="18" r="2" fill="#10B981" />
        <circle cx="11" cy="26" r="2" fill="#10B981" />
        <circle cx="11" cy="34" r="2" fill="#10B981" />
      </svg>
    )}
  </div>
);

const categories = [
  { name: 'Tất cả', icon: '⊞' },
  { name: 'Kinh nghiệm', icon: '👥' },
  { name: 'Phương pháp', icon: '💡' },
  { name: 'Tin tức', icon: '📰' },
  { name: 'Tâm lý học tập', icon: '⚡' },
  { name: 'Cẩm nang', icon: '📖' },
];

// Tag badge styles mapped to category
const tagStyles: Record<string, string> = {
  'Kinh nghiệm': 'bg-[#DBEAFE] text-[#1D4ED8]',
  'Phương pháp': 'bg-[#FCE7F3] text-[#BE185D]',
  'Tin tức': 'bg-[#D1FAE5] text-[#047857]',
};



// Full-size thumbnail for blog cards
const CardThumbnail: React.FC<{ type: 'calendar' | 'brain' | 'checklist'; bg: string }> = ({ type, bg }) => (
  <div className={`w-full h-full ${bg} flex items-center justify-center`}>
    {type === 'calendar' && (
      <svg viewBox="0 0 120 90" className="w-16 h-16" fill="none">
        <rect x="15" y="10" width="90" height="70" rx="10" stroke="#6366F1" strokeWidth="2.5" />
        <line x1="15" y1="28" x2="105" y2="28" stroke="#6366F1" strokeWidth="2" />
        <circle cx="38" cy="45" r="3" fill="#6366F1" />
        <circle cx="60" cy="45" r="3" fill="#6366F1" />
        <circle cx="82" cy="45" r="3" fill="#6366F1" />
        <circle cx="38" cy="62" r="3" fill="#6366F1" />
        <circle cx="60" cy="62" r="3" fill="#6366F1" />
        <circle cx="82" cy="62" r="3" fill="#A5B4FC" />
        <line x1="37" y1="2" x2="37" y2="18" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
        <line x1="83" y1="2" x2="83" y2="18" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
        {/* Clock icon */}
        <circle cx="95" cy="72" r="14" fill="white" />
        <circle cx="95" cy="72" r="11" stroke="#6366F1" strokeWidth="2.5" fill="none" />
        <line x1="95" y1="72" x2="95" y2="64" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="95" y1="72" x2="102" y2="72" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )}
    {type === 'brain' && (
      <svg viewBox="0 0 120 90" className="w-18 h-18" fill="none">
        <path d="M60 75 C36 75 20 60 20 44 C20 28 36 16 60 16 C84 16 100 28 100 44 C100 60 84 75 60 75 Z" fill="#BE185D" opacity="0.12" stroke="#BE185D" strokeWidth="2" />
        <path d="M60 16 L60 75" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 36 C25 44 28 56 36 60" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
        <path d="M90 36 C95 44 92 56 84 60" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
        <polygon points="50,24 54,14 58,24 68,20 62,28 66,38 54,32 42,38 46,28 40,20" fill="#F59E0B" opacity="0.85" />
        <circle cx="44" cy="50" r="4" fill="#BE185D" opacity="0.3" />
        <circle cx="76" cy="50" r="4" fill="#BE185D" opacity="0.3" />
      </svg>
    )}
    {type === 'checklist' && (
      <svg viewBox="0 0 120 90" className="w-16 h-16" fill="none">
        <rect x="18" y="6" width="64" height="78" rx="8" fill="#047857" opacity="0.08" stroke="#047857" strokeWidth="2" />
        <line x1="30" y1="28" x2="68" y2="28" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="46" x2="68" y2="46" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="64" x2="56" y2="64" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="28" r="5" fill="#10B981" />
        <circle cx="20" cy="46" r="5" fill="#10B981" />
        <circle cx="20" cy="64" r="5" fill="#10B981" />
        {/* 2026 badge */}
        <rect x="72" y="52" width="36" height="22" rx="6" fill="#10B981" />
        <text x="90" y="67" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">2026</text>
        {/* bar chart */}
        <rect x="80" y="62" width="4" height="10" fill="#047857" opacity="0.3" />
        <rect x="86" y="58" width="4" height="14" fill="#047857" opacity="0.4" />
        <rect x="92" y="55" width="4" height="17" fill="#047857" opacity="0.5" />
        <rect x="98" y="52" width="4" height="20" fill="#047857" opacity="0.6" />
      </svg>
    )}
  </div>
);

export const Blog: React.FC = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
    setEmailInput('');
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPosts = mockPosts.filter(post => {
    return activeCategory === 'Tất cả' || post.category === activeCategory;
  });

  const activePost = mockPosts.find(p => p.id === selectedPostId);

  // ── ARTICLE DETAIL VIEW ──────────────────────────────────────────────────────
  if (activePost) {
    return (
      <div className="max-w-[760px] mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => setSelectedPostId(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#6366F1] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Quay lại Blog</span>
        </button>

        <div className="space-y-4 pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3 text-xs">
            <span className={`px-2.5 py-1 rounded-md font-semibold tracking-wide ${tagStyles[activePost.category] || 'bg-[#D1FAE5] text-[#047857]'}`}>
              {activePost.category.toUpperCase()}
            </span>
            <span className="text-[#64748B] flex items-center gap-1"><Calendar size={12} /> {activePost.date}</span>
            <span className="text-[#64748B] flex items-center gap-1"><Clock size={12} /> {activePost.readTime}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] leading-tight">{activePost.title}</h1>
        </div>

        <article className="space-y-5 text-[#64748B] leading-relaxed text-sm">
          {activePost.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>

        <div className="pt-8 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center justify-between">
          <span>Bản quyền thuộc về Onmi Exam. Vui lòng ghi rõ nguồn khi chia sẻ.</span>
          <button
            onClick={() => alert('Đã sao chép link bài viết.')}
            className="flex items-center gap-1 text-[#6366F1] font-medium hover:underline cursor-pointer"
          >
            <Share2 size={12} /> Chia sẻ
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN BLOG LISTING ────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-[#1E293B]">
          Góc tự học của bạn
          <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </h1>
        <p className="text-[#64748B] text-sm max-w-xl leading-relaxed">
          Nơi cập nhật tin tức thi cử mới nhất, các phương pháp tự học khoa học<br />
          và cẩm nang rèn luyện thói quen tự học hằng ngày.
        </p>
      </header>

      {/* ── CATEGORY TABS ── */}
      <nav className="flex flex-wrap gap-3 mb-8">
        {categories.map(cat => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#6366F1] text-white hover:bg-indigo-600'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-gray-50'
              }`}
            >
              <span className="text-xs">{cat.icon}</span> {cat.name}
            </button>
          );
        })}
      </nav>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">

        {/* ── MAIN FEED ── */}
        <main
          className="flex-1 bg-white rounded-3xl p-5 lg:p-6 border border-[#E2E8F0]/50 flex flex-col justify-between"
          style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}
        >
          <div className="flex flex-col gap-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0]/50" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
                <p className="text-[#64748B] text-xs">Không tìm thấy bài viết trong chuyên mục này.</p>
              </div>
            ) : (
              filteredPosts.map((post, index) => {
                const isBookmarked = !!bookmarkedPosts[post.id];
                return (
                  <React.Fragment key={post.id}>
                    {index > 0 && <hr className="border-[#E2E8F0]/60 my-1" />}
                    <article
                      className="py-3 flex flex-col sm:flex-row gap-5 cursor-pointer group"
                      onClick={() => setSelectedPostId(post.id)}
                    >
                      {/* Thumbnail (smaller) */}
                      <div className={`w-full h-32 sm:w-[130px] sm:h-[90px] shrink-0 rounded-xl overflow-hidden ${post.thumbnailBg} transition-transform duration-200 group-hover:scale-[1.02]`}>
                        <CardThumbnail type={post.thumbnailType} bg={post.thumbnailBg} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          {/* Meta row */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5 text-[10px]">
                              <span className={`px-2 py-0.5 rounded font-bold tracking-wide text-[9px] ${tagStyles[post.category] || 'bg-[#D1FAE5] text-[#047857]'}`}>
                                {post.category.toUpperCase()}
                              </span>
                              <span className="text-text-secondary">{post.date}</span>
                              <span className="text-text-secondary">{post.readTime}</span>
                            </div>
                            <button
                              onClick={(e) => toggleBookmark(post.id, e)}
                              className={`transition-colors cursor-pointer ${isBookmarked ? 'text-[#6366F1]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                              </svg>
                            </button>
                          </div>

                          {/* Title (smaller text) */}
                          <h2 className="text-sm font-black mb-1 text-[#1E293B] group-hover:text-[#6366F1] transition-colors leading-snug">
                            {post.title}
                          </h2>

                          {/* Excerpt (smaller text) */}
                          <p className="text-text-secondary text-[11px] leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Footer row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {/* Overlapping avatars */}
                            <div className="flex -space-x-1.5">
                              <div className="w-6 h-6 rounded-full border border-white bg-indigo-500 text-white text-[8px] font-bold flex items-center justify-center">A</div>
                              <div className="w-6 h-6 rounded-full border border-white bg-pink-500 text-white text-[8px] font-bold flex items-center justify-center">B</div>
                              <div className="w-6 h-6 rounded-full border border-white bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center">C</div>
                            </div>
                            <span className="text-[11px] font-medium text-text-secondary">{post.views}</span>
                          </div>
                          <span className="text-[#6366F1] font-bold text-xs flex items-center gap-1 group-hover:underline">
                            Đọc chi tiết
                            <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="currentColor">
                              <path d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* ── PAGINATION ── */}
          {filteredPosts.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-3 border-t border-[#E2E8F0]/60">
              <button
                disabled
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-not-allowed"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M15 8a.5.5 0 00-.5-.5H2.707l3.147-3.146a.5.5 0 10-.708-.708l-4 4a.5.5 0 000 .708l4 4a.5.5 0 00.708-.708L2.707 8.5H14.5A.5.5 0 0015 8z" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#6366F1] text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B] text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B] text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer">3</button>
              <span className="w-8 h-8 flex items-center justify-center text-xs text-[#64748B]">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B] text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer">12</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B] hover:bg-gray-50 transition-colors cursor-pointer">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z" />
                </svg>
              </button>
            </div>
          )}
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
          {/* Trending Topics (Separate Box) */}
          <div
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0]/50 flex-1 flex flex-col justify-between"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Chủ đề nổi bật</h3>
              <button
                onClick={() => alert('Xem tất cả chủ đề')}
                className="text-[#6366F1] text-[11px] hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            <ul className="space-y-2.5 flex-1 flex flex-col justify-center">
              {mockTopics.map((topic, index) => (
                <li key={index}>
                  <button
                    onClick={() => setActiveCategory(topic.name)}
                    className="flex items-center justify-between group w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center transition-colors ${topic.color} ${topic.hoverColor} text-xs`}>
                        {topic.icon}
                      </div>
                      <span className="font-semibold text-[#1E293B] group-hover:text-[#6366F1] transition-colors text-xs">
                        # {topic.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#64748B] bg-gray-50 px-1.5 py-0.5 rounded">
                      {topic.count} bài viết
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (Separate Box - Shrunk) */}
          <div
            className="rounded-3xl p-4 text-white relative overflow-hidden flex-1 flex flex-col justify-center"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            }}
          >
            {/* Decorative plane */}
            <svg
              className="absolute top-3 right-3 opacity-20 -rotate-12"
              width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="1.5"
            >
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
            </svg>

            <h3 className="font-bold text-sm mb-0.5 relative z-10">Đăng ký nhận bản tin</h3>
            <p className="text-[10px] text-indigo-100 mb-3 leading-relaxed relative z-10">
              Nhận bài viết tự học hay nhất mỗi tuần từ Omni Exam.
            </p>

            {isSubscribed ? (
              <div className="z-10 bg-white/10 p-3 rounded-xl border border-white/20 text-center space-y-1 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xs text-indigo-100">Cảm ơn bạn đã theo dõi bản tin Omni Exam.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative z-10 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-none text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-white/50 text-xs outline-none bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-700/50 hover:bg-indigo-700/70 text-white font-semibold text-xs transition-colors flex justify-center items-center gap-2 border border-white/10 cursor-pointer"
                >
                  Đăng ký ngay
                  <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
                    <path d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z" />
                  </svg>
                </button>
              </form>
            )}
          </div>

          {/* Popular Articles (Separate Box - 2 Items) */}
          <div
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0]/50 flex-1 flex flex-col justify-between"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}
          >
            <h3 className="font-bold text-sm mb-3 text-[#1E293B]">Bài viết được yêu thích</h3>
            <div className="flex flex-col gap-3 flex-1 justify-center">
              {mockPopularPosts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => alert(`Mở bài viết: ${item.title}`)}
                  className="flex gap-3 group text-left cursor-pointer items-center w-full"
                >
                  <MiniThumbnail type={item.thumbnailType} bg={item.thumbnailBg} />
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <h4 className="text-[11px] font-semibold text-[#1E293B] leading-snug group-hover:text-[#6366F1] transition-colors mb-0.5 line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="text-[9px] text-text-secondary">{item.views}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Blog;
