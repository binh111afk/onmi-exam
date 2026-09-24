import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  try {
    // @ts-expect-error - Vite query import
    import('pdfjs-dist/build/pdf.worker.min.mjs?url').then((mod) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = mod.default || mod;
    });
  } catch {}
}
