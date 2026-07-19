import type {
  OmlCalloutBlock,
  OmlContentBlock,
  OmlDocumentV2,
  OmlFormulaBlock,
  OmlImageBlock,
  OmlListBlock,
  OmlQuestionBlock,
  OmlQuestionGroupBlock,
  OmlTableBlock,
} from '../../types/oml';
import type {
  DocumentContentNode,
  DocumentMetadata,
  FutureQuestionObject,
  ImageNode,
  QuestionDocument,
  QuestionGroupNode,
  QuestionObject,
} from '../../types/question-object';
import type { OmlGenerator } from '../contracts';

const toMetadata = (info: OmlDocumentV2['info']): DocumentMetadata => ({ ...info });

const toImageNode = (image: OmlImageBlock): ImageNode => ({
  kind: 'image',
  src: image.src,
  alt: image.alt,
  caption: image.caption,
  size: image.size,
});

const toQuestionObject = (question: OmlQuestionBlock): QuestionObject => {
  const image = question.image
    ? { kind: 'image' as const, ...question.image }
    : undefined;

  if (question.subType === 'fill-blank') {
    return {
      kind: 'question',
      questionType: 'fill-blank',
      id: question.id,
      question: question.question,
      points: question.points,
      difficulty: question.difficulty,
      tags: question.tags,
      image,
      explanation: question.explanation,
      answer: question.answer,
      unit: question.unit,
      units: question.units,
      showAnswer: question.showAnswer,
    };
  }

  return {
    kind: 'question',
    questionType: question.subType === 'true-false' ? 'true-false' : 'choice',
    id: question.id,
    question: question.question,
    points: question.points,
    difficulty: question.difficulty,
    tags: question.tags,
    image,
    explanation: question.explanation,
    options: question.options,
    answer: question.answer,
  };
};

const toDocumentNode = (block: OmlContentBlock): DocumentContentNode => {
  switch (block.type) {
    case 'heading': {
      const heading = block as Extract<OmlContentBlock, { type: 'heading' }>;
      return { kind: 'heading', level: heading.level, text: heading.text };
    }
    case 'paragraph': {
      const paragraph = block as Extract<OmlContentBlock, { type: 'paragraph' }>;
      return { kind: 'text', text: paragraph.text };
    }
    case 'divider':
      return { kind: 'divider' };
    case 'quote': {
      const quote = block as Extract<OmlContentBlock, { type: 'quote' }>;
      return { kind: 'quote', text: quote.text, cite: quote.cite };
    }
    case 'callout': {
      const callout = block as OmlCalloutBlock;
      return { kind: 'callout', variant: callout.variant ?? 'info', title: callout.title, content: callout.content };
    }
    case 'image':
      return toImageNode(block as OmlImageBlock);
    case 'image-group':
      return { kind: 'legacy-oml', block: block as unknown as Record<string, unknown> };
    case 'formula': {
      const formula = block as OmlFormulaBlock;
      return { kind: 'formula', latex: formula.latex, display: formula.display ?? 'block' };
    }
    case 'table': {
      const table = block as OmlTableBlock;
      return { kind: 'table', caption: table.caption, headers: table.headers, rows: table.rows };
    }
    case 'list': {
      const list = block as OmlListBlock;
      return { kind: 'list', ordered: list.ordered ?? false, items: list.items };
    }
    case 'question':
      return toQuestionObject(block as OmlQuestionBlock);
    case 'question-group': {
      const group = block as OmlQuestionGroupBlock;
      return {
        kind: 'question-group',
        id: group.id,
        context: group.context.map(toDocumentNode),
        questions: group.questions.map(toQuestionObject),
      };
    }
    default:
      return { kind: 'legacy-oml', block: block as Record<string, unknown> };
  }
};

export const omlToQuestionDocument = (document: OmlDocumentV2): QuestionDocument => ({
  version: '1.0',
  metadata: toMetadata(document.info),
  content: document.content.map(toDocumentNode),
});

const toOmlQuestion = (question: QuestionObject): OmlQuestionBlock => {
  if (question.questionType === 'fill-blank') {
    return {
      type: 'question',
      subType: 'fill-blank',
      id: question.id ?? '',
      question: question.question,
      points: question.points,
      difficulty: question.difficulty,
      tags: question.tags,
      image: question.image,
      explanation: question.explanation,
      answer: question.answer,
      unit: question.unit,
      units: question.units,
      showAnswer: question.showAnswer,
    };
  }

  if (question.questionType === 'essay' || question.questionType === 'matching' || question.questionType === 'ordering') {
    const unsupported = question as FutureQuestionObject;
    throw new Error(`Question type "${unsupported.questionType}" does not have an OML v2 representation yet.`);
  }

  if (!('options' in question) || !('answer' in question)) {
    throw new Error(`Question type "${question.questionType}" does not have an OML v2 representation yet.`);
  }

  return {
    type: 'question',
    subType: question.questionType,
    id: question.id ?? '',
    question: question.question,
    points: question.points,
    difficulty: question.difficulty,
    tags: question.tags,
    image: question.image,
    explanation: question.explanation,
    options: question.options,
    answer: question.answer,
  };
};

const toOmlBlock = (node: DocumentContentNode): OmlContentBlock | OmlContentBlock[] => {
  switch (node.kind) {
    case 'heading': return { type: 'heading', level: node.level, text: node.text };
    case 'text': return { type: 'paragraph', text: node.text };
    case 'divider': return { type: 'divider' };
    case 'quote': return { type: 'quote', text: node.text, cite: node.cite };
    case 'callout': return { type: 'callout', variant: node.variant, title: node.title, content: node.content };
    case 'image': return { type: 'image', src: node.src, alt: node.alt, caption: node.caption, size: node.size };
    case 'formula': return { type: 'formula', latex: node.latex, display: node.display };
    case 'table': return { type: 'table', caption: node.caption, headers: node.headers, rows: node.rows };
    case 'list': return { type: 'list', ordered: node.ordered, items: node.items };
    case 'question': return toOmlQuestion(node);
    case 'question-group': {
      const group = node as QuestionGroupNode;
      return {
        type: 'question-group',
        id: group.id ?? '',
        context: group.context.flatMap(toOmlBlock).filter((block): block is Exclude<OmlContentBlock, OmlQuestionBlock | OmlQuestionGroupBlock> => (
          block.type !== 'question' && block.type !== 'question-group'
        )),
        questions: group.questions.map(toOmlQuestion),
      };
    }
    case 'section': return node.children.flatMap(toOmlBlock);
    case 'legacy-oml': return node.block as OmlContentBlock;
  }
};

export const questionDocumentToOml = (document: QuestionDocument): OmlDocumentV2 => ({
  version: '2.0',
  info: { ...document.metadata },
  content: document.content.flatMap(toOmlBlock),
});

export const questionObjectOmlGenerator: OmlGenerator = {
  generate: questionDocumentToOml,
};
