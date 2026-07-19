import type { DocumentImporter } from '../contracts';
import type { RawDocument, RawDocumentNode } from '../../types/raw-document';

const ZIP_END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const ZIP_CENTRAL_DIRECTORY_ENTRY = 0x02014b50;
const ZIP_LOCAL_FILE_HEADER = 0x04034b50;

const getAttribute = (element: Element, localName: string): string | null => (
  element.getAttribute(`w:${localName}`) ?? element.getAttribute(localName)
);

const readUInt16 = (view: DataView, offset: number): number => view.getUint16(offset, true);
const readUInt32 = (view: DataView, offset: number): number => view.getUint32(offset, true);

const toBlobPart = (bytes: Uint8Array): ArrayBuffer => (
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
);

const decompress = async (bytes: Uint8Array, compressionMethod: number): Promise<Uint8Array> => {
  if (compressionMethod === 0) return bytes;
  if (compressionMethod !== 8) throw new Error(`Unsupported DOCX ZIP compression method: ${compressionMethod}`);

  const decompressed = new Blob([toBlobPart(bytes)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(decompressed).arrayBuffer());
};

const readZipEntries = async (file: File): Promise<Map<string, Uint8Array>> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let endOffset = -1;

  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (readUInt32(view, offset) === ZIP_END_OF_CENTRAL_DIRECTORY) {
      endOffset = offset;
      break;
    }
  }

  if (endOffset < 0) throw new Error('Invalid DOCX archive: end-of-central-directory record is missing.');

  const entryCount = readUInt16(view, endOffset + 10);
  let centralOffset = readUInt32(view, endOffset + 16);
  const entries = new Map<string, Uint8Array>();
  const decoder = new TextDecoder();

  for (let index = 0; index < entryCount; index += 1) {
    if (readUInt32(view, centralOffset) !== ZIP_CENTRAL_DIRECTORY_ENTRY) {
      throw new Error('Invalid DOCX archive: central-directory entry is malformed.');
    }

    const compressionMethod = readUInt16(view, centralOffset + 10);
    const compressedSize = readUInt32(view, centralOffset + 20);
    const nameLength = readUInt16(view, centralOffset + 28);
    const extraLength = readUInt16(view, centralOffset + 30);
    const commentLength = readUInt16(view, centralOffset + 32);
    const localOffset = readUInt32(view, centralOffset + 42);
    const name = decoder.decode(bytes.subarray(centralOffset + 46, centralOffset + 46 + nameLength));

    if (readUInt32(view, localOffset) !== ZIP_LOCAL_FILE_HEADER) {
      throw new Error(`Invalid DOCX archive: local file header is missing for ${name}.`);
    }

    const localNameLength = readUInt16(view, localOffset + 26);
    const localExtraLength = readUInt16(view, localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
    entries.set(name, await decompress(compressed, compressionMethod));

    centralOffset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
};

const parseXml = (bytes: Uint8Array): XMLDocument => new DOMParser().parseFromString(new TextDecoder().decode(bytes), 'application/xml');

const textFromParagraph = (paragraph: Element): string => Array.from(paragraph.getElementsByTagNameNS('*', 't'))
  .map((node) => node.textContent ?? '')
  .join('')
  .trim();

export class DocxImporter implements DocumentImporter<File> {
  async import(file: File): Promise<RawDocument> {
    const entries = await readZipEntries(file);
    const documentEntry = entries.get('word/document.xml');
    if (!documentEntry) throw new Error('Invalid DOCX file: word/document.xml is missing.');

    const relationshipEntry = entries.get('word/_rels/document.xml.rels');
    const relationships = new Map<string, string>();
    if (relationshipEntry) {
      const relationshipXml = parseXml(relationshipEntry);
      Array.from(relationshipXml.getElementsByTagName('Relationship')).forEach((relationship) => {
        const id = relationship.getAttribute('Id');
        const target = relationship.getAttribute('Target');
        if (id && target) relationships.set(id, target.replace(/^\.\.\//, ''));
      });
    }

    const nodes: RawDocumentNode[] = [];
    const documentXml = parseXml(documentEntry);
    const body = documentXml.getElementsByTagNameNS('*', 'body')[0];
    if (!body) throw new Error('Invalid DOCX file: document body is missing.');

    Array.from(body.children).forEach((element) => {
      const localName = element.localName;
      if (localName === 'p') {
        const text = textFromParagraph(element);
        if (text) {
          const style = element.getElementsByTagNameNS('*', 'pStyle')[0];
          const styleName = style ? getAttribute(style, 'val') : null;
          const headingMatch = styleName?.match(/^Heading([1-3])$/i);
          const numbering = element.getElementsByTagNameNS('*', 'numPr').length > 0 ? 'word-numbering' : undefined;
          nodes.push({
            kind: 'text',
            text,
            confidence: 1,
            style: headingMatch ? 'heading' : 'paragraph',
            headingLevel: headingMatch ? Number(headingMatch[1]) as 1 | 2 | 3 : undefined,
            numbering,
          });
        }

        Array.from(element.getElementsByTagNameNS('*', 'blip')).forEach((blip) => {
          const relationshipId = blip.getAttribute('r:embed') ?? blip.getAttribute('embed');
          const target = relationshipId ? relationships.get(relationshipId) : undefined;
          if (!target) return;
          const entryName = target.startsWith('word/') ? target : `word/${target}`;
          const imageBytes = entries.get(entryName);
          if (!imageBytes) return;
          nodes.push({ kind: 'image', src: URL.createObjectURL(new Blob([toBlobPart(imageBytes)])), confidence: 1 });
        });
      }

      if (localName === 'tbl') {
        const rows = Array.from(element.getElementsByTagNameNS('*', 'tr')).map((row) => (
          Array.from(row.getElementsByTagNameNS('*', 'tc')).map((cell) => textFromParagraph(cell))
        ));
        nodes.push({ kind: 'table', rows, confidence: 1 });
      }
    });

    return {
      version: '1.0',
      source: { name: file.name, mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'docx' },
      nodes,
      ocrRequirement: 'not-required',
      ocrCandidates: [],
      reviewMarkers: [],
    };
  }
}
