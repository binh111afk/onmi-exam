import type { DocumentLayout, DocumentLayoutNode, LayoutBoundingBox, OcrPlanAction } from '../../types/document-layout';

export interface OcrRegion {
  id: string;
  layoutNodeId: string;
  page: number;
  boundingBox: LayoutBoundingBox;
  readingOrder: number;
  action: Extract<OcrPlanAction, 'text-ocr' | 'math-ocr'>;
  confidence: number;
}

export interface RegionPlanMetrics {
  totalRegions: number;
  ocrRegions: number;
  skippedRegions: number;
  estimatedSavingPercent: number;
}

export interface RegionPlan {
  regions: OcrRegion[];
  deferredNodeIds: string[];
  metrics: RegionPlanMetrics;
}

export class RegionPlanner {
  plan(layout: DocumentLayout): RegionPlan {
    const regions: OcrRegion[] = [];
    const deferredNodeIds: string[] = [];
    let skippedRegions = 0;

    layout.ocrPlan.forEach((planItem) => {
      const node = layout.nodes.find((candidate) => candidate.id === planItem.nodeId);
      if (!node || planItem.action === 'no-ocr') {
        skippedRegions += 1;
        return;
      }
      if (planItem.action === 'ai-review' || !node.hasMeasuredGeometry) {
        deferredNodeIds.push(planItem.nodeId);
        skippedRegions += 1;
        return;
      }
      regions.push(this.toRegion(node, planItem.action));
    });

    const totalRegions = regions.length + skippedRegions;
    return {
      regions: regions.sort((first, second) => first.page - second.page || first.readingOrder - second.readingOrder),
      deferredNodeIds,
      metrics: {
        totalRegions,
        ocrRegions: regions.length,
        skippedRegions,
        estimatedSavingPercent: totalRegions === 0 ? 100 : Math.round((skippedRegions / totalRegions) * 100),
      },
    };
  }

  private toRegion(node: DocumentLayoutNode, action: OcrPlanAction): OcrRegion {
    if (action !== 'text-ocr' && action !== 'math-ocr') throw new Error(`Unsupported OCR region action: ${action}`);
    return {
      id: `region-${node.id}`,
      layoutNodeId: node.id,
      page: node.page,
      boundingBox: node.boundingBox,
      readingOrder: node.readingOrder,
      action,
      confidence: node.confidence,
    };
  }
}
