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
  await expect(page.getByText("Cette liste n'a pas encore de catégorie.")).toBeVisible()
})

test('T55 — créer une liste avec catégorie, ajouter des éléments, cocher trie la liste', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter un outil' }).click()
  await page.getByRole('button', { name: 'Nouvelle liste' }).click()
  await page.getByLabel('Nom de la liste').fill('Courses')
  await page.getByLabel('Nouvelle catégorie').fill('Fruits')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await page.getByRole('button', { name: 'Créer' }).click()

  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
  await page.getByRole('button', { name: /^Fruits/ }).click()

  await page.getByRole('button', { name: 'Ajouter un élément' }).click()
  await page.getByLabel('Élément', { exact: true }).fill('Pommes')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()

  await page.getByRole('button', { name: 'Ajouter un élément' }).click()
  await page.getByLabel('Élément', { exact: true }).fill('Bananes')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()

  await expect(page.getByText('Pommes')).toBeVisible()
  await expect(page.getByText('Bananes')).toBeVisible()

  await page.getByRole('button', { name: 'Cocher Pommes' }).click()
  const items = page.locator('li')
  await expect(items.last()).toContainText('Pommes')
})

test('T56 — le réveil d’un item de liste planifie une tâche ponctuelle', async ({ page }) => {
  await page.getByRole('button', { name: 'To Do' }).click()
  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  await page.getByLabel('Nom de la catégorie').fill('Santé')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await page.getByRole('button', { name: /^Santé/ }).click()

  await page.getByRole('button', { name: 'Ajouter un élément' }).click()
  await page.getByLabel('Élément', { exact: true }).fill('Appeler le médecin')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()

  await page.getByRole('button', { name: 'Planifier Appeler le médecin' }).click()
  await expect(page.getByRole('dialog', { name: 'Planifier Appeler le médecin' })).toBeVisible()
  await page.getByRole('button', { name: 'Planifier', exact: true }).click()

  await page.getByRole('button', { name: 'Accueil' }).click()
  await expect(page.getByText('Appeler le médecin')).toBeVisible()
})

test('T57 — le widget Comptes de l’accueil ouvre le suivi des sous-catégories, sans régression du Budget', async ({ page }) => {
  await page.getByRole('button', { name: 'Budget' }).click()
  await page.getByRole('button', { name: 'Configurer le budget' }).click()
  const incomeDialog = page.getByRole('dialog', { name: 'Ajouter un revenu' })
  await incomeDialog.getByLabel('Montant').fill('1500')
  await incomeDialog.getByRole('button', { name: 'Enregistrer' }).click()

  await page.getByRole('button', { name: 'Paramètres du budget' }).click()
  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const categoryDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await categoryDialog.getByLabel('Nom').fill('Courses')
  await categoryDialog.getByLabel('Périodicité').selectOption('week')
  await categoryDialog.getByLabel('Montant').fill('60')
  await categoryDialog.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Courses' })).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'AuDHD' })).toBeVisible()

  await page.getByRole('button', { name: 'Comptes' }).click()
  await expect(page.getByRole('heading', { name: 'Comptes' })).toBeVisible()
  await page.getByRole('button', { name: 'Ouvrir Courses' }).click()

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expenseDialog.getByLabel('Montant').fill('15')
  await expenseDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/15,00.*dépensés sur 60,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'AuDHD' })).toBeVisible()

  await page.getByRole('button', { name: 'Budget' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Mon compte' })).toBeVisible()
})
