import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Calendar, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
}

const mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Làm thế nào để duy trì chuỗi ngày tự học liên tục?',
    category: 'Kinh nghiệm',
    date: '30/06/2026',
    readTime: '5 phút đọc',
    excerpt: 'Xây dựng thói quen tự học hàng ngày thông qua các bước nhỏ, thiết lập phần thưởng trực quan và sử dụng streak học tập để duy trì động lực bền bỉ.',
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
    excerpt: 'Phân tích xu hướng ra đề thi trắc nghiệm của các môn Toán, Lý, Hóa năm nay và những điểm mới quan trọng học sinh cần đặc biệt lưu ý.',
    content: [
      'Đề thi THPT Quốc gia năm nay tiếp tục ghi nhận sự thay đổi trong cấu trúc câu hỏi định tính và ứng dụng thực tiễn. Tỷ lệ các câu hỏi yêu cầu kỹ năng đọc hiểu bảng biểu và xử lý tình huống thực tế tăng nhẹ.',
      'Đối với môn Toán học, phần hình học không gian và tích phân ứng dụng có xu hướng lồng ghép các bài toán tối ưu hóa chi phí sản xuất hoặc thiết kế thực tế.',
      'Đối với môn Vật lý và Hóa học, các câu hỏi lý thuyết thí nghiệm thực hành đòi hỏi học sinh phải nắm rõ bản chất hiện tượng thay vì chỉ học thuộc lòng sơ đồ phản ứng hay công thức tính nhanh.',
      'Để chuẩn bị tốt nhất, các bạn nên đa dạng hóa nguồn tài liệu đọc hiểu bên cạnh việc luyện đề thi truyền thống. Hãy sử dụng thư mục Tài liệu của Onmi Exam để cập nhật các tóm tắt chuyên đề mới nhất.'
    ]
  }
];

export const Blog: React.FC = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const activePost = mockPosts.find(p => p.id === selectedPostId);

  if (activePost) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-8 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedPostId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-default uppercase"
        >
          <ArrowLeft size={14} />
          <span>Quay lại Blog</span>
        </button>

        {/* Article Header */}
        <div className="space-y-3 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary">
            <span className="px-2 py-0.5 rounded bg-primary-light text-primary border border-primary/10">
              {activePost.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {activePost.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {activePost.readTime}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary leading-snug">
            {activePost.title}
          </h1>
        </div>

        {/* Article Body Content */}
        <article className="space-y-5 text-xs text-text-primary leading-relaxed">
          {activePost.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>

        {/* Footer Note */}
        <div className="pt-8 border-t border-slate-100 text-[10px] text-text-muted italic">
          Bản quyền thuộc về Onmi Exam. Vui lòng ghi rõ nguồn khi chia sẻ bài viết này.
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold bg-[#EFF6FF] text-primary border border-primary/20 px-2.5 py-0.5 rounded w-max">
          <BookOpen size={12} />
          <span>BLOG CHIA SẺ BÍ QUYẾT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
          Góc tự học của bạn
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          Nơi cập nhật tin tức thi cử mới nhất, các phương pháp tự học khoa học và cẩm nang rèn luyện thói quen tự học hàng ngày.
        </p>
      </div>

      {/* Blog Posts List - Notion Style Cards */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPostId(post.id)}
            className="group bg-white border border-slate-200/80 hover:border-slate-350 p-5 cursor-pointer transition-default flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary">
                <span className="text-primary uppercase tracking-wider">{post.category}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-default leading-snug">
                {post.title}
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 pt-1">
                {post.excerpt}
              </p>
            </div>
            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-primary opacity-80 group-hover:opacity-100 hover:underline flex items-center gap-0.5 transition-default">
                ĐỌC CHI TIẾT
                <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
export default Blog;
