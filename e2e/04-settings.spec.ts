import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T30 — Dashboard → Paramètres → liste des sections', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Profil' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accessibilité' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confidentialité' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/30-settings-list.png' })
})

test('T31 — Paramètres → Accessibilité → grande police → DOM modifié', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Accessibilité' }).click()
  await expect(page.getByRole('heading', { name: 'Accessibilité' })).toBeVisible()
  await page.getByRole('button', { name: 'Grande' }).click()
  await page.waitForFunction(() => document.documentElement.style.fontSize === '22px')
  const fontSize = await page.evaluate(() => document.documentElement.style.fontSize)
  expect(fontSize).toBe('22px')
  await page.screenshot({ path: 'e2e/screenshots/31-accessibility-large-font.png' })
})

test('T32 — Accessibilité → petite police', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Accessibilité' }).click()
  await page.getByRole('button', { name: 'Petite' }).click()
  await page.waitForFunction(() => document.documentElement.style.fontSize === '13px')
  const fontSize = await page.evaluate(() => document.documentElement.style.fontSize)
  expect(fontSize).toBe('13px')
})

test('T33 — Accessibilité → mode sombre toggle', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Accessibilité' }).click()
  await page.getByLabel('Mode sombre').click()
  await page.waitForFunction(() => document.documentElement.classList.contains('dark-mode'))
  const hasDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains('dark-mode'),
  )
  expect(hasDarkMode).toBe(true)
  await page.screenshot({ path: 'e2e/screenshots/33-dark-mode.png' })
})

test('T34 — Accessibilité → réduire animations toggle', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Accessibilité' }).click()
  await page.getByLabel('Réduire les animations').click()
  await page.waitForFunction(() => document.documentElement.classList.contains('reduce-motion'))
  const hasReduceMotion = await page.evaluate(() =>
    document.documentElement.classList.contains('reduce-motion'),
  )
  expect(hasReduceMotion).toBe(true)
})

test('T35 — Export → bouton export présent', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Export' }).click()
  await expect(page.getByRole('heading', { name: 'Export & suppression' }).or(page.getByRole('heading', { name: 'Export' }))).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/35-export-screen.png' })
})

test('T36 — Confidentialité → affiche infos données locales', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Confidentialité' }).click()
  await expect(page.getByRole('heading', { name: 'Confidentialité' })).toBeVisible()
  await expect(page.getByText('Stockage local')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/36-privacy.png' })
})

test('T37 — Confidentialité → supprimer données → modale confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Confidentialité' }).click()
  await page.getByRole('button', { name: 'Supprimer toutes les données' }).click()
  await expect(page.getByRole('dialog', { name: 'Confirmer la suppression' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/37-delete-confirm.png' })
  await page.getByRole('button', { name: 'Annuler' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('T38 — Supprimer toutes les données → retour écran Welcome', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Confidentialité' }).click()
  await page.getByRole('button', { name: 'Supprimer toutes les données' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/38-after-delete-welcome.png' })
})

test('T39 — Retour paramètres → dashboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
})
