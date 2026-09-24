import type { Exam, Document, LeaderboardEntry, User, Course, CourseLesson, ExamMistake, Question } from '../types';

export const initialUser: User = {
  name: 'Đặng Minh Khôi',
  email: 'khoi.dang@omniexam.edu.vn',
  loggedIn: false, // Default is logged out, user can toggle login
  xp: 1420,
  streak: 5,
  badges: ['Lý thuyết gia', 'Siêu chiến binh', 'Học tập bền bỉ'],
  completedExams: {
    'exam-math-1': { score: 9.0, completedAt: '2026-06-29T15:30:00Z' }
  },
  // seed demo: 5/7 bài Toán 12 đã học (user cũ thiếu key này tự nhận seed qua merge spread)
  completedLessons: {
    'le-m12-1-1': true,
    'le-m12-1-2': true,
    'le-m12-1-3': true,
    'le-m12-2-1': true,
    'le-m12-2-2': true,
  },
  // seed demo Mistake Book (key = questionId, đều tồn tại thật trong mockExams)
  examMistakes: {
    'q-m1-2': { examId: 'exam-math-1', topic: 'Mũ và Logarit', lastWrongAt: '2026-09-20', wrongCount: 2 },
    'q-m1-3': { examId: 'exam-math-1', topic: 'Hàm số và đồ thị', lastWrongAt: '2026-09-20', wrongCount: 1 },
    'q-m1-1': { examId: 'exam-math-1', topic: 'Hàm số và đồ thị', lastWrongAt: '2026-09-18', wrongCount: 1 },
    'q-p1-1': { examId: 'exam-phys-1', topic: 'Dao động cơ học', lastWrongAt: '2026-09-19', wrongCount: 3 },
    'q-p1-3': { examId: 'exam-phys-1', topic: 'Dao động cơ học', lastWrongAt: '2026-09-19', wrongCount: 1 },
    'q-c1-1': { examId: 'exam-chem-1', topic: 'Hydrocarbon', lastWrongAt: '2026-09-17', wrongCount: 2 },
    'q-c1-2': { examId: 'exam-chem-1', topic: 'Hydrocarbon', lastWrongAt: '2026-09-17', wrongCount: 1 },
    'q-e1-1': { examId: 'exam-eng-1', topic: 'Ngữ pháp', lastWrongAt: '2026-09-15', wrongCount: 1 },
    'q-b1-1': { examId: 'exam-bio-1', topic: 'Cấu trúc tế bào', lastWrongAt: '2026-09-14', wrongCount: 2 },
  },
  savedExams: ['exam-phys-1'],
  savedDocs: ['doc-eng-1'],
  bookmarks: {
    'doc-math-1': [0, 1]
  },
  notes: {
    'doc-math-1': 'Ghi nhớ công thức tích phân từng phần: u dv = uv - v du.'
  }
};

