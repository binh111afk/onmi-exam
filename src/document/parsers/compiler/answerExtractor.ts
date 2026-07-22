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

    // Phase 1: Scan strictly for explicit answer section trigger (e.g. "HẾT", "BẢNG ĐÁP ÁN")
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];

      if (node.kind === 'text') {
        const text = node.text.trim();

        // Skip garbled OCR rows (e.g., ¡¢£¤...)
        if (/[\u00A1-\u00FF]{5,}/.test(text) && !/[a-zA-Z0-9áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵĐđ]/i.test(text)) {
          if (inAnswerSection) answerKeyNodeIndexes.add(index);
          continue;
        }

        // Check strictly for Answer Section Header or End marker
        if (
          /^\s*(?:---*\s*HẾT\s*---*|ĐÁP\s*ÁN|BẢNG\s*ĐÁP\s*ÁN|ANSWER\s*KEY|PHẦN\s*ĐÁP\s*ÁN)\b/iu.test(text) ||
          /^\s*BẢNG\s+ĐÁP\s+ÁN\s+CÁC\s+MÃ\s+ĐỀ/iu.test(text)
        ) {
          inAnswerSection = true;
          answerHeaderIndex = index;
          answerKeyNodeIndexes.add(index);
          continue;
        }

        // ONLY parse answers if we are strictly inside the answer section AFTER the marker
        if (inAnswerSection) {
          answerKeyNodeIndexes.add(index);
          const parsed = this.parseAnswerLine(text);
          if (parsed.size > 0) {
            for (const [qId, ansList] of parsed.entries()) {
              answers.set(qId, ansList);
            }
          }
        }
      } else if (node.kind === 'table') {
        if (inAnswerSection) {
          const tableParsed = this.parseAnswerTable(node.rows);
          if (tableParsed.size > 0) {
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
    // e.g., "Câu 1: A", "Câu 1. A, B", "1. a) Đ  b) S", "1A 2B 3C 4D 5E"
    return /^\s*(?:Câu|Question)?\s*\d+\s*[:.-]?\s*(?:[A-D]|đúng|sai|[ĐS]|true|false)\b/iu.test(text) ||
      /^(?:\d+[A-D]\s+){2,}\d+[A-D]?$/iu.test(text);
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
        // Sort by a, b, c, d
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

    // 2. Multi-choice list format e.g. "1A 2B 3C 4D 5E" or "1.A 2.B 3.C"
    const gridMatches = Array.from(text.matchAll(/(?:Câu\s*)?(\d+)\s*[:.]?\s*([A-Da-d])(?=\s+|$)/gu));
    if (gridMatches.length >= 2) {
      for (const m of gridMatches) {
        const qId = Number(m[1]);
        const ans = m[2].toUpperCase();
        result.set(qId, [ans]);
      }
      return result;
    }

    // 3. Single line format: "Câu 1: A" or "Câu 1: A, B" or "1. A" or "Câu 1: 30a^3"
    const singleMatch = text.match(/^\s*(?:Câu|Question)\s*(\d+)\s*[:.]?\s*(.+)$/iu) ||
      text.match(/^\s*(\d+)\s*[:.]\s*(.+)$/u);

    if (singleMatch) {
      const qId = Number(singleMatch[1]);
      const rawAns = singleMatch[2].trim();

      // Check if rawAns is choice letter(s) e.g. "A" or "A, B"
      if (/^[A-D](\s*,\s*[A-D])*$/iu.test(rawAns)) {
        const choiceAns = rawAns.split(',').map((s) => s.trim().toUpperCase());
        result.set(qId, choiceAns);
      } else {
        // Fill-blank or text answer
        result.set(qId, [rawAns]);
      }
    }

    return result;
  }

  private parseAnswerTable(rows: string[][]): Map<number, string[]> {
    const result = new Map<number, string[]>();
    if (!rows || rows.length === 0) return result;

    // Pattern A: Horizontal Table
    // Row 0: ["Câu", "1", "2", "3", "4"]
    // Row 1: ["Đáp án", "A", "B", "C", "D"]
    for (let r = 0; r < rows.length - 1; r += 1) {
      const headerRow = rows[r];
      const valRow = rows[r + 1];

      if (headerRow.length === valRow.length) {
        let matchCount = 0;
        for (let c = 0; c < headerRow.length; c += 1) {
          const qText = headerRow[c].trim().replace(/^Câu\s*/i, '');
          const qId = Number(qText);
          const val = valRow[c].trim().toUpperCase();

          if (!Number.isNaN(qId) && qId > 0 && /^[A-D]$/u.test(val)) {
            result.set(qId, [val]);
            matchCount += 1;
          }
        }
        if (matchCount >= 2) return result;
      }
    }

    // Pattern B: Vertical Table (2 columns: QId | Ans)
    for (const row of rows) {
      if (row.length >= 2) {
        const qText = row[0].trim().replace(/^Câu\s*/i, '');
        const qId = Number(qText);
        const val = row[1].trim();

        if (!Number.isNaN(qId) && qId > 0 && val.length > 0) {
          if (/^[A-D]$/iu.test(val)) {
            result.set(qId, [val.toUpperCase()]);
          } else {
            result.set(qId, [val]);
          }
        }
      }
    }

    return result;
  }
}
