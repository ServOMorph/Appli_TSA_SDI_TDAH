import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T20 — Dashboard → Mon énergie → écran énergie', async ({ page }) => {
  await page.getByRole('button', { name: "5 souffle aujourd'hui" }).click()
  await expect(page.getByRole('heading', { name: 'Mon énergie' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/20-energy-view.png' })
})

test('T21 — Énergie déjà saisie (onboarding) affichée sur E30', async ({ page }) => {
  await page.getByRole('button', { name: "5 souffle aujourd'hui" }).click()
  await expect(page.getByLabel('5 souffle aujourd\'hui')).toBeVisible()
})

test('T22 — Modifier énergie via check-in', async ({ page }) => {
  await page.getByRole('button', { name: "5 souffle aujourd'hui" }).click()
  await page.getByRole('button', { name: 'Modifier' }).click()
  await expect(page.getByRole('heading', { name: "Mon énergie aujourd'hui" })).toBeVisible()
  await page.getByRole('button', { name: '3' }).click()
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByRole('heading', { name: 'Mon énergie' })).toBeVisible()
  await expect(page.getByLabel('3 souffle aujourd\'hui')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/22-energy-modified.png' })
})

test('T23 — Skip énergie depuis E30 check-in', async ({ page }) => {
  await page.getByRole('button', { name: "5 souffle aujourd'hui" }).click()
  await page.getByRole('button', { name: 'Modifier' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await page.screenshot({ path: 'e2e/screenshots/23-energy-skipped-dashboard.png' })
})

test('T24 — Badge énergie visible sur dashboard après check-in', async ({ page }) => {
  await expect(page.getByRole('button', { name: "5 souffle aujourd'hui" })).toBeVisible()
})

test('T25 — Énergie ignorée → badge "Énergie ignorée" visible sur dashboard', async ({ page }) => {
  await page.getByRole('button', { name: "5 souffle aujourd'hui" }).click()
  await page.getByRole('button', { name: 'Modifier' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByText('Énergie ignorée')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/25-energy-skipped-badge.png' })
})

test('T26 — Retour depuis E30 → dashboard', async ({ page }) => {
  await page.getByRole('button', { name: "5 souffle aujourd'hui" }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
})
