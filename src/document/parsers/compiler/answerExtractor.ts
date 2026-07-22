/**
 * AnswerExtractor — Extract answer keys (Choice, True-False, Fill-Blank)
 * from document nodes and answer tables.
 */
import type { RawDocumentNode } from '../../../types/raw-document.ts';

export interface AnswerExtractionResult {
  answers: Map<number, string[]>;
  answerKeyNodeIndexes: Set<number>;
}

export class AnswerExtractor {
  extract(nodes: RawDocumentNode[]): AnswerExtractionResult {
    const answers = new Map<number, string[]>();
    const answerKeyNodeIndexes = new Set<number>();

    let inAnswerSection = false;
    let answerHeaderIndex = -1;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];

      if (node.kind === 'text') {
        const text = node.text.trim();
        if (!text) continue;

        // Skip garbled OCR rows (e.g., ¡¢£¤...)
        if (/[\u00A1-\u00FF]{5,}/.test(text) && !/[a-zA-Z0-9áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵĐđ]/i.test(text)) {
          if (inAnswerSection) answerKeyNodeIndexes.add(index);
          continue;
        }

        // Check for Answer Section Header or End marker
        if (
          /^\s*(?:---*\s*HẾT\s*---*|ĐÁP\s*ÁN|BẢNG\s*ĐÁP\s*ÁN|ANSWER\s*KEY|PHẦN\s*ĐÁP\s*ÁN|HƯỚNG\s+DẪN\s+GIẢI|ĐÁP\s+ÁN\s+VÀ\s+LỜI\s+GIẢI)\b/iu.test(text) ||
          /^\s*BẢNG\s+ĐÁP\s+ÁN\s+CÁC\s+MÃ\s+ĐỀ/iu.test(text)
        ) {
          inAnswerSection = true;
          answerHeaderIndex = index;
          answerKeyNodeIndexes.add(index);
          continue;
        }

        // Check if text line itself is an answer line
        const parsed = this.parseAnswerLine(text);
        if (parsed.size > 0) {
          // If we find multiple answers or an explicit answer line, treat as answer section
          if (inAnswerSection || parsed.size >= 2 || this.isExplicitAnswerLine(text)) {
            inAnswerSection = true;
            answerKeyNodeIndexes.add(index);
            for (const [qId, ansList] of parsed.entries()) {
              answers.set(qId, ansList);
            }
          }
        }
      } else if (node.kind === 'table') {
        const tableParsed = this.parseAnswerTable(node.rows);
        if (tableParsed.size > 0) {
          // If table has at least 2 answers or we are in answer section
          if (inAnswerSection || tableParsed.size >= 2) {
            inAnswerSection = true;
            answerKeyNodeIndexes.add(index);
            if (answerHeaderIndex >= 0) {
              for (let hIndex = answerHeaderIndex; hIndex < index; hIndex += 1) {
                answerKeyNodeIndexes.add(hIndex);
              }
            }
            for (const [qId, ansList] of tableParsed.entries()) {
              answers.set(qId, ansList);
            }
          }
        }
      }
    }

    return { answers, answerKeyNodeIndexes };
  }

  private isExplicitAnswerLine(text: string): boolean {
    return (
      /^\s*(?:Câu|Question)?\s*\d+\s*[:.-]?\s*(?:[A-D]|đúng|sai|[ĐS]|true|false)\b/iu.test(text) ||
      /^(?:\d+[A-D]\s+){2,}\d+[A-D]?$/iu.test(text) ||
      /^\s*(?:Câu|Question)?\s*\d+\s*[:.-]?\s*a[)-]\s*[ĐS]/iu.test(text)
    );
  }

  private parseAnswerLine(text: string): Map<number, string[]> {
    const result = new Map<number, string[]>();

    // 1. True-False format: "1. a) Đ b) S c) S d) Đ" or "1. a-Đ, b-S, c-S, d-Đ" or "Câu 1: a) True b) False..."
    const tfMatch = text.match(/^\s*(?:Câu|Question)?\s*(\d+)\s*[:.]?\s*((?:[a-d][)-]\s*[ĐS|True|False|đúng|sai]\s*[,;]?\s*)+)/iu);
    if (tfMatch) {
      const qId = Number(tfMatch[1]);
      const subItemsText = tfMatch[2];
      const subMatches = Array.from(subItemsText.matchAll(/([a-d])[)-]\s*([ĐS|True|False|đúng|sai])/giu));
      if (subMatches.length > 0) {
        const tfMap: Record<string, string> = {};
        for (const m of subMatches) {
          const key = m[1].toLowerCase();
          let val = m[2].toUpperCase();
          if (val === 'TRUE' || val === 'ĐÚNG') val = 'Đ';
          if (val === 'FALSE' || val === 'SAI') val = 'S';
          tfMap[key] = val;
        }
        const sortedVals = ['a', 'b', 'c', 'd'].map((k) => tfMap[k] ?? 'Đ');
        result.set(qId, sortedVals);
        return result;
      }
    }

    // 1b. True-False shorthand format: "Câu 1. Đ - S - S - Đ" or "1. Đ S S Đ" or "1. Đ, S, S, Đ"
    const tfShortMatch = text.match(/^\s*(?:Câu|Question)?\s*(\d+)\s*[:.]?\s*([ĐS]\s*[-,\s]\s*[ĐS]\s*[-,\s]\s*[ĐS]\s*[-,\s]\s*[ĐS])\b/iu);
    if (tfShortMatch) {
      const qId = Number(tfShortMatch[1]);
      const vals = tfShortMatch[2].toUpperCase().split(/[-,\s]+/).filter((s) => s === 'Đ' || s === 'S');
      if (vals.length === 4) {
        result.set(qId, vals);
        return result;
      }
    }

    // 2. Multi-choice list format e.g. "1A 2B 3C 4D 5E" or "1.A 2.B 3.C" or "1-A 2-B 3-C"
    // Guard: reject math equations containing =, +, \vec, etc., and True-False statement lines (a), b), c), d))
    if (!/[=+−\\/]/u.test(text) && !/^\s*[a-d][)-]/iu.test(text)) {
      const gridMatches = Array.from(text.matchAll(/(?:Câu\s*)?(\d{1,3})\s*[:.-]?\s*([A-D])(?=\s+|$)/g));
      if (gridMatches.length >= 2) {
        for (const m of gridMatches) {
          const qId = Number(m[1]);
          const ans = m[2].toUpperCase();
          result.set(qId, [ans]);
        }
        return result;
      }
    }

    // 3. Single line format: "Câu 1: A" or "Câu 1: A, B" or "1. A" or "Câu 19: 37.2" or "19. 37,2"
    const singleMatch = text.match(/^\s*(?:Câu|Question)\s*(\d+)\s*[:.]?\s*(.+)$/iu) ||
      text.match(/^\s*(\d+)\s*[:.]\s*(.+)$/u);

    if (singleMatch) {
      const qId = Number(singleMatch[1]);
      const rawAns = singleMatch[2].trim();

      // Reject prose/stem text (e.g., "Cho hàm số...", "Câu hỏi...", "Tính giá trị...")
      const isProse = /^(?:Cho|Tính|Tìm|Biết|Trong|Hàm|Xét|Nêu|Gọi|Với|Có|Để|Rút|Hãy|Câu)\b/iu.test(rawAns) ||
        /\b(?:hàm\s+số|không\s+gian|mặt\s+phẳng|giá\s+trị|phương\s+trình|nghiệm|tọa\s+độ|bất\s+phương|đồ\s+thị|khảo\s+sát|thứ\s+nhất|thứ\s+hai)\b/iu.test(rawAns);

      if (!isProse) {
        // Check if rawAns is choice letter(s) e.g. "A" or "A, B"
        if (/^[A-D](\s*,\s*[A-D])*$/iu.test(rawAns)) {
          const choiceAns = rawAns.split(',').map((s) => s.trim().toUpperCase());
          result.set(qId, choiceAns);
        } else if (/^[ĐS](\s*[-,\s]\s*[ĐS]){3}$/iu.test(rawAns)) {
          // True-False shorthand in single match
          const tfVals = rawAns.toUpperCase().split(/[-,\s]+/).filter((s) => s === 'Đ' || s === 'S');
          if (tfVals.length === 4) {
            result.set(qId, tfVals);
          }
        } else {
          // Fill-blank or numerical/short answer e.g. "37.2", "37,2", "-4.5", "1/2", "30a^3"
          const cleanAns = rawAns.replace(/[\s;]+$/, '');
          if (cleanAns.length > 0 && cleanAns.length <= 25 && !/\s{2,}/.test(cleanAns)) {
            result.set(qId, [cleanAns]);
          }
        }
      }
    }

    return result;
  }

  private parseAnswerTable(rows: string[][]): Map<number, string[]> {
    const result = new Map<number, string[]>();
    if (!rows || rows.length === 0) return result;

    // Pattern A: Horizontal Table with a, b, c, d rows for True-False
    // Row 0: ["Câu", "1", "2", "3", "4"]
    // Row 1: ["a", "Đ", "S", "Đ", "S"]
    // Row 2: ["b", "S", "Đ", "S", "Đ"]
    // Row 3: ["c", "S", "S", "Đ", "Đ"]
    // Row 4: ["d", "Đ", "S", "S", "Đ"]
    for (let r = 0; r < rows.length - 4; r += 1) {
      const headerRow = rows[r];
      const rowA = rows[r + 1];
      const rowB = rows[r + 2];
      const rowC = rows[r + 3];
      const rowD = rows[r + 4];

      if (
        headerRow.length === rowA.length &&
        rowA.length === rowB.length &&
        rowB.length === rowC.length &&
        rowC.length === rowD.length
      ) {
        const labelA = rowA[0].trim().toLowerCase();
        const labelB = rowB[0].trim().toLowerCase();
        const labelC = rowC[0].trim().toLowerCase();
        const labelD = rowD[0].trim().toLowerCase();

        if (labelA.includes('a') && labelB.includes('b') && labelC.includes('c') && labelD.includes('d')) {
          let matchCount = 0;
          for (let c = 1; c < headerRow.length; c += 1) {
            const qId = Number(headerRow[c].trim().replace(/^Câu\s*/i, ''));
            const valA = this.normalizeTfValue(rowA[c]);
            const valB = this.normalizeTfValue(rowB[c]);
            const valC = this.normalizeTfValue(rowC[c]);
            const valD = this.normalizeTfValue(rowD[c]);

            if (!Number.isNaN(qId) && qId > 0 && valA && valB && valC && valD) {
              result.set(qId, [valA, valB, valC, valD]);
              matchCount += 1;
            }
          }
          if (matchCount >= 1) return result;
        }
      }
    }

    // Pattern B: Horizontal Table (Choice / Fill-blank / Combined TF)
    // Row 0: ["Câu", "1", "2", "3", "4"]
    // Row 1: ["Đáp án", "A", "37.2", "Đ-S-S-Đ", "D"]
    for (let r = 0; r < rows.length - 1; r += 1) {
      const headerRow = rows[r];
      const valRow = rows[r + 1];

      if (headerRow.length === valRow.length) {
        let matchCount = 0;
        for (let c = 0; c < headerRow.length; c += 1) {
          const qText = headerRow[c].trim().replace(/^Câu\s*/i, '');
          const qId = Number(qText);
          const val = valRow[c].trim();

          if (!Number.isNaN(qId) && qId > 0 && val.length > 0) {
            const parsedCell = this.parseCellAnswer(val);
            if (parsedCell.length > 0) {
              result.set(qId, parsedCell);
              matchCount += 1;
            }
          }
        }
        if (matchCount >= 2) return result;
      }
    }

    // Pattern C: Vertical Table (2 or 4 or 6 columns)
    // e.g. 2 columns: [QId, Ans], 4 columns: [QId, Ans, QId, Ans]
    const tfSubItems = new Map<number, { a?: string; b?: string; c?: string; d?: string }>();

    for (const row of rows) {
      for (let col = 0; col < row.length - 1; col += 2) {
        const cellQ = row[col].trim().replace(/^Câu\s*/i, '');
        const cellAns = row[col + 1].trim();

        // Check for sub-item like "1a", "1b", "1c", "1d"
        const subMatch = cellQ.match(/^(\d+)\s*([a-d])$/i);
        if (subMatch) {
          const qId = Number(subMatch[1]);
          const subKey = subMatch[2].toLowerCase() as 'a' | 'b' | 'c' | 'd';
          const tfVal = this.normalizeTfValue(cellAns);
          if (tfVal) {
            const existing = tfSubItems.get(qId) ?? {};
            existing[subKey] = tfVal;
            tfSubItems.set(qId, existing);
          }
          continue;
        }

        const qId = Number(cellQ);
        if (!Number.isNaN(qId) && qId > 0 && cellAns.length > 0) {
          const parsedCell = this.parseCellAnswer(cellAns);
          if (parsedCell.length > 0) {
            result.set(qId, parsedCell);
          }
        }
      }
    }

    // Merge vertical TF subItems if any
    for (const [qId, subObj] of tfSubItems.entries()) {
      if (subObj.a && subObj.b && subObj.c && subObj.d) {
        result.set(qId, [subObj.a, subObj.b, subObj.c, subObj.d]);
      }
    }

    return result;
  }

  private normalizeTfValue(val: string): string | null {
    const clean = val.trim().toUpperCase();
    if (clean === 'Đ' || clean === 'ĐÚNG' || clean === 'T' || clean === 'TRUE' || clean === 'D') return 'Đ';
    if (clean === 'S' || clean === 'SAI' || clean === 'F' || clean === 'FALSE') return 'S';
    return null;
  }

  private parseCellAnswer(val: string): string[] {
    const clean = val.trim();
    if (!clean) return [];

    // True-False 4 values e.g. "Đ-S-S-Đ" or "Đ S S Đ" or "Đ, S, S, Đ"
    if (/^[ĐS](\s*[-,\s]\s*[ĐS]){3}$/iu.test(clean)) {
      const parts = clean.toUpperCase().split(/[-,\s]+/).filter((s) => s === 'Đ' || s === 'S');
      if (parts.length === 4) return parts;
    }

    // Choice e.g. "A" or "a"
    if (/^[A-D]$/iu.test(clean)) {
      return [clean.toUpperCase()];
    }

    // Multiple Choice e.g. "A, B"
    if (/^[A-D](\s*,\s*[A-D])*$/iu.test(clean)) {
      return clean.split(',').map((s) => s.trim().toUpperCase());
    }

    // True-False structured string e.g. "a-Đ, b-S, c-S, d-Đ"
    const subMatches = Array.from(clean.matchAll(/([a-d])[)-]\s*([ĐS|True|False|đúng|sai])/giu));
    if (subMatches.length === 4) {
      const tfMap: Record<string, string> = {};
      for (const m of subMatches) {
        const key = m[1].toLowerCase();
        let v = m[2].toUpperCase();
        if (v === 'TRUE' || v === 'ĐÚNG') v = 'Đ';
        if (v === 'FALSE' || v === 'SAI') v = 'S';
        tfMap[key] = v;
      }
      return ['a', 'b', 'c', 'd'].map((k) => tfMap[k] ?? 'Đ');
    }

    // Fill-Blank / Text answer e.g. "37.2" or "37,2" or "-4.5"
    return [clean];
  }
}

