/**
 * Validator — Stage 5 of the Compiler Pipeline.
 *
 * Validates each question node before emitting it.
 * On failure, uses a RecoveryStrategy rather than throwing.
 *
 * Validation checks & Recovery:
 * 1. Question id must be a positive integer.
 * 2. Stem must not be empty.
 * 3. Minimum 2 options, maximum 4.
 * 4. Option IDs must be A, B, C, D in order (strict) or A-B at minimum.
 * 5. Duplicate option recovery (e.g. A, A, C, D -> A, B, C, D).
 * 6. Multi-status reporting: PASS, PASS_WITH_RECOVERY, WARNING, FAIL.
 */
import type { DocumentGraph, GraphNode, GraphQuestion, GraphReadingPassage } from './questionGraphBuilder.ts';
import type { SemanticOption } from './semanticAnalyzer.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecoveryStrategy = 'commit' | 'rollback-to-paragraph' | 'skip';
export type ValidationStatus = 'PASS' | 'PASS_WITH_RECOVERY' | 'WARNING' | 'FAIL';

export interface ValidationError {
  code: string;
  message: string;
}

export interface ValidatedQuestion extends GraphQuestion {
  validationErrors: ValidationError[];
  isRecovered?: boolean;
  recoveryType?: string;
}

export interface ValidationDiagnostics {
  status: ValidationStatus;
  averageConfidence: number;
  lowestConfidenceQuestion?: { id: number; confidence: number };
  recoveredQuestionCount: number;
  recoveredOptionCount: number;
  recoveryTypes: string[];
  warningCount: number;
}

export interface ValidationResult {
  graph: DocumentGraph;
  diagnostics: ValidationDiagnostics;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const RE_QUESTION_MARKER_IN_OPTION = /(?:\bCâu\s+\d+\b|\bQuestion\s+\d+\b)/iu;
const VALID_OPTION_SEQUENCE = ['A', 'B', 'C', 'D'];

const attemptOptionRecovery = (
  question: GraphQuestion,
): { recovered: boolean; recoveredOptions: SemanticOption[]; recoveryType?: string } => {
  const options = [...question.options];
  const ids = options.map((o) => o.id);
  const expectedSlice = VALID_OPTION_SEQUENCE.slice(0, ids.length);

  // Check for duplicate options (e.g. ['A', 'A', 'C', 'D'] or ['A', 'B', 'C', 'C'])
  const idCounts = new Map<string, number>();
  for (const id of ids) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);

  const duplicates = Array.from(idCounts.entries()).filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    // Attempt duplicate option repair
    const missing = expectedSlice.filter((exp) => !ids.includes(exp));
    if (missing.length === 1 && duplicates.length === 1) {
      const targetDup = duplicates[0][0];
      const missingId = missing[0];

      // Fix the second occurrence of targetDup to missingId
      let dupIndex = -1;
      let firstFound = false;
      for (let i = 0; i < options.length; i += 1) {
        if (options[i].id === targetDup) {
          if (!firstFound) firstFound = true;
          else {
            dupIndex = i;
            break;
          }
        }
      }

      if (dupIndex !== -1) {
        options[dupIndex] = {
          ...options[dupIndex],
          id: missingId,
          confidence: Math.min(options[dupIndex].confidence ?? 0.70, 0.65),
          isFuzzy: true,
        };
        return { recovered: true, recoveredOptions: options, recoveryType: 'duplicate-option-repaired' };
      }
    }
  }

  // Check for wrong order (e.g., ['A', 'C', 'B', 'D'])
  if (ids.length >= 2 && ids.some((id, i) => id !== expectedSlice[i])) {
    const isSubsetOfValid = ids.every((id) => VALID_OPTION_SEQUENCE.includes(id));
    if (isSubsetOfValid && new Set(ids).size === ids.length) {
      // Re-sort options into standard A, B, C, D order
      options.sort((a, b) => VALID_OPTION_SEQUENCE.indexOf(a.id) - VALID_OPTION_SEQUENCE.indexOf(b.id));
      return { recovered: true, recoveredOptions: options, recoveryType: 'option-order-reordered' };
    }
  }

  return { recovered: false, recoveredOptions: question.options };
};

