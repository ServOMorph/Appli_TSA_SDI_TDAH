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
