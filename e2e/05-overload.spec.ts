import { test, expect, type Page } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

async function planOverloadingTask(page: Page, title: string) {
  await page.getByRole('button', { name: 'Planning' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 8h00' }).click()
  await page.getByLabel('Nom de la tâche').fill(title)
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('group', { name: 'Coût en énergie' }).getByRole('button', { name: '12', exact: true }).click()
  await page.getByRole('button', { name: 'Non' }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
}

test('T40 — Planifier une tâche coûteuse en énergie → surcharge activée automatiquement', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/40-overload-active.png' })
})

test('T41 — Surcharge active → bouton Centre récupération visible', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: 'Centre récupération' })).toBeVisible()
})

test('T42 — Centre récupération → conseils affichés', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await page.getByRole('button', { name: 'Centre récupération' }).click()
  await expect(page.getByRole('heading', { name: 'Mode surcharge actif' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Conseils de récupération' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/42-recovery-center.png' })
})

test('T43 — Terminer la tâche depuis le dashboard → surcharge désactivée, bouton neutre conservé', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Terminer Tâche lourde' }).click()
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toHaveText('Mode surcharge')
  await expect(page.getByRole('button', { name: 'Centre récupération' })).not.toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/43-overload-deactivated.png' })
})

test('T44 — Terminer la tâche depuis le Planning → surcharge désactivée, bouton neutre conservé', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await page.getByRole('button', { name: 'Tâche lourde — voir dans le planning' }).click()
  await page.getByRole('checkbox', { name: 'Terminer Tâche lourde' }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toHaveText('Mode surcharge')
})

test('T45 — Surcharge persistée après rechargement page', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.reload()
  await page.waitForSelector('h1')
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/45-overload-persisted.png' })
})

test('T46 — Décocher une tâche planifiée réactive la surcharge', async ({ page }) => {
  await planOverloadingTask(page, 'Tâche lourde')
  const checkbox = page.getByRole('checkbox', { name: 'Terminer Tâche lourde' })

  await checkbox.click()
  await expect(checkbox).toBeChecked()
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toHaveText('Mode surcharge')

  await checkbox.click()
  await expect(checkbox).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Détail du mode surcharge' })).toHaveText('Mode surcharge actif')
})
