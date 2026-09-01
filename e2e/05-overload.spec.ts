import { test, expect, type Page } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

const OVERLOAD_ACTIVE = 'Mode surcharge actif, ouvrir le centre récupération'
const OVERLOAD_IDLE = 'Détail du mode surcharge'

/** La tâche est créée directement planifiée ; le planning est toujours déplié (#20). */
async function planOverloadingTask(page: Page, title: string) {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill(title)
  await page.getByLabel('Heure de début').fill('08:00')
  await page.getByRole('group', { name: 'Coût en énergie' }).getByRole('button', { name: '12', exact: true }).click()
  await page.getByRole('button', { name: 'Valider' }).click()
}

test('T40 — Planifier une tâche coûteuse en énergie → surcharge activée automatiquement', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: OVERLOAD_ACTIVE })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/40-overload-active.png' })
})

test('T41 — Surcharge active → bouton Centre récupération visible', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: 'Centre récupération', exact: true })).toBeVisible()
})

test('T42 — Centre récupération → conseils affichés', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await page.getByRole('button', { name: 'Centre récupération', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge actif' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Conseils de récupération' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/42-recovery-center.png' })
})

test('T43 — Terminer la tâche depuis le planning → surcharge désactivée, pastille neutre conservée', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: OVERLOAD_ACTIVE })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Terminer Tâche lourde' }).click()
  await expect(page.getByRole('button', { name: OVERLOAD_IDLE })).toHaveText('Mode surcharge')
  await expect(page.getByRole('button', { name: 'Centre récupération', exact: true })).not.toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/43-overload-deactivated.png' })
})

test('T44 — La pastille de surcharge ouvre directement le centre de récupération (E21)', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await page.getByRole('button', { name: OVERLOAD_ACTIVE }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge actif' })).toBeVisible()
})

test('T45 — Surcharge persistée après rechargement page', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: OVERLOAD_ACTIVE })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.reload()
  await page.waitForSelector('h1')
  await expect(page.getByRole('button', { name: OVERLOAD_ACTIVE })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/45-overload-persisted.png' })
})

test('T46 — Décocher une tâche planifiée réactive la surcharge', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  const checkbox = page.getByRole('checkbox', { name: 'Terminer Tâche lourde' })

  await checkbox.click()
  await expect(checkbox).toBeChecked()
  await expect(page.getByRole('button', { name: OVERLOAD_IDLE })).toHaveText('Mode surcharge')

  await checkbox.click()
  await expect(checkbox).not.toBeChecked()
  await expect(page.getByRole('button', { name: OVERLOAD_ACTIVE })).toHaveText('Mode surcharge actif')
})
