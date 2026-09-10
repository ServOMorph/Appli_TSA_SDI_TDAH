import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import { resetApp, completeFastOnboarding } from './helpers/reset'

async function gotoExportScreen(page: Page) {
  await page.getByRole('navigation').getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Export et import', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Export et import des données' })).toBeVisible()
}

async function seedInboxTask(page: Page, title: string) {
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await page.getByRole('main').getByRole('button', { name: 'Ajouter une tâche' }).click()
  await page.getByLabel('Titre de la tâche').fill(title)
  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByRole('heading', { name: 'Réception' })).toBeVisible()
  await expect(page.getByText(title)).toBeVisible()
}

test('T59 — export JSON puis réimport après perte totale des données restaure la sauvegarde', async ({
  page,
}) => {
  const marker = 'Tache RT sauvegarde 42'

  await resetApp(page)
  await completeFastOnboarding(page)
  await seedInboxTask(page, marker)

  // Export : télécharge le fichier et vérifie sa forme
  await gotoExportScreen(page)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exporter mes données JSON' }).click()
  await page.getByRole('dialog', { name: "Confirmer l'export" }).getByRole('button', { name: 'Télécharger' }).click()
  const download = await downloadPromise
  const savedPath = test.info().outputPath('export.json')
  await download.saveAs(savedPath)
  await expect(page.getByRole('status')).toContainText('Export téléchargé avec succès')

  const json = JSON.parse(fs.readFileSync(savedPath, 'utf-8')) as Record<string, unknown>
  expect(typeof json.version).toBe('string')
  expect(json).toHaveProperty('export_date')
  expect((json.user as { profile_type?: string } | undefined)?.profile_type).toBeTruthy()
  expect(Array.isArray(json.tasks)).toBe(true)
  expect(JSON.stringify(json.tasks)).toContain(marker)
  // Le journal des tests manuels est dans le périmètre de l'export
  expect(json).toHaveProperty('manual_test_results')
  // Exclusion assumée : les retours annotés ne sont pas sérialisés
  expect(json).not.toHaveProperty('feedback_reports')

  // Perte totale des données côté appareil
  await page.getByRole('navigation').getByRole('button', { name: 'Paramètres' }).click()
  await page.getByRole('button', { name: 'Confidentialité' }).click()
  await page.getByRole('button', { name: 'Supprimer toutes les données' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible()

  // Nouvelle installation vierge : la tâche n'existe plus
  await completeFastOnboarding(page)
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await expect(page.getByText(marker)).toHaveCount(0)

  // Réimport de la sauvegarde
  await gotoExportScreen(page)
  await page.locator('input[type="file"]').setInputFiles(savedPath)
  await expect(page.getByRole('dialog', { name: "Confirmer l'import" })).toBeVisible()
  await page.getByRole('dialog', { name: "Confirmer l'import" }).getByRole('button', { name: 'Remplacer' }).click()
  await expect(page.getByRole('dialog', { name: "Confirmer l'import" })).not.toBeVisible()

  // Données restaurées à l'identique
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await expect(page.getByText(marker)).toBeVisible()
})

test('T60 — un fichier illisible ou de version incompatible est refusé sans effacer les données', async ({
  page,
}) => {
  const marker = 'Tache preservee RT'

  await resetApp(page)
  await completeFastOnboarding(page)
  await seedInboxTask(page, marker)
  await gotoExportScreen(page)

  // JSON invalide : erreur immédiate, aucune modale de confirmation
  const badPath = test.info().outputPath('bad.json')
  fs.writeFileSync(badPath, '{ ceci nest pas du json ]')
  await page.locator('input[type="file"]').setInputFiles(badPath)
  await expect(page.getByRole('alert')).toContainText('JSON invalide')
  await expect(page.getByRole('dialog', { name: "Confirmer l'import" })).toHaveCount(0)

  // JSON valide mais version future : import refusé après confirmation
  const futurePath = test.info().outputPath('future.json')
  fs.writeFileSync(
    futurePath,
    JSON.stringify({ version: '99.0', user: { id: 'x', profile_type: 'etudiant' } }),
  )
  await page.locator('input[type="file"]').setInputFiles(futurePath)
  await expect(page.getByRole('dialog', { name: "Confirmer l'import" })).toBeVisible()
  await page.getByRole('dialog', { name: "Confirmer l'import" }).getByRole('button', { name: 'Remplacer' }).click()
  await expect(page.getByRole('alert')).toContainText('plus récente')

  // La modale reste ouverte après un import refusé : la fermer explicitement
  await page.getByRole('dialog', { name: "Confirmer l'import" }).getByRole('button', { name: 'Annuler' }).click()
  await expect(page.getByRole('dialog', { name: "Confirmer l'import" })).toHaveCount(0)

  // Les données locales sont intactes
  await page.getByRole('navigation').getByRole('button', { name: 'Boîte de réception' }).click()
  await expect(page.getByText(marker)).toBeVisible()
})
