import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T40 — Activer le mode surcharge depuis dashboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Activer le mode surcharge' }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/40-overload-active.png' })
})

test('T41 — Mode surcharge → bouton Centre récupération visible', async ({ page }) => {
  await page.getByRole('button', { name: 'Activer le mode surcharge' }).click()
  await expect(page.getByRole('button', { name: 'Centre récupération' })).toBeVisible()
})

test('T42 — Mode surcharge → Centre récupération → conseils affichés', async ({ page }) => {
  await page.getByRole('button', { name: 'Activer le mode surcharge' }).click()
  await page.getByRole('button', { name: 'Centre récupération' }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge actif' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Conseils de récupération' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/42-recovery-center.png' })
})

test('T43 — Centre récupération → Désactiver → dashboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Activer le mode surcharge' }).click()
  await page.getByRole('button', { name: 'Centre récupération' }).click()
  await page.getByRole('button', { name: 'Désactiver le mode surcharge' }).click()
  await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/43-overload-deactivated.png' })
})

test('T44 — Désactiver surcharge depuis écran Mode surcharge', async ({ page }) => {
  await page.getByRole('button', { name: 'Activer le mode surcharge' }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge' })).toBeVisible()
  await page.getByRole('button', { name: 'Désactiver le mode surcharge' }).click()
  await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
})

test('T45 — Surcharge persistée après rechargement page', async ({ page }) => {
  await page.getByRole('button', { name: 'Activer le mode surcharge' }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.reload()
  await page.waitForSelector('h1')
  await expect(page.getByRole('heading', { name: 'Mode surcharge' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/45-overload-persisted.png' })
})
