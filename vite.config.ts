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
    // Dossier par defaut de npm run build / npm run test:e2e — jamais une reference de mesure.
    // /deploy impose toujours --outDir dist/<version>, qui prime sur cette valeur. dist/dev est
    // le dossier scratch deja utilise a cet effet (roadmap_bundle_2026-08-31.md, Phase 4) :
    // avant ce correctif, la valeur codee en dur pointait vers dist/v5.1, un build versionne reel,
    // silencieusement ecrase a chaque build local.
    outDir: 'dist/dev',
    // Alerte Vite abaissee a la valeur reellement atteinte (chunk d entree 242 kB, marge de
    // bruit incluse) plutot que le defaut 500 kB : un depassement doit signaler une regression,
    // pas rester silencieux jusqu au prochain seuil arbitraire. Le gate bloquant reste
    // scripts/check_bundle_budget.mjs (bundle.budget.json), cette valeur n est qu un avertissement
    // de build informatif.
    chunkSizeWarningLimit: 260,
  },
})
