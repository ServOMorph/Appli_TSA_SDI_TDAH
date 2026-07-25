import { expect, test } from '@playwright/test'
import { completeFastOnboarding, resetApp } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T52 — configurer le Budget, saisir une dépense, un dépôt et corriger une saisie', async ({ page }) => {
  await page.getByRole('button', { name: 'Outils' }).click()
  await page.getByRole('button', { name: 'Budget' }).click()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  await page.getByLabel('Nom').fill('Courses')
  await page.getByLabel('Périodicité').selectOption('week')
  await page.getByLabel('Montant').fill('60')
  await page.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByText('Courses', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const incomeDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await incomeDialog.getByLabel('Nom').fill('Salaire')
  await incomeDialog.getByLabel('Type').selectOption('income')
  await incomeDialog.getByLabel('Périodicité').selectOption('month')
  await incomeDialog.getByLabel('Montant').fill('1500')
  await incomeDialog.getByRole('button', { name: 'Créer' }).click()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const monthlyExpenseDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await monthlyExpenseDialog.getByLabel('Nom').fill('Box')
  await monthlyExpenseDialog.getByLabel('Périodicité').selectOption('month')
  await monthlyExpenseDialog.getByLabel('Montant').fill('120')
  await monthlyExpenseDialog.getByRole('button', { name: 'Créer' }).click()

  await page.getByRole('button', { name: 'Ajouter un livret' }).click()
  await page.getByLabel('Nom du livret').fill('Livret A')
  await page.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByText('Livret A', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expenseDialog.getByLabel('Montant').fill('20')
  await expenseDialog.getByLabel('Libellé (facultatif)').fill('Intermarché')
  await expenseDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Dépensé.*20.*Restant.*40/)).toBeVisible()
  await expect(page.getByText(/Intermarché/)).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter un dépôt' }).click()
  const depositDialog = page.getByRole('dialog', { name: 'Ajouter un dépôt' })
  await depositDialog.getByLabel('Montant').fill('50')
  await depositDialog.getByLabel('Périodicité').selectOption('month')
  await depositDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Solde.*50/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer la dépense Intermarché' }).click()
  await expect(page.getByText(/Dépensé.*0.*Restant.*60/)).toBeVisible()
  await page.getByRole('button', { name: 'Supprimer le dépôt 50' }).click()
  await expect(page.getByText(/Solde.*0/)).toBeVisible()
  await expect(page.getByText(/Reste non budgétisé.*1.*380/)).toBeVisible()

  await page.getByRole('button', { name: 'Semaine précédente' }).click()
  await expect(page.getByText('Courses', { exact: true })).toBeVisible()
})

test('T53 — suppression en cascade d’un livret et d’une catégorie, sans donnée orpheline comptée', async ({ page }) => {
  await page.getByRole('button', { name: 'Outils' }).click()
  await page.getByRole('button', { name: 'Budget' }).click()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const incomeDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await incomeDialog.getByLabel('Nom').fill('Salaire')
  await incomeDialog.getByLabel('Type').selectOption('income')
  await incomeDialog.getByLabel('Périodicité').selectOption('month')
  await incomeDialog.getByLabel('Montant').fill('1500')
  await incomeDialog.getByRole('button', { name: 'Créer' }).click()

  await page.getByRole('button', { name: 'Ajouter un livret' }).click()
  await page.getByLabel('Nom du livret').fill('Livret A')
  await page.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByText('Livret A', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter un dépôt' }).click()
  const depositDialog = page.getByRole('dialog', { name: 'Ajouter un dépôt' })
  await depositDialog.getByLabel('Montant').fill('50')
  await depositDialog.getByLabel('Périodicité').selectOption('month')
  await depositDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Reste non budgétisé.*1.*450/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer Livret A' }).click()
  await expect(page.getByRole('dialog', { name: 'Supprimer le livret' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Supprimer le livret' }).getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucun livret configuré.')).toBeVisible()
  await expect(page.getByText(/Reste non budgétisé.*1.*500/)).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await expenseDialog.getByLabel('Nom').fill('Loisirs')
  await expenseDialog.getByLabel('Périodicité').selectOption('month')
  await expenseDialog.getByLabel('Montant').fill('100')
  await expenseDialog.getByRole('button', { name: 'Créer' }).click()

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const expenseEntryDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expenseEntryDialog.getByLabel('Catégorie').selectOption({ label: 'Loisirs' })
  await expenseEntryDialog.getByLabel('Montant').fill('40')
  await expenseEntryDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Dépensé.*40.*Restant.*60/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer Loisirs' }).click()
  await expect(page.getByRole('dialog', { name: 'Supprimer la catégorie' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Supprimer la catégorie' }).getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Loisirs', { exact: true })).not.toBeVisible()
  await expect(page.getByText(/Reste non budgétisé.*1.*500/)).toBeVisible()
})