export const mockExams: Exam[] = [
  {
    id: 'exam-math-1',
    title: 'Đề thi thử THPT Quốc gia 2026 - Môn Toán học - Đề số 1',
    subject: 'Toán học',
    grade: 'Lớp 12',
    difficulty: 'Khó',
    questionCount: 5,
    durationMinutes: 90,
    tries: 2450,
    rating: 4.8,
    isPremium: false,
    tag: 'Mới nhất',
    questions: [
      {
        id: 'q-m1-1',
        text: 'Cho hàm số y = f(x) có đạo hàm liên tục trên ℝ và có bảng biến thiên như hình vẽ. Hàm số đã cho đồng biến trên khoảng nào dưới đây?',
        options: [
          '(-\\infty; -1) \\cup (2; +\\infty)',
          '(-1; 2)',
          '(-\\infty; -1)',
          '(2; +\\infty)'
        ],
        correctOptionIndex: 0,
        explanation: 'Dựa vào bảng biến thiên, ta thấy f\'(x) > 0 trên khoảng (-\\infty; -1) và (2; +\\infty) nên hàm số đồng biến trên các khoảng đó.',
        hint: 'Hàm số đồng biến trên khoảng mà đạo hàm f\'(x) nhận giá trị dương (+).'
      },
      {
        id: 'q-m1-2',
        text: 'Tìm tất cả các giá trị thực của tham số m để phương trình log_3^2(x) - (m+2)log_3(x) + 3m - 1 = 0 có hai nghiệm phân biệt x_1, x_2 thỏa mãn x_1 . x_2 = 27.',
        options: ['m = 1', 'm = 3', 'm = -1', 'm = 2'],
        correctOptionIndex: 0,
        explanation: 'Đặt t = log_3(x). Phương trình trở thành t^2 - (m+2)t + 3m - 1 = 0. Điều kiện có 2 nghiệm phân biệt là Delta > 0. Theo Viet ta có t_1 + t_2 = log_3(x_1) + log_3(x_2) = log_3(x_1.x_2) = log_3(27) = 3. Mặt khác t_1 + t_2 = m + 2. Suy ra m + 2 = 3 => m = 1. Kiểm tra Delta với m=1 thỏa mãn.',
        hint: 'Đặt ẩn phụ t = log_3(x). Sử dụng tính chất của logarit: log(a) + log(b) = log(ab) kết hợp với định lý Viet cho phương trình bậc hai.'
      },
      {
        id: 'q-m1-3',
        text: 'Trong không gian Oxyz, cho điểm A(1, 2, -1) và đường thẳng d: (x-1)/2 = y/1 = (z+2)/-1. Phương trình mặt phẳng (P) đi qua A và vuông góc với đường thẳng d là:',
        options: [
          '2x + y - z - 5 = 0',
          '2x + y + z - 3 = 0',
          'x + 2y - z - 6 = 0',
          '2x + y - z + 5 = 0'
        ],
        correctOptionIndex: 0,
        explanation: 'Mặt phẳng (P) vuông góc với đường thẳng d nên nhận vectơ chỉ phương của d làm vectơ pháp tuyến: n = (2, 1, -1). Mặt phẳng đi qua A(1, 2, -1) nên phương trình là: 2(x-1) + 1(y-2) - 1(z+1) = 0 <=> 2x + y - z - 5 = 0.',
        hint: 'Vectơ pháp tuyến của mặt phẳng vuông góc với đường thẳng chính là vectơ chỉ phương của đường thẳng đó.'
      },
      {
        id: 'q-m1-4',
        text: 'Tính thể tích V của khối tròn xoay thu được khi quay hình phẳng giới hạn bởi đường thẳng y = x và đường cong y = x^2 quanh trục Ox.',
        options: ['V = pi/15', 'V = 2pi/15', 'V = pi/5', 'V = 3pi/10'],
        correctOptionIndex: 1,
        explanation: 'Hoành độ giao điểm của hai đường: x = x^2 <=> x=0 hoặc x=1. Thể tích khối tròn xoay được tính theo công thức: V = pi * tích phân từ 0 đến 1 của |y_1^2 - y_2^2| dx = pi * tích phân từ 0 đến 1 của (x^2 - x^4) dx = pi * [x^3/3 - x^5/5] cận từ 0 đến 1 = pi * (1/3 - 1/5) = 2pi/15.',
        hint: 'Áp dụng công thức tính thể tích xoay trục Ox: V = pi * tích phân từ a đến b của |f^2(x) - g^2(x)| dx.'
      },
      {
        id: 'q-m1-5',
        text: 'Một chiếc hộp chứa 6 viên bi đỏ và 4 viên bi xanh. Lấy ngẫu nhiên đồng thời 3 viên bi. Tính xác suất để lấy được ít nhất 2 viên bi đỏ.',
        options: ['2/3', '3/5', '5/6', '7/10'],
        correctOptionIndex: 0,
        explanation: 'Số phần tử không gian mẫu n(Omega) = C(3, 10) = 120. Gọi A là biến cố lấy được ít nhất 2 viên bi đỏ. Trường hợp 1: 2 đỏ, 1 xanh: C(2, 6) * C(1, 4) = 15 * 4 = 60 cách. Trường hợp 2: 3 đỏ, 0 xanh: C(3, 6) = 20 cách. Tổng số cách thuận lợi n(A) = 60 + 20 = 80 cách. Xác suất P(A) = 80/120 = 2/3.',
        hint: 'Tính số cách chọn 3 viên bất kỳ làm không gian mẫu. Sau đó chia trường hợp cho biến cố: TH1 có 2 bi đỏ + 1 bi xanh; TH2 có cả 3 bi đỏ.'
      }
    ]
  },
  {
    id: 'exam-phys-1',
    title: 'Khảo sát chất lượng Vật lý 12 - Chuyên đề Dao động cơ học',
    subject: 'Vật lý',
    grade: 'Lớp 12',
    difficulty: 'Trung bình',
    questionCount: 4,
    durationMinutes: 45,
    tries: 3120,
    rating: 4.6,
    isPremium: false,
    tag: 'Phổ biến',
    questions: [
      {
        id: 'q-p1-1',
        text: 'Một con lắc lò xo gồm vật nhỏ và lò xo nhẹ có độ cứng k, dao động điều hòa dọc theo trục Ox quanh vị trí cân bằng O. Biểu thức gia tốc a của vật theo li độ x là:',
        options: ['a = -omega^2 . x', 'a = omega^2 . x', 'a = -omega . x^2', 'a = -omega^2 . x^2'],
        correctOptionIndex: 0,
        explanation: 'Theo định luật II Niuton và định nghĩa dao động điều hòa, gia tốc a của vật luôn ngược pha và tỉ lệ thuận với li độ x theo công thức a = -omega^2 . x.',
        hint: 'Mối liên hệ giữa li độ, vận tốc và gia tốc trong dao động điều hòa: Gia tốc là đạo hàm bậc 2 của li độ theo thời gian.'
      },
      {
        id: 'q-p1-2',
        text: 'Chu kỳ dao động điều hòa của con lắc đơn có chiều dài l tại nơi có gia tốc trọng trường g là:',
        options: ['T = 2pi * sqrt(g/l)', 'T = 2pi * sqrt(l/g)', 'T = 1/(2pi) * sqrt(g/l)', 'T = 2pi * (l/g)'],
        correctOptionIndex: 1,
        explanation: 'Chu kỳ dao động nhỏ của con lắc đơn tỷ lệ thuận với căn bậc hai của chiều dài dây và tỷ lệ nghịch với căn bậc hai của gia tốc trọng trường: T = 2pi * sqrt(l/g).',
        hint: 'Nhớ mẹo ghi nhớ: "Thấy hai pi là ghiền" (T = 2pi * căn(l/g)).'
      },
      {
        id: 'q-p1-3',
        text: 'Khi một vật dao động điều hòa từ vị trí biên về vị trí cân bằng thì:',
        options: [
          'Động năng giảm dần, thế năng tăng dần',
          'Vận tốc giảm dần, gia tốc tăng dần',
          'Động năng tăng dần, thế năng giảm dần',
          'Cơ năng biến thiên tuần hoàn'
        ],
        correctOptionIndex: 2,
        explanation: 'Khi đi từ vị trí biên (v = 0, x = max) về vị trí cân bằng (v = max, x = 0), tốc độ của vật tăng dần nên động năng tăng dần, trong khi li độ giảm dần nên thế năng giảm dần.',
        hint: 'Tại vị trí biên vật dừng lại (v=0), thế năng cực đại. Tại vị trí cân bằng vật có tốc độ lớn nhất, động năng cực đại.'
      },
      {
        id: 'q-p1-4',
        text: 'Dao động duy trì là dao động tự do mà người ta đã:',
        options: [
          'Tác dụng vào vật một ngoại lực biến thiên tuần hoàn theo thời gian',
          'Cung cấp cho vật một năng lượng đúng bằng phần năng lượng tiêu hao sau mỗi chu kỳ mà không làm thay đổi chu kỳ dao động riêng',
          'Tăng thêm ma sát của môi trường xung quanh vật',
          'Thay đổi khối lượng của vật dao động'
        ],
        correctOptionIndex: 1,
        explanation: 'Dao động duy trì là dao động tắt dần được cung cấp năng lượng bù đắp đúng bằng phần hao phí sau mỗi chu kỳ thông qua cơ cấu tự điều chỉnh, giữ nguyên tần số riêng của hệ.',
        hint: 'Khác với dao động cưỡng bức (có lực cưỡng bức tuần hoàn bên ngoài làm thay đổi tần số), dao động duy trì giữ nguyên tần số riêng.'
      }
    ]
  },
  {
    id: 'exam-chem-1',
    title: 'Đề kiểm tra Hóa học 11 - Chuyên đề Hydrocarbon & Dẫn xuất',
    subject: 'Hóa học',
    grade: 'Lớp 11',
    difficulty: 'Dễ',
    questionCount: 3,
    durationMinutes: 30,
    tries: 980,
    rating: 4.5,
    isPremium: true,
    tag: 'Premium',
    questions: [
      {
        id: 'q-c1-1',
        text: 'Chất nào sau đây tác dụng với dung dịch AgNO3 trong NH3 tạo kết tủa màu vàng nhạt?',
        options: ['Ethane', 'Ethylene', 'Acetylene', 'But-2-yne'],
        correctOptionIndex: 2,
        explanation: 'Acetylene (CH=CH) là alk-1-yne có liên kết ba đầu mạch chứa nguyên tử H linh động, có khả năng thế bằng ion bạc Ag+ tạo ra kết tủa bạc acetylide Ag-C=C-Ag màu vàng nhạt.',
        hint: 'Chỉ các alkyne có liên kết ba ở đầu mạch (alk-1-yne) mới có phản ứng thế ion kim loại này.'
      },
      {
        id: 'q-c1-2',
        text: 'Công thức cấu tạo thu gọn của Phenol là:',
        options: ['C6H5OH', 'C6H5CH2OH', 'C2H5OH', 'C6H5COOH'],
        correctOptionIndex: 0,
        explanation: 'Phenol là những hợp chất hữu cơ có nhóm hydroxyl (-OH) liên kết trực tiếp với nguyên tử carbon của vòng benzene. Công thức đơn giản nhất là C6H5OH.',
        hint: 'Phân biệt phenol (OH cắm vào vòng benzene) với ancol benzylic C6H5CH2OH (OH cắm vào nhánh).'
      },
      {
        id: 'q-c1-3',
        text: 'Cho 4.4 gam ethyl acetate tác dụng hoàn toàn với dung dịch NaOH dư, đun nóng. Khối lượng muối thu được sau phản ứng là bao nhiêu?',
        options: ['4.1 gam', '3.4 gam', '5.5 gam', '8.2 gam'],
        correctOptionIndex: 0,
        explanation: 'Ta có n(ethyl acetate) = 4.4 / 88 = 0.05 mol. Phản ứng: CH3COOC2H5 + NaOH -> CH3COONa + C2H5OH. Muối thu được là CH3COONa có số mol 0.05 mol. Khối lượng m = 0.05 * 82 = 4.1 gam.',
        hint: 'Tính số mol ethyl acetate (M=88). Sử dụng phương trình thủy phân este đơn chức để tìm số mol muối natri axetat (M=82).'
      }
    ]
  },
  {
    id: 'exam-eng-1',
    title: 'Đề thi tiếng Anh THPTQG - Chuyên đề Ngữ pháp & Đọc hiểu nâng cao',
    subject: 'Tiếng Anh',
    grade: 'Lớp 12',
    difficulty: 'Khó',
    questionCount: 3,
    durationMinutes: 60,
    tries: 4120,
    rating: 4.9,
    isPremium: false,
    tag: 'Đánh giá cao',
    questions: [
      {
        id: 'q-e1-1',
        text: 'Select the correct option to fill in the blank: "Had I known about the changes in the schedule, I ______ my travel plans accordingly."',
        options: [
          'would alter',
          'will have altered',
          'would have altered',
          'should alter'
        ],
        correctOptionIndex: 2,
        explanation: 'Đây là cấu trúc đảo ngữ của câu điều kiện loại 3 (Had + S + V3, S + would + have + V3), diễn tả giả định trái với thực tế trong quá khứ. Do đó phương án đúng là "would have altered".',
        hint: 'Xem xét vế điều kiện đảo ngữ "Had I known" (quá khứ phân từ). Điều này chỉ ra câu điều kiện loại 3.'
      },
      {
        id: 'q-e1-2',
        text: 'Identify the synonym of the word "Meticulous" in the context of academic writing:',
        options: ['Careless', 'Thorough and precise', 'Hasty', 'Superficial'],
        correctOptionIndex: 1,
        explanation: '"Meticulous" có nghĩa là rất cẩn thận, tỉ mỉ, chú ý đến từng chi tiết nhỏ. Đồng nghĩa của nó là "Thorough and precise".',
        hint: 'Từ này thường dùng để chỉ một người làm việc khoa học rất chi tiết và cẩn thận.'
      },
      {
        id: 'q-e1-3',
        text: 'Choose the correct preposition: "The committee is responsible ______ drawing up the guidelines for school safety."',
        options: ['to', 'for', 'with', 'about'],
        correctOptionIndex: 1,
        explanation: 'Cấu trúc cố định "be responsible for sth/doing sth" có nghĩa là chịu trách nhiệm cho việc gì.',
        hint: 'Tính từ "responsible" luôn đi kèm giới từ "for" khi nói về trách nhiệm.'
      }
    ]
  },
  {
    id: 'exam-bio-1',
    title: 'Đề cương Sinh học 10 - Học kỳ 2 - Cấu trúc tế bào & Trao đổi chất',
    subject: 'Sinh học',
    grade: 'Lớp 10',
    difficulty: 'Trung bình',
    questionCount: 3,
    durationMinutes: 45,
    tries: 1540,
    rating: 4.4,
    isPremium: false,
    tag: 'Miễn phí',
    questions: [
      {
        id: 'q-b1-1',
        text: 'Bào quan nào sau đây được ví như "nhà máy năng lượng" của tế bào nhân thực, chịu trách nhiệm tổng hợp ATP?',
        options: ['Lưới nội chất', 'Bộ máy Golgi', 'Ti thể', 'Ribosome'],
        correctOptionIndex: 2,
        explanation: 'Ti thể (Mitochondria) là bào quan diễn ra quá trình hô hấp tế bào, phân giải các hợp chất hữu cơ để giải phóng năng lượng và tích lũy dưới dạng ATP cung cấp cho mọi hoạt động sống.',
        hint: 'Bào quan này có cấu trúc màng kép, màng trong gấp nếp tạo thành các mào chứa chuỗi truyền electron.'
      },
      {
        id: 'q-b1-2',
        text: 'Thành tế bào thực vật cấu tạo chủ yếu từ chất nào sau đây?',
        options: ['Cellulose', 'Chitin', 'Peptidoglycan', 'Phospholipid'],
        correctOptionIndex: 0,
        explanation: 'Thành tế bào thực vật được cấu tạo chủ yếu từ các sợi cellulose liên kết chéo với nhau tạo độ cứng cáp và bảo vệ tế bào. Chitin cấu tạo thành tế bào nấm, peptidoglycan cấu tạo thành tế bào vi khuẩn.',
        hint: 'Đây là loại polysaccharide cấu trúc phổ biến nhất trong thực vật.'
      },
      {
        id: 'q-b1-3',
        text: 'Quá trình quang hợp ở cây xanh xảy ra chủ yếu ở bào quan nào?',
        options: ['Không bào', 'Lục lạp', 'Ti thể', 'Lyosome'],
        correctOptionIndex: 1,
        explanation: 'Lục lạp (Chloroplast) chứa chất diệp lục hấp thụ ánh sáng mặt trời để thực hiện phản ứng quang hợp tạo ra glucose và oxy.',
        hint: 'Bào quan này chỉ có ở thực vật và một số loài tảo, chứa các đĩa thylakoid xếp chồng.'
      }
    ]
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'doc-math-1',
    title: 'Sổ tay công thức Giải tích lớp 12 đầy đủ và chi tiết nhất',
    subject: 'Toán học',
    grade: 'Lớp 12',
    fileSize: '4.2 MB',
    pageCount: 32,
    views: 12500,
    downloads: 4890,
    format: 'PDF',
    author: 'Thầy Nguyễn Tiến Đạt',
    updatedAt: '2026-06-15',
    readingTimeMinutes: 15,
    chapters: [
      {
        id: 'c-m1',
        title: 'Chương I: Ứng dụng đạo hàm để khảo sát hàm số',
        content: `
          <h2>1. Tính đơn điệu của hàm số</h2>
          <p>Hàm số y = f(x) đồng biến trên khoảng K khi và chỉ khi đạo hàm f'(x) &gt;= 0 với mọi x thuộc K (dấu bằng chỉ xảy ra tại hữu hạn điểm). Hàm số nghịch biến trên K khi và chỉ khi f'(x) &lt;= 0.</p>
          <blockquote>Định lý Lagrange: Nếu f(x) liên tục trên đoạn [a;b] và có đạo hàm trên khoảng (a;b) thì tồn tại c thuộc (a;b) sao cho f'(c) = [f(b) - f(a)] / (b - a).</blockquote>
          
          <h2>2. Cực trị của hàm số</h2>
          <p>Điểm cực đại và cực tiểu được xác định qua dấu đạo hàm cấp 1 hoặc đạo hàm cấp 2:</p>
          <ul>
            <li>Nếu f'(x0) = 0 và f''(x0) &lt; 0 thì x0 là điểm cực đại của hàm số.</li>
            <li>Nếu f'(x0) = 0 and f''(x0) &gt; 0 thì x0 là điểm cực tiểu của hàm số.</li>
          </ul>

          <h2>3. Giá trị lớn nhất và nhỏ nhất</h2>
          <p>Để tìm GTLN, GTNN của hàm số liên tục trên đoạn [a, b], ta tính giá trị f(a), f(b) và các giá trị f(xi) với xi là các điểm cực trị thuộc khoảng (a, b). Giá trị lớn nhất trong số này là max f(x), nhỏ nhất là min f(x).</p>
          <pre><code>// Thuật toán tìm cực trị đơn giản bằng code
function findExtrema(f, derivative, step = 0.01) {
  // Thực hiện khảo sát đạo hàm đổi dấu
}</code></pre>
        `
      },
      {
        id: 'c-m2',
        title: 'Chương II: Hàm số Lũy thừa, Mũ và Logarit',
        content: `
          <h2>1. Công thức Mũ nâng cao</h2>
          <p>Với a &gt; 0, ta có các hệ thức lũy thừa cơ bản sau đây:</p>
          <ul>
            <li>a^alpha * a^beta = a^(alpha + beta)</li>
            <li>a^alpha / a^beta = a^(alpha - beta)</li>
            <li>(a^alpha)^beta = a^(alpha * beta)</li>
          </ul>

          <h2>2. Công thức Logarit cơ bản</h2>
          <p>Điều kiện: cơ số a &gt; 0 và a khác 1, số b &gt; 0. Ta có:</p>
          <ul>
            <li>log_a(x * y) = log_a(x) + log_a(y)</li>
            <li>log_a(x / y) = log_a(x) - log_a(y)</li>
            <li>log_a(x^alpha) = alpha * log_a(x)</li>
            <li>log_b(c) = log_a(c) / log_a(b) (Công thức đổi cơ số)</li>
          </ul>
          <p>Nhờ công thức đổi cơ số, ta có thể đưa mọi phép toán logarit về cơ số tự nhiên (ln) hoặc cơ số 10 (log) để tính toán dễ dàng bằng máy tính bỏ túi Casio.</p>
        `
      },
      {
        id: 'c-m3',
        title: 'Chương III: Nguyên hàm, Tích phân và Ứng dụng',
        content: `
          <h2>1. Bảng Nguyên hàm các hàm số sơ cấp</h2>
          <p>Dưới đây là một số nguyên hàm quan trọng cần học thuộc:</p>
          <ul>
            <li>Int( x^alpha dx ) = x^(alpha+1)/(alpha+1) + C (với alpha khác -1)</li>
            <li>Int( 1/x dx ) = ln|x| + C</li>
            <li>Int( e^x dx ) = e^x + C</li>
            <li>Int( sin(x) dx ) = -cos(x) + C</li>
            <li>Int( cos(x) dx ) = sin(x) + C</li>
          </ul>

          <h2>2. Phương pháp tích phân từng phần</h2>
          <p>Công thức tích phân từng phần được suy ra từ công thức đạo hàm tích:</p>
          <blockquote>Int( u dv ) = uv - Int( v du )</blockquote>
          <p>Thứ tự ưu tiên đặt u: <strong>"Nhất lô, nhì đa, tam lượng, tứ mũ"</strong> (Ưu tiên số 1 là Logarit, tiếp đến là Đa thức, Lượng giác và cuối cùng là Hàm mũ).</p>
        `
      }
    ]
  },
  {
    id: 'doc-phys-1',
    title: 'Tổng hợp sơ đồ tư duy Vật lý 12 cả năm học - Đầy đủ 7 chuyên đề',
    subject: 'Vật lý',
    grade: 'Lớp 12',
    fileSize: '8.7 MB',
    pageCount: 14,
    views: 8900,
    downloads: 3200,
    format: 'Slide',
    author: 'Cô Chu Thị Thảo',
    updatedAt: '2026-05-20',
    readingTimeMinutes: 10,
    chapters: [
      {
        id: 'c-p1',
        title: 'Chuyên đề 1: Dao động cơ học',
        content: `
          <h2>Sơ đồ dao động cơ học</h2>
          <p>Chuyên đề dao động cơ là nền tảng cốt lõi của đề thi Vật lý THPT. Các nội dung chính cần ghi nhớ:</p>
          <ul>
            <li><strong>Dao động điều hòa:</strong> Phương trình x = A*cos(omega*t + phi). Các đại lượng A (biên độ), omega (tần số góc), phi (pha ban đầu).</li>
            <li><strong>Con lắc lò xo:</strong> Tần số góc omega = sqrt(k/m), chu kỳ T = 2pi * sqrt(m/k). Lực kéo về F = -k*x.</li>
            <li><strong>Con lắc đơn:</strong> Tần số góc omega = sqrt(g/l), chu kỳ T = 2pi * sqrt(l/g).</li>
            <li><strong>Các loại dao động:</strong> Dao động tự do, dao động duy trì, dao động cưỡng bức, dao động tắt dần và hiện tượng cộng hưởng.</li>
          </ul>
        `
      },
      {
        id: 'c-p2',
        title: 'Chuyên đề 2: Sóng cơ học và Sóng âm',
        content: `
          <h2>Định nghĩa và các đại lượng đặc trưng của sóng</h2>
          <p>Sóng cơ là quá trình lan truyền dao động cơ trong một môi trường đàn hồi theo thời gian. Lưu ý: Sóng lan truyền pha dao động và năng lượng, các phần tử môi trường chỉ dao động tại chỗ chứ không truyền đi.</p>
          <ul>
            <li>Bước sóng lambda = v * T = v / f.</li>
            <li>Phương trình sóng tại điểm M cách nguồn O một khoảng x: uM = A * cos(omega*t - 2*pi*x/lambda).</li>
            <li><strong>Giao thoa sóng:</strong> Hai nguồn kết hợp cùng pha. Cực đại giao thoa: d2 - d1 = k*lambda. Cực tiểu giao thoa: d2 - d1 = (k + 0.5)*lambda.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'doc-eng-1',
    title: 'Hệ thống 20 chủ điểm ngữ pháp tiếng Anh trọng tâm thi đại học',
    subject: 'Tiếng Anh',
    grade: 'Lớp 12',
    fileSize: '2.5 MB',
    pageCount: 45,
    views: 16700,
    downloads: 7100,
    format: 'DOCX',
    author: 'Ms. Hoa TOEIC',
    updatedAt: '2026-06-25',
    readingTimeMinutes: 20,
    chapters: [
      {
        id: 'c-e1',
        title: 'Chủ điểm 1: Thì của động từ (Verb Tenses)',
        content: `
          <h2>Tổng quan 12 thì trong tiếng Anh</h2>
          <p>Trong đề thi THPT, các thì hay xuất hiện nhất bao gồm: Hiện tại hoàn thành, Quá khứ đơn, Quá khứ tiếp diễn và Tương lai đơn. Sự phối hợp thì giữa Quá khứ đơn và Quá khứ tiếp diễn (ví dụ: When S + V2, S + was/were V-ing) luôn là câu hỏi ăn điểm.</p>
          <blockquote>Ví dụ: "I was reading a book when the phone rang." (Hành động đang xảy ra chia Quá khứ tiếp diễn, hành động xen vào chia Quá khứ đơn).</blockquote>
        `
      },
      {
        id: 'c-e2',
        title: 'Chủ điểm 2: Câu bị động (Passive Voice)',
        content: `
          <h2>Công thức câu bị động tổng quát</h2>
          <p>Công thức chung: S + Be + V3/ED (+ by O).</p>
          <p>Các trường hợp đặc biệt:</p>
          <ul>
            <li><strong>Bị động với động từ chỉ ý kiến:</strong> People say that S + V => It is said that S + V hoặc S + is said to V/to have V3.</li>
            <li><strong>Cấu trúc nhờ vả (Causative form):</strong> Have someone do sth / Get someone to do sth => Have/Get sth done.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'doc-bio-1',
    title: 'Tóm tắt lý thuyết Sinh học 10 học kỳ 2 - Đề cương ôn tập',
    subject: 'Sinh học',
    grade: 'Lớp 10',
    fileSize: '1.8 MB',
    pageCount: 15,
    views: 4520,
    downloads: 1200,
    format: 'Tóm tắt',
    author: 'Thầy Phan Khắc Nghệ',
    updatedAt: '2026-04-10',
    readingTimeMinutes: 8,
    chapters: [
      {
        id: 'c-b1',
        title: 'Chương I: Thành phần hóa học của tế bào',
        content: `
          <h2>1. Nguyên tố hóa học và Nước</h2>
          <p>Có khoảng 25 nguyên tố cần thiết cấu tạo nên cơ thể sống. Đại lượng carbon là nguyên tố cốt lõi vì cấu tạo liên kết hóa học đa dạng. Nước đóng vai trò dung môi hòa tan, môi trường phản ứng sinh hóa, giúp điều hòa nhiệt độ tế bào.</p>
          <h2>2. Các đại phân tử hữu cơ</h2>
          <p>Tế bào gồm 4 nhóm đại phân tử chính:</p>
          <ul>
            <li>Carbohydrate (Đường): cung cấp năng lượng và cấu trúc thành tế bào.</li>
            <li>Lipid (Chất béo): dự trữ năng lượng dài hạn, cấu tạo màng sinh chất.</li>
            <li>Protein: đảm nhiệm mọi chức năng sống (xúc tác, vận chuyển, cấu trúc).</li>
            <li>Axit nucleic (DNA, RNA): lưu trữ và truyền đạt thông tin di truyền.</li>
          </ul>
        `
      }
    ]
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Nguyễn Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80', school: 'THPT Chuyên Hà Nội - Amsterdam', grade: 'Lớp 12', xp: 12850, streak: 35, badges: ['Thủ khoa Toán', 'Chăm chỉ Vàng', 'Chiến binh Học kỳ'] },
  { rank: 2, name: 'Trần Thị Mỹ Linh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80', school: 'THPT Chuyên Lê Hồng Phong, Nam Định', grade: 'Lớp 12', xp: 11400, streak: 28, badges: ['Phù thủy Lý', 'Ngôi sao Sáng'] },
  { rank: 3, name: 'Lê Quốc Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80', school: 'THPT Chuyên Trần Phú, Hải Phòng', grade: 'Lớp 11', xp: 9540, streak: 14, badges: ['Cực nhanh nhạy'] },
  { rank: 4, name: 'Phạm Minh Đức', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80', school: 'THPT Lam Sơn, Thanh Hóa', grade: 'Lớp 12', xp: 8900, streak: 21, badges: ['Nhà thông thái'] },
  { rank: 5, name: 'Vũ Hải Yến', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80', school: 'THPT Chuyên Phan Bội Châu, Nghệ An', grade: 'Lớp 10', xp: 7420, streak: 9, badges: ['Tân binh Khủng'] },
  { rank: 6, name: 'Hoàng Quốc Bảo', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=80&h=80', school: 'Trường Trung học Thực hành ĐH Sư phạm TP.HCM', grade: 'Lớp 11', xp: 6810, streak: 12, badges: ['Giải bài siêu tốc'] },
  { rank: 7, name: 'Nguyễn Phương Thảo', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80', school: 'THPT Chuyên Nguyễn Huệ, Hà Nội', grade: 'Lớp 12', xp: 6200, streak: 6, badges: ['Yêu sinh học'] },
  { rank: 8, name: 'Bùi Anh Quân', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=80&h=80', school: 'Trường Trung học Thực nghiệm KHGD, Hà Nội', grade: 'Lớp 10', xp: 5930, streak: 15, badges: ['Kiên trì'] }
];

export const mockCourses: Course[] = [
  {
    id: 'course-math-12',
    title: 'Toán 12 — Ôn thi THPT',
    subject: 'Toán học',
    grade: 'Lớp 12',
    description: 'Ôn luyện toàn bộ chương trình Toán 12 theo định hướng đề thi tốt nghiệp THPT: đạo hàm, hàm số mũ logarit và xác suất.',
    practiceCount: 6,
    examCount: 3,
    chapters: [
      {
        id: 'ch-m12-1',
        title: 'Chương 1: Ứng dụng đạo hàm để khảo sát hàm số',
        lessons: [
          {
            id: 'le-m12-1-1',
            title: 'Bài 1: Tính đơn điệu của hàm số',
            durationMinutes: 18,
            blocks: [
              { type: 'heading', level: 2, text: 'Tính đơn điệu của hàm số' },
              { type: 'paragraph', text: 'Cho hàm số y = f(x) xác định trên khoảng K. Hàm số đồng biến trên K nếu với mọi x1, x2 thuộc K mà x1 < x2 thì f(x1) < f(x2).' },
              { type: 'formula', latex: "f'(x) > 0 \\iff f \\text{ đồng biến trên khoảng đang xét}", display: 'block' },
              { type: 'callout', variant: 'info', title: 'Lưu ý', content: 'Trên bảng biến thiên, hàm số đồng biến trên những khoảng mà đạo hàm f\'(x) nhận giá trị dương.' },
              { type: 'image', src: '/math_illustration.png', alt: 'Minh họa đồ thị hàm số và bảng biến thiên', size: 'medium' as const }
            ]
          },
          {
            id: 'le-m12-1-2',
            title: 'Bài 2: Cực trị của hàm số',
            durationMinutes: 22,
            blocks: [
              { type: 'heading', level: 2, text: 'Cực trị của hàm số' },
              { type: 'paragraph', text: 'Điểm x0 được gọi là điểm cực đại của hàm số f(x) nếu tồn tại khoảng (a; b) chứa x0 sao cho f(x0) là giá trị lớn nhất của hàm số trên khoảng đó.' },
              { type: 'list', ordered: true, items: ['Tìm tập xác định', "Tính f'(x) và tìm nghiệm của f'(x) = 0", 'Lập bảng biến thiên và kết luận cực trị'] }
            ]
          },
          {
            id: 'le-m12-1-3',
            title: 'Bài 3: Giá trị lớn nhất và nhỏ nhất',
            durationMinutes: 20,
            blocks: [
              { type: 'heading', level: 2, text: 'Giá trị lớn nhất và nhỏ nhất trên đoạn' },
              { type: 'paragraph', text: 'Hàm số liên tục trên đoạn [a; b] thì đạt giá trị lớn nhất và nhỏ nhất trên đoạn đó, tại các điểm tới hạn hoặc tại hai đầu mút.' },
              { type: 'formula', latex: '\\max_{[a;b]} f = \\max\\{f(a),\\ f(b),\\ f(x_1),\\ \\dots,\\ f(x_n)\\}', display: 'block' }
            ]
          }
        ]
      },
      {
        id: 'ch-m12-2',
        title: 'Chương 2: Xác suất thống kê',
        lessons: [
          {
            id: 'le-m12-2-1',
            title: 'Bài 4: Biến cố và quy tắc tính xác suất',
            durationMinutes: 25,
            blocks: [
              { type: 'heading', level: 2, text: 'Biến cố và quy tắc tính xác suất' },
              { type: 'paragraph', text: 'Biến cố là kết quả hoặc tập hợp các kết quả của một phép thử có thể xảy ra hoặc không xảy ra. Xác suất của biến cố A ký hiệu P(A).' },
              { type: 'formula', latex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)', display: 'block' }
            ]
          },
          {
            id: 'le-m12-2-2',
            title: 'Bài 5: Xác suất có điều kiện',
            durationMinutes: 24,
            blocks: [
              { type: 'heading', level: 2, text: 'Xác suất có điều kiện' },
              { type: 'paragraph', text: 'Xác suất có điều kiện của A khi B xảy ra là xác suất của biến cố A trong giả thiết rằng biến cố B đã xảy ra.' },
              { type: 'formula', latex: 'P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}, \\quad P(B) > 0', display: 'block' },
              { type: 'callout', variant: 'warning', title: 'Nhầm lẫn thường gặp', content: 'Phân biệt P(A|B) với P(B|A) — hai xác suất có điều kiện này thường khác nhau.' }
            ]
          },
          {
            id: 'le-m12-2-3',
            title: 'Bài 6: Định lý Bayes',
            durationMinutes: 26,
            blocks: [
              { type: 'heading', level: 2, text: 'Định lý Bayes' },
              { type: 'paragraph', text: 'Định lý Bayes cho phép tính xác suất của nguyên nhân dựa trên kết quả quan sát được, khi đã biết các xác suất ngược lại.' },
              { type: 'formula', latex: 'P(A_i \\mid B) = \\frac{P(A_i) \\, P(B \\mid A_i)}{\\sum_{j} P(A_j) \\, P(B \\mid A_j)}', display: 'block' }
            ]
          },
          {
            id: 'le-m12-2-4',
            title: 'Bài 7: Luyện tập xác suất',
            durationMinutes: 30,
            blocks: [
              { type: 'heading', level: 2, text: 'Luyện tập xác suất' },
              { type: 'paragraph', text: 'Sau bài này, hãy chuyển sang phần Luyện tập để làm 10 câu về xác suất có điều kiện và định lý Bayes.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-phys-12',
    title: 'Vật lý 12 — Dao động cơ học',
    subject: 'Vật lý',
    grade: 'Lớp 12',
    description: 'Chuyên đề dao động cơ học: dao động điều hòa, con lắc lò xo và con lắc đơn — nền tảng cho đề thi tốt nghiệp.',
    practiceCount: 4,
    examCount: 2,
    chapters: [
      {
        id: 'ch-p12-1',
        title: 'Chương 1: Dao động điều hòa',
        lessons: [
          {
            id: 'le-p12-1-1',
            title: 'Bài 1: Dao động điều hòa',
            durationMinutes: 20,
            blocks: [
              { type: 'heading', level: 2, text: 'Dao động điều hòa' },
              { type: 'paragraph', text: 'Dao động điều hòa là dao động mà li độ là hàm cosin (hoặc sin) của thời gian theo phương trình x = A cos(ωt + φ).' },
              { type: 'formula', latex: 'x = A\\cos(\\omega t + \\varphi); \\quad v = -A\\omega\\sin(\\omega t + \\varphi)', display: 'block' },
              { type: 'image', src: '/physics_illustration.png', alt: 'Minh họa dao động điều hòa con lắc lò xo', size: 'medium' as const }
            ]
          },
          {
            id: 'le-p12-1-2',
            title: 'Bài 2: Con lắc lò xo',
            durationMinutes: 22,
            blocks: [
              { type: 'heading', level: 2, text: 'Con lắc lò xo' },
              { type: 'paragraph', text: 'Con lắc lò xo gồm vật nhỏ khối lượng m treo vào lò xo có độ cứng k, dao động điều hòa với chu kỳ phụ thuộc vào m và k.' },
              { type: 'formula', latex: 'T = 2\\pi\\sqrt{\\frac{m}{k}}', display: 'block' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-lit-12',
    title: 'Ngữ văn 12 — Ôn thi tốt nghiệp',
    subject: 'Ngữ văn',
    grade: 'Lớp 12',
    description: 'Ôn tập kỹ năng đọc hiểu và viết bài nghị luận xã hội theo cấu trúc đề thi tốt nghiệp THPT.',
    practiceCount: 3,
    examCount: 2,
    chapters: [
      {
        id: 'ch-l12-1',
        title: 'Chương 1: Nghị luận xã hội',
        lessons: [
          {
            id: 'le-l12-1-1',
            title: 'Bài 1: Dàn ý nghị luận xã hội',
            durationMinutes: 15,
            blocks: [
              { type: 'heading', level: 2, text: 'Dàn ý nghị luận xã hội' },
              { type: 'list', ordered: true, items: ['Mở bài: giới thiệu vấn đề nghị luận', 'Thân bài: giải thích, bàn luận, mở rộng, phản đề', 'Kết bài: khẳng định vấn đề và bài học nhận thức'] }
            ]
          },
          {
            id: 'le-l12-1-2',
            title: 'Bài 2: Bài nghị luận mẫu',
            durationMinutes: 18,
            blocks: [
              { type: 'heading', level: 2, text: 'Bài nghị luận mẫu' },
              { type: 'quote', text: 'Học tập không phải là chuẩn bị cho cuộc sống, học tập chính là cuộc sống.', cite: 'John Dewey' }
            ]
          }
        ]
      }
    ]
  }
];

const SUBJECT_SLUGS: Record<string, string> = {
  'toan-hoc': 'Toán học',
  'vat-ly': 'Vật lý',
  'hoa-hoc': 'Hóa học',
  'tieng-anh': 'Tiếng Anh',
  'sinh-hoc': 'Sinh học',
  'ngu-van': 'Ngữ văn',
};

export function subjectToSlug(subject: string): string | undefined {
  return Object.keys(SUBJECT_SLUGS).find((slug) => SUBJECT_SLUGS[slug] === subject);
}

/** Xây bộ luyện tập (pseudo-Exam) từ id ổn định dạng practice-*, dùng chung engine thi.
 * examMistakes: truyền user.examMistakes từ mọi call-site (default {} chỉ là guard compile). */
export function buildPracticeSet(
  id: string,
  examMistakes: Record<string, ExamMistake> = {}
): Exam | undefined {
  const collectQuestions = (predicate: (q: Question, exam: Exam) => boolean): Question[] =>
    mockExams.flatMap((exam) => exam.questions.filter((q) => predicate(q, exam)));

  const toPracticeExam = (questions: Question[], subject: string, title: string): Exam => ({
    id,
    title,
    subject,
    grade: 'Lớp 12',
    difficulty: 'Trung bình',
    questionCount: questions.length,
    durationMinutes: Math.max(10, questions.length * 2),
    tries: 0,
    rating: 0,
    isPremium: false,
    tag: 'Luyện tập',
    questions,
  });

  if (id.startsWith('topic-')) {
    const subject = SUBJECT_SLUGS[id.slice('topic-'.length)];
    if (!subject) return undefined;
    const questions = collectQuestions((_q, exam) => exam.subject === subject);
    return questions.length > 0 ? toPracticeExam(questions, subject, `Luyện theo chủ đề: ${subject}`) : undefined;
  }

  if (id === 'mistakes-review') {
    const questions = collectQuestions((q, exam) => {
      const m = examMistakes[q.id];
      return m && m.examId === exam.id && !m.mastered;
    });
    return questions.length > 0 ? toPracticeExam(questions, 'Tổng hợp', 'Ôn câu sai') : undefined;
  }

  if (id.startsWith('quick-')) {
    const parts = id.split('-');
    const count = Number(parts[parts.length - 1]);
    if (!Number.isInteger(count) || ![10, 20].includes(count)) return undefined;
    const subject = SUBJECT_SLUGS[parts.slice(1, -1).join('-')];
    if (!subject) return undefined;
    // ponytail: slice đầu danh sách (deterministic, không Math.random) — shuffle khi có adaptive engine
    const questions = collectQuestions((_q, exam) => exam.subject === subject).slice(0, count);
    return questions.length > 0 ? toPracticeExam(questions, subject, `Luyện nhanh ${questions.length} câu: ${subject}`) : undefined;
  }

  return undefined;
}

/** Bộ luyện thích ứng: ≤5 câu sai chưa nắm (ôn nền tảng) + câu môn yếu nhất đủ 15 (mức hiện tại) + câu môn khác đủ 20 (thử thách).
 * id cố định 'adaptive' để result.examId khớp khi resolve lại. Trả undefined khi không còn câu sai nào chưa nắm. */
export function buildAdaptiveSet(examMistakes: Record<string, ExamMistake> = {}): Exam | undefined {
  const unmastered = Object.entries(examMistakes).filter(([, m]) => !m.mastered);
  if (unmastered.length === 0) return undefined;

  const questionIndex = new Map<string, { question: Question; subject: string }>();
  for (const exam of mockExams) {
    for (const q of exam.questions) questionIndex.set(q.id, { question: q, subject: exam.subject });
  }

  const picked = new Set<string>();
  const questions: Question[] = [];

  // 1) Ôn nền tảng: câu sai chưa nắm (≤5, theo thứ tự key)
  for (const [qid] of unmastered) {
    if (questions.length >= 5) break;
    const entry = questionIndex.get(qid);
    if (entry && !picked.has(qid)) {
      picked.add(qid);
      questions.push(entry.question);
    }
  }

  // 2) Mức hiện tại: môn có nhiều lỗi chưa nắm nhất — count cao nhất trước, tie chọn môn xuất hiện đầu (deterministic)
  const subjectCounts = new Map<string, number>();
  for (const [, m] of unmastered) {
    const subject = mockExams.find((e) => e.id === m.examId)?.subject;
    if (subject) subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
  }
  const weakSubject = [...subjectCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  if (weakSubject) {
    for (const exam of mockExams) {
      if (exam.subject !== weakSubject) continue;
      for (const q of exam.questions) {
        if (questions.length >= 15) break;
        if (!picked.has(q.id)) {
          picked.add(q.id);
          questions.push(q);
        }
      }
      if (questions.length >= 15) break;
    }
  }

  // 3) Thử thách: câu môn khác fill đến 20
  for (const exam of mockExams) {
    if (exam.subject === weakSubject) continue;
    for (const q of exam.questions) {
      if (questions.length >= 20) break;
      if (!picked.has(q.id)) {
        picked.add(q.id);
        questions.push(q);
      }
    }
    if (questions.length >= 20) break;
  }

  if (questions.length === 0) return undefined;
  return {
    id: 'adaptive',
    title: 'Luyện theo năng lực của bạn',
    subject: weakSubject || 'Tổng hợp',
    grade: 'Lớp 12',
    difficulty: 'Trung bình',
    questionCount: questions.length,
    durationMinutes: Math.max(10, questions.length * 2),
    tries: 0,
    rating: 0,
    isPremium: false,
    tag: 'Adaptive',
    questions,
  };
}

// ===== Teacher Studio analytics (P6) — aggregates deterministic, mọi chỉ số derive ở render =====
export interface ClassExamAnalytics {
  examId: string;
  className: string;
  studentScores: number[];    // điểm 0-10 từng học sinh
  questionAccuracy: number[]; // % đúng từng câu (index = thứ tự câu trong đề)
  topicAccuracy: { topic: string; percent: number }[];
}

export const mockClassAnalytics: ClassExamAnalytics[] = [
  {
    examId: 'exam-math-1',
    className: 'Lớp 12A',
    studentScores: [8.5, 7, 9, 6.5, 8, 7.5, 5.5, 9.5, 7, 8],
    questionAccuracy: [80, 70, 60, 90, 50],
    topicAccuracy: [
      { topic: 'Hàm số và đồ thị', percent: 75 },
      { topic: 'Mũ và Logarit', percent: 60 },
    ],
  },
  {
    examId: 'exam-phys-1',
    className: 'Lớp 12B',
    studentScores: [7, 8, 6, 9, 5.5, 7.5, 8.5, 6.5],
    questionAccuracy: [75, 62.5, 87.5, 50, 62.5],
    topicAccuracy: [{ topic: 'Dao động cơ học', percent: 62 }],
  },
];

/** Derive tiến độ khóa học từ user.completedLessons — nguồn duy nhất dùng chung Home/Courses/CourseDetail. */export function courseProgress(
  course: Course,
  completedLessons: Record<string, true>
): { percent: number; done: number; total: number; nextLesson?: CourseLesson; nextChapterTitle?: string } {
  const lessons = course.chapters.flatMap((ch) => ch.lessons);
  const done = lessons.filter((l) => completedLessons[l.id]).length;
  const nextLesson = lessons.find((l) => !completedLessons[l.id]);
  const nextChapter = nextLesson
    ? course.chapters.find((ch) => ch.lessons.some((l) => l.id === nextLesson.id))
    : undefined;
  return {
    percent: lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100),
    done,
    total: lessons.length,
    nextLesson,
    nextChapterTitle: nextChapter?.title,
  };
}

/** Tiến độ trung bình theo môn (dedupe subject) — dùng chung Home snapshot + Progress tổng quan. */
export function subjectProgress(
  courses: Course[],
  completedLessons: Record<string, true>
): { subject: string; percent: number }[] {
  const bySubject = new Map<string, { sum: number; count: number }>();
  for (const c of courses) {
    const { percent } = courseProgress(c, completedLessons);
    const cur = bySubject.get(c.subject) || { sum: 0, count: 0 };
    bySubject.set(c.subject, { sum: cur.sum + percent, count: cur.count + 1 });
  }
  return [...bySubject.entries()].map(([subject, v]) => ({
    subject,
    percent: Math.round(v.sum / v.count),
  }));
}
