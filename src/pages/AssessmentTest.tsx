import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Briefcase, 
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Target,
  LogOut,
  Flag,
  RotateCw,
  ShieldCheck,
  Check,
  ChevronRight,
  BarChart2,
  Cpu,
  Frown,
  Meh,
  Smile
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  category: 'logic' | 'communication' | 'creativity' | 'teamwork' | 'leadership' | 'focus' | 'language' | 'empathy';
  mbtiDimension?: 'EI' | 'NS' | 'TF' | 'JP';
  mbtiWeight?: number; // 1 = positive (E, N, T, J), -1 = negative (I, S, F, P)
  subTextNo: string;
  subTextMaybe: string;
  subTextYes: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  { 
    id: 1, 
    text: "Tôi thích giải quyết các vấn đề logic hoặc giải đố hơn là ghi nhớ thông tin đơn thuần.", 
    category: "logic", 
    mbtiDimension: "TF", 
    mbtiWeight: 1,
    subTextNo: "Tôi thấy mệt mỏi với các bài toán logic.",
    subTextMaybe: "Tùy thuộc vào từng dạng bài toán cụ thể.",
    subTextYes: "Tôi rất hào hứng với các thử thách tư duy phức tạp."
  },
  { 
    id: 2, 
    text: "Tôi cảm thấy tràn đầy năng lượng sau khi giao tiếp và làm quen với nhiều bạn mới.", 
    category: "communication", 
    mbtiDimension: "EI", 
    mbtiWeight: 1,
    subTextNo: "Tôi thấy kiệt sức và cần thời gian ở một mình.",
    subTextMaybe: "Bình thường, tôi không cảm thấy quá khác biệt.",
    subTextYes: "Tôi cảm thấy rất vui vẻ và phấn chấn."
  },
  { 
    id: 3, 
    text: "Tôi thường nảy ra nhiều ý tưởng độc đáo, sáng tạo khi chuẩn bị bài thuyết trình ở lớp.", 
    category: "creativity", 
    mbtiDimension: "NS", 
    mbtiWeight: 1,
    subTextNo: "Tôi thường làm theo các khuôn mẫu có sẵn.",
    subTextMaybe: "Đôi khi tôi cũng có vài ý tưởng nhỏ.",
    subTextYes: "Tôi luôn muốn thiết kế slide độc đáo nhất có thể."
  },
  { 
    id: 4, 
    text: "Tôi thích làm việc nhóm để cùng giải quyết bài tập hơn là tự ôn tập một mình.", 
    category: "teamwork", 
    mbtiDimension: "EI", 
    mbtiWeight: 1,
    subTextNo: "Tôi thích làm việc độc lập để tập trung tốt nhất.",
    subTextMaybe: "Làm nhóm cũng được nhưng tự làm vẫn nhanh hơn.",
    subTextYes: "Tôi học hỏi được rất nhiều từ các thành viên khác."
  },
  { 
    id: 5, 
    text: "Tôi thường tự tin đứng ra làm nhóm trưởng hoặc phân công công việc khi làm bài tập chung.", 
    category: "leadership", 
    mbtiDimension: "EI", 
    mbtiWeight: 1,
    subTextNo: "Tôi thích làm thành viên thực thi kế hoạch hơn.",
    subTextMaybe: "Nếu không có ai nhận tôi sẽ đứng ra làm.",
    subTextYes: "Tôi thích tổ chức và dẫn dắt cả đội cùng tiến bộ."
  },
  { 
    id: 6, 
    text: "Tôi có thể tập trung học bài liên tục 1-2 tiếng mà không bị xao nhãng bởi điện thoại hay mạng xã hội.", 
    category: "focus",
    subTextNo: "Tôi thường kiểm tra điện thoại cứ sau 10-15 phút.",
    subTextMaybe: "Tôi thỉnh thoảng bị phân tâm bởi tin nhắn.",
    subTextYes: "Tôi có thể tắt nguồn điện thoại để tập trung tuyệt đối."
  },
  { 
    id: 7, 
    text: "Tôi yêu thích việc đọc sách, viết lách hoặc tìm hiểu các vấn đề khoa học xã hội.", 
    category: "language", 
    mbtiDimension: "NS", 
    mbtiWeight: -1,
    subTextNo: "Tôi không có thói quen đọc sách hay tự luận xã hội.",
    subTextMaybe: "Tôi thỉnh thoảng đọc tin tức ngắn.",
    subTextYes: "Tôi thích suy ngẫm sâu sắc về các chủ đề nhân văn."
  },
  { 
    id: 8, 
    text: "Tôi tò mò muốn biết cơ chế hoạt động bên trong của các thiết bị công nghệ hoặc phần mềm máy tính.", 
    category: "logic", 
    mbtiDimension: "NS", 
    mbtiWeight: 1,
    subTextNo: "Tôi chỉ sử dụng chúng như người dùng bình thường.",
    subTextMaybe: "Thỉnh thoảng tôi có xem video giải thích công nghệ.",
    subTextYes: "Tôi rất thích tìm hiểu về code hoặc linh kiện máy tính."
  },
  { 
    id: 9, 
    text: "Tôi luôn lên kế hoạch học tập cụ thể theo tuần và cố gắng bám sát lộ trình đó.", 
    category: "focus", 
    mbtiDimension: "JP", 
    mbtiWeight: 1,
    subTextNo: "Tôi thích học tùy hứng và tự do hơn.",
    subTextMaybe: "Tôi có ghi chép kế hoạch nhưng ít khi hoàn thành hết.",
    subTextYes: "Tôi cảm thấy an tâm khi có thời khóa biểu rõ ràng."
  },
  { 
    id: 10, 
    text: "Tôi là người nhạy cảm, dễ dàng đồng cảm và chia sẻ cảm xúc với bạn bè xung quanh.", 
    category: "empathy", 
    mbtiDimension: "TF", 
    mbtiWeight: -1,
    subTextNo: "Tôi thường giải quyết vấn đề bằng lý trí khách quan.",
    subTextMaybe: "Tôi lắng nghe nhưng ít khi can thiệp cảm xúc.",
    subTextYes: "Tôi dễ xúc động và luôn muốn an ủi người khác."
  },
  { 
    id: 11, 
    text: "Tôi thích vẽ tranh, thiết kế đồ họa hoặc tham gia vào các hoạt động nghệ thuật, âm nhạc.", 
    category: "creativity", 
    mbtiDimension: "NS", 
    mbtiWeight: 1,
    subTextNo: "Tôi không có năng khiếu hay hứng thú nghệ thuật.",
    subTextMaybe: "Tôi thích xem/nghe hơn là tự sáng tạo.",
    subTextYes: "Sáng tạo nghệ thuật giúp tôi giải tỏa áp lực rất tốt."
  },
  { 
    id: 12, 
    text: "Tôi cảm thấy tự tin và thoải mái khi chia sẻ ý kiến cá nhân trước cả lớp học.", 
    category: "communication", 
    mbtiDimension: "EI", 
    mbtiWeight: 1,
    subTextNo: "Tôi thấy rất run và hồi hộp trước đám đông.",
    subTextMaybe: "Tôi nói được nếu đã chuẩn bị kỹ nội dung.",
    subTextYes: "Tôi thích tương tác và chia sẻ trực tiếp."
  },
  { 
    id: 13, 
    text: "Tôi bị thu hút bởi các số liệu, biểu đồ thống kê hoặc các bài toán phân tích logic.", 
    category: "logic", 
    mbtiDimension: "TF", 
    mbtiWeight: 1,
    subTextNo: "Tôi thấy chúng rất khô khan và nhức đầu.",
    subTextMaybe: "Tôi đọc hiểu được khi được giảng giải chi tiết.",
    subTextYes: "Số liệu luôn phản ánh sự thật khách quan rõ ràng."
  },
  { 
    id: 14, 
    text: "Tôi coi trọng sự hòa đồng trong nhóm và luôn cố gắng lắng nghe ý kiến của người khác.", 
    category: "teamwork", 
    mbtiDimension: "TF", 
    mbtiWeight: -1,
    subTextNo: "Tôi tập trung vào hiệu quả công việc hơn là cảm xúc nhóm.",
    subTextMaybe: "Tôi lắng nghe nhưng vẫn bảo vệ ý kiến cá nhân.",
    subTextYes: "Sự đoàn kết và tôn trọng lẫn nhau là quan trọng nhất."
  },
  { 
    id: 15, 
    text: "Tôi thích tự nghiên cứu hoặc làm các thí nghiệm khoa học thực tế.", 
    category: "logic", 
    mbtiDimension: "NS", 
    mbtiWeight: 1,
    subTextNo: "Tôi thích học lý thuyết qua sách vở hơn làm thí nghiệm.",
    subTextMaybe: "Thí nghiệm vui thì tôi sẽ tham gia.",
    subTextYes: "Tự tay làm thí nghiệm giúp tôi hiểu sâu bài học."
  },
  { 
    id: 16, 
    text: "Tôi tiếp thu bài tốt nhất khi nhìn vào hình ảnh, sơ đồ tư duy sinh động (Visual Learning).", 
    category: "focus",
    subTextNo: "Tôi thích nghe giảng giải chi tiết bằng lời nói hơn.",
    subTextMaybe: "Tôi kết hợp cả ghi chép văn bản và sơ đồ.",
    subTextYes: "Màu sắc và hình vẽ giúp tôi ghi nhớ thông tin lập tức."
  },
  { 
    id: 17, 
    text: "Tôi thích tìm tòi tự học lập trình, giải toán nâng cao hoặc chơi cờ vua.", 
    category: "logic", 
    mbtiDimension: "TF", 
    mbtiWeight: 1,
    subTextNo: "Tôi không hứng thú với lập trình hay cờ vua.",
    subTextMaybe: "Tôi có chơi giải trí một vài lần.",
    subTextYes: "Các trò chơi chiến thuật kích thích trí não tôi cực độ."
  },
  { 
    id: 18, 
    text: "Tôi luôn sẵn sàng tham gia các hoạt động tình nguyện giúp đỡ cộng đồng.", 
    category: "empathy", 
    mbtiDimension: "TF", 
    mbtiWeight: -1,
    subTextNo: "Tôi ưu tiên thời gian cho việc học tập cá nhân.",
    subTextMaybe: "Tôi tham gia nếu trường bắt buộc tích điểm rèn luyện.",
    subTextYes: "Giúp đỡ người khác mang lại hạnh phúc cho tôi."
  },
  { 
    id: 19, 
    text: "Tôi thường giữ bình tĩnh tốt và đưa ra giải pháp giải quyết xung đột khi nhóm xảy ra bất đồng.", 
    category: "leadership", 
    mbtiDimension: "TF", 
    mbtiWeight: 1,
    subTextNo: "Tôi thường im lặng tránh xa các cuộc cãi vã.",
    subTextMaybe: "Tôi cố gắng can ngăn nhưng không biết giải quyết thế nào.",
    subTextYes: "Tôi phân tích lý do khách quan để cả hai bên hiểu nhau."
  },
  { 
    id: 20, 
    text: "Tôi có tính kỷ luật cao, hiếm khi để bài tập sát giờ nộp mới bắt đầu làm.", 
    category: "focus", 
    mbtiDimension: "JP", 
    mbtiWeight: 1,
    subTextNo: "Tôi thường có thói quen nước đến chân mới nhảy.",
    subTextMaybe: "Đôi khi tôi cũng bị trễ hẹn nhẹ.",
    subTextYes: "Tôi luôn hoàn thành bài tập sớm hơn thời hạn 1 ngày."
  },
  { 
    id: 21, 
    text: "Tôi thích học ngoại ngữ mới và muốn giao lưu học hỏi với bạn bè quốc tế.", 
    category: "language", 
    mbtiDimension: "EI", 
    mbtiWeight: 1,
    subTextNo: "Tôi thấy học ngoại ngữ khá vất vả và ngại giao tiếp.",
    subTextMaybe: "Tôi học tốt ngữ pháp nhưng nói chưa tự tin.",
    subTextYes: "Ngoại ngữ mở ra cánh cửa kết nối toàn cầu."
  },
  { 
    id: 22, 
    text: "Tôi thích dành không gian riêng tư để suy ngẫm về bản thân hoặc viết nhật ký học tập.", 
    category: "empathy", 
    mbtiDimension: "EI", 
    mbtiWeight: -1,
    subTextNo: "Tôi thích chia sẻ tâm sự trực tiếp với bạn thân hơn.",
    subTextMaybe: "Tôi thỉnh thoảng tự suy ngẫm lúc rảnh rỗi.",
    subTextYes: "Viết nhật ký giúp tôi sắp xếp cảm xúc hiệu quả."
  },
  { 
    id: 23, 
    text: "Tôi có xu hướng tìm nhiều cách giải quyết linh hoạt cho một vấn đề thay vì đi theo lối mòn.", 
    category: "creativity", 
    mbtiDimension: "NS", 
    mbtiWeight: 1,
    subTextNo: "Tôi thích áp dụng các phương pháp chuẩn đã được dạy.",
    subTextMaybe: "Tôi tìm phương pháp mới nếu phương án cũ thất bại.",
    subTextYes: "Tôi thích thử thách các góc nhìn phá cách mới mẻ."
  },
  { 
    id: 24, 
    text: "Tôi thích tự tay lắp ráp mô hình, làm đồ thủ công hoặc vẽ phác thảo ý tưởng.", 
    category: "creativity", 
    mbtiDimension: "NS", 
    mbtiWeight: -1,
    subTextNo: "Tôi không thích làm các công việc lắp ráp tỉ mỉ.",
    subTextMaybe: "Tôi thỉnh thoảng vẽ bậy nguệch ngoạc giải trí.",
    subTextYes: "Tôi cực kỳ tỉ mỉ và tự hào về các mô hình tự chế."
  },
  { 
    id: 25, 
    text: "Tôi có tầm nhìn và định hướng rõ ràng về mục tiêu sự nghiệp sau khi tốt nghiệp cấp 3.", 
    category: "leadership", 
    mbtiDimension: "JP", 
    mbtiWeight: 1,
    subTextNo: "Tôi chưa có ý tưởng gì cụ thể, học tới đâu hay tới đó.",
    subTextMaybe: "Tôi có vài lựa chọn nhưng chưa thực sự chắc chắn.",
    subTextYes: "Tôi đã chọn được trường Đại học và nghề nghiệp mơ ước."
  },
  { 
    id: 26, 
    text: "Tôi rất thích giải thích bài học, hướng dẫn các bạn học yếu hơn cùng tiến bộ.", 
    category: "language", 
    mbtiDimension: "TF", 
    mbtiWeight: -1,
    subTextNo: "Tôi thấy khá mất thời gian và khó giải thích.",
    subTextMaybe: "Tôi chỉ bài nếu bạn hỏi đúng câu tôi biết làm.",
    subTextYes: "Giảng bài cho bạn giúp tôi tự ôn tập kiến thức rất tốt."
  },
  { 
    id: 27, 
    text: "Tôi thích tham gia các câu lạc bộ thể thao, hoạt động tập thể ngoài trời.", 
    category: "communication", 
    mbtiDimension: "EI", 
    mbtiWeight: 1,
    subTextNo: "Tôi thích các hoạt động trong nhà như chơi game, xem phim.",
    subTextMaybe: "Tôi tham gia dã ngoại nếu có bạn thân đi cùng.",
    subTextYes: "Vận động ngoài trời giúp tôi tràn trề sức sống."
  },
  { 
    id: 28, 
    text: "Tôi hứng thú tìm hiểu về xu hướng kinh tế, cách các doanh nghiệp hoặc khởi nghiệp vận hành.", 
    category: "leadership", 
    mbtiDimension: "JP", 
    mbtiWeight: 1,
    subTextNo: "Tôi thấy kinh doanh khá phức tạp và đau đầu.",
    subTextMaybe: "Tôi có nghe tin tức tài chính nhưng ít tìm hiểu sâu.",
    subTextYes: "Tôi ước mơ được tự khởi nghiệp một thương hiệu riêng."
  },
  { 
    id: 29, 
    text: "Tôi yêu thích khám phá thế giới tự nhiên, môi trường sinh thái và thế giới động thực vật.", 
    category: "empathy",
    subTextNo: "Tôi thích cuộc sống đô thị hiện đại tiện nghi hơn.",
    subTextMaybe: "Tôi thích đi du lịch sinh thái thư giãn rảnh rỗi.",
    subTextYes: "Tôi rất thích các chương trình tài liệu khoa học tự nhiên."
  },
  { 
    id: 30, 
    text: "Tôi mong muốn tự phát triển ra một sản phẩm hoặc giải pháp có ích cho hàng triệu người.", 
    category: "leadership", 
    mbtiDimension: "JP", 
    mbtiWeight: -1,
    subTextNo: "Tôi muốn cống hiến thầm lặng trong công việc ổn định.",
    subTextMaybe: "Đó là ý tưởng lớn, tôi sẽ thử nếu có cơ hội thích hợp.",
    subTextYes: "Tôi muốn tạo ra giá trị đột phá thay đổi cuộc sống."
  }
];

