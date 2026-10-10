import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..', '..')

export default defineConfig({
  root: here,
  cacheDir: path.join(repo, 'node_modules', '.vite-jeux'),
  define: {
    __APP_DEV_VERSION__: JSON.stringify('jeux'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(repo, 'src'),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    fs: { allow: [repo] },
  },
})
