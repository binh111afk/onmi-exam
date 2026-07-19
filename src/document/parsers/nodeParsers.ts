import type { DocumentContentNode, DocumentReviewMarker, OptionObject, QuestionObject } from '../../types/question-object';
import type { RawDocumentNode } from '../../types/raw-document';
import type { DocumentNodeParser, ParserContext, ParserResult } from './parserContracts';

const result = (value: DocumentContentNode | null, confidence: number, reviewMarkers: DocumentReviewMarker[] = []): ParserResult<DocumentContentNode | null> => ({
  value,
  confidence,
  reviewMarkers,
});

export class HeadingParser implements DocumentNodeParser {
  supports(node: RawDocumentNode): boolean {
    return node.kind === 'text' && (node.style === 'heading' || node.headingLevel !== undefined);
  }

  parse(node: RawDocumentNode, _context: Parameters<DocumentNodeParser['parse']>[1]): ParserResult<DocumentContentNode | null> {
    if (node.kind !== 'text') return result(null, 0);
    return result({ kind: 'heading', level: node.headingLevel ?? 1, text: node.text }, node.confidence);
  }
}

export class TableParser implements DocumentNodeParser {
  supports(node: RawDocumentNode): boolean {
    return node.kind === 'table';
  }

  parse(node: RawDocumentNode, _context: Parameters<DocumentNodeParser['parse']>[1]): ParserResult<DocumentContentNode | null> {
    return node.kind === 'table' ? result({ kind: 'table', rows: node.rows }, node.confidence) : result(null, 0);
  }
}

export class ImageParser implements DocumentNodeParser {
  supports(node: RawDocumentNode): boolean {
    return node.kind === 'image';
  }

  parse(node: RawDocumentNode, _context: Parameters<DocumentNodeParser['parse']>[1]): ParserResult<DocumentContentNode | null> {
    return node.kind === 'image'
      ? result({ kind: 'image', src: node.src, alt: node.alt }, node.confidence)
      : result(null, 0);
  }
}

export class FormulaParser implements DocumentNodeParser {
  supports(node: RawDocumentNode): boolean {
    return node.kind === 'text' && /(?:\\[a-zA-Z]+|[=±√∑∫])/u.test(node.text);
  }

  parse(node: RawDocumentNode, _context: Parameters<DocumentNodeParser['parse']>[1]): ParserResult<DocumentContentNode | null> {
    if (node.kind !== 'text') return result(null, 0);
    return result(
      { kind: 'text', text: node.text },
      0.42,
      [{ status: 'ai-review-required', reason: 'low-parser-confidence', confidence: 0.42, page: node.page }],
    );
  }
}

export class ReadingParser implements DocumentNodeParser {
  supports(node: RawDocumentNode): boolean {
    return node.kind === 'text';
  }

  parse(node: RawDocumentNode, _context: Parameters<DocumentNodeParser['parse']>[1]): ParserResult<DocumentContentNode | null> {
    return node.kind === 'text' ? result({ kind: 'text', text: node.text }, node.confidence) : result(null, 0);
  }
}

export class OptionParser {
  parse(text: string, confidence: number): ParserResult<OptionObject | null> {
    const matched = text.match(/^\s*([A-Da-d])\s*[.)]\s*(.*)$/u);
    return matched
      ? { value: { id: matched[1].toUpperCase(), content: matched[2] }, confidence, reviewMarkers: [] }
      : { value: null, confidence: 0, reviewMarkers: [] };
  }
}

export class QuestionParser {
  parse(text: string, confidence: number): ParserResult<QuestionObject | null> {
    const matched = text.match(/^\s*Câu\s+(\d+)\s*[.:)]\s*(.*)$/i);
    return matched
      ? {
        value: { kind: 'question', questionType: 'choice', id: Number(matched[1]), question: matched[2], options: [], answer: [] },
        confidence,
        reviewMarkers: [],
      }
      : { value: null, confidence: 0, reviewMarkers: [] };
  }
}

export class QuestionGroupParser {
  isReadingPassage(text: string, context: ParserContext): boolean {
    return context.rules.match(text).some((match) => match.kind === 'reading-passage');
  }
}