interface AssessmentTestProps {
  onBackToHome: () => void;
}

export const AssessmentTest: React.FC<AssessmentTestProps> = ({ onBackToHome }) => {
  const [step, setStep] = useState<2 | 3 | 4>(2); // 2 = Testing, 3 = Analyzing, 4 = Results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Time tracking (15 minutes 30 seconds count)
  const [timeLeft, setTimeLeft] = useState(15 * 60 + 30); 

  // UI state: Exit confirmation popup
  const [showExitModal, setShowExitModal] = useState(false);

  // AI loading analysis text updates
  const [analysisText, setAnalysisText] = useState('🧠 Đang phân tích kết quả...');
  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    if (step === 2) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 3) {
      // Rotate messages during analysis stage
      const interval = setInterval(() => {
        setProgressVal(prev => {
          const next = prev + 5;
          if (next >= 100) {
            clearInterval(interval);
            setStep(4);
            // Save state to localStorage that assessment is completed
            localStorage.setItem('omni_onboarding_completed', 'true');
            return 100;
          }
          
          if (next < 25) {
            setAnalysisText('Đang phân tích kết quả câu trả lời...');
          } else if (next < 50) {
            setAnalysisText('Đánh giá 8 nhóm năng lực cốt lõi...');
          } else if (next < 75) {
            setAnalysisText('Xây dựng hồ sơ học tập & MBTI...');
          } else {
            setAnalysisText('AI đang thiết lập lộ trình học tập tối ưu...');
          }
          return next;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSelectOption = (value: number) => {
    setSelectedAnswer(value);
    setAnswers(prev => ({ ...prev, [ASSESSMENT_QUESTIONS[currentQuestionIndex].id]: value }));

    // Auto-advance after 320ms
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStep(3); // Start analyzing
      }
    }, 320);
  };

  const formatTimeMinutes = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleExitTestConfirm = () => {
    setShowExitModal(false);
    onBackToHome();
  };

  // Calculations for step 4 (Results)
  const calculateResults = () => {
    // 8 Competencies calculation (0 to 10 points)
    const competencies: Record<string, { total: number; count: number }> = {
      logic: { total: 0, count: 0 },
      communication: { total: 0, count: 0 },
      creativity: { total: 0, count: 0 },
      teamwork: { total: 0, count: 0 },
      leadership: { total: 0, count: 0 },
      focus: { total: 0, count: 0 },
      language: { total: 0, count: 0 },
      empathy: { total: 0, count: 0 }
    };

    // MBTI dimension scores
    const mbtiScores = { EI: 0, NS: 0, TF: 0, JP: 0 };

    ASSESSMENT_QUESTIONS.forEach(q => {
      const answerVal = answers[q.id] !== undefined ? answers[q.id] : 1; 
      competencies[q.category].total += answerVal;
      competencies[q.category].count += 1;

      if (q.mbtiDimension) {
        mbtiScores[q.mbtiDimension] += (answerVal - 1) * (q.mbtiWeight || 1);
      }
    });

    const scores = Object.keys(competencies).reduce((acc, key) => {
      const { total, count } = competencies[key];
      acc[key] = Math.round((total / (count * 2)) * 100);
      return acc;
    }, {} as Record<string, number>);

    const E_I = mbtiScores.EI >= 0 ? 'E' : 'I';
    const N_S = mbtiScores.NS >= 0 ? 'N' : 'S';
    const T_F = mbtiScores.TF >= 0 ? 'T' : 'F';
    const J_P = mbtiScores.JP >= 0 ? 'J' : 'P';
    const mbti = `${E_I}${N_S}${T_F}${J_P}`;

    return { scores, mbti };
  };

  const { scores, mbti } = calculateResults();

  const getMbtiDetails = (type: string) => {
    const details: Record<string, { title: string; desc: string; careers: string[]; strengths: string[]; weaknesses: string[]; skills: string[] }> = {
      INFP: {
        title: "Người Lý Tưởng Hóa (INFP)",
        desc: "Bạn là người sáng tạo, đồng cảm và luôn hướng tới những giá trị sống ý nghĩa. Bạn học tốt qua hình ảnh và thích làm việc độc lập hoặc nhóm nhỏ hòa hợp.",
        careers: ["Thiết kế đồ họa", "Viết lách / Biên kịch", "Tâm lý học", "Truyền thông", "Giáo dục"],
        strengths: ["Giàu lòng nhân ái", "Sáng tạo vượt trội", "Lắng nghe tốt"],
        weaknesses: ["Quá lý tưởng hóa thực tế", "Khó tiếp nhận phản hồi tiêu cực"],
        skills: ["Tư duy thiết kế", "Viết luận tiếng Anh", "Kỹ năng phản biện"]
      },
      ENFP: {
        title: "Người Truyền Cảm Hứng (ENFP)",
        desc: "Bạn đầy nhiệt huyết, linh hoạt và luôn tràn đầy ý tưởng mới. Bạn thích kết nối mọi người và có khả năng ngôn ngữ tự nhiên tuyệt vời.",
        careers: ["Marketing / PR", "Tổ chức sự kiện", "Nhà báo", "Khởi nghiệp", "Quan hệ quốc tế"],
        strengths: ["Giao tiếp lôi cuốn", "Nhiều sáng kiến", "Năng lượng tích cực"],
        weaknesses: ["Dễ mất tập trung", "Ngại làm việc chi tiết rập khuôn"],
        skills: ["Thuyết trình trước đám đông", "Sáng tạo nội dung", "Quản trị dự án"]
      },
      INTJ: {
        title: "Nhà Kiến Trúc (INTJ)",
        desc: "Bạn có đầu óc chiến lược, tư duy logic cực kỳ sắc bén và thích giải quyết các bài toán hóc búa một cách độc lập.",
        careers: ["Lập trình viên / AI", "Phân tích dữ liệu", "Nghiên cứu khoa học", "Kỹ sư hệ thống", "Tài chính đầu tư"],
        strengths: ["Tư duy hệ thống", "Quyết đoán cao", "Tự học xuất sắc"],
        weaknesses: ["Ít kiên nhẫn với ý kiến thiếu logic", "Khép kín, ngại giao tiếp"],
        skills: ["Lập trình Python", "Toán rời rạc / Logic", "Quản trị mục tiêu"]
      },
      ENTJ: {
        title: "Nhà Điều Hành (ENTJ)",
        desc: "Bạn là nhà lãnh đạo bẩm sinh, quyết đoán, có tổ chức và định hướng mục tiêu cực kỳ rõ ràng.",
        careers: ["Quản trị kinh doanh", "Quản lý dự án", "Luật sư", "Tư vấn chiến lược", "Kinh tế đối ngoại"],
        strengths: ["Lãnh đạo lôi cuốn", "Tổ chức tốt", "Tầm nhìn xa"],
        weaknesses: ["Đôi khi độc đoán", "Ít kiên nhẫn với chi tiết nhỏ"],
        skills: ["Kỹ năng đàm phán", "Lập kế hoạch chiến lược", "Quản lý nhân sự"]
      },
      INTP: {
        title: "Nhà Logic Học (INTP)",
        desc: "Bạn đam mê lý thuyết, phân tích và muốn thấu hiểu bản chất cốt lõi của mọi sự vật xung quanh.",
        careers: ["Nghiên cứu Toán/Lý", "Phát triển phần mềm", "Kỹ sư thuật toán", "Nhà triết học", "Phân tích hệ thống"],
        strengths: ["Khách quan, logic", "Độc lập suy nghĩ", "Sáng tạo phân tích"],
        weaknesses: ["Dễ sa đà vào lý thuyết suông", "Ngại giao tiếp xã hội"],
        skills: ["Giải thuật toán học", "Phân tích hệ thống", "Tự học nâng cao"]
      },
      ENTP: {
        title: "Người Thách Thức (ENTP)",
        desc: "Bạn thích tranh luận, phản biện và tìm tòi các giải pháp phá cách. Bạn nhanh nhạy và không ngại thay đổi.",
        careers: ["Luật sư tranh biện", "Phát triển sản phẩm", "Giám đốc sáng tạo", "Cố vấn đổi mới", "Kinh doanh công nghệ"],
        strengths: ["Nhanh trí, phản biện tốt", "Năng động thích ứng", "Ý tưởng đột phá"],
        weaknesses: ["Dễ bỏ dở nửa chừng", "Thích tranh cãi gây căng thẳng"],
        skills: ["Tư duy phản biện", "Đàm phán thương lượng", "Kỹ năng thuyết phục"]
      },
      INFJ: {
        title: "Nhà Bảo Vệ (INFJ)",
        desc: "Bạn sâu sắc, thầm lặng và luôn hướng tới việc giúp đỡ người khác cải thiện cuộc sống tốt đẹp hơn.",
        careers: ["Tâm lý trị liệu", "Công tác xã hội", "Giáo viên", "Nhà văn / Biên dịch", "Y tế cộng đồng"],
        strengths: ["Trực giác nhạy bén", "Tận tụy, nhân ái", "Kiên định mục tiêu"],
        weaknesses: ["Dễ bị kiệt sức vì lo lắng", "Quá nhạy cảm trước áp lực"],
        skills: ["Tâm lý học hành vi", "Viết chuyên đề học thuật", "Lắng nghe tích cực"]
      },
      ENFJ: {
        title: "Người Chỉ Dẫn (ENFJ)",
        desc: "Bạn ấm áp, biết lắng nghe và luôn truyền cảm hứng, động lực cho đội nhóm cùng phát triển vượt trội.",
        careers: ["Quản lý nhân sự", "Quan hệ công chúng", "Đào tạo kỹ năng", "Ngoại giao", "Quản lý giáo dục"],
        strengths: ["Đồng cảm tuyệt vời", "Giao tiếp thuyết phục", "Truyền lửa tốt"],
        weaknesses: ["Quá khắt khe với bản thân", "Dễ ôm đồm nhiều việc"],
        skills: ["Lãnh đạo đội ngũ", "Giao tiếp liên nhân cách", "Nói trước công chúng"]
      },
      ISTJ: {
        title: "Nhà Kỷ Luật (ISTJ)",
        desc: "Bạn thực tế, có trách nhiệm, kỷ luật cao và coi trọng tính chính xác, trung thực trong mọi việc.",
        careers: ["Kế toán / Kiểm toán", "Phân tích tài chính", "Quản trị cơ sở dữ liệu", "Kỹ sư cầu đường", "Quân sự / An ninh"],
        strengths: ["Cực kỳ kỷ luật", "Chú ý chi tiết tốt", "Đáng tin cậy"],
        weaknesses: ["Bảo thủ, khó thay đổi", "Thiếu tính linh hoạt sáng tạo"],
        skills: ["Tin học văn phòng", "Quản lý ngân sách", "Phân tích dữ liệu kế toán"]
      },
      ESTJ: {
        title: "Người Giám Sát (ESTJ)",
        desc: "Bạn thực tế, thích trật tự và quy củ. Bạn thích dẫn dắt tổ chức theo đúng kế hoạch và luật lệ.",
        careers: ["Quản lý nhà hàng/khách sạn", "Thanh tra tài chính", "Giám đốc vận hành", "Quản lý sản xuất", "Luật hành chính"],
        strengths: ["Tổ chức quy củ", "Trách nhiệm cao", "Quyết đoán thực tế"],
        weaknesses: ["Khắt khe với sai sót", "Thiếu linh hoạt trước thay đổi"],
        skills: ["Vận hành quy trình", "Quản trị thời gian", "Đánh giá chất lượng"]
      },
      ISFJ: {
        title: "Người Nuôi Dưỡng (ISFJ)",
        desc: "Bạn tận tụy, chu đáo, ấm áp và luôn sẵn lòng đứng sau hỗ trợ, bảo vệ sự ổn định của tập thể.",
        careers: ["Y tá / Bác sĩ thú y", "Quản trị văn phòng", "Dịch vụ khách hàng", "Công tác thư viện", "Hỗ trợ học đường"],
        strengths: ["Chu đáo, cẩn thận", "Trung thành, nhiệt tình", "Hỗ trợ thầm lặng"],
        weaknesses: ["Khó từ chối người khác", "Dễ giữ áp lực trong lòng"],
        skills: ["Chăm sóc khách hàng", "Quản lý hồ sơ tài liệu", "Làm việc nhóm nhỏ"]
      },
      ESFJ: {
        title: "Người Quan Tâm (ESFJ)",
        desc: "Bạn hướng ngoại, thân thiện và luôn nỗ lực xây dựng mối quan hệ cộng đồng gắn kết tốt đẹp.",
        careers: ["Quản lý cộng đồng", "Chăm sóc sức khỏe", "Nhân sự", "Dạy học tiểu học", "Hướng dẫn viên du lịch"],
        strengths: ["Nhiều người yêu quý", "Tổ chức sự kiện tốt", "Chân thành"],
        weaknesses: ["Nhạy cảm với lời chê bai", "Sợ bị cô lập khỏi tập thể"],
        skills: ["Tổ chức hoạt động", "Thuyết trình giới thiệu", "Giải quyết bất hòa"]
      },
      ISTP: {
        title: "Người Thợ Điện (ISTP)",
        desc: "Bạn thực tế, thích hành động và đam mê khám phá các công cụ, máy móc bằng trải nghiệm thực tế.",
        careers: ["Kỹ thuật cơ khí", "Lập trình nhúng", "Kỹ thuật viên phòng thí nghiệm", "Chụp ảnh phong cảnh", "Hệ thống thông tin"],
        strengths: ["Thích nghi nhanh", "Xử lý sự cố tốt", "Khéo tay thực tế"],
        weaknesses: ["Dễ chán ghét lý thuyết", "Thích tự cô lập, khép kín"],
        skills: ["Kỹ năng thực hành lắp ráp", "Lập trình phần cứng", "Sửa chữa hệ thống"]
      },
      ESTP: {
        title: "Người Thực Thi (ESTP)",
        desc: "Bạn hướng ngoại, thích hành động ngay lập tức, đam mê mạo hiểm và tràn đầy năng lượng thực tế.",
        careers: ["Môi giới bất động sản", "Kinh doanh bán hàng", "Vận động viên / HLV", "Quản lý sự cố khẩn cấp", "Kinh doanh tự do"],
        strengths: ["Quyết đoán tức thì", "Năng lượng dồi dào", "Nhạy bén cơ hội"],
        weaknesses: ["Thiếu kiên nhẫn tầm nhìn xa", "Dễ đưa ra quyết định liều lĩnh"],
        skills: ["Kỹ năng chốt sale", "Nói chuyện cuốn hút", "Phản ứng nhanh"]
      },
      ISFP: {
        title: "Người Nghệ Sĩ (ISFP)",
        desc: "Bạn nhạy cảm, yêu nghệ thuật, thiên nhiên và thích sống trọn vẹn từng khoảnh khắc hiện tại.",
        careers: ["Thiết kế thời trang", "Hội họa / Điêu khắc", "Chụp ảnh nghệ thuật", "Nông nghiệp công nghệ cao", "Làm bánh chuyên nghiệp"],
        strengths: ["Trực giác nghệ thuật tốt", "Dễ tính, hòa đồng", "Độc lập tư duy"],
        weaknesses: ["Khó lập kế hoạch dài hạn", "Dễ căng thẳng khi bị gò bó"],
        skills: ["Vẽ minh họa", "Nhiếp ảnh cơ bản", "Phối màu sắc thiết kế"]
      },
      ESFP: {
        title: "Người Trình Diễn (ESFP)",
        desc: "Bạn sinh ra để làm trung tâm của sự chú ý, hài hước, sôi động và luôn mang lại tiếng cười cho tập thể.",
        careers: ["Diễn viên / MC", "Hướng dẫn viên du lịch", "Chuyên viên tư vấn làm đẹp", "Quan hệ khách hàng", "Truyền thông giải trí"],
        strengths: ["Hoạt ngôn, lôi cuốn", "Lạc quan tích cực", "Kết nối mọi người"],
        weaknesses: ["Sợ kỷ luật gò bó", "Khó tập trung học thuật chuyên sâu"],
        skills: ["Dẫn chương trình", "Diễn xuất biểu cảm", "Giao tiếp công chúng"]
      }
    };

    return details[type] || details.INFP;
  };

  const mbtiDetails = getMbtiDetails(mbti);

  const getRadarCoordinates = (scores: Record<string, number>) => {
    const competencies = [
      'logic', 'communication', 'creativity', 'teamwork', 
      'leadership', 'focus', 'language', 'empathy'
    ];
    
    const center = 140;
    const rMax = 90; 

    return competencies.map((key, index) => {
      const score = scores[key] || 50;
      const angle = (index * 45 - 90) * (Math.PI / 180); 
      const r = (score / 100) * rMax;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, label: key };
    });
  };

  const coordinates = getRadarCoordinates(scores);
  const polygonPoints = coordinates.map(c => `${c.x},${c.y}`).join(' ');

  const getGridPoints = (level: number) => {
    const center = 140;
    const r = (level / 4) * 90;
    return Array.from({ length: 8 }).map((_, index) => {
      const angle = (index * 45 - 90) * (Math.PI / 180);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];

  // Circular gauge parameters
  const answeredCount = currentQuestionIndex;
  const radius = 28;
  const circumference = 2 * Math.PI * radius; // 175.92
  const strokeDashoffset = circumference - (circumference * answeredCount) / ASSESSMENT_QUESTIONS.length;

  return (
    <div className="h-screen max-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none overflow-hidden animate-fadeIn relative">
      
      {/* 1. SURVEY TESTING SCREEN */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between w-full max-w-7xl mx-auto px-6 py-4 overflow-hidden h-full">
          
          {/* Header Bar */}
          <header className="h-16 flex items-center justify-between shrink-0 bg-white border border-slate-100 rounded-3xl px-6 relative z-10 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Onmi Exam" className="h-6 w-auto object-contain" />
            </div>

            {/* Title & overall progress info */}
            <div className="text-center space-y-1 max-w-md flex-1">
              <h1 className="text-[11px] sm:text-xs font-black text-slate-800 tracking-wide uppercase">
                Đánh giá năng lực & Định hướng nghề nghiệp
              </h1>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5 leading-none">
                <span>{currentQuestionIndex} / 30</span>
                <span>•</span>
                <span>{Math.round((currentQuestionIndex / ASSESSMENT_QUESTIONS.length) * 100)}% hoàn thành</span>
              </div>
              {/* Center progress bar inside header */}
              <div className="w-40 mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentQuestionIndex / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Thoát bài button */}
            <button 
              onClick={() => setShowExitModal(true)}
              className="px-3.5 py-1.5 border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-600 text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer bg-white focus:outline-none focus:ring-0 outline-none"
            >
              <LogOut size={12} /> Thoát bài
            </button>
          </header>

          {/* Main Layout Workspace Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch py-4 overflow-hidden">
            
            {/* LEFT STATS PANEL (25% width - cols 3/12) */}
            <div className="lg:col-span-3 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
              
              {/* Card 1: Khám phá bản thân */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-primary flex items-center justify-center shadow-inner">
                  <Brain size={20} className="stroke-[2.5]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Khám phá bản thân</h4>
                  <p className="text-[9px] text-slate-400 font-bold">Để hiểu mình hơn và đi đúng hướng hơn</p>
                </div>
              </div>

              {/* Card 2: Tiến trình bài test */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tiến trình bài test</h4>
                
                <div className="flex items-center gap-4">
                  {/* Circular progress SVG */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center select-none">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                      {/* Grey background circle */}
                      <circle cx="32" cy="32" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="6" />
                      {/* Purple active progress circle */}
                      <circle 
                        cx="32" 
                        cy="32" 
                        r={radius} 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="6" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    {/* Text center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                      <span className="text-xs font-black text-slate-800">{currentQuestionIndex}</span>
                      <span className="text-[7px] text-slate-400 font-bold mt-0.5">/ 30</span>
                    </div>
                  </div>

                  {/* Status labels */}
                  <div className="flex-1 space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đã trả lời</span>
                      <span className="text-slate-800 font-black">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Đang làm</span>
                      <span className="text-slate-800 font-black">1</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Chưa trả lời</span>
                      <span className="text-slate-800 font-black">{ASSESSMENT_QUESTIONS.length - answeredCount - 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Thời gian ước tính */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Thời gian ước tính</h4>
                <div className="flex items-baseline gap-1.5 justify-center py-1">
                  <span className="text-2xl font-black font-mono text-slate-800">{formatTimeMinutes(timeLeft)}</span>
                  <span className="text-[9px] text-slate-400 font-bold">còn lại</span>
                </div>
                {/* Horizontal slider progress bar */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(timeLeft / (15 * 60 + 30)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Mẹo nhỏ */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2.5">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                  <Lightbulb size={11} className="text-primary" />
                  <span>Mẹo nhỏ</span>
                </div>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                  Không có đáp án đúng hay sai. Hãy chọn câu trả lời phản ánh đúng nhất con người của bạn nhé!
                </p>
              </div>

            </div>

            {/* MIDDLE/RIGHT WORKSPACE (75% width - cols 9/12) */}
            <div className="lg:col-span-9 bg-white border border-slate-100/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden h-full">
              
              {/* Top row: progress tag and report bug */}
              <div className="flex justify-between items-center shrink-0 select-none">
                <span className="px-2.5 py-1 rounded-lg bg-primary-light border border-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                  Câu hỏi {currentQuestion.id} / 30
                </span>
                <button 
                  onClick={() => alert('Đã báo lỗi câu hỏi thành công')}
                  className="px-2.5 py-1 text-[9px] font-bold text-slate-400 hover:text-slate-655 flex items-center gap-1 border border-slate-100 hover:border-slate-200 bg-white rounded-lg transition cursor-pointer focus:outline-none focus:ring-0 outline-none"
                >
                  <Flag size={10} /> Báo lỗi câu hỏi
                </button>
              </div>

              {/* Center work graphics illustration */}
              <div className="flex-1 flex flex-col justify-center py-6 select-text max-w-xl mx-auto w-full">
                
                {/* Visual Work SVG illustration */}
                <div className="flex justify-center mb-6 select-none pointer-events-none">
                  <svg width="140" height="90" viewBox="0 0 140 90" className="overflow-visible">
                    {/* Shadow circle */}
                    <ellipse cx="70" cy="80" rx="45" ry="8" fill="#F1F5F9" />
                    
                    {/* Purple cloud shapes representing thoughts/ideas */}
                    <circle cx="45" cy="30" r="12" fill="#EEF2FF" opacity="0.8" />
                    <circle cx="95" cy="25" r="10" fill="#EEF2FF" opacity="0.8" />
                    <circle cx="68" cy="18" r="14" fill="#EEF2FF" opacity="0.9" />

                    {/* Puzzle pieces floats */}
                    <rect x="25" y="24" width="8" height="8" rx="2.5" fill="#8F85F3" transform="rotate(15, 25, 24)" opacity="0.5" />
                    <rect x="106" y="20" width="10" height="10" rx="3.5" fill="#10B981" transform="rotate(-15, 106, 20)" opacity="0.5" />
                    <polygon points="68,5 73,11 63,11" fill="#F59E0B" opacity="0.7" />

                    {/* Sitting Work Person */}
                    {/* Torso/Head */}
                    <circle cx="70" cy="40" r="8" fill="#E2E8F0" stroke="#6C5DD3" strokeWidth="2" />
                    <path d="M 58,68 C 58,52 82,52 82,68 Z" fill="#6C5DD3" />
                    {/* Table / Laptop */}
                    <line x1="40" y1="74" x2="100" y2="74" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="62" y="66" width="16" height="8" rx="1.5" fill="white" stroke="#6C5DD3" strokeWidth="1.5" />
                    <line x1="64" y1="74" x2="76" y2="74" stroke="#6C5DD3" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-800 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold select-none">
                    Hãy chọn mức độ phù hợp nhất với bạn.
                  </p>
                </div>
              </div>

              {/* Large cards options: Không, Trung bình, Có */}
              <div className="space-y-2.5 shrink-0 select-none">
                
                {/* 1. KHÔNG option */}
                <button 
                  onClick={() => handleSelectOption(0)}
                  className={`w-full p-3.5 px-4 border rounded-2xl flex items-center justify-between text-left transition cursor-pointer focus:outline-none focus:ring-0 outline-none ${
                    selectedAnswer === 0 
                      ? 'border-red-500 bg-red-50/5 text-red-500 shadow-sm shadow-red-100/10' 
                      : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                      selectedAnswer === 0 ? 'bg-red-100 text-red-500' : 'bg-red-50/70 text-red-400'
                    }`}>
                      <Frown size={20} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 leading-normal">
                      <h4 className="text-xs font-black">Không</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md mt-0.5">
                        {currentQuestion.subTextNo}
                      </p>
                    </div>
                  </div>
                  {selectedAnswer === 0 ? (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-sm animate-scaleUp">
                      <Check size={11} className="stroke-[3.5]" />
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  )}
                </button>

                {/* 2. TRUNG BÌNH option */}
                <button 
                  onClick={() => handleSelectOption(1)}
                  className={`w-full p-3.5 px-4 border rounded-2xl flex items-center justify-between text-left transition cursor-pointer focus:outline-none focus:ring-0 outline-none ${
                    selectedAnswer === 1 
                      ? 'border-amber-500 bg-amber-50/5 text-amber-500 shadow-sm shadow-amber-100/10' 
                      : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                      selectedAnswer === 1 ? 'bg-amber-100 text-amber-500' : 'bg-amber-50/70 text-amber-400'
                    }`}>
                      <Meh size={20} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 leading-normal">
                      <h4 className="text-xs font-black">Trung bình</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md mt-0.5">
                        {currentQuestion.subTextMaybe}
                      </p>
                    </div>
                  </div>
                  {selectedAnswer === 1 ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm animate-scaleUp">
                      <Check size={11} className="stroke-[3.5]" />
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  )}
                </button>

                {/* 3. CÓ option */}
                <button 
                  onClick={() => handleSelectOption(2)}
                  className={`w-full p-3.5 px-4 border rounded-2xl flex items-center justify-between text-left transition cursor-pointer focus:outline-none focus:ring-0 outline-none ${
                    selectedAnswer === 2 
                      ? 'border-emerald-500 bg-emerald-50/5 text-emerald-500 shadow-sm shadow-emerald-100/10' 
                      : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                      selectedAnswer === 2 ? 'bg-emerald-100 text-emerald-500' : 'bg-emerald-50/70 text-emerald-400'
                    }`}>
                      <Smile size={20} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 leading-normal">
                      <h4 className="text-xs font-black">Có</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md mt-0.5">
                        {currentQuestion.subTextYes}
                      </p>
                    </div>
                  </div>
                  {selectedAnswer === 2 ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm animate-scaleUp">
                      <Check size={11} className="stroke-[3.5]" />
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  )}
                </button>

              </div>

              {/* Status footer spinner text */}
              <div className="h-8 border-t border-slate-50 flex items-center justify-center text-[9px] text-[#A3AED0] font-bold mt-4 select-none shrink-0 gap-1 pt-1.5">
                <RotateCw size={11} className="animate-spin" /> Chọn một đáp án để tự động chuyển tiếp
              </div>

            </div>

          </div>

          {/* Security Banner at bottom */}
          <footer className="h-10 bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl flex items-center justify-center gap-2 text-[10px] text-primary font-bold shrink-0">
            <ShieldCheck size={14} className="stroke-[2.5]" />
            <span>Bảo mật tuyệt đối • Thông tin của bạn được mã hóa và bảo vệ an toàn</span>
          </footer>

        </div>
      )}

      {/* 2. AI ANALYZING LOADING SCREEN */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 w-full animate-scaleUp">
            
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              {progressVal < 25 && <Brain size={28} className="text-primary animate-pulse" />}
              {progressVal >= 25 && progressVal < 50 && <BarChart2 size={28} className="text-primary animate-pulse" />}
              {progressVal >= 50 && progressVal < 75 && <Target size={28} className="text-primary animate-pulse" />}
              {progressVal >= 75 && <Cpu size={28} className="text-primary animate-pulse" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-black text-slate-800 tracking-tight">AI đang xử lý thông tin</h2>
              <p className="text-[11px] font-black text-primary h-6 transition-all duration-300">
                {analysisText}
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-[#8F85F3] rounded-full transition-all duration-150"
                  style={{ width: `${progressVal}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{progressVal}% hoàn thành</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS DASHBOARD */}
      {step === 4 && (
        <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto space-y-8 select-text">
          
          <div className="text-center space-y-3 pb-2 select-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light/50 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-wider">
              <Sparkles size={11} /> Kết quả đánh giá năng lực cá nhân
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Báo Cáo Định Hướng Năng Lực & Nghề Nghiệp
            </h1>
            <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed font-semibold max-w-xl mx-auto">
              Hệ thống AI đã tổng hợp hồ sơ tính cách, đo lường 8 chiều năng lực và đề xuất lộ trình định hướng học tập tối ưu dành riêng cho bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* MBTI Personality detail (7 cols) */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-primary flex items-center justify-center shrink-0 border border-purple-100/50">
                    <Brain size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-wide">Nhóm tính cách của bạn</span>
                    <h3 className="text-sm font-black text-slate-800 mt-0.5">{mbtiDetails.title}</h3>
                  </div>
                </div>

                <p className="text-[11px] text-slate-655 leading-relaxed font-semibold">
                  {mbtiDetails.desc}
                </p>

                <div className="h-px bg-slate-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle size={12} /> Điểm mạnh nổi bật
                    </h4>
                    <ul className="space-y-1.5 pl-1.5 text-[10px] font-bold text-slate-600">
                      {mbtiDetails.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-emerald-500 pt-0.5">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Điểm cần cải thiện
                    </h4>
                    <ul className="space-y-1.5 pl-1.5 text-[10px] font-bold text-slate-600">
                      {mbtiDetails.weaknesses.map((wk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-amber-500 pt-0.5">•</span>
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Lightbulb size={14} className="text-primary-hover" />
                </div>
                <div className="text-[10px] leading-relaxed text-slate-655 font-bold font-sans">
                  <span>Khuyên học tập:</span> Hãy tập trung củng cố các kỹ năng học tập thông qua bản đồ tư duy trực quan để tiếp thu kiến thức nhanh hơn.
                </div>
              </div>
            </div>

            {/* Radar Chart (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">Biểu đồ 8 Nhóm năng lực</h3>
              
              <div className="relative w-72 h-72 flex items-center justify-center select-none shrink-0">
                <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible">
                  <circle cx="140" cy="140" r="90" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                  
                  <polygon points={getGridPoints(4)} fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <polygon points={getGridPoints(3)} fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <polygon points={getGridPoints(2)} fill="none" stroke="#F1F5F9" strokeWidth="1" />
                  <polygon points={getGridPoints(1)} fill="none" stroke="#F1F5F9" strokeWidth="1" />

                  {Array.from({ length: 8 }).map((_, index) => {
                    const angle = (index * 45 - 90) * (Math.PI / 180);
                    const x = 140 + 90 * Math.cos(angle);
                    const y = 140 + 90 * Math.sin(angle);
                    return (
                      <line key={index} x1="140" y1="140" x2={x} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                    );
                  })}

                  <polygon 
                    points={polygonPoints} 
                    fill="rgba(99, 102, 241, 0.15)" 
                    stroke="#6366F1" 
                    strokeWidth="2.5" 
                    strokeLinejoin="round"
                  />

                  {coordinates.map((c, idx) => {
                    const labelNames: Record<string, string> = {
                      logic: 'Logic/STEM',
                      communication: 'Giao tiếp',
                      creativity: 'Sáng tạo',
                      teamwork: 'Nhóm',
                      leadership: 'Lãnh đạo',
                      focus: 'Tập trung',
                      language: 'Ngôn ngữ',
                      empathy: 'Thấu cảm'
                    };
                    const label = labelNames[c.label] || c.label;
                    const angle = (idx * 45 - 90) * (Math.PI / 180);
                    const textDist = 108; 
                    const tx = 140 + textDist * Math.cos(angle);
                    const ty = 140 + textDist * Math.sin(angle);

                    let textAnchor: "inherit" | "end" | "middle" | "start" = 'middle';
                    if (Math.cos(angle) > 0.1) textAnchor = 'start';
                    if (Math.cos(angle) < -0.1) textAnchor = 'end';

                    return (
                      <g key={idx}>
                        <circle cx={c.x} cy={c.y} r="3.5" fill="#6366F1" stroke="white" strokeWidth="1.5" />
                        <text 
                          x={tx} 
                          y={ty + 3} 
                          textAnchor={textAnchor} 
                          fontSize="8.5" 
                          fontWeight="black" 
                          fill="#64748B" 
                          fontFamily="sans-serif"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Top 5 Suitable careers (7 cols) */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-1 select-none">
                <Briefcase size={16} className="text-primary shrink-0" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Top 5 Ngành nghề phù hợp nhất</h3>
              </div>

              <div className="space-y-3.5">
                {mbtiDetails.careers.map((career, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-100 hover:border-slate-200 hover:bg-slate-50/20 rounded-2xl flex items-center justify-between transition gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-700 leading-snug">{career}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-wider shrink-0 select-none bg-emerald-50/50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                      <span>Phù hợp {95 - idx * 4}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Skills to develop (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-1 select-none">
                <Target size={16} className="text-primary shrink-0" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Kỹ năng gợi ý phát triển</h3>
              </div>

              <div className="flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  {mbtiDetails.skills.map((skill, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 rounded-xl flex items-center gap-2.5 bg-slate-50/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-[11px] font-bold text-slate-600 leading-normal">{skill}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onBackToHome}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-150 font-sans"
                >
                  Kiến tạo lộ trình học tập <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

          <div className="flex justify-center pt-2 select-none">
            <button 
              onClick={onBackToHome}
              className="text-slate-400 hover:text-slate-600 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} /> Quay lại trang chủ
            </button>
          </div>
        </div>
      )}

      {/* ── EXIT CONFIRMATION MODAL POPUP ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowExitModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={22} className="stroke-[2.5]" />
            </div>
            
            <div className="space-y-2 leading-relaxed">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Xác nhận thoát bài làm?</h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Tiến trình làm bài của bạn sẽ bị xóa và không lưu lại. Bạn có chắc chắn muốn thoát về trang chủ không?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={handleExitTestConfirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-red-100"
              >
                Thoát và xóa tiến trình
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
