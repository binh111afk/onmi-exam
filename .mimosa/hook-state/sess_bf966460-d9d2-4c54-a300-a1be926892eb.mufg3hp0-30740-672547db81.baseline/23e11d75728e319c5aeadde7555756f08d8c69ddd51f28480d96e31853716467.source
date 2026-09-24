import { SemanticAnalyzer } from '../src/document/parsers/compiler/semanticAnalyzer.ts';
import { LogicalBlockBuilder } from '../src/document/parsers/compiler/logicalBlockBuilder.ts';
import { Tokenizer } from '../src/document/parsers/compiler/tokenizer.ts';
import { DocumentNormalizer } from '../src/document/parsers/compiler/documentNormalizer.ts';

const textQ4 = 'Câu 4. Khảo sát thưởng tết Bính Ngọ 2026 của người lao động ở công ty X được thống kê trong bảng sau:\n\nMức thưởng (triệu đồng): $[5; 8) \\quad [8; 11) \\quad [11; 14) \\quad [14; 17) \\quad [17; 20)$\nSố người: $30 \\quad 55 \\quad 45 \\quad 30 \\quad 20$\n\nMức thưởng trung bình của người lao động ở công ty X là bao nhiêu triệu (Làm tròn đến hàng phần trăm)?';

console.log('Q4 text normalized:');
console.log(new DocumentNormalizer().normalizeText(textQ4).text);
