import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
      exclude: [
        'src/test/**',
        'src/main.tsx',
        'src/App.tsx',
        '**/*.config.*',
        'dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
