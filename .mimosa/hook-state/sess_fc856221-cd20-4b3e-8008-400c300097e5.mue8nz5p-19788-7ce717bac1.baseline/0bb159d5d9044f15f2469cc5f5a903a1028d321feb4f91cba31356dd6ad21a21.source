import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DocumentRegressionSnapshot } from '../../src/document/testing/documentRegressionRunner.ts';

export class SnapshotManager {
  private readonly root: string;

  constructor(root = process.cwd()) {
    this.root = root;
  }

  async save(snapshot: DocumentRegressionSnapshot, report: string, timestamp = new Date().toISOString()): Promise<string> {
    const safeTimestamp = timestamp.replace(/[:.]/g, '-');
    const path = join(this.root, 'tests', 'snapshots', snapshot.id, `${safeTimestamp}.json`);
    await mkdir(join(this.root, 'tests', 'snapshots', snapshot.id), { recursive: true });
    await writeFile(path, JSON.stringify({ timestamp, ...snapshot, report }, null, 2));
    return path;
  }
}
