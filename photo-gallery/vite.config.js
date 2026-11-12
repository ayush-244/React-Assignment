import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { picsumProxyPlugin } from './vite-picsum-proxy.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), picsumProxyPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    clearMocks: true,
  },
})
