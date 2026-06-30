import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.describe('Offline / PWA — Phase 6', () => {
  test('T50 — Service worker enregistré sur la page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      const regs = await navigator.serviceWorker.getRegistrations()
      return regs.length > 0
    })
    expect(swRegistered).toBe(true)
    await page.screenshot({ path: 'e2e/screenshots/50-sw-registered.png' })
  })

  test('T51 — App accessible après coupure réseau', async ({ page, context }) => {
    await resetApp(page)
    await completeFastOnboarding(page)
    await page.waitForLoadState('networkidle')
    await context.setOffline(true)
    await page.reload()
    await page.waitForSelector('h1', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
    await page.screenshot({ path: 'e2e/screenshots/51-offline-dashboard.png' })
    await context.setOffline(false)
  })

  test('T52 — Données persistées hors ligne après rechargement', async ({ page, context }) => {
    await resetApp(page)
    await completeFastOnboarding(page)
    await page.getByRole('button', { name: 'Todo' }).click()
    await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
    await page.getByLabel('Titre de la tâche').fill('Tâche offline test')
    await page.getByRole('button', { name: 'Valider' }).click()
    await expect(page.getByText('Tâche offline test')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await context.setOffline(true)
    await page.reload()
    await page.waitForSelector('h1', { timeout: 10000 })
    await page.getByRole('button', { name: 'Todo' }).click()
    await expect(page.getByText('Tâche offline test')).toBeVisible()
    await page.screenshot({ path: 'e2e/screenshots/52-offline-data-persisted.png' })
    await context.setOffline(false)
  })

  test('T53 — Données persistées après rechargement normal (IndexedDB)', async ({ page }) => {
    await resetApp(page)
    await completeFastOnboarding(page)
    await page.getByRole('button', { name: 'Todo' }).click()
    await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
    await page.getByLabel('Titre de la tâche').fill('Tâche persistance')
    await page.getByRole('button', { name: 'Valider' }).click()
    await expect(page.getByText('Tâche persistance')).toBeVisible()
    await page.reload()
    await page.waitForSelector('h1')
    await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
    await page.getByRole('button', { name: 'Todo' }).click()
    await expect(page.getByText('Tâche persistance')).toBeVisible()
    await page.screenshot({ path: 'e2e/screenshots/53-persistence-after-reload.png' })
  })

  test('T54 — Profil persisté après rechargement', async ({ page }) => {
    await resetApp(page)
    await completeFastOnboarding(page)
    await page.reload()
    await page.waitForSelector('h1')
    await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
  })

  test('T55 — App ne revient pas à Welcome si user existe (rechargement)', async ({ page }) => {
    await resetApp(page)
    await completeFastOnboarding(page)
    await page.reload()
    await page.waitForSelector('h1')
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
  })
})
