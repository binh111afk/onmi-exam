import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'AZURE_'],
    define: {
      'process.env.NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY': JSON.stringify(
        env.NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY ?? '',
      ),
    },
  }
})
