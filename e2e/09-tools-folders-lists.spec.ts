import { expect, test } from '@playwright/test'
import { completeFastOnboarding, resetApp } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T54 — la To Do et le Budget sont présents d’office à l’installation, sans donnée préremplie dedans', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'To Do' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Budget' })).toBeVisible()

  await page.getByRole('button', { name: 'To Do' }).click()
  await expect(page.getByText('Cette liste est vide.')).toBeVisible()
})

test('T55 — créer une liste, cocher/décocher et trier, regrouper par rubrique', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter un outil' }).click()
  await page.getByRole('button', { name: 'Nouvelle liste' }).click()
  await page.getByLabel('Nom de la liste').fill('Courses')
  await page.getByRole('button', { name: 'Créer' }).click()

  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter un élément' }).click()
  await page.getByLabel('Élément').fill('Pommes')
  await page.getByLabel('Rubrique (optionnel)').fill('Fruits')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()

  await page.getByRole('button', { name: 'Ajouter un élément' }).click()
  await page.getByLabel('Élément').fill('Lait')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Fruits' })).toBeVisible()
  await expect(page.getByText('Pommes')).toBeVisible()
  await expect(page.getByText('Lait')).toBeVisible()

  await page.getByRole('button', { name: 'Cocher Lait' }).click()
  const items = page.locator('li')
  await expect(items.last()).toContainText('Lait')
})

test('T56 — le réveil d’un item de liste planifie une tâche ponctuelle', async ({ page }) => {
  await page.getByRole('button', { name: 'To Do' }).click()
  await page.getByRole('button', { name: 'Ajouter un élément' }).click()
  await page.getByLabel('Élément').fill('Appeler le médecin')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()

  await page.getByRole('button', { name: 'Planifier Appeler le médecin' }).click()
  await expect(page.getByRole('dialog', { name: 'Planifier Appeler le médecin' })).toBeVisible()
  await page.getByRole('button', { name: 'Planifier', exact: true }).click()

  await page.getByRole('button', { name: 'Accueil' }).click()
  await page.getByRole('button', { name: 'Déplier le planning' }).click()
  await expect(page.getByText('Appeler le médecin')).toBeVisible()
})

test('T57 — le widget Comptes de l’accueil saisit une dépense en un tap, sans régression du Budget', async ({ page }) => {
  await page.getByRole('button', { name: 'Budget' }).click()
  await page.getByRole('button', { name: 'Configurer le budget' }).click()
  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  await page.getByLabel('Nom').fill('Courses')
  await page.getByLabel('Périodicité').selectOption('week')
  await page.getByLabel('Montant').fill('60')
  await page.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Courses' })).toBeVisible()

  await page.getByRole('button', { name: 'Accueil' }).click()
  await page.getByRole('button', { name: 'Comptes' }).click()
  const dialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Montant').fill('15')
  await dialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: 'Budget' }).click()
  await expect(page.getByText(/sur 60,00.*15,00.*dépensés/)).toBeVisible()
})
