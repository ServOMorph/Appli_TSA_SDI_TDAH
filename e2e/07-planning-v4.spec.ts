import { test, expect } from '@playwright/test'
import { resetApp, completeFastOnboarding } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T46 — planifier une tâche sur plusieurs créneaux et la repositionner', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('McDo')
  await page.getByRole('button', { name: 'Planifier', exact: true }).click()
  await page.getByRole('button', { name: 'Valider' }).click()

  await expect(page.getByText('« McDo » est en cours de planification.')).toBeVisible()
  await page.getByRole('gridcell', { name: 'Créneau 10h00' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 11h00' }).click()
  await page.getByRole('button', { name: 'Placer' }).click()

  await expect(page.getByRole('gridcell', { name: 'Créneau 10h00 : McDo' })).toBeVisible()
  await expect(page.getByRole('gridcell', { name: 'Créneau 10h30 : McDo (suite)' })).toBeVisible()
  await expect(page.getByRole('gridcell', { name: 'Créneau 11h00 : McDo (suite)' })).toBeVisible()

  await page.getByRole('gridcell', { name: 'Créneau 12h00' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 12h30' }).click()
  await expect(page.getByRole('gridcell', { name: 'Créneau 12h00 : McDo' })).toBeVisible()
  await expect(page.getByRole('gridcell', { name: 'Créneau 12h30 : McDo (suite)' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Terminer la planification de McDo' })).toBeVisible()
})

test('T47 — Répéter demain est absent du planning', async ({ page }) => {
  await page.getByRole('button', { name: 'Planning' }).click()
  await expect(page.getByRole('grid', { name: 'Planning de la journée' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Répéter.*demain/ })).toHaveCount(0)
})

async function planTask(page: import('@playwright/test').Page, title: string, startSlot: string) {
  await page.getByRole('button', { name: 'Planning' }).click()
  await page.getByRole('gridcell', { name: startSlot }).click()
  await page.getByRole('gridcell', { name: startSlot }).click()
  await page.getByLabel('Nom de la tâche').fill(title)
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('button', { name: 'Placer' }).click()
  await page.getByRole('button', { name: `Terminer la planification de ${title}` }).click()
}

test('T48 — tap sur une tâche planifiée ouvre le menu déplacer/renommer/supprimer (E6)', async ({ page }) => {
  await planTask(page, 'RDV dentiste', 'Créneau 15h00')

  await page.getByRole('gridcell', { name: 'Créneau 15h00 : RDV dentiste' }).click()
  await expect(page.getByRole('dialog', { name: 'Actions sur la tâche' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Déplacer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Renommer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()

  await page.getByRole('button', { name: 'Renommer' }).click()
  await page.getByLabel('Nouveau nom').fill('RDV dentiste Dr Martin')
  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByRole('gridcell', { name: 'Créneau 15h00 : RDV dentiste Dr Martin' })).toBeVisible()

  await page.getByRole('gridcell', { name: 'Créneau 15h00 : RDV dentiste Dr Martin' }).click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('gridcell', { name: 'Créneau 15h00 : RDV dentiste Dr Martin' })).toHaveCount(0)
})

test('T49 — Reporter une tâche en surcharge affiche le bandeau et bascule sur le lendemain (E8)', async ({ page }) => {
  await page.getByRole('button', { name: 'Planning' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 8h00' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 8h00' }).click()
  await page.getByLabel('Nom de la tâche').fill('Tâche lourde')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByRole('group', { name: 'Coût en énergie' }).getByRole('button', { name: '12', exact: true }).click()
  await page.getByRole('button', { name: 'Placer' }).click()

  await page.getByRole('button', { name: 'Reporter Tâche lourde' }).click()
  await expect(page.getByText('« Tâche lourde » est en cours de déplacement.')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.getByRole('gridcell', { name: 'Créneau 9h00' }).click()
  await expect(page.getByText(/en cours de déplacement/)).toHaveCount(0)
  await expect(page.getByRole('gridcell', { name: 'Créneau 9h00 : Tâche lourde' })).toBeVisible()
  await expect(page.getByText('Reporté')).toBeVisible()

  await page.getByRole('button', { name: 'Jour précédent' }).click()
  await expect(page.getByRole('gridcell', { name: 'Créneau 8h00 : Tâche lourde' })).toHaveCount(0)
})

test('T50 — Déplacer une tâche vers un autre jour via le bandeau (E6)', async ({ page }) => {
  await planTask(page, 'Courses', 'Créneau 16h00')

  await page.getByRole('gridcell', { name: 'Créneau 16h00 : Courses' }).click()
  await page.getByRole('button', { name: 'Déplacer' }).click()
  await expect(page.getByText('« Courses » est en cours de déplacement.')).toBeVisible()

  await page.getByRole('button', { name: 'Jour suivant' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 10h00' }).click()

  await expect(page.getByText(/en cours de déplacement/)).toHaveCount(0)
  await expect(page.getByRole('gridcell', { name: 'Créneau 10h00 : Courses' })).toBeVisible()

  await page.getByRole('button', { name: 'Jour précédent' }).click()
  await expect(page.getByRole('gridcell', { name: 'Créneau 16h00 : Courses' })).toHaveCount(0)
})

test('T51 — planifier une sous-tâche depuis Décomposer, affichage hiérarchique dans le planning (E9)', async ({ page }) => {
  await page.getByRole('button', { name: 'Outils' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Todo', exact: true }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill('Grand ménage')
  await page.getByRole('button', { name: 'Valider' }).click()
  await page.getByText('Grand ménage').click()
  await page.getByRole('button', { name: 'Décomposer' }).click()
  await page.getByLabel('Nouvelle sous-étape').fill('Ranger le bureau')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByText('Ranger le bureau')).toBeVisible()

  await page.getByRole('button', { name: 'Planifier Ranger le bureau', exact: true }).click()
  await expect(page.getByText('« Ranger le bureau » est en cours de planification.')).toBeVisible()
  await page.getByRole('gridcell', { name: 'Créneau 10h00' }).click()
  await page.getByRole('gridcell', { name: 'Créneau 10h00' }).click()

  await expect(page.getByText('Grand ménage', { exact: true })).toBeVisible()
  await expect(page.getByText('- Ranger le bureau')).toBeVisible()

  await page.getByRole('button', { name: 'Accueil' }).click()
  await expect(page.getByText(/10:00 · Grand ménage/)).toBeVisible()
  await expect(page.getByText('- Ranger le bureau')).toBeVisible()
})
