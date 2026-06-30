import React from 'react';
import { Shield, Sparkles, BookOpen } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-[700px] mx-auto px-4 py-12 space-y-8 select-text">
      
      {/* Title */}
      <div className="space-y-2 text-center pb-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Về Onmi Exam
        </h1>
        <p className="text-xs text-text-secondary">
          Kiến tạo trải nghiệm học tập số cao cấp dành cho thế hệ học sinh Việt Nam mới.
        </p>
      </div>

      {/* Main paragraphs */}
      <section className="reader-content select-text space-y-6">
        <p>
          Onmi Exam được thành lập từ cuối năm 2024 bởi một nhóm các nhà sư phạm và kỹ sư công nghệ với mong muốn thay đổi định kiến về việc luyện thi trực tuyến tại Việt Nam. Chúng tôi tin rằng, việc học tập và kiểm tra không nên là một trải nghiệm gây áp lực hay lo âu kéo dài.
        </p>
        
        <p>
          Hệ thống <strong>Onmi Exam</strong> ra đời nhằm hướng tới mục tiêu xây dựng một nền tảng học tập lâu dài (SaaS). Nơi học sinh không chỉ tìm kiếm đề thi thử trước mỗi kỳ thi chính thức, mà còn tìm thấy thói quen tự học lành mạnh mỗi ngày.
        </p>

        <h2 className="text-base font-bold text-text-primary">Triết lý thiết kế "Calm UI"</h2>
        <p>
          Lấy cảm hứng từ triết lý giao diện của Notion, Apple và Linear, Onmi Exam tối giản hóa mọi thành phần gây xao nhãng. Chúng tôi loại bỏ các banner quảng cáo lòe loẹt, các vòng quay may mắn, hay hệ thống coin ảo gây nghiện. Sự tập trung của học viên là tài sản quý giá nhất, và giao diện của chúng tôi có nghĩa vụ bảo vệ nó.
        </p>

        <h2 className="text-base font-bold text-text-primary">Ba giá trị cốt lõi</h2>

        <div className="space-y-4 pt-2">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-btn bg-primary-light text-primary flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">Chất lượng học thuật hàng đầu</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                Mọi đề thi trắc nghiệm và tài liệu ôn tập trên hệ thống đều được biên soạn và kiểm duyệt bởi các thầy cô giáo có nhiều năm kinh nghiệm giảng dạy ở trường chuyên.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-btn bg-success-light text-success flex items-center justify-center shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">Không gian học tập chuyên nghiệp</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                Chế độ thi CBT (Computer-Based Testing) nghiêm ngặt giúp học sinh làm quen với áp lực phòng thi thật, đồng thời cung cấp gợi ý gia sư AI ngắn gọn và thông minh.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-btn bg-accent-light text-accent flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">Phát triển thói quen tự giác</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                Khích lệ sự tiến bộ liên tục thông qua chuỗi streak ngày học và điểm kinh nghiệm (XP) thay vì áp lực xếp hạng điểm số tuyệt đối.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
