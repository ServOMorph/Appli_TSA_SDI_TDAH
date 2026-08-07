import { expect, test } from '@playwright/test'
import { completeFastOnboarding, resetApp } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T52 — configurer le Budget, saisir une dépense, la consulter en fiche et la corriger', async ({ page }) => {
  await page.getByRole('button', { name: 'Budget' }).click()
  await page.getByRole('button', { name: 'Configurer le budget' }).click()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const weeklyDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await weeklyDialog.getByLabel('Nom').fill('Courses')
  await weeklyDialog.getByLabel('Périodicité').selectOption('week')
  await weeklyDialog.getByLabel('Montant').fill('60')
  await weeklyDialog.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Courses' })).toBeVisible()

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
  await expect(page.getByText(/Solde.*50,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByText(/sur 60,00.*0,00.*dépensés/)).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expenseDialog.getByLabel('Montant').fill('20')
  await expenseDialog.getByLabel('Libellé (facultatif)').fill('Intermarché')
  await expenseDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/sur 60,00.*20,00.*dépensés/)).toBeVisible()
  await expect(page.getByText('Mes livrets')).toBeVisible()

  await page.getByRole('button', { name: 'Ouvrir Courses' }).click()
  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
  await expect(page.getByText(/Intermarché.*20,00/)).toBeVisible()
  await page.getByRole('button', { name: 'Supprimer la dépense Intermarché' }).click()
  await expect(page.getByText('Aucune dépense sur cette période.')).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByText(/sur 60,00.*0,00.*dépensés/)).toBeVisible()

  await page.getByRole('button', { name: 'Période précédente' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Courses' })).toBeVisible()
})

test('T53 — suppression en cascade d’un livret et d’une catégorie, sans donnée orpheline comptée', async ({ page }) => {
  await page.getByRole('button', { name: 'Budget' }).click()
  await page.getByRole('button', { name: 'Configurer le budget' }).click()

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

  await page.getByRole('button', { name: 'Ajouter un dépôt' }).click()
  const depositDialog = page.getByRole('dialog', { name: 'Ajouter un dépôt' })
  await depositDialog.getByLabel('Montant').fill('50')
  await depositDialog.getByLabel('Périodicité').selectOption('month')
  await depositDialog.getByRole('button', { name: 'Enregistrer' }).click()

  const unallocated = page.getByRole('region', { name: 'Non alloué' })
  await expect(unallocated.getByText(/1.*450,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer Livret A' }).click()
  await expect(page.getByRole('dialog', { name: 'Supprimer le livret' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Supprimer le livret' }).getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucun livret configuré.')).toBeVisible()
  await expect(unallocated.getByText(/1.*500,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await expenseDialog.getByLabel('Nom').fill('Loisirs')
  await expenseDialog.getByLabel('Périodicité').selectOption('month')
  await expenseDialog.getByLabel('Montant').fill('100')
  await expenseDialog.getByRole('button', { name: 'Créer' }).click()
  await expect(unallocated.getByText(/1.*400,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await page.getByRole('tab', { name: 'Mois' }).click()

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const entryDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await entryDialog.getByRole('button', { name: 'Loisirs' }).click()
  await entryDialog.getByLabel('Montant').fill('40')
  await entryDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/sur 100,00.*40,00.*dépensés/)).toBeVisible()

  await page.getByRole('button', { name: 'Ouvrir Loisirs' }).click()
  await page.getByRole('button', { name: 'Supprimer la catégorie' }).click()
  await expect(page.getByRole('dialog', { name: 'Supprimer la catégorie' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Supprimer la catégorie' }).getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('tab', { name: 'Mois' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Loisirs' })).toHaveCount(0)
  await expect(page.getByText('Non configuré')).toBeVisible()
})
