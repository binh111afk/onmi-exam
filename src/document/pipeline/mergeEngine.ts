import type { RawDocument, RawDocumentNode } from '../../types/raw-document';
import type { OcrWorkerResult } from './ocrWorker';

export class MergeEngine {
  merge(document: RawDocument, results: OcrWorkerResult[]): RawDocument {
    const completed = results.filter((result) => result.status === 'completed').sort((first, second) => (
      first.task.region.page - second.task.region.page || first.task.region.readingOrder - second.task.region.readingOrder
    ));
    const regionNodes = completed.flatMap((result) => result.nodes.map((node) => this.withRegionSource(node, result)));
    return {
      ...document,
      nodes: [...document.nodes, ...regionNodes],
      ocrCandidates: document.ocrCandidates.filter((candidate) => !completed.some((result) => result.task.region.page === (candidate.page ?? 1))),
      reviewMarkers: document.reviewMarkers.filter((marker) => marker.reason !== 'ocr-required' || !completed.some((result) => result.task.region.page === (marker.page ?? 1))),
      ocrRequirement: completed.length > 0 && document.ocrCandidates.length === completed.length ? 'not-required' : document.ocrRequirement,
    };
  }

  private withRegionSource(node: RawDocumentNode, result: OcrWorkerResult): RawDocumentNode {
    const region = result.task.region;
    return {
      ...node,
      page: region.page,
      boundingBox: node.boundingBox ?? [region.boundingBox.x, region.boundingBox.y, region.boundingBox.width, region.boundingBox.height],
      confidence: node.confidence * region.confidence,
    };
  }
}
