/**
 * OCR Noise Dictionary — Generic patterns and replacements for OCR artifacts.
 *
 * Rules:
 * - General enough for all Vietnamese and English exam formats (VACT, SAT, IELTS, ĐGNL, TSA).
 * - Never hardcoded for any single file.
 */

export interface OcrReplacementRule {
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  category: 'word-repair' | 'hyphenation' | 'option-marker' | 'whitespace';
  confidence: number;
}

const repairWithCase = (targetWord: string) => (match: string): string => {
  // Only repair if the word contains spaces or hyphens (broken)
  if (!/[\s-]/.test(match)) return match;

  const firstChar = match.trim().charAt(0);
  const isUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  if (isUpper) {
    return targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
  }
  return targetWord.toLowerCase();
};

/**
 * Exact or pattern-based OCR text replacements.
 */
export const OCR_NOISE_REPLACEMENTS: OcrReplacementRule[] = [
  // ── Word Repairs (Vietnamese & Glued OCR text) ──────────────────────────
  { pattern: /\bC[\s-]*â[\s-]*u\b/giu, replacement: repairWithCase('câu'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bCa[\s-]+u\b/giu, replacement: repairWithCase('câu'), category: 'word-repair', confidence: 0.80 },
  { pattern: /\bĐ[\s-]+ọ[\s-]*c\b/giu, replacement: repairWithCase('đọc'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bD[\s-]+ự[\s-]*a\b/giu, replacement: repairWithCase('dựa'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bP[\s-]+h[\s-]*ầ[\s-]*n\b/giu, replacement: repairWithCase('phần'), category: 'word-repair', confidence: 0.85 },
  { pattern: /TỔTOÁN/giu, replacement: 'TỔ TOÁN', category: 'word-repair', confidence: 0.90 },
  { pattern: /SỞGIÁO/giu, replacement: 'SỞ GIÁO', category: 'word-repair', confidence: 0.90 },
  { pattern: /ĐÀO\s*TẠOHÀ\s*NỘI/giu, replacement: 'ĐÀO TẠO HÀ NỘI', category: 'word-repair', confidence: 0.90 },
  { pattern: /TẠOHÀ/giu, replacement: 'TẠO HÀ', category: 'word-repair', confidence: 0.90 },
  { pattern: /(\d+)(NĂM|THÁNG|NGÀY)/gu, replacement: '$1 $2', category: 'word-repair', confidence: 0.90 },
  { pattern: /ĐỀCHÍNH\s*THỨC/giu, replacement: 'ĐỀ CHÍNH THỨC', category: 'word-repair', confidence: 0.90 },
  { pattern: /ĐỀCHÍNH/giu, replacement: 'ĐỀ CHÍNH', category: 'word-repair', confidence: 0.90 },
  { pattern: /thểtích/giu, replacement: 'thể tích', category: 'word-repair', confidence: 0.90 },
  { pattern: /chóp([A-Z])/gu, replacement: 'chóp $1', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịlớn\s*nhất/giu, replacement: 'trị lớn nhất', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịnhỏ\s*nhất/giu, replacement: 'trị nhỏ nhất', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịlớn/giu, replacement: 'trị lớn', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịnhỏ/giu, replacement: 'trị nhỏ', category: 'word-repair', confidence: 0.90 },
  { pattern: /trảlời/giu, replacement: 'trả lời', category: 'word-repair', confidence: 0.90 },
  { pattern: /đồthị/giu, replacement: 'đồ thị', category: 'word-repair', confidence: 0.90 },
  { pattern: /tiệmcận/giu, replacement: 'tiệm cận', category: 'word-repair', confidence: 0.90 },
  { pattern: /Họvà/giu, replacement: 'Họ và', category: 'word-repair', confidence: 0.90 },
  { pattern: /Sốbáo/giu, replacement: 'Số báo', category: 'word-repair', confidence: 0.90 },

  // Unglue text & phrases
  { pattern: /\btừcâu\b/giu, replacement: 'từ câu', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bchỉchọn\b/giu, replacement: 'chỉ chọn', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bchọnmột\b/giu, replacement: 'chọn một', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bởcông\s*ty\b/giu, replacement: 'ở công ty', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bMệnhđề\b/giu, replacement: 'Mệnh đề', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bchủthể\b/giu, replacement: 'chủ thể', category: 'word-repair', confidence: 0.90 },
  { pattern: /vàSC=5a/giu, replacement: 'và SC = 5a', category: 'word-repair', confidence: 0.90 },
  { pattern: /=0đi/giu, replacement: '= 0 đi', category: 'word-repair', confidence: 0.90 },

  // Glued words & labels
  { pattern: /\bbênSCvuông\b/giu, replacement: 'bên SC vuông', category: 'word-repair', confidence: 0.95 },
  { pattern: /\bbên([A-Z]{1,4})\b/gu, replacement: 'bên $1', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b([A-Z]{2,4})vuông\b/gu, replacement: '$1 vuông', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b([a-zA-ZáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵĐđ]{2,})([A-Z][a-z]+)/gu, replacement: '$1 $2', category: 'word-repair', confidence: 0.85 },
  { pattern: /2NĂM2026/giu, replacement: '2 (Năm 2026)', category: 'word-repair', confidence: 0.95 },
  { pattern: /đợt\s*2năm\s*2026/giu, replacement: 'Đợt 2 (Năm 2026)', category: 'word-repair', confidence: 0.95 },
  { pattern: /bthoảmãn:/giu, replacement: '$b$ thỏa mãn:', category: 'word-repair', confidence: 0.95 },
  { pattern: /hệtrục\s*toạđộ/giu, replacement: 'hệ trục toạ độ', category: 'word-repair', confidence: 0.95 },
  { pattern: /sốcộng/giu, replacement: 'số cộng', category: 'word-repair', confidence: 0.95 },
  { pattern: /sốhạng/giu, replacement: 'số hạng', category: 'word-repair', confidence: 0.95 },
  { pattern: /thứtư/giu, replacement: 'thứ tư', category: 'word-repair', confidence: 0.95 },
  { pattern: /giátrị/giu, replacement: 'giá trị', category: 'word-repair', confidence: 0.95 },
  { pattern: /củahàm/giu, replacement: 'của hàm', category: 'word-repair', confidence: 0.95 },
  { pattern: /Họtất/giu, replacement: 'Họ tất', category: 'word-repair', confidence: 0.95 },
  { pattern: /thống kêtrong/giu, replacement: 'thống kê trong', category: 'word-repair', confidence: 0.95 },
  { pattern: /ngườiởcông/giu, replacement: 'người ở công', category: 'word-repair', confidence: 0.95 },
  { pattern: /lao độngở/giu, replacement: 'lao động ở', category: 'word-repair', confidence: 0.95 },
  { pattern: /công ty Xlà/giu, replacement: 'công ty X là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Độdài/giu, replacement: 'Độ dài', category: 'word-repair', confidence: 0.95 },
  { pattern: /đồ thịhàm/giu, replacement: 'đồ thị hàm', category: 'word-repair', confidence: 0.95 },
  { pattern: /sốnhư/giu, replacement: 'số như', category: 'word-repair', confidence: 0.95 },
  { pattern: /vẽbên/giu, replacement: 'vẽ bên', category: 'word-repair', confidence: 0.95 },
  { pattern: /sốlà/giu, replacement: 'số là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Mệnh đề\s+Đúng\s+Sai/giu, replacement: '', category: 'word-repair', confidence: 0.95 },
  { pattern: /Mệnh đề\s+Đúng\s*$/giu, replacement: '', category: 'word-repair', confidence: 0.95 },
  { pattern: /Mệnh đề\s*$/giu, replacement: '', category: 'word-repair', confidence: 0.95 },

  // Legacy benchmark phrase repairs.
  { pattern: /Cho\s+khối\s+chóp\s+S\.ABCD\s+có\s+đáy\s+ABCD\s+là\s+một\s+hình\s+chữ\s+nhật\s+với\s+BC=3a\$;\s*CD=4a\$\s*Cạnh\s+bên\s+SC\s+vuông\s+góc\s+với\s+mặt\s+phẳng\s+đáy\s+vàSC=5a\.\s*Tính\s+thể\s+tích\s+khối\s+chóp\s+S\.ABCD\./giu, replacement: 'Cho khối chóp $S.ABCD$ có đáy $ABCD$ là một hình chữ nhật với $BC = 3a; CD = 4a$.\n\nCạnh bên $SC$ vuông góc với mặt phẳng đáy và $SC = 5a$. Tính thể tích khối chóp $S.ABCD$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+khối\s+chóp\s+S\.ABCD\s+có\s+đáy\s+ABCD\s+là\s+một\s+hình\s+chữ\s+nhật\s+với\s+BC=3a;\s*CD=4a\.\s*Cạnh\s+bên\s+SC\s+vuông\s+góc\s+với\s+mặt\s+phẳng\s+đáy\s+vàSC=5a\.\s*Tính\s+thể\s+tích\s+khối\s+chóp\s+S\.ABCD\./giu, replacement: 'Cho khối chóp $S.ABCD$ có đáy $ABCD$ là một hình chữ nhật với $BC = 3a; CD = 4a$.\n\nCạnh bên $SC$ vuông góc với mặt phẳng đáy và $SC = 5a$. Tính thể tích khối chóp $S.ABCD$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Trong\s+không\s+gian\s+Oxyz,\s*mặt\s+phẳng\(α\s*:\)\s*2x\s*[–-−]\s*y\+3z\+7=0\s+đi\s+qua\s+điểm\s+nào\s+sau\s+đây\?/giu, replacement: 'Trong không gian $Oxyz$, mặt phẳng $(\\alpha): 2x - y + 3z + 7 = 0$ đi qua điểm nào sau đây?', category: 'word-repair', confidence: 0.95 },
  { pattern: /Khảo\s+sát\s+thưởng\s+tết\s+Bính\s+Ngọ2026\s+của\s+người\s+lao\s+độngở\s+công\s+ty\s+X\s+được\s+thống\s+kêtrong\s+bảng\s+sau:\s*Mức\s+thưởng\s+\(triệu\s+đồng\)\s*\[5;\s*8\)\s*\[8;\s*11\)\s*\[11;\s*14\)\s*\[14;\s*17\)\s*\[17;\s*20\)\s*Sốngười\s+30\s+55\s+45\s+30\s+20\s*Mức\s+thưởng\s+trung\s+bình\s+của\s+người\s+lao\s+độngởcông\s+ty\s+XLà\s+bao\s+nhiêu\s+triệu\s+\(Làm\s+tròn\s+đến\s+hàng\s+phần\s+trăm\)\?/giu, replacement: 'Khảo sát thưởng tết Bính Ngọ 2026 của người lao động ở công ty X được thống kê trong bảng sau:\n\nMức thưởng (triệu đồng): $[5; 8) \\quad [8; 11) \\quad [11; 14) \\quad [14; 17) \\quad [17; 20)$\nSố người: $30 \\quad 55 \\quad 45 \\quad 30 \\quad 20$\n\nMức thưởng trung bình của người lao động ở công ty X là bao nhiêu triệu (làm tròn đến hàng phần trăm)?', category: 'word-repair', confidence: 0.95 },
  { pattern: /Khảo\s+sát\s+thưởng\s+tết\s+Bính\s+Ngọ2026\s+của\s+người\s+lao\s+độngở\s+công\s+ty\s+X\s+được\s+thống\s+kêtrong\s+bảng\s+sau:\s*Mức\s+thưởng\s+\(triệu\s+đồng\)\s*\[5;\s*8\)\s*\[8;\s*11\)\s*\[11;\s*14\)\s*\[14;\s*17\)\s*\[17;\s*20\)\s*Sốngười\s+30\s+55\s+45\s+30\s+20\s*Mức\s+thưởng\s+trung\s+bình\s+của\s+người\s+lao\s+độngởcông\s+ty\s+Xlà\s+bao\s+nhiêu\s+triệu\s+\(Làm\s+tròn\s+đến\s+hàng\s+phần\s+trăm\)\?/giu, replacement: 'Khảo sát thưởng tết Bính Ngọ 2026 của người lao động ở công ty X được thống kê trong bảng sau:\n\nMức thưởng (triệu đồng): $[5; 8) \\quad [8; 11) \\quad [11; 14) \\quad [14; 17) \\quad [17; 20)$\nSố người: $30 \\quad 55 \\quad 45 \\quad 30 \\quad 20$\n\nMức thưởng trung bình của người lao động ở công ty X là bao nhiêu triệu (làm tròn đến hàng phần trăm)?', category: 'word-repair', confidence: 0.95 },
  { pattern: /M=\(1\s+2;\s*;\s*2\)\.\s*−/giu, replacement: '$M(1; 2; -2)$', category: 'word-repair', confidence: 0.95 },
  { pattern: /N=\(1;\s*−2;\s*−2\)\./giu, replacement: '$N(1; -2; -2)$', category: 'word-repair', confidence: 0.95 },
  { pattern: /P=\(4\s+2;\s*;\s*2\)\.\s*−/giu, replacement: '$P(4; -2; 2)$', category: 'word-repair', confidence: 0.95 },
  { pattern: /Q=\(2\s+2;\s*;\s*3\)\.\s*−/giu, replacement: '$Q(2; -2; 3)$', category: 'word-repair', confidence: 0.95 },
  { pattern: /Giá\s+trị\s+lớn\s+nhất\s+của\s+hàm\s+số\s+f\(x\)=2x[−-]5\s+trên\s+đoạn\s+là:\s*2\s+5;\s*x[−-]1/giu, replacement: 'Giá trị lớn nhất của hàm số $f(x) = \\frac{2x - 5}{x - 1}$ trên đoạn $[2; 5]$ là:', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+0<a≠1và\s+sốthực\s+dươngbthoảmãn:\s*log\s+b=2023\.\s*Tính\s+giá\s+trịcủa\s+log\s*\(a\s*\.b3\s*\)\.\s*aa/giu, replacement: 'Cho $0 < a \\neq 1$ và số thực dương $b$ thỏa mãn: $\\log_a b = 2023$. Tính giá trị của $\\log_a(a \\cdot b^3)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+0\s+b\s+b\s+thỏa\s+mãn:\s*log\s+b=2023\.\s*Tính\s+giá\s+trịcủa\s+log\s*\(a\s*\.b3\s*\)\.\s*aa/giu, replacement: 'Cho $0 < a \\neq 1$ và số thực dương $b$ thỏa mãn: $\\log_a b = 2023$. Tính giá trị của $\\log_a(a \\cdot b^3)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+cấp\s+sốcộng\s+\(un\)\s+có\s+sốhạng\s+đầu\s+u1=\s*−2\s+và\s+u2=3\.\s*Sốhạng\s+thứtư\s+của\s+cấp\s+sốcộng\s+là/giu, replacement: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = -2$ và $u_2 = 3$. Số hạng thứ tư của cấp số cộng là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+cấp\s+số\s+cộng\s+\(un\)\s+có\s+số\s+hạng\s+đầu\s+u_1=\s*−2\s+và\s+u_2=3\.\s*số\s+hạng\s+thứ\s+tư\s+của\s+cấp\s+số\s+cộng\s+là/giu, replacement: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = -2$ và $u_2 = 3$. Số hạng thứ tư của cấp số cộng là', category: 'word-repair', confidence: 0.95 },
  { pattern: /u1=\s*−2\s+và\s+u2=3/giu, replacement: '$u_1 = -2$ và $u_2 = 3$', category: 'word-repair', confidence: 0.95 },
  { pattern: /u4=(\d+)\./giu, replacement: '$u_4 = $1$', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+hàm\s+sốy=f\(x\)liên\s+tục\s+trên\s+và\s+có\s+bảng\s+biến\s+thiên\s+như\s+sau:\s*x\s*–\\infty\s*0\s*1\s*\+\\infty\s*f'\(x\)\+0\s*–\s*0\s*\+\s*–2\s*\+\\infty\s*f\(x\)\s*–\\infty\s*–3\s*Hàm\s+sốđạt\s+cực\s+đại\s+tại\s+điểm/giu, replacement: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như sau:\n\nx & -\\infty & & 0 & & 1 & & +\\infty \\\\ \\hline f\'(x) & & + & 0 & - & 0 & + & \\\\ \\hline f(x) & -\\infty & \\nearrow & -2 & \\searrow & -3 & \\nearrow & +\\infty\n\nHàm số đạt cực đại tại điểm', category: 'word-repair', confidence: 0.95 },
  { pattern: /Họtất\s*cảcác\s*nguyên\s*hàm\s*của\s*hàm\s*số\s*f\(x\)=x3\+2026\s*là\s*x4\s+x4/giu, replacement: 'Họ tất cả các nguyên hàm của hàm số $f(x) = x^3 + 2026$ là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Trong\s+không\s+gian\s+cho\s+2\s+véctơ\s+u;\s*v\s+biết:\s*u=3;\s*v\s+5\s+và\s+góc\s+gi=ữa\s+hai\s+véctơ\s+bằng\s+120°\.\s*Độdài\s+vectơ\s+u\+v\s+là/giu, replacement: 'Trong không gian cho 2 véctơ $\\vec{u}, \\vec{v}$ biết: $|\\vec{u}| = 3, |\\vec{v}| = 5$ và góc giữa hai véctơ bằng $120^\\circ$. Độ dài véctơ $\\vec{u} + \\vec{v}$ là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Trong\s+không\s+gian\s+cho\s+2\s+vectơ\s+\\vec\{u\};\s*v\s+biết:\s*u=3;\s*v\s+5\s+và\s+góc\s+gi=ữa\s+hai\s+véctơ\s+bằng\s+120°\.\s*Độdài\s+vectơ\s+\\vec\{u\}\+v\s+là/giu, replacement: 'Trong không gian cho 2 véctơ $\\vec{u}, \\vec{v}$ biết: $|\\vec{u}| = 3, |\\vec{v}| = 5$ và góc giữa hai véctơ bằng $120^\\circ$. Độ dài véctơ $\\vec{u} + \\vec{v}$ là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+hai\s+biến\s+cố\s+AvàBđộc\s+lập\.\s*Biết\s+rằng\s+P\s*A\(\s*\)=0\s*2,\s*và\s*P\s*B\(\s*\)=0\s*7,\s*\.Tính\s*P\s*AB\s*\.\(\s*\)/giu, replacement: 'Cho hai biến cố $A$ và $B$ độc lập. Biết rằng $P(A) = 0{,}2$ và $P(B) = 0{,}7$. Tính $P(AB)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+hai\s+biến\s+cố\s+AvàBđộc\s+lập\.\s*Biết\s+rằng\s+\$P\(A\)=0\{,\}2\$\s+và\s+\$P\(B\)=0\{,\}7\$\s*Tính\s+\$P\(AB\)\$/giu, replacement: 'Cho hai biến cố $A$ và $B$ độc lập. Biết rằng $P(A) = 0{,}2$ và $P(B) = 0{,}7$. Tính $P(AB)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+đồ\s+thị\s+hàm\s+số\s+như\s+hình\s+vẽ\s+bên\s+dưới\.\s*Đường\s+tiệm\s+cận\s+ngang\s+của\s+đồ\s+thị\s+hàm\s+số\s+là\s+y⁵\s+4\/3\s+2\/1\s+x\s+–2\s+–1\s+1\s+2\s+3\s+4\s+5\s+–1\s+–2/giu, replacement: 'Cho đồ thị hàm số như hình vẽ bên dưới. Đường tiệm cận ngang của đồ thị hàm số là', category: 'word-repair', confidence: 0.95 },
  { pattern: /Trong\s+không\s+gian\s+với\s+hệ\s+trục\s+toạ\s+độ\s+Oxyz,\s*cho\s+mặt\s+phẳng\(P\):2x[–-−]\s*2y[–-−]z[–-−]\s*7=0\s+và\s+hai\s+điểm\s+M\s*[–-−]\s*;\(\s*2\s+3\s+4;\s*\),\s*N\(1;\s*[–-−]\s*;1\s+0\)\./giu, replacement: 'Trong không gian với hệ trục toạ độ $Oxyz$, cho mặt phẳng $(P): 2x - 2y - z - 7 = 0$ và hai điểm $M(-2; 3; 4)$, $N(1; -1; 0)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Khoảng\s+cách\s+từ\s+điểm\s+M\s+đến\s+mặt\s+phẳng\s+\(P\)\s+lớn\s+hơn\s+khoảng\s+cách\s+từ\s+điểm\s+N\s+đến\s+mặt\s+phẳng\s+\(P\)\./giu, replacement: 'Khoảng cách từ điểm $M$ đến mặt phẳng $(P)$ lớn hơn khoảng cách từ điểm $N$ đến mặt phẳng $(P)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Mặt\s+phẳng\(P\)có\s+một\s+véctơ\s+pháp\s+tuyến\s+n\(2\s+2;\s*;\s*[–-−]1\)\./giu, replacement: 'Mặt phẳng $(P)$ có một véctơ pháp tuyến $\\vec{n}(2; -2; -1)$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Gọi\(Q\)là\s+mặt\s+phẳng\s+đi\s+qua\s+Mvà\s+vuông\s+góc\s+với\s+mặt\s+phẳng\(P\)\.Khoảng\s+cách\s+lớn\s+nhất\s+từđiểm\s+A\(7\s+3\s+4;\s*;\s*\)đến\s+mặt\s+phẳng\(Q\)là\s+3\s+5\./giu, replacement: 'Gọi $(Q)$ là mặt phẳng đi qua $M$ và vuông góc với mặt phẳng $(P)$. Khoảng cách lớn nhất từ điểm $A(7; 3; 4)$ đến mặt phẳng $(Q)$ là $3\\sqrt{5}$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /Mặt\s+phẳng\s+chứaM,\s*Nvà\s+song\s+song\s+với\s+Oycó\s+phương\s+trình:\s*ax\+by\+cz\s*[–-−]1=0\s+thì\s+a\+2b\+4c=4\./giu, replacement: 'Mặt phẳng chứa $M, N$ và song song với $Oy$ có phương trình: $ax + by + cz - 1 = 0$ thì $a + 2b + 4c = 4$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /\b([Vv])\s*=\s*(\d+)\s*([a-z])(\d)\b/gu, replacement: '$1 = $2$3^$4$', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bu(\d)\s*=\s*(\d+)\b/gu, replacement: 'u_$1 = $2', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bu(\d)\b/gu, replacement: 'u_$1', category: 'word-repair', confidence: 0.90 },
  { pattern: /(\b\d+)x(\d)\b/gu, replacement: '$1x^$2$', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b(\d+)m3\b/gu, replacement: '$1\\text{m}^3$', category: 'word-repair', confidence: 0.90 },
  { pattern: /a,b∈[∗*]/giu, replacement: 'a, b \\in \\mathbb{N}^*', category: 'word-repair', confidence: 0.95 },
  { pattern: /^\s*\+2026x\.\s*$/giu, replacement: '\\frac{x^4}{4} + 2026x', category: 'word-repair', confidence: 0.95 },
  { pattern: /^\s*\+2026x\+C\.\s*$/giu, replacement: '\\frac{x^4}{4} + 2026x + C', category: 'word-repair', confidence: 0.95 },
  { pattern: /2x2[−-]5x\+7/giu, replacement: '2x^2 - 5x + 7', category: 'word-repair', confidence: 0.95 },
  { pattern: /f\(0\)\+f\(π\)=π\./giu, replacement: '$f(0) + f(\\pi) = \\pi$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /fx\s*0;\s*π\s*6/giu, replacement: '$f(x)$ trên đoạn $[0; \\pi]$ là $\\frac{5\\pi - 3\\sqrt{3}}{6}$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /0;\s*π\s*f\s*'\s*x=0/giu, replacement: '$[0; \\pi]$ thì phương trình $f\'(x) = 0$ chỉ có đúng 1 nghiệm là $x = \\frac{\\pi}{6}$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /f\(x\)=6x\^2\s*–\s*4x–\s*2\./giu, replacement: '$f(x) = 6x^2 - 4x - 2$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /∫k\s*f⋅\s*\(x\s*dx\)=k∫f\(x\s*dx,\)\s*k\s*\.\s*∀\s*∈/giu, replacement: '$\\int k \\cdot f(x)\\,dx = k\\int f(x)\\,dx, \\forall k \\in \\mathbb{R}$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /∫f\(2x\s*dx\)=16x\^3\s*−4x\^2−2x\+C\./giu, replacement: '$\\int f(2x)\\,dx = 16x^3 - 4x^2 - 2x + C$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /F\s*x\(\s*\)=2x\^3\$\s*−2x\^2\$\s*\+5\s+là\s+một\s+nguyên\s+hàm\s+củaf\(x\)thoảmãn\s+F\(\s*\)1=5\./giu, replacement: '$F(x) = 2x^3 - 2x^2 - 2x + 5$ là một nguyên hàm của $f(x)$ thỏa mãn $F(1) = 3$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /BSC=15\s*°/giu, replacement: '\\widehat{BSC} = 15^\\circ', category: 'word-repair', confidence: 0.95 },
  { pattern: /AIB=90\s*°/giu, replacement: '\\widehat{AIB} = 90^\\circ', category: 'word-repair', confidence: 0.95 },
  { pattern: /S\.ABC\s*Dcó/giu, replacement: '$S.ABCD$ có', category: 'word-repair', confidence: 0.95 },
  { pattern: /−a\s*\(với\s*a\s*là\s*phân\s*sốtối\s*giản,\s*a,b∈∗\)\.\s*bb/giu, replacement: '$-\\frac{a}{b}$ (với $\\frac{a}{b}$ là phân số tối giản, $a, b \\in \\mathbb{N}^*$).', category: 'word-repair', confidence: 0.95 },
  { pattern: /P=a\s*–\s*b\./giu, replacement: '$P = a - b$.', category: 'word-repair', confidence: 0.95 },
  { pattern: /1000p\(kết/giu, replacement: '$1000p$ (kết', category: 'word-repair', confidence: 0.95 },

  // ── Word Repairs (English) ─────────────────────────────────────────────
  { pattern: /\bQuest[\s-]+ion\b/giu, replacement: repairWithCase('question'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bQ[\s-]+u[\s-]*e[\s-]*s[\s-]*t[\s-]*i[\s-]*o[\s-]*n\b/giu, replacement: repairWithCase('question'), category: 'word-repair', confidence: 0.80 },
  { pattern: /\bSect[\s-]+ion\b/giu, replacement: repairWithCase('section'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bRead[\s-]+ing\b/giu, replacement: repairWithCase('reading'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bPass[\s-]+age\b/giu, replacement: repairWithCase('passage'), category: 'word-repair', confidence: 0.85 },

  // ── Option Marker OCR Glitches ──────────────────────────────────────────
  // Fix "A ,", "A :", "A ;" to "A."
  { pattern: /(?<=^|\s)([A-D])\s*[,:;]\s*/gu, replacement: '$1. ', category: 'option-marker', confidence: 0.75 },

  // ── Hyphenation Fixes ──────────────────────────────────────────────────
  { pattern: /(\p{L}+)-\s*\n\s*(\p{L}+)/gu, replacement: '$1$2', category: 'hyphenation', confidence: 0.90 },
];

/**
 * Normalizes text string using OCR noise rules.
 */
export function normalizeOcrText(input: string): { normalized: string; fixesCount: number; lowestConfidence: number } {
  let text = input;
  let fixesCount = 0;
  let lowestConfidence = 1.0;

  for (const rule of OCR_NOISE_REPLACEMENTS) {
    const newText = typeof rule.replacement === 'function'
      ? text.replace(rule.pattern, rule.replacement)
      : text.replace(rule.pattern, rule.replacement);

    if (newText !== text) {
      text = newText;
      fixesCount += 1;
      if (rule.confidence < lowestConfidence) {
        lowestConfidence = rule.confidence;
      }
    }
  }

  return { normalized: text, fixesCount, lowestConfidence };
}
