import type { DocumentImporter } from '../contracts';
import type { RawDocument } from '../../types/raw-document';

export class OmlImporter implements DocumentImporter<File> {
  async import(file: File): Promise<RawDocument> {
    return {
      version: '1.0',
      source: { name: file.name, mimeType: file.type || 'application/json', kind: 'oml' },
      nodes: [{ kind: 'serialized', format: 'oml', value: await file.text(), confidence: 1 }],
      ocrRequirement: 'not-required',
      ocrCandidates: [],
      reviewMarkers: [],
    };
  }
}
