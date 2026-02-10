import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    proxy: {
      '/server': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
