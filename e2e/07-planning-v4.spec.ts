import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T46 — planifier une tâche à la création, puis modifier son horaire depuis sa fiche', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('McDo')
  await page.getByLabel('Heure de début').fill('10:00')
  await page.getByRole('button', { name: 'Valider' }).click()

  await expect(page.getByText('McDo')).toBeVisible()
  await expect(page.getByText('10:00')).toBeVisible()

  await page.getByText('McDo').click()
  await expect(page.getByRole('heading', { name: 'McDo' })).toBeVisible()
  await page.getByRole('button', { name: 'Modifier' }).click()
  await page.getByLabel('Heure de début').fill('12:00')
  await page.getByRole('button', { name: 'Enregistrer' }).click()

  await expect(page.getByRole('heading', { name: 'McDo' })).toBeVisible()
  await expect(page.getByText('12:00')).toBeVisible()
})

test('T47 — le planning épuré ne propose plus de grille ni de glisser-déposer (Q10)', async ({ page }) => {
  await expect(page.getByRole('grid', { name: 'Planning de la journée' })).toHaveCount(0)
  await expect(page.getByRole('gridcell')).toHaveCount(0)
})

test('T48 — cliquer une tâche planifiée ouvre sa fiche, renommer et supprimer', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('RDV dentiste')
  await page.getByLabel('Heure de début').fill('15:00')
  await page.getByRole('button', { name: 'Valider' }).click()

  await page.getByText('RDV dentiste').click()
  await expect(page.getByRole('heading', { name: 'RDV dentiste' })).toBeVisible()

  await page.getByRole('button', { name: 'Modifier' }).click()
  await page.getByLabel('Titre de la tâche').fill('RDV dentiste Dr Martin')
  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByRole('heading', { name: 'RDV dentiste Dr Martin' })).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('RDV dentiste Dr Martin')).toHaveCount(0)
})

test('T49 — Reporter une tâche en surcharge la bascule sur le lendemain (E8)', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Tâche lourde')
  await page.getByLabel('Heure de début').fill('08:00')
  await page.getByRole('group', { name: 'Coût en énergie' }).getByRole('button', { name: '12', exact: true }).click()
  await page.getByRole('button', { name: 'Valider' }).click()

  await page.getByRole('button', { name: 'Reporter Tâche lourde', exact: true }).click()
  await expect(page.getByText('Reporté')).toHaveCount(0)

  const toIso = (d: Date) => d.toISOString().slice(0, 10)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  await page.getByRole('button', { name: toIso(tomorrow) }).click()
  await expect(page.getByText('Tâche lourde')).toBeVisible()
  await expect(page.getByText('Reporté')).toBeVisible()

  await page.getByRole('button', { name: toIso(today) }).click()
  await expect(page.getByText('Tâche lourde')).toHaveCount(0)
})

test('T51 — planifier une sous-tâche depuis Décomposer, comptée sur la tâche parente dans le planning (E9)', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Grand ménage')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Grand ménage').click()
  await page.getByRole('button', { name: 'Décomposer' }).click()
  await page.getByLabel('Nouvelle sous-étape').fill('Ranger le bureau')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByText('Ranger le bureau')).toBeVisible()

  await page.getByRole('button', { name: 'Horaire de Ranger le bureau', exact: true }).click()
  await page.getByLabel('Heure de Ranger le bureau').fill('10:00')

  await page.getByRole('button', { name: 'Accueil' }).click()
  await expect(page.getByText('Grand ménage - Ranger le bureau')).toBeVisible()
})
