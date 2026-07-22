import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const glmOcrTarget = env.VITE_GLM_API_URL?.includes('open.bigmodel.cn')
    ? 'https://open.bigmodel.cn'
    : 'https://api.z.ai'

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'AZURE_', 'OCR_', 'OPENAI_', 'GEMINI_', 'GLM_'],
    define: {
      'process.env.NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY': JSON.stringify(
        env.NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY ?? '',
      ),
    },
    server: {
      proxy: {
        '/api/glm-ocr': {
          target: glmOcrTarget,
          changeOrigin: true,
          rewrite: () => '/api/paas/v4/layout_parsing',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.setHeader('Authorization', `Bearer ${env.VITE_GLM_API_KEY ?? ''}`)
            })
          },
        },
      },
    },
  }
})
