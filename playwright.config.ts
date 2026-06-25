import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  reporter: [
    ['html', { outputFolder: 'e2e/playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
