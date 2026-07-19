import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { questionDocumentToOml } from '../../src/document/adapters/omlQuestionObjectAdapter.ts';
import { compareOmlSemantically } from '../../src/document/testing/semanticComparator.ts';
import { CorpusManager, type CorpusEntry } from './corpusManager.ts';
import { GoldenManager } from './goldenManager.ts';

type Command = 'document' | 'benchmark' | 'corpus' | 'parser';

interface FixtureOutcome {
  entry: CorpusEntry;
  omlEqual: boolean;
  differences: string[];
  status: 'pass' | 'missing-golden' | 'fail';
}

const root = process.cwd();
const reportsDirectory = join(root, 'tests', 'reports');

const evaluateFixture = async (entry: CorpusEntry): Promise<FixtureOutcome> => {
  const golden = await new GoldenManager().load(entry);
  if (golden.status === 'missing' || golden.questionObject === undefined || golden.oml === undefined) {
    return { entry, omlEqual: false, differences: ['Missing Golden'], status: 'missing-golden' };
  }
  const generatedOml = questionDocumentToOml(golden.questionObject);
  const oml = compareOmlSemantically(golden.oml, generatedOml);
  return {
    entry,
    omlEqual: oml.equal,
    differences: oml.differences.map((difference) => `${difference.path}: ${difference.message}`),
    status: oml.equal ? 'pass' : 'fail',
  };
};

const reportCorpus = async (): Promise<number> => {
  const statistics = await new CorpusManager(root).statistics();
  const lines = [
    '# Document Corpus Report',
    '',
    `Total files: ${statistics.total}`,
    '',
    '| Corpus type | Files |',
    '| --- | ---: |',
    ...Object.entries(statistics.byCategory).map(([kind, count]) => `| ${kind} | ${count} |`),
    '',
    '| Subject | Files |',
    '| --- | ---: |',
    ...Object.entries(statistics.bySubject).sort(([first], [second]) => first.localeCompare(second)).map(([subject, count]) => `| ${subject} | ${count} |`),
    '',
    `Missing golden results: ${statistics.missingGoldenResults.length}`,
    ...statistics.missingGoldenResults.map((id) => `- ${id}`),
  ];
  await mkdir(reportsDirectory, { recursive: true });
  await writeFile(join(reportsDirectory, 'corpus-report.md'), lines.join('\n'));
  return statistics.missingGoldenResults.length === 0 ? 0 : 1;
};

const reportParser = async (): Promise<number> => {
  const manager = new CorpusManager(root);
  const entries = await manager.load();
  const outcomes: FixtureOutcome[] = [];
  for (const entry of entries) outcomes.push(await evaluateFixture(entry));
  const failures = outcomes.filter((outcome) => outcome.status === 'fail');
  const missingGolden = outcomes.filter((outcome) => outcome.status === 'missing-golden');
  const lines = [
    '# Document Parser Golden Report',
    '',
    `Total files: ${outcomes.length}`,
    `Pass: ${outcomes.filter((outcome) => outcome.status === 'pass').length}`,
    `Fail: ${failures.length}`,
    `Missing Golden: ${missingGolden.length}`,
    '',
    '## Golden consistency failures',
    ...failures.flatMap((failure) => [`### ${failure.entry.id}`, ...failure.differences.map((difference) => `- ${difference}`)]),
    '',
    '## Missing Golden',
    ...missingGolden.map((outcome) => `- ${outcome.entry.id}`),
  ];
  await mkdir(reportsDirectory, { recursive: true });
  await writeFile(join(reportsDirectory, 'parser-report.md'), lines.join('\n'));
  return failures.length === 0 && missingGolden.length === 0 ? 0 : 1;
};

const reportBenchmark = async (): Promise<number> => {
  const entries = await new CorpusManager(root).load();
  const lines = [
    '# Document Benchmark Regression Report',
    '',
    `Corpus entries available for browser benchmark: ${entries.length}`,
    '',
    'No benchmark values are emitted by this CLI because it cannot truthfully execute the browser-native pipeline.',
    'DocumentRegressionRunner consumes real File objects in a browser test host and produces latency, OCR-region, memory, trace, and accuracy data.',
  ];
  await mkdir(reportsDirectory, { recursive: true });
  await writeFile(join(reportsDirectory, 'benchmark-report.md'), lines.join('\n'));
  return 0;
};

const reportDocument = async (): Promise<number> => {
  const corpusStatus = await reportCorpus();
  const parserStatus = await reportParser();
  const lines = [
    '# Document Regression Report',
    '',
    'Corpus discovery and golden contract checks completed. Runtime pipeline, accuracy, and performance values are intentionally unavailable in Node because the pipeline is browser-native.',
    `Corpus status: ${corpusStatus === 0 ? 'pass' : 'fail'}`,
    `Parser golden status: ${parserStatus === 0 ? 'pass' : 'fail'}`,
    'Accuracy: N/A until DocumentRegressionRunner executes the real corpus.',
  ];
  await mkdir(reportsDirectory, { recursive: true });
  await writeFile(join(reportsDirectory, 'document-regression-report.md'), lines.join('\n'));
  return corpusStatus || parserStatus ? 1 : 0;
};

const command = process.argv[2] as Command | undefined;
if (command === undefined || !['document', 'benchmark', 'corpus', 'parser'].includes(command)) {
  throw new Error('Use one of: document, benchmark, corpus, parser.');
}

const exitCode = command === 'corpus'
  ? await reportCorpus()
  : command === 'parser'
    ? await reportParser()
    : command === 'benchmark'
      ? await reportBenchmark()
      : await reportDocument();

process.exitCode = exitCode;
