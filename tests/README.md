# Document pipeline regression corpus

Place each source document anywhere beneath `corpus/`. The scanner is recursive: `corpus/pdf-text/sinh/de-01.pdf` and a future folder such as `corpus/pdf-text/lichsu/de-02.pdf` are discovered without code changes. Supported inputs are PDF, DOCX, PNG, JPG, JPEG, WEBP, JSON, and OML.

For `corpus/pdf-text/sample.pdf`, add these golden files:

- `expected/question-object/pdf-text/sample.json`
- `expected/oml/pdf-text/sample.json`

The golden Question Object is the semantic source of truth. IDs, source coordinates, review markers, and timestamps are ignored by the comparator. OML is normalized before comparison, so whitespace and key ordering do not create false failures. Missing files are reported as `Missing Golden`; no command creates or overwrites them automatically. `GoldenManager.update` requires an explicit `--update-golden` authorization from the test host.

`npm run test:corpus` checks discovery, metadata, categories, subjects, and golden completeness. `npm run test:parser` validates every Question Object-to-OML golden pair. `npm run test:benchmark` produces a benchmark handoff without inventing measurements. `npm run test:document` runs the corpus and golden checks together.

The browser-native `DocumentRegressionRunner` in `src/document/testing/documentRegressionRunner.ts` accepts loaded `File` objects plus their golden records. It runs the real dispatcher and benchmark runner, evaluates semantic/accuracy/performance regression, and returns a detailed result for a browser test host. `SnapshotManager` stores timestamped actual Question Object, OML, metrics, trace, and report after that execution. This separation is necessary because the production importer and crop engine require browser `File`, canvas, and PDF.js APIs.
