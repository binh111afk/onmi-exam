export interface LatexOcrServiceOptions {
  enabled?: boolean;
  apiUrl?: string;
  fetchImplementation?: typeof fetch;
}

export class LatexOcrServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LatexOcrServiceError';
  }
}

const normalizeApiUrl = (apiUrl: string): string => `${apiUrl.replace(/\/$/u, '')}/predict/`;

const responseLatex = async (response: Response): Promise<string> => {
  const raw = await response.text();
  if (!response.ok) {
    throw new LatexOcrServiceError(`LaTeX OCR API trả về ${response.status}: ${raw || response.statusText}`);
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    const latex = typeof parsed === 'string'
      ? parsed
      : typeof parsed === 'object' && parsed !== null && 'latex' in parsed && typeof parsed.latex === 'string'
        ? parsed.latex
        : '';
    if (latex.trim()) return latex.trim();
  } catch {
    if (raw.trim()) return raw.trim();
  }

  throw new LatexOcrServiceError('LaTeX OCR API không trả về công thức hợp lệ.');
};

/** Browser client for the official pix2tex FastAPI endpoint. */
export class LatexOcrService {
  private readonly enabled: boolean;
  private readonly apiUrl: string;
  private readonly fetchImplementation: typeof fetch;
  private readonly cache = new Map<string, Promise<string>>();

  constructor(options: LatexOcrServiceOptions = {}) {
    this.enabled = options.enabled ?? import.meta.env.VITE_LATEX_OCR_ENABLED === 'true';
    this.apiUrl = normalizeApiUrl(options.apiUrl ?? import.meta.env.VITE_LATEX_OCR_API_URL ?? 'http://localhost:8502');
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async recognize(image: File): Promise<string> {
    if (!this.enabled) throw new LatexOcrServiceError('LaTeX OCR chưa được bật.');

    const cacheKey = await this.cacheKey(image);
    const existing = this.cache.get(cacheKey);
    if (existing) return existing;

    const request = this.request(image);
    this.cache.set(cacheKey, request);
    try {
      return await request;
    } catch (error) {
      this.cache.delete(cacheKey);
      throw error;
    }
  }

  private async cacheKey(image: File): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', await image.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private async request(image: File): Promise<string> {
    const form = new FormData();
    form.append('file', image, image.name);
    let response: Response;
    try {
      response = await this.fetchImplementation(this.apiUrl, { method: 'POST', body: form });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new LatexOcrServiceError(`Không thể kết nối LaTeX OCR API: ${detail}`);
    }
    return responseLatex(response);
  }
}
