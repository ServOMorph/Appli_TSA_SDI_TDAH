import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function currentChangelogVersion(): string {
  const changelogPath = fileURLToPath(new URL('./CHANGELOG.md', import.meta.url))
  const match = readFileSync(changelogPath, 'utf-8').match(/^## (v\S+)/m)
  return match ? match[1] : 'dev'
}

export default defineConfig({
  define: {
    __APP_DEV_VERSION__: JSON.stringify(currentChangelogVersion()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Appli TSA SDI TDAH',
        short_name: 'TSA App',
        description: 'Application neuroinclusive pour personnes AuDHD',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist/v5.1',
  },
})
