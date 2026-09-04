import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T10 — Ajouter une tâche depuis le dashboard ouvre l\'écran de création', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await expect(page.getByRole('heading', { name: 'Votre première tâche' }).or(page.getByRole('heading', { name: 'Nouvelle tâche' }))).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/10-create-task-screen.png' })
})

test('T11 — Créer tâche dans inbox → visible dans inbox', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche inbox Playwright')
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByRole('heading', { name: 'Réception' })).toBeVisible()
  await expect(page.getByText('Tâche inbox Playwright')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/11-inbox-with-task.png' })
})

test('T12 — Ouvrir détail tâche depuis inbox', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche détail test')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche détail test').click()
  await expect(page.getByRole('heading', { name: 'Tâche détail test' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Modifier' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Décomposer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dupliquer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/12-task-detail.png' })
})

test('T13 — Décomposer tâche → ajouter sous-tâche → affichée dans détail', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à décomposer')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à décomposer').click()
  await page.getByRole('button', { name: 'Décomposer', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Décomposer' }).or(page.getByRole('heading', { level: 1 }))).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/13-decompose-screen.png' })
})

test('T16 — Terminer tâche → retour dashboard', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à terminer')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('button', { name: 'Planifier Tâche à terminer' }).click()
  await expect(page.getByRole('heading', { name: 'Tâche à terminer' })).toBeVisible()
  await page.getByRole('button', { name: 'Accueil' }).click()
  await expect(page.getByRole('heading', { name: 'AuDHD' })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Terminer Tâche à terminer' }).click()
  await expect(page.getByRole('checkbox', { name: 'Terminer Tâche à terminer' })).toBeChecked()
  await page.screenshot({ path: 'e2e/screenshots/16-task-completed.png' })
})

test('T17 — Supprimer tâche avec confirmation', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à supprimer')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à supprimer').click()
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('Cette action est irréversible.')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/17-delete-confirm.png' })
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('heading', { name: 'Réception' })).toBeVisible()
  await expect(page.getByText('Tâche à supprimer')).toHaveCount(0)
})

test('T19 — Depuis Paramètres, "+" crée directement une tâche en réception (destination toujours forcée)', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Paramètres' }).click()
  await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible()
  await page.getByRole('navigation').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await expect(page.getByRole('heading', { name: 'Nouvelle tâche' })).toBeVisible()
  await expect(page.getByText('Que faire de cette tâche ?')).toHaveCount(0)
  await page.getByLabel('Titre de la tâche').fill('Tâche depuis paramètres')
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByRole('heading', { name: 'Réception' })).toBeVisible()
  await expect(page.getByText('Tâche depuis paramètres')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/19-forced-destination-from-settings.png' })
})

test('T18 — Annuler suppression tâche', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à garder')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à garder').click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tâche à garder' })).toBeVisible()
})
