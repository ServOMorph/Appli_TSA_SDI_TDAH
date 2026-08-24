import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'
import { E71Budget } from './E71Budget'

function makeCategory(overrides: Partial<BudgetCategory> = {}): BudgetCategory {
  return {
    id: 'category-1',
    name: 'Courses',
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
    date: todayDate(),
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

function makeDeposit(overrides: Partial<BudgetDeposit> = {}): BudgetDeposit {
  return {
    id: 'deposit-1',
    account_id: 'account-1',
    amount: 50,
    date: todayDate(),
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

function makeIncomeEntry(overrides: Partial<BudgetIncomeEntry> = {}): BudgetIncomeEntry {
  return {
    id: 'income-1',
    amount: 500,
    label: 'Salaire',
    date: todayDate(),
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

describe('E71Budget', () => {
  it('n’affiche qu’un bouton « Configurer le budget » tant qu’aucun revenu n’a été saisi', () => {
    renderWithApp(<E71Budget />)
    expect(screen.getByRole('heading', { name: 'Budget' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Configurer le budget' })).toBeDefined()
    expect(screen.queryByText('Montant total')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ouvrir Mon compte' })).toBeNull()
  })

  it('le retour utilise back("dashboard") pour respecter l\'origine réelle de navigation, y compris non configuré', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E71Budget />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('dashboard')
  })

  it('configure le budget en saisissant le premier revenu', async () => {
    const createBudgetIncomeEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ createBudgetIncomeEntry }))
    await userEvent.click(screen.getByRole('button', { name: 'Configurer le budget' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un revenu' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '500')
    await userEvent.type(within(dialog).getByLabelText('Libellé (facultatif)'), 'Salaire')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetIncomeEntry).toHaveBeenCalledWith(500, 'Salaire', todayDate())
  })

  it('affiche le bouton « Modifier le budget » une fois un revenu enregistré', () => {
    renderWithApp(<E71Budget />, makeAppContext({ budgetIncomeEntries: [makeIncomeEntry()] }))
    expect(screen.getByRole('button', { name: 'Modifier le budget' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Configurer le budget' })).toBeNull()
  })

  it('affiche le montant total des revenus saisis', () => {
    renderWithApp(<E71Budget />, makeAppContext({ budgetIncomeEntries: [makeIncomeEntry({ amount: 500 })] }))
    expect(screen.getByText('Montant total')).toBeDefined()
    expect(screen.getAllByText(/500,00/).length).toBeGreaterThan(0)
  })

  it('déduit les dépôts sur livrets du montant total et recrédite les retraits', () => {
    renderWithApp(<E71Budget />, makeAppContext({
      budgetIncomeEntries: [makeIncomeEntry({ amount: 500 })],
      budgetDeposits: [makeDeposit({ amount: 120 })],
    }))
    expect(screen.getByText(/380,00/)).toBeDefined()
    expect(screen.getByText(/500,00.*de revenus.*-120,00.*livrets/)).toBeDefined()
  })

  it('déduit « Mon compte » du montant total, en comptant ×4 chaque dépense d’une sous-catégorie Semaine', () => {
    renderWithApp(<E71Budget />, makeAppContext({
      budgetIncomeEntries: [makeIncomeEntry({ amount: 2000 })],
      budgetCategories: [
        makeCategory({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
        makeCategory({ id: 'courses', name: 'Courses', period: 'week', amount: 60 }),
      ],
      budgetEntries: [makeEntry({ category_id: 'courses', amount: 20 })],
    }))
    expect(screen.getByText(/mon compte/)).toBeDefined()
  })

  it('navigue vers Mon compte et Mes livrets avec leurs totaux respectifs', async () => {
    const ctx = makeAppContext({
      budgetIncomeEntries: [makeIncomeEntry()],
      budgetCategories: [makeCategory()],
      budgetEntries: [makeEntry()],
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit()],
    })
    renderWithApp(<E71Budget />, ctx)
    expect(within(screen.getByRole('button', { name: 'Ouvrir Mes livrets' })).getByText(/50,00/)).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Mon compte' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-account')
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Mes livrets' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-livrets')
  })

  it('renvoie la configuration du budget vers l’écran dédié', async () => {
    const ctx = makeAppContext({ budgetIncomeEntries: [makeIncomeEntry()] })
    renderWithApp(<E71Budget />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Paramètres du budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
  })

  it('donne accès à toutes les entrées de « Montant total », modifiables et supprimables', async () => {
    const updateBudgetIncomeEntry = vi.fn().mockResolvedValue(undefined)
    const deleteBudgetIncomeEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({
      budgetIncomeEntries: [makeIncomeEntry({ id: 'income-1', amount: 500, label: 'Salaire' }), makeIncomeEntry({ id: 'income-2', amount: 80, label: 'Prime', date: '2026-01-05' })],
      updateBudgetIncomeEntry,
      deleteBudgetIncomeEntry,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Modifier le budget' }))
    const manager = screen.getByRole('dialog', { name: 'Modifier le budget' })
    expect(within(manager).getByText(/Salaire.*500,00/)).toBeDefined()
    expect(within(manager).getByText(/Prime.*80,00/)).toBeDefined()

    await userEvent.click(within(manager).getByRole('button', { name: 'Modifier le revenu Prime' }))
    const editDialog = screen.getByRole('dialog', { name: 'Modifier le revenu' })
    await userEvent.clear(within(editDialog).getByLabelText('Montant'))
    await userEvent.type(within(editDialog).getByLabelText('Montant'), '90')
    await userEvent.click(within(editDialog).getByRole('button', { name: 'Enregistrer' }))
    expect(updateBudgetIncomeEntry).toHaveBeenCalledWith('income-2', 90, 'Prime', '2026-01-05')

    await userEvent.click(within(manager).getByRole('button', { name: 'Supprimer le revenu Salaire' }))
    expect(deleteBudgetIncomeEntry).toHaveBeenCalledWith('income-1')
  })

  it('ajoute un nouveau revenu depuis la fenêtre de modification du budget', async () => {
    const createBudgetIncomeEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({
      budgetIncomeEntries: [makeIncomeEntry()],
      createBudgetIncomeEntry,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Modifier le budget' }))
    const manager = screen.getByRole('dialog', { name: 'Modifier le budget' })
    await userEvent.click(within(manager).getByRole('button', { name: 'Ajouter un revenu' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un revenu' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '200')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetIncomeEntry).toHaveBeenCalledWith(200, '', todayDate())
  })
})
