import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/analyze': {
        target: 'http://127.0.0.1:8030',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8030',
        changeOrigin: true,
      },
      '/model-info': {
        target: 'http://127.0.0.1:8030',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://127.0.0.1:8030',
        changeOrigin: true,
      },
    },
  },
})
