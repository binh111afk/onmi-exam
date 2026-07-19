export type RawDocumentKind = 'docx' | 'pdf' | 'image' | 'oml';

export type OcrRequirement = 'not-required' | 'required' | 'partial';

export interface OcrCandidate {
  page?: number;
  reason: 'image-document' | 'page-without-text-layer' | 'uncovered-pdf-region';
}

export interface RawDocumentReviewMarker {
  status: 'ai-review-required';
  reason: 'ocr-required' | 'low-parser-confidence' | 'unsupported-structure';
  page?: number;
  confidence?: number;
}

export interface RawDocumentSource {
  name: string;
  mimeType: string;
  kind: RawDocumentKind;
}

export interface RawNodeBase {
  page?: number;
  boundingBox?: [number, number, number, number];
  confidence: number;
}

export interface RawTextNode extends RawNodeBase {
  kind: 'text';
  text: string;
  style?: 'heading' | 'paragraph';
  headingLevel?: 1 | 2 | 3;
  numbering?: string;
}

export interface RawTableNode extends RawNodeBase {
  kind: 'table';
  rows: string[][];
}

export interface RawImageNode extends RawNodeBase {
  kind: 'image';
  src: string;
  alt?: string;
}

export interface RawSerializedNode extends RawNodeBase {
  kind: 'serialized';
  format: 'oml';
  value: string;
}

export type RawDocumentNode = RawTextNode | RawTableNode | RawImageNode | RawSerializedNode;

export interface RawDocument {
  version: '1.0';
  source: RawDocumentSource;
  nodes: RawDocumentNode[];
  ocrRequirement: OcrRequirement;
  ocrCandidates: OcrCandidate[];
  reviewMarkers: RawDocumentReviewMarker[];
}
