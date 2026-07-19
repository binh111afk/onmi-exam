import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { OcrRegion } from './regionPlanner';
import type { OcrCropProfilerData } from '../../types/ocr-profiler';

export class CropEngine {
  async cropPdfRegion(file: File, region: OcrRegion): Promise<{ file: File; temporaryCanvasBytes: number; profiler: OcrCropProfilerData }> {
    const loadingTask = pdfjsLib.getDocument({ data: await file.arrayBuffer() });
    let pdf: PDFDocumentProxy | undefined;
    let page: Awaited<ReturnType<PDFDocumentProxy['getPage']>> | undefined;
    let sourceCanvas: HTMLCanvasElement | undefined;
    let cropCanvas: HTMLCanvasElement | undefined;
    try {
      pdf = await loadingTask.promise;
      page = await pdf.getPage(region.page);
      const cropStartedAt = performance.now();
      const viewport = page.getViewport({ scale: 2 });
      sourceCanvas = document.createElement('canvas');
      const sourceContext = sourceCanvas.getContext('2d');
      if (!sourceContext) throw new Error(`Unable to render PDF page ${region.page} for region crop.`);
      sourceCanvas.width = Math.ceil(viewport.width);
      sourceCanvas.height = Math.ceil(viewport.height);
      await page.render({ canvas: sourceCanvas, canvasContext: sourceContext, viewport }).promise;
      const renderTimeMs = performance.now() - cropStartedAt;

      const scale = 2;
      const sourceX = Math.max(0, Math.floor(region.boundingBox.x * scale));
      const sourceY = Math.max(0, Math.floor(viewport.height - ((region.boundingBox.y + region.boundingBox.height) * scale)));
      const sourceWidth = Math.min(sourceCanvas.width - sourceX, Math.max(1, Math.ceil(region.boundingBox.width * scale)));
      const sourceHeight = Math.min(sourceCanvas.height - sourceY, Math.max(1, Math.ceil(region.boundingBox.height * scale)));
      cropCanvas = document.createElement('canvas');
      const cropContext = cropCanvas.getContext('2d');
      if (!cropContext) throw new Error(`Unable to create crop canvas for region ${region.id}.`);
      cropCanvas.width = sourceWidth;
      cropCanvas.height = sourceHeight;
      cropContext.drawImage(sourceCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

      const encodeStartedAt = performance.now();
      const blob = await new Promise<Blob>((resolve, reject) => cropCanvas.toBlob((result) => (
        result ? resolve(result) : reject(new Error(`Unable to encode crop for region ${region.id}.`))
      ), 'image/jpeg', 0.92));
      const encodeTimeMs = performance.now() - encodeStartedAt;
      return {
        file: new File([blob], `${file.name}-${region.id}.jpg`, { type: 'image/jpeg' }),
        temporaryCanvasBytes: (sourceCanvas.width * sourceCanvas.height * 4) + (cropCanvas.width * cropCanvas.height * 4),
        profiler: {
          startedAtMs: cropStartedAt,
          cropWidth: cropCanvas.width,
          cropHeight: cropCanvas.height,
          imageFormat: 'image/jpeg',
          imageQuality: 0.92,
          imageBytes: blob.size,
          renderTimeMs,
          encodeTimeMs,
        },
      };
    } finally {
      sourceCanvas && (sourceCanvas.width = sourceCanvas.height = 0);
      cropCanvas && (cropCanvas.width = cropCanvas.height = 0);
      if (page !== undefined) page.cleanup();
      if (pdf !== undefined) await pdf.cleanup();
      await loadingTask.destroy();
    }
  }
}
