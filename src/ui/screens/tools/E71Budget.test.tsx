import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import { E71Budget } from './E71Budget'

function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return {
    id: 'category-1',
    name: 'Courses',
    kind: 'expense',
    period: 'week',
    amount: 60,
    position: 0,
    created_at: '2026-07-21T10:00:00.000Z',
    updated_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

function makeAccount(overrides: Partial<BudgetAccount> = {}): BudgetAccount {
  return {
    id: 'account-1',
    name: 'Livret A',
    created_at: '2026-07-21T10:00:00.000Z',
    updated_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

function makeEntry(overrides: Partial<BudgetEntry> = {}): BudgetEntry {
  return {
    id: 'entry-1',
    category_id: 'category-1',
    amount: 20,
    label: 'Intermarché',
    date: new Date().toISOString().slice(0, 10),
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

function makeDeposit(overrides: Partial<BudgetDeposit> = {}): BudgetDeposit {
  return {
    id: 'deposit-1',
    account_id: 'account-1',
    amount: 50,
    period: 'month',
    date: new Date().toISOString().slice(0, 10),
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

describe('E71Budget', () => {
  it('affiche les sections semaine et mois sans configuration', () => {
    renderWithApp(<E71Budget />)
    expect(screen.getByRole('heading', { name: 'Budget' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'À la semaine' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Au mois' })).toBeDefined()
    expect(screen.getAllByText('Non configuré')).toHaveLength(2)
    expect(screen.getByText('Aucun livret configuré.')).toBeDefined()
  })

  it('le retour utilise back("dashboard") pour respecter l\'origine réelle de navigation', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E71Budget />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('dashboard')
  })

  it('crée une catégorie avec ses paramètres', async () => {
    const createBudgetCategory = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ createBudgetCategory }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une catégorie' }))
    await userEvent.type(screen.getByLabelText('Nom'), 'Salaire')
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'income')
    await userEvent.selectOptions(screen.getByLabelText('Périodicité'), 'month')
    await userEvent.type(screen.getByLabelText('Montant'), '1500')
    await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
    expect(createBudgetCategory).toHaveBeenCalledWith('Salaire', 'income', 'month', 1500)
  })

  it('permet de renommer et modifier le montant d’une catégorie', async () => {
    const renameBudgetCategory = vi.fn().mockResolvedValue(undefined)
    const updateBudgetCategoryAmount = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ budgetCategories: [makeCategory()], renameBudgetCategory, updateBudgetCategoryAmount }))
    await userEvent.click(screen.getByRole('button', { name: 'Renommer Courses' }))
    await userEvent.clear(screen.getByLabelText('Nouveau nom de la catégorie'))
    await userEvent.type(screen.getByLabelText('Nouveau nom de la catégorie'), 'Courses maison')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(renameBudgetCategory).toHaveBeenCalledWith('category-1', 'Courses maison')

    await userEvent.click(screen.getByRole('button', { name: 'Modifier le montant de Courses' }))
    await userEvent.clear(screen.getByLabelText('Nouveau montant'))
    await userEvent.type(screen.getByLabelText('Nouveau montant'), '75')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(updateBudgetCategoryAmount).toHaveBeenCalledWith('category-1', 75)
  })

  it('demande confirmation avant de supprimer une catégorie ayant des dépenses', async () => {
    const deleteBudgetCategory = vi.fn().mockResolvedValueOnce('needs_confirmation').mockResolvedValueOnce('deleted')
    renderWithApp(<E71Budget />, makeAppContext({ budgetCategories: [makeCategory()], deleteBudgetCategory }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer Courses' }))
    expect(screen.getByRole('dialog', { name: 'Supprimer la catégorie' })).toBeDefined()
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Supprimer la catégorie' })).getByRole('button', { name: 'Supprimer' }))
    expect(deleteBudgetCategory).toHaveBeenNthCalledWith(1, 'category-1')
    expect(deleteBudgetCategory).toHaveBeenNthCalledWith(2, 'category-1', true)
  })

  it('crée et renomme un livret', async () => {
    const createBudgetAccount = vi.fn().mockResolvedValue(undefined)
    const renameBudgetAccount = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ budgetAccounts: [makeAccount()], createBudgetAccount, renameBudgetAccount }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un livret' }))
    await userEvent.type(screen.getByLabelText('Nom du livret'), 'Épargne')
    await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
    expect(createBudgetAccount).toHaveBeenCalledWith('Épargne')

    await userEvent.click(screen.getByRole('button', { name: 'Renommer Livret A' }))
    await userEvent.clear(screen.getByLabelText('Nouveau nom du livret'))
    await userEvent.type(screen.getByLabelText('Nouveau nom du livret'), 'Livret jeune')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(renameBudgetAccount).toHaveBeenCalledWith('account-1', 'Livret jeune')
  })

  it('saisit et corrige une dépense', async () => {
    const createBudgetEntry = vi.fn().mockResolvedValue(undefined)
    const deleteBudgetEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ budgetCategories: [makeCategory()], budgetEntries: [makeEntry()], createBudgetEntry, deleteBudgetEntry }))
    expect(screen.getByText(/Dépensé/)).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une dépense' }))
    await userEvent.type(screen.getByLabelText('Montant'), '15')
    await userEvent.type(screen.getByLabelText('Libellé (facultatif)'), 'Marché')
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Ajouter une dépense' })).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetEntry).toHaveBeenCalledWith('category-1', 15, 'Marché')
    expect(screen.getByRole('button', { name: 'Supprimer la dépense Intermarché' }).textContent).toBe('Supprimer la dépense')
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer la dépense Intermarché' }))
    expect(deleteBudgetEntry).toHaveBeenCalledWith('entry-1')
  })

  it('saisit un dépôt, affiche le solde et permet sa correction', async () => {
    const createBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    const deleteBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ budgetAccounts: [makeAccount()], budgetDeposits: [makeDeposit()], createBudgetDeposit, deleteBudgetDeposit }))
    expect(screen.getByText(/Solde.*50/)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Supprimer le dépôt 50' }).textContent).toBe('Supprimer le dépôt')
    expect(screen.getByRole('button', { name: 'Supprimer Livret A' }).textContent).toBe('Supprimer le livret')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un dépôt' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un dépôt' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '25')
    await userEvent.selectOptions(within(dialog).getByLabelText('Périodicité'), 'week')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetDeposit).toHaveBeenCalledWith('account-1', 25, 'week')
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer le dépôt 50' }))
    expect(deleteBudgetDeposit).toHaveBeenCalledWith('deposit-1')
  })
})
