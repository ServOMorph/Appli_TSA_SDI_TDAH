import { test, expect } from '@playwright/test'
import { resetApp } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('T01 — écran Welcome affiché au démarrage', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/01-welcome.png' })
})

test('T02 — Entrer → écran Profil', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await expect(page.getByRole('heading', { name: 'Votre profil' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/02-profile.png' })
})

test('T03 — Sélectionner profil Étudiant → écran Énergie', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.getByRole('button', { name: 'Étudiant' }).click()
  await expect(page.getByRole('heading', { name: "Votre énergie aujourd'hui" })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/03-energy.png' })
})

test('T04 — Saisir énergie et valider → écran Première tâche', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.getByRole('button', { name: 'Étudiant' }).click()
  await page.getByRole('button', { name: '7' }).click()
  await expect(page.getByRole('button', { name: '7' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByRole('heading', { name: 'Votre première tâche' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/04-first-task.png' })
})

test('T05 — Ignorer énergie → écran Première tâche', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.getByRole('button', { name: 'Étudiant' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await expect(page.getByRole('heading', { name: 'Votre première tâche' })).toBeVisible()
})

test('T06 — Créer première tâche → Dashboard avec tâche visible', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.getByRole('button', { name: 'Adulte' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche onboarding test')
  await page.getByRole('button', { name: 'Ajouter' }).click()
  await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
  await expect(page.getByText('Tâche onboarding test').first()).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/06-dashboard-with-task.png' })
})

test('T07 — Ignorer première tâche → Dashboard vide', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.getByRole('button', { name: 'Adulte' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await page.getByRole('button', { name: 'Ignorer' }).click()
  await expect(page.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeVisible()
  await expect(page.getByText('Que souhaitez-vous ajouter ?')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/07-dashboard-empty.png' })
})
