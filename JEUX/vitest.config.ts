import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..')

export default defineConfig({
  root: repo,
  define: {
    __APP_DEV_VERSION__: JSON.stringify('test'),
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['JEUX/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.join(repo, 'src'),
    },
  },
})
