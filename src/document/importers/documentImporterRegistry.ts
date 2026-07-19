import type { DocumentImporter } from '../contracts';
import type { RawDocument } from '../../types/raw-document';
import { DocxImporter } from './docxImporter';
import { ImageImporter } from './imageImporter';
import { OmlImporter } from './omlImporter';
import { PdfImporter } from './pdfImporter';

const hasExtension = (file: File, extension: string): boolean => file.name.toLowerCase().endsWith(extension);

export class DocumentImporterRegistry {
  private readonly importers: Array<{ supports: (file: File) => boolean; importer: DocumentImporter<File> }>;

  constructor() {
    this.importers = [
      { supports: (file) => file.type === 'application/pdf' || hasExtension(file, '.pdf'), importer: new PdfImporter() },
      { supports: (file) => file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || hasExtension(file, '.docx'), importer: new DocxImporter() },
      { supports: (file) => file.type === 'application/json' || hasExtension(file, '.oml') || hasExtension(file, '.json'), importer: new OmlImporter() },
      { supports: (file) => file.type.startsWith('image/'), importer: new ImageImporter() },
    ];
  }

  async import(file: File): Promise<RawDocument> {
    const matched = this.importers.find(({ supports }) => supports(file));
    if (!matched) {
      throw new Error(`Unsupported document type: ${file.type || file.name}`);
    }

    return matched.importer.import(file);
  }
}
