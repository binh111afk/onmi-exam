import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { OmlDocumentV2 } from '../../src/types/oml.ts';
import type { QuestionDocument } from '../../src/types/question-object.ts';
import type { CorpusEntry } from './corpusManager.ts';

export interface GoldenResult {
  status: 'available' | 'missing';
  questionObject?: QuestionDocument;
  oml?: OmlDocumentV2;
}

const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T;

export class GoldenManager {
  async load(entry: CorpusEntry): Promise<GoldenResult> {
    try {
      await Promise.all([access(entry.expectedQuestionObjectPath), access(entry.expectedOmlPath)]);
      return {
        status: 'available',
        questionObject: await readJson<QuestionDocument>(entry.expectedQuestionObjectPath),
        oml: await readJson<OmlDocumentV2>(entry.expectedOmlPath),
      };
    } catch {
      return { status: 'missing' };
    }
  }

  async update(entry: CorpusEntry, result: { questionObject: QuestionDocument; oml: OmlDocumentV2 }, updateGolden: boolean): Promise<void> {
    if (!updateGolden) throw new Error(`Golden update for ${entry.id} requires --update-golden.`);
    await Promise.all([
      mkdir(dirname(entry.expectedQuestionObjectPath), { recursive: true }),
      mkdir(dirname(entry.expectedOmlPath), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(entry.expectedQuestionObjectPath, JSON.stringify(result.questionObject, null, 2)),
      writeFile(entry.expectedOmlPath, JSON.stringify(result.oml, null, 2)),
    ]);
  }
}
