import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable history API fallback so BrowserRouter handles all routes
    // without 404 errors on page refresh
    historyApiFallback: true,
  },
})