const validateQuestion = (
  rawQuestion: GraphQuestion,
  seenIds: Set<number>,
): {
  valid: boolean;
  errors: ValidationError[];
  strategy: RecoveryStrategy;
  question: GraphQuestion;
  recovered: boolean;
  recoveryType?: string;
} => {
  let question = rawQuestion;
  let recovered = false;
  let recoveryType: string | undefined;

  // Attempt Option Recovery before validation
  const recoveryResult = attemptOptionRecovery(question);
  if (recoveryResult.recovered) {
    recovered = true;
    recoveryType = recoveryResult.recoveryType;
    question = {
      ...question,
      options: recoveryResult.recoveredOptions,
      confidence: Math.round(Math.min(question.confidence, 0.75) * 100) / 100,
    };
  }

  const errors: ValidationError[] = [];

  if (question.id <= 0 || !Number.isFinite(question.id)) {
    errors.push({ code: 'INVALID_ID', message: `Question id ${question.id} is not a positive integer` });
  }

  if (seenIds.has(question.id)) {
    errors.push({ code: 'DUPLICATE_ID', message: `Duplicate question id ${question.id}` });
    return { valid: false, errors, strategy: 'skip', question, recovered: false };
  }

  if (!question.stem || question.stem.trim().length === 0) {
    errors.push({ code: 'MISSING_STEM', message: `Question ${question.id} has no stem` });
  }

  const isChoiceQuestion = question.subType === 'choice' || question.subType === 'true-false' || (question.options && question.options.length >= 2);

  if (isChoiceQuestion) {
    if (question.options.length < 2) {
      errors.push({ code: 'TOO_FEW_OPTIONS', message: `Question ${question.id} has ${question.options.length} options (min 2)` });
      return { valid: false, errors, strategy: 'rollback-to-paragraph', question, recovered: false };
    }

    const ids = question.options.map((o) => o.id);
    const expectedSlice = VALID_OPTION_SEQUENCE.slice(0, ids.length);
    if (ids.some((id, i) => id !== expectedSlice[i])) {
      errors.push({ code: 'BAD_OPTION_ORDER', message: `Question ${question.id} options not in A-B-C-D order: ${ids.join(',')}` });
    }

    for (const opt of question.options) {
      if (!opt.content || opt.content.trim().length === 0) {
        errors.push({ code: 'EMPTY_OPTION', message: `Question ${question.id} option ${opt.id} is empty` });
      }
      if (RE_QUESTION_MARKER_IN_OPTION.test(opt.content)) {
        errors.push({ code: 'PASSAGE_IN_OPTION', message: `Question ${question.id} option ${opt.id} appears to contain a passage` });
      }
    }
  }

  const hardFail = errors.some((e) =>
    ['DUPLICATE_ID', 'TOO_FEW_OPTIONS', 'MISSING_STEM'].includes(e.code),
  );

  return {
    valid: !hardFail,
    errors,
    strategy: hardFail ? 'rollback-to-paragraph' : 'commit',
    question,
    recovered,
    recoveryType,
  };
};

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

export class Validator {
  validate(graph: DocumentGraph): ValidationResult {
    const seenIds = new Set<number>();
    const nodes: GraphNode[] = [];
    const recoveryTypes = new Set<string>();
    let recoveredQuestionCount = 0;
    let recoveredOptionCount = 0;
    let warningCount = 0;
    const questionConfidences: Array<{ id: number; confidence: number }> = [];

    const processQuestionNode = (q: GraphQuestion): GraphNode | null => {
      const result = validateQuestion(q, seenIds);
      if (result.strategy === 'skip') return null;
      if (result.strategy === 'rollback-to-paragraph') {
        const text = `Câu ${q.id}. ${q.stem ?? ''}`.trim();
        return { kind: 'paragraph', text, page: q.page };
      }

      seenIds.add(result.question.id);
      questionConfidences.push({ id: result.question.id, confidence: result.question.confidence });

      if (result.errors.length > 0) {
        warningCount += result.errors.length;
      }

      if (result.recovered) {
        recoveredQuestionCount += 1;
        recoveredOptionCount += 1;
        if (result.recoveryType) recoveryTypes.add(result.recoveryType);
      }

      return result.question;
    };

    for (const node of graph.nodes) {
      if (node.kind === 'question') {
        const processed = processQuestionNode(node);
        if (processed !== null) nodes.push(processed);
        continue;
      }

      if (node.kind === 'reading') {
        const validatedGroup = this.validateGroup(node, seenIds, (_recovered, type, q) => {
          recoveredQuestionCount += 1;
          recoveredOptionCount += 1;
          if (type) recoveryTypes.add(type);
          questionConfidences.push({ id: q.id, confidence: q.confidence });
        });
        nodes.push(validatedGroup);
        continue;
      }

      nodes.push(node);
    }

    const totalConf = questionConfidences.reduce((sum, item) => sum + item.confidence, 0);
    const averageConfidence = questionConfidences.length > 0
      ? Math.round((totalConf / questionConfidences.length) * 100) / 100
      : 1.0;

    let lowestConfidenceQuestion: { id: number; confidence: number } | undefined;
    if (questionConfidences.length > 0) {
      lowestConfidenceQuestion = questionConfidences.reduce((min, curr) =>
        curr.confidence < min.confidence ? curr : min,
      );
    }

    let status: ValidationStatus = 'PASS';
    if (recoveredQuestionCount > 0) {
      status = 'PASS_WITH_RECOVERY';
    } else if (warningCount > 0 || averageConfidence < 0.85) {
      status = 'WARNING';
    }

    return {
      graph: { nodes },
      diagnostics: {
        status,
        averageConfidence,
        lowestConfidenceQuestion,
        recoveredQuestionCount,
        recoveredOptionCount,
        recoveryTypes: Array.from(recoveryTypes),
        warningCount,
      },
    };
  }

  private validateGroup(
    group: GraphReadingPassage,
    seenIds: Set<number>,
    onRecovery: (recovered: boolean, recoveryType: string | undefined, question: GraphQuestion) => void,
  ): GraphReadingPassage {
    const validQuestions: GraphQuestion[] = [];
    for (const q of group.questions) {
      const result = validateQuestion(q, seenIds);
      if (result.strategy === 'skip' || result.strategy === 'rollback-to-paragraph') continue;
      seenIds.add(result.question.id);
      if (result.recovered) {
        onRecovery(true, result.recoveryType, result.question);
      }
      validQuestions.push(result.question);
    }
    return { ...group, questions: validQuestions };
  }
}
