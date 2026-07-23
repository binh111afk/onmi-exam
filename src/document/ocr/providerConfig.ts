import type { BenchmarkRunOptions } from './ocrProvider';

export interface ProviderConfigurationStatus {
  configured: boolean;
  missing: string[];
}

export const getProviderConfigurationStatus = (options: BenchmarkRunOptions): ProviderConfigurationStatus => {
  if (options.providerId === 'google') {
    const missing = [
      ...(import.meta.env.VITE_GEMINI_API_KEY ? [] : ['VITE_GEMINI_API_KEY']),
      ...(import.meta.env.VITE_GEMINI_MODEL ? [] : ['VITE_GEMINI_MODEL']),
    ];
    return { configured: missing.length === 0, missing };
  }
  const missing = [
    ...(import.meta.env.AZURE_QWEN_KEY ? [] : ['AZURE_QWEN_KEY']),
    ...(import.meta.env.AZURE_QWEN_ENDPOINT ? [] : ['AZURE_QWEN_ENDPOINT']),
    ...(import.meta.env.AZURE_QWEN_MODEL ? [] : ['AZURE_QWEN_MODEL']),
  ];
  return { configured: missing.length === 0, missing };
};
