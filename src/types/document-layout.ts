import type { RawDocumentKind } from './raw-document';

export type LayoutNodeType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'image'
  | 'table'
  | 'formula'
  | 'caption'
  | 'question-candidate'
  | 'option-candidate'
  | 'reading-candidate'
  | 'explanation-candidate'
  | 'unknown';

export interface LayoutBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentLayoutNode {
  id: string;
  rawNodeIndex?: number;
  page: number;
  boundingBox: LayoutBoundingBox;
  hasMeasuredGeometry: boolean;
  readingOrder: number;
  type: LayoutNodeType;
  text?: string;
  confidence: number;
}

export interface DocumentLayoutPage {
  page: number;
  nodes: DocumentLayoutNode[];
}

export type OcrPlanAction = 'no-ocr' | 'text-ocr' | 'math-ocr' | 'ai-review';

export interface OcrPlanItem {
  nodeId: string;
  action: OcrPlanAction;
  reason: string;
  confidence: number;
}

export interface DocumentLayout {
  version: '1.0';
  sourceKind: RawDocumentKind;
  pages: DocumentLayoutPage[];
  nodes: DocumentLayoutNode[];
  ocrPlan: OcrPlanItem[];
}
