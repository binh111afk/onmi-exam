import type { DocumentImporter } from '../contracts';
import type { RawDocument } from '../../types/raw-document';

export class ImageImporter implements DocumentImporter<File> {
  async import(file: File): Promise<RawDocument> {
    const image = await createImageBitmap(file);
    try {
      return {
        version: '1.0',
        source: { name: file.name, mimeType: file.type || 'image/*', kind: 'image' },
        nodes: [{ kind: 'image', src: URL.createObjectURL(file), alt: file.name, page: 1, boundingBox: [0, 0, image.width, image.height], confidence: 1 }],
        ocrRequirement: 'required',
        ocrCandidates: [{ reason: 'image-document' }],
        reviewMarkers: [{ status: 'ai-review-required', reason: 'ocr-required' }],
      };
    } finally {
      image.close();
    }
  }
}
