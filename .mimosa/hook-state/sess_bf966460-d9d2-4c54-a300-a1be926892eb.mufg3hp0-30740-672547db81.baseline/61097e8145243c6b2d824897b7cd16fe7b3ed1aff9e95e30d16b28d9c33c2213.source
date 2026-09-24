import { createHash, randomInt } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, relative, resolve, sep } from 'node:path';

export type DocumentCategory = 'docx' | 'pdf-text' | 'pdf-scan' | 'pdf-hybrid' | 'image' | 'json' | 'oml';

export interface CorpusMetadata {
  id: string;
  filename: string;
  extension: string;
  category: DocumentCategory;
  subject: string;
  sourceFolder: string;
  size: number;
  hash: string;
  lastModified: string;
}

export interface CorpusEntry extends CorpusMetadata {
  sourcePath: string;
  expectedQuestionObjectPath: string;
  expectedOmlPath: string;
}

export interface CorpusStatistics {
  total: number;
  byCategory: Record<DocumentCategory, number>;
  bySubject: Record<string, number>;
  missingGoldenResults: string[];
}

const supportedExtensions = new Set(['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.json', '.oml']);
const categoryFolderMap: Record<string, DocumentCategory> = { docx: 'docx', 'pdf-text': 'pdf-text', 'pdf-scan': 'pdf-scan', 'pdf-hybrid': 'pdf-hybrid', image: 'image', images: 'image', json: 'json', oml: 'oml' };
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const subjectAliases: Array<[RegExp, string]> = [
  [/\b(toan|math|mathematics)\b/i, 'toán'],
  [/\b(ly|vat[_ -]?li|physics)\b/i, 'vật lý'],
  [/\b(hoa|hoa[_ -]?hoc|chemistry)\b/i, 'hóa học'],
  [/\b(van|ngu[_ -]?van|literature)\b/i, 'ngữ văn'],
  [/\b(anh|english|eng)\b/i, 'tiếng anh'],
];

const emptyCategoryCounts = (): Record<DocumentCategory, number> => ({ docx: 0, 'pdf-text': 0, 'pdf-scan': 0, 'pdf-hybrid': 0, image: 0, json: 0, oml: 0 });

const readFilesRecursively = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? readFilesRecursively(path) : [path];
  }));
  return files.flat();
};

const toPortablePath = (path: string): string => path.split(sep).join('/');

export const detectSubject = (sourceFolder: string, filename: string): string => {
  const folders = toPortablePath(sourceFolder).split('/').filter(Boolean);
  const categoryIndex = folders.findIndex((folder) => folder in categoryFolderMap);
  const folderSubject = categoryIndex >= 0 ? folders[categoryIndex + 1] : undefined;
  if (folderSubject !== undefined) return folderSubject;
  const input = basename(filename, extname(filename));
  const alias = subjectAliases.find(([pattern]) => pattern.test(input));
  return alias?.[1] ?? 'unknown';
};

export const detectDocumentCategory = (sourceFolder: string, extension: string): DocumentCategory | undefined => {
  const folderSegments = toPortablePath(sourceFolder).split('/');
  const folderCategory = folderSegments.find((segment) => segment in categoryFolderMap);
  if (folderCategory !== undefined) return categoryFolderMap[folderCategory];
  if (extension === '.docx') return 'docx';
  if (imageExtensions.has(extension)) return 'image';
  if (extension === '.json') return 'json';
  if (extension === '.oml') return 'oml';
  return extension === '.pdf' ? 'pdf-text' : undefined;
};

const createMetadata = async (corpusRoot: string, sourcePath: string): Promise<CorpusMetadata | undefined> => {
  const extension = extname(sourcePath).toLocaleLowerCase();
  if (!supportedExtensions.has(extension)) return undefined;
  const relativePath = relative(corpusRoot, sourcePath);
  const sourceFolder = toPortablePath(relative(corpusRoot, relativePath === '' ? corpusRoot : join(corpusRoot, relativePath, '..')));
  const category = detectDocumentCategory(sourceFolder, extension);
  if (category === undefined) return undefined;
  const contents = await readFile(sourcePath);
  const fileStat = await stat(sourcePath);
  return {
    id: toPortablePath(relativePath).replace(/\.[^.]+$/, ''),
    filename: basename(sourcePath),
    extension: extension.slice(1),
    category,
    subject: detectSubject(sourceFolder, basename(sourcePath)),
    sourceFolder,
    size: fileStat.size,
    hash: createHash('sha256').update(contents).digest('hex'),
    lastModified: fileStat.mtime.toISOString(),
  };
};

export class CorpusManager {
  private readonly root: string;
  private readonly corpusRoot: string;
  private readonly expectedQuestionObjectRoot: string;
  private readonly expectedOmlRoot: string;

  constructor(root = process.cwd()) {
    this.root = resolve(root);
    this.corpusRoot = join(this.root, 'tests', 'corpus');
    this.expectedQuestionObjectRoot = join(this.root, 'tests', 'expected', 'question-object');
    this.expectedOmlRoot = join(this.root, 'tests', 'expected', 'oml');
  }

  async load(category?: DocumentCategory): Promise<CorpusEntry[]> {
    const files = await readFilesRecursively(this.corpusRoot);
    const scanned = await Promise.all(files.filter((file) => !file.endsWith('.gitkeep')).map(async (sourcePath) => ({ sourcePath, metadata: await createMetadata(this.corpusRoot, sourcePath) })));
    return scanned
      .filter((entry): entry is { sourcePath: string; metadata: CorpusMetadata } => entry.metadata !== undefined && (category === undefined || entry.metadata.category === category))
      .map(({ sourcePath, metadata }) => ({
        ...metadata,
        sourcePath,
        expectedQuestionObjectPath: join(this.expectedQuestionObjectRoot, `${metadata.id}.json`),
        expectedOmlPath: join(this.expectedOmlRoot, `${metadata.id}.json`),
      }))
      .sort((first, second) => first.id.localeCompare(second.id));
  }

  async statistics(): Promise<CorpusStatistics> {
    const entries = await this.load();
    const missingGoldenResults: string[] = [];
    for (const entry of entries) {
      try {
        await Promise.all([readFile(entry.expectedQuestionObjectPath), readFile(entry.expectedOmlPath)]);
      } catch {
        missingGoldenResults.push(entry.id);
      }
    }
    return {
      total: entries.length,
      byCategory: entries.reduce<Record<DocumentCategory, number>>((counts, entry) => ({ ...counts, [entry.category]: counts[entry.category] + 1 }), emptyCategoryCounts()),
      bySubject: entries.reduce<Record<string, number>>((counts, entry) => ({ ...counts, [entry.subject]: (counts[entry.subject] ?? 0) + 1 }), {}),
      missingGoldenResults,
    };
  }

  async selectRandom(count: number, category?: DocumentCategory): Promise<CorpusEntry[]> {
    const pool = [...await this.load(category)];
    const selected: CorpusEntry[] = [];
    while (pool.length > 0 && selected.length < count) selected.push(pool.splice(randomInt(pool.length), 1)[0]);
    return selected;
  }
}
