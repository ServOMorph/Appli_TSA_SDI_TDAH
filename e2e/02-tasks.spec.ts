import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T10 — Ajouter une tâche depuis dashboard → apparaît dans tâches du jour', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await expect(page.getByRole('heading', { name: 'Votre première tâche' }).or(page.getByRole('heading', { name: 'Nouvelle tâche' }))).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/10-create-task-screen.png' })
})

test('T11 — Créer tâche dans inbox → visible dans inbox', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await expect(page.getByRole('heading', { name: 'Nouvelle tâche' })).toBeVisible()
  await page.getByLabel('Titre de la tâche').fill('Tâche inbox Playwright')
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible()
  await expect(page.getByText('Tâche inbox Playwright')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/11-inbox-with-task.png' })
})

test('T12 — Ouvrir détail tâche depuis inbox', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche détail test')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche détail test').click()
  await expect(page.getByRole('heading', { name: 'Tâche détail test' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Décomposer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Terminer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/12-task-detail.png' })
})

test('T13 — Décomposer tâche → ajouter sous-tâche → affichée dans détail', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à décomposer')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à décomposer').click()
  await page.getByRole('button', { name: 'Décomposer' }).click()
  await expect(page.getByRole('heading', { name: 'Décomposer' }).or(page.getByRole('heading', { level: 1 }))).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/13-decompose-screen.png' })
})

test('T14 — Déplacer tâche inbox → Aujourd\'hui', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche vers aujourd\'hui')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('button', { name: /Déplacer Tâche vers aujourd'hui vers Aujourd'hui/ }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await page.getByRole('button', { name: "Aujourd'hui", exact: true }).click()
  await expect(page.getByText("Tâche vers aujourd'hui")).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/14-task-today.png' })
})

test('T15 — Déplacer tâche inbox → Plus tard', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche pour plus tard')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('button', { name: /Déplacer Tâche pour plus tard vers Plus tard/ }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await page.getByRole('button', { name: 'Plus tard' }).click()
  await expect(page.getByText('Tâche pour plus tard')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/15-task-later.png' })
})

test('T16 — Terminer tâche → retour dashboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à terminer')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à terminer').click()
  await page.getByRole('button', { name: 'Terminer' }).click()
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/16-task-completed.png' })
})

test('T17 — Supprimer tâche avec confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à supprimer')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à supprimer').click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('Cette action est irréversible.')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/17-delete-confirm.png' })
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Tâche à supprimer')).not.toBeVisible()
})

test('T18 — Annuler suppression tâche', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche à garder')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Tâche à garder').click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tâche à garder' })).toBeVisible()
})

test('T19 — Limite 3 tâches aujourd\'hui → modale de remplacement', async ({ page }) => {
  await page.getByRole('button', { name: 'Inbox' }).click()
  for (const title of ['Tâche A', 'Tâche B', 'Tâche C', 'Tâche D']) {
    await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
    await page.getByLabel('Titre de la tâche').fill(title)
    await page.getByRole('button', { name: 'Valider' }).click()
  }
  await page.getByRole('button', { name: /Déplacer Tâche A vers Aujourd'hui/ }).click()
  await page.getByRole('button', { name: /Déplacer Tâche B vers Aujourd'hui/ }).click()
  await page.getByRole('button', { name: /Déplacer Tâche C vers Aujourd'hui/ }).click()
  await page.getByRole('button', { name: /Déplacer Tâche D vers Aujourd'hui/ }).click()
  await expect(page.getByRole('dialog', { name: 'Remplacer une tâche' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/19-limit-3-modal.png' })
  await page.getByRole('button', { name: 'Annuler' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})
