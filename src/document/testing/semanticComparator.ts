import type { OmlContentBlock, OmlDocumentV2, OmlQuestionBlock } from '../../types/oml';
import type { DocumentContentNode, QuestionDocument, QuestionObject } from '../../types/question-object';

export interface SemanticDiff {
  path: string;
  expected: unknown;
  actual: unknown;
  message: string;
}

export interface SemanticComparison {
  equal: boolean;
  differences: SemanticDiff[];
}

export interface DocumentAccuracy {
  question: AccuracyScore;
  option: AccuracyScore;
  readingGroup: AccuracyScore;
  image: AccuracyScore;
  table: AccuracyScore;
  formula: AccuracyScore;
}

export interface AccuracyScore {
  expected: number;
  actual: number;
  matched: number;
  precision: number;
  recall: number;
}

type SemanticValue = null | boolean | number | string | SemanticValue[] | { [key: string]: SemanticValue };

const ignoredKeys = new Set(['id', 'source', 'reviewMarkers', 'createdAt', 'updatedAt', 'timestamp']);

const normalizeText = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const normalizeSemanticValue = (value: unknown): SemanticValue => {
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return normalizeText(value);
  if (Array.isArray(value)) return value.map(normalizeSemanticValue);
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !ignoredKeys.has(key))
      .sort(([first], [second]) => first.localeCompare(second))
      .reduce<Record<string, SemanticValue>>((normalized, [key, child]) => {
        normalized[key] = normalizeSemanticValue(child);
        return normalized;
      }, {});
  }
  return String(value);
};

const compareValues = (expected: SemanticValue, actual: SemanticValue, path: string, differences: SemanticDiff[]): void => {
  if (typeof expected !== typeof actual || Array.isArray(expected) !== Array.isArray(actual)) {
    differences.push({ path, expected, actual, message: 'Different value type' });
    return;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) differences.push({ path, expected: expected.length, actual: actual.length, message: 'Different item count' });
    const length = Math.max(expected.length, actual.length);
    for (let index = 0; index < length; index += 1) {
      if (expected[index] === undefined || actual[index] === undefined) continue;
      compareValues(expected[index], actual[index], `${path}[${index}]`, differences);
    }
    return;
  }
  if (typeof expected === 'object' && expected !== null && actual !== null) {
    const expectedRecord = expected as Record<string, SemanticValue>;
    const actualRecord = actual as Record<string, SemanticValue>;
    const keys = new Set([...Object.keys(expectedRecord), ...Object.keys(actualRecord)]);
    keys.forEach((key) => {
      if (!(key in expectedRecord) || !(key in actualRecord)) {
        differences.push({ path: `${path}.${key}`, expected: expectedRecord[key], actual: actualRecord[key], message: 'Missing property' });
        return;
      }
      compareValues(expectedRecord[key], actualRecord[key], `${path}.${key}`, differences);
    });
    return;
  }
  if (expected !== actual) differences.push({ path, expected, actual, message: 'Different value' });
};

export const compareSemantically = (expected: unknown, actual: unknown): SemanticComparison => {
  const differences: SemanticDiff[] = [];
  compareValues(normalizeSemanticValue(expected), normalizeSemanticValue(actual), '$', differences);
  return { equal: differences.length === 0, differences };
};

const flattenDocumentNodes = (nodes: DocumentContentNode[]): DocumentContentNode[] => nodes.flatMap((node) => {
  if (node.kind === 'question-group') return [node, ...flattenDocumentNodes([...node.context, ...node.questions])];
  if (node.kind === 'section') return [node, ...flattenDocumentNodes(node.children)];
  return [node];
});

const questionSignature = (question: QuestionObject): string => normalizeText(question.question).toLocaleLowerCase();
const optionSignature = (question: QuestionObject): string[] => 'options' in question ? question.options.map((option) => normalizeText(option.content).toLocaleLowerCase()) : [];

const score = (expectedItems: string[], actualItems: string[]): AccuracyScore => {
  const remaining = new Set(actualItems);
  const matched = expectedItems.reduce((count, item) => {
    if (!remaining.has(item)) return count;
    remaining.delete(item);
    return count + 1;
  }, 0);
  return {
    expected: expectedItems.length,
    actual: actualItems.length,
    matched,
    precision: actualItems.length === 0 ? (expectedItems.length === 0 ? 1 : 0) : matched / actualItems.length,
    recall: expectedItems.length === 0 ? 1 : matched / expectedItems.length,
  };
};

const nodeSignatures = (document: QuestionDocument, kind: DocumentContentNode['kind']): string[] => flattenDocumentNodes(document.content)
  .filter((node) => node.kind === kind)
  .map((node) => {
    if (node.kind === 'image') return normalizeText(`${node.src}|${node.caption ?? ''}`);
    if (node.kind === 'table') return normalizeText(`${node.caption ?? ''}|${node.rows.flat().join('|')}`);
    if (node.kind === 'formula') return normalizeText(node.latex);
    if (node.kind === 'question-group') return normalizeText(node.context.map((item) => item.kind).join('|'));
    return node.kind;
  });

export const measureDocumentAccuracy = (expected: QuestionDocument, actual: QuestionDocument): DocumentAccuracy => {
  const expectedNodes = flattenDocumentNodes(expected.content);
  const actualNodes = flattenDocumentNodes(actual.content);
  const expectedQuestions = expectedNodes.filter((node): node is QuestionObject => node.kind === 'question');
  const actualQuestions = actualNodes.filter((node): node is QuestionObject => node.kind === 'question');
  return {
    question: score(expectedQuestions.map(questionSignature), actualQuestions.map(questionSignature)),
    option: score(expectedQuestions.flatMap(optionSignature), actualQuestions.flatMap(optionSignature)),
    readingGroup: score(nodeSignatures(expected, 'question-group'), nodeSignatures(actual, 'question-group')),
    image: score(nodeSignatures(expected, 'image'), nodeSignatures(actual, 'image')),
    table: score(nodeSignatures(expected, 'table'), nodeSignatures(actual, 'table')),
    formula: score(nodeSignatures(expected, 'formula'), nodeSignatures(actual, 'formula')),
  };
};

const normalizeOmlBlock = (block: OmlContentBlock): SemanticValue => normalizeSemanticValue(block);

export const normalizeOmlDocument = (document: OmlDocumentV2): SemanticValue => ({
  version: document.version,
  info: normalizeSemanticValue(document.info),
  content: document.content.map(normalizeOmlBlock),
});

export const compareOmlSemantically = (expected: OmlDocumentV2, actual: OmlDocumentV2): SemanticComparison => compareSemantically(normalizeOmlDocument(expected), normalizeOmlDocument(actual));

export const countOmlQuestions = (blocks: OmlContentBlock[]): number => blocks.reduce((count, block) => {
  if (block.type === 'question-group') return count + block.questions.length;
  return block.type === 'question' ? count + 1 : count;
}, 0);

export const questionBlockSignature = (question: OmlQuestionBlock): string => normalizeText(question.question).toLocaleLowerCase();
