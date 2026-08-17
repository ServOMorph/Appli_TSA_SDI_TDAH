import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
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
    period: 'month',
    date: todayDate(),
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

describe('E71Budget', () => {
  it('affiche une seule période à la fois et signale l’absence de configuration', () => {
    renderWithApp(<E71Budget />)
    expect(screen.getByRole('heading', { name: 'Budget' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'Semaine' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Mois' }).getAttribute('aria-selected')).toBe('false')
    expect(screen.getByText('Il me reste')).toBeDefined()
    expect(screen.getByText('Non configuré')).toBeDefined()
    expect(screen.getByText('Aucune catégorie de dépense pour cette période.')).toBeDefined()
    expect(screen.getByText('Aucun livret')).toBeDefined()
  })

  it('le retour utilise back("dashboard") pour respecter l\'origine réelle de navigation', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E71Budget />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('dashboard')
  })

  it('met en tête ce qu’il reste à dépenser sur la période, avec sa jauge', () => {
    renderWithApp(<E71Budget />, makeAppContext({ budgetCategories: [makeCategory()], budgetEntries: [makeEntry()] }))
    expect(screen.getByText(/sur 60,00.*20,00.*dépensés/)).toBeDefined()
    const gauge = screen.getByRole('progressbar', { name: 'Budget consommé sur la période' })
    expect(gauge.getAttribute('aria-valuenow')).toBe('33')
  })

  it('bascule entre semaine et mois sans empiler les deux périodes', async () => {
    const ctx = makeAppContext({
      budgetCategories: [makeCategory(), makeCategory({ id: 'category-2', name: 'Loyer', period: 'month', amount: 600 })],
    })
    renderWithApp(<E71Budget />, ctx)
    expect(screen.getByRole('button', { name: 'Ouvrir Courses' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Ouvrir Loyer' })).toBeNull()

    await userEvent.click(screen.getByRole('tab', { name: 'Mois' }))
    expect(screen.getByRole('button', { name: 'Ouvrir Loyer' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Ouvrir Courses' })).toBeNull()
  })

  it('change de période affichée sans changer d’onglet', async () => {
    renderWithApp(<E71Budget />, makeAppContext({ budgetCategories: [makeCategory()], budgetEntries: [makeEntry()] }))
    await userEvent.click(screen.getByRole('button', { name: 'Période précédente' }))
    expect(screen.getByText(/sur 60,00.*0,00.*dépensés/)).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Période suivante' }))
    expect(screen.getByText(/sur 60,00.*20,00.*dépensés/)).toBeDefined()
  })

  it('ouvre la fiche d’une catégorie avec la période consultée', async () => {
    const ctx = makeAppContext({ budgetCategories: [makeCategory()] })
    renderWithApp(<E71Budget />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Courses' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'budget-category-detail', categoryId: 'category-1', date: todayDate() })
  })

  it('renvoie la configuration vers l’écran dédié', async () => {
    const ctx = makeAppContext({ budgetAccounts: [makeAccount()], budgetDeposits: [makeDeposit()] })
    renderWithApp(<E71Budget />, ctx)
    expect(screen.getByText(/50,00/)).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Configurer le budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
    await userEvent.click(screen.getByRole('button', { name: 'Gérer les livrets' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
  })

  it('saisit une dépense avec sa catégorie en pastille et sa date', async () => {
    const createBudgetEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({
      budgetCategories: [makeCategory(), makeCategory({ id: 'category-2', name: 'Plaisir', amount: 40 })],
      createBudgetEntry,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une dépense' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter une dépense' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Plaisir' }))
    await userEvent.type(within(dialog).getByLabelText('Montant'), '15')
    await userEvent.type(within(dialog).getByLabelText('Libellé (facultatif)'), 'Marché')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetEntry).toHaveBeenCalledWith('category-2', 15, 'Marché', todayDate())
  })

  it('saisit un revenu avec son montant, son libellé et sa date', async () => {
    const createBudgetIncomeEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E71Budget />, makeAppContext({ createBudgetIncomeEntry }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un revenu' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un revenu' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '500')
    await userEvent.type(within(dialog).getByLabelText('Libellé (facultatif)'), 'Salaire')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetIncomeEntry).toHaveBeenCalledWith(500, 'Salaire', todayDate())
  })

  it('affiche le montant total des revenus saisis sur la période', () => {
    renderWithApp(<E71Budget />, makeAppContext({
      budgetIncomeEntries: [{ id: 'income-1', amount: 500, label: 'Salaire', date: todayDate(), created_at: todayDate() }],
    }))
    expect(screen.getByText('Montant total')).toBeDefined()
    expect(screen.getByText(/500,00/)).toBeDefined()
  })

  it('désactive la saisie de dépense tant qu’aucune catégorie de dépense n’existe', () => {
    renderWithApp(<E71Budget />, makeAppContext({ budgetCategories: [makeCategory({ kind: 'income', name: 'Salaire' })] }))
    expect(screen.getByRole('button', { name: 'Ajouter une dépense' }).hasAttribute('disabled')).toBe(true)
  })
})
