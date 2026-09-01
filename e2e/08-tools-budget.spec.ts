import { expect, test } from '@playwright/test'
import { completeFastOnboarding, resetApp } from './helpers/reset'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
  await completeFastOnboarding(page)
})

test('T52 — configurer le Budget, saisir une dépense, la consulter en fiche et la corriger', async ({ page }) => {
  await page.getByRole('button', { name: 'Budget' }).click()
  await page.getByRole('button', { name: 'Configurer le budget' }).click()
  const incomeDialog = page.getByRole('dialog', { name: 'Ajouter un revenu' })
  await incomeDialog.getByLabel('Montant').fill('1500')
  await incomeDialog.getByLabel('Libellé (facultatif)').fill('Salaire')
  await incomeDialog.getByRole('button', { name: 'Enregistrer' }).click()

  await page.getByRole('button', { name: 'Paramètres du budget' }).click()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const categoryDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await categoryDialog.getByLabel('Nom').fill('Courses')
  await categoryDialog.getByLabel('Périodicité').selectOption('week')
  await categoryDialog.getByLabel('Montant').fill('60')
  await categoryDialog.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Courses' })).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter un livret' }).click()
  await page.getByLabel('Nom du livret').fill('Livret A')
  await page.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByText('Livret A', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Ouvrir Livret A' }).click()
  await page.getByRole('button', { name: 'Ajouter un mouvement' }).click()
  const movementDialog = page.getByRole('dialog', { name: 'Ajouter un mouvement' })
  await movementDialog.getByLabel('Montant').fill('50')
  await movementDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Solde/)).toBeVisible()
  await expect(page.getByText('50,00 €', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Configurer le budget' })).toBeVisible()

  await page.getByRole('button', { name: 'Ouvrir Courses' }).click()
  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
  await expect(page.getByText(/dépensés sur 60,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expenseDialog.getByLabel('Montant').fill('20')
  await expenseDialog.getByLabel('Libellé (facultatif)').fill('Intermarché')
  await expenseDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/20,00.*dépensés sur 60,00/)).toBeVisible()
  await expect(page.getByText(/Intermarché.*20,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer la dépense Intermarché' }).click()
  await expect(page.getByText('Aucune dépense sur cette période.')).toBeVisible()
  await expect(page.getByText(/0,00.*dépensés sur 60,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Configurer le budget' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ouvrir Courses' })).toBeVisible()
})

test('T53 — suppression en cascade d’un livret et d’une catégorie, sans donnée orpheline comptée', async ({ page }) => {
  await page.getByRole('button', { name: 'Budget' }).click()
  await page.getByRole('button', { name: 'Configurer le budget' }).click()
  const incomeDialog = page.getByRole('dialog', { name: 'Ajouter un revenu' })
  await incomeDialog.getByLabel('Montant').fill('1500')
  await incomeDialog.getByRole('button', { name: 'Enregistrer' }).click()

  await page.getByRole('button', { name: 'Paramètres du budget' }).click()

  await page.getByRole('button', { name: 'Ajouter un livret' }).click()
  await page.getByLabel('Nom du livret').fill('Livret A')
  await page.getByRole('button', { name: 'Créer' }).click()

  await page.getByRole('button', { name: 'Ouvrir Livret A' }).click()
  await page.getByRole('button', { name: 'Ajouter un mouvement' }).click()
  const movementDialog = page.getByRole('dialog', { name: 'Ajouter un mouvement' })
  await movementDialog.getByLabel('Montant').fill('50')
  await movementDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/Solde/)).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByText(/50,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer Livret A' }).click()
  await expect(page.getByRole('dialog', { name: 'Supprimer le livret' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Supprimer le livret' }).getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucun livret configuré.')).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click()
  const categoryDialog = page.getByRole('dialog', { name: 'Ajouter une catégorie' })
  await categoryDialog.getByLabel('Nom').fill('Loisirs')
  await categoryDialog.getByLabel('Périodicité').selectOption('month')
  await categoryDialog.getByLabel('Montant').fill('100')
  await categoryDialog.getByRole('button', { name: 'Créer' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Loisirs' })).toBeVisible()

  await page.getByRole('button', { name: 'Ouvrir Loisirs' }).click()
  await page.getByRole('button', { name: 'Ajouter une dépense' }).click()
  const expenseDialog = page.getByRole('dialog', { name: 'Ajouter une dépense' })
  await expenseDialog.getByLabel('Montant').fill('40')
  await expenseDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(page.getByText(/40,00.*dépensés sur 100,00/)).toBeVisible()

  await page.getByRole('button', { name: 'Supprimer la catégorie' }).click()
  await expect(page.getByRole('dialog', { name: 'Supprimer la catégorie' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Supprimer la catégorie' }).getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir Loisirs' })).toHaveCount(0)
  await expect(page.getByText('Aucune catégorie configurée.')).toBeVisible()

  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ouvrir Mon compte' }).getByText('Non configuré')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ouvrir Mes livrets' }).getByText('Aucun livret')).toBeVisible()
})
