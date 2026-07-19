# Document Pipeline Audit — 2026-07-19

## Scope and execution status

This audit scanned every supported file below `tests/corpus` and invoked the existing corpus audit command. A real browser pipeline run was attempted, but the available browser runtime returned `No browser is available`.

The production dispatcher requires browser `File`, canvas, and PDF.js APIs for PDF/image import, crop, and OCR-region execution. No replacement runtime was used, and no pipeline result was fabricated.

| Status | Files |
| --- | ---: |
| Discovered | 249 |
| Executed through Document Pipeline | 0 |
| Passed | 0 |
| Failed | 0 |
| Not executed because browser runtime is unavailable | 249 |
| Missing Golden | 249 |

## Corpus summary

| Corpus folder classification | Files |
| --- | ---: |
| DOCX | 4 |
| PDF text | 81 |
| PDF scan | 80 |
| PDF hybrid | 80 |
| Images | 4 |
| Total | 249 |

Physical extension inventory: 242 PDF, 3 DOCX, 3 JPG, and 1 PNG. One PDF (`docx/khac/gzjgq7b000lu.pdf`) is stored beneath the DOCX folder, so the folder classification and physical extension disagree for that entry.

| Subject folder | Files |
| --- | ---: |
| Toán | 125 |
| Vật lý | 117 |
| Hóa | 3 |
| Khác | 4 |

Total input size is 289,209,714 bytes. The largest file is `gzjgq7b000lu.pdf` at 31,991,743 bytes.

## Static document inventory

`pdfinfo` successfully read page metadata for all 242 PDFs. This is an input-file check only; it is not a Document Pipeline result.

| Metric | Value |
| --- | ---: |
| PDF pages total | 2,437 |
| Average pages per PDF | 10.07 |
| Minimum pages | 2 |
| Maximum pages | 300 |
| PDFs with unreadable page metadata | 0 |

The 300-page `gzjgq7b000lu.pdf` appears four times across corpus folders. It accounts for 1,200 of the counted PDF pages.

## Corpus integrity observations

| Observation | Result |
| --- | ---: |
| Golden Question Object files | 0 |
| Golden OML files | 0 |
| SHA-256 duplicate groups | 77 |
| File instances belonging to duplicate groups | 241 |
| Distinct file contents by SHA-256 | 85 |

The corpus contains the same physical documents under `pdf-text`, `pdf-scan`, and `pdf-hybrid`. This is useful only when those categories intentionally represent different expected routing cases. Since their hashes are identical, it cannot by itself validate distinct text/scan/hybrid detection behavior.

## Per-file pipeline result

No file reached Importer, Layout Analyzer, Region Planner, Crop Engine, OCR Worker, Merge Engine, Question Parser, Question Object, OML Generator, or renderer-compatibility execution. Therefore the following fields are **N/A for all 249 files**:

- Page count as observed by the importer
- Pipeline route and OCR requirement
- OCR/skip region count
- Question, option, image, table, formula, and review-marker count
- Pipeline, importer, parser, OCR, CPU, memory, and canvas timings
- Estimated OCR saving
- Question/Object and OML semantic accuracy

## Performance summary

No pipeline invocation completed, so average, median, P95, P99, OCR time, parser time, importer time, memory, canvas memory, and OCR saving are **N/A**. No bottleneck ranking can be made from the available evidence.

## OCR and review analysis

No OCR plan, OCR task, or review marker was produced. The number of no-OCR files, page-based/region-based OCR files, skipped regions, OCR regions, and markers by reason is **N/A**.

## Conclusions grounded in this audit

1. **Pipeline stability:** not established; zero files executed through the actual pipeline.
2. **Observed strength:** corpus discovery is stable for all 249 inputs, and all PDFs expose readable static page metadata.
3. **Observed weakness:** the current audit environment has no browser runtime, which prevents the actual browser-native pipeline from running.
4. **Largest measured bottleneck:** not measurable; no timing data exists.
5. **Logic issue detected:** one PDF is placed in the DOCX corpus folder, and 241 entries are duplicates. These are corpus-label/data-quality issues, not proven pipeline logic defects.
6. **Architecture change:** no conclusion is justified from this run.
7. **Parser, OCR, and layout optimization:** no recommendation is justified without actual pipeline timings and outputs.
8. **Production readiness percentage:** not estimable from this audit; functional pipeline coverage is 0/249 in the available execution environment.

## Prerequisite for a complete rerun

Provide a browser-capable test runtime connected to the current environment, then execute the dispatcher for each corpus file while preserving this corpus unchanged. Add golden results only when semantic accuracy measurement is required; their absence must not prevent timing and route benchmarks.
