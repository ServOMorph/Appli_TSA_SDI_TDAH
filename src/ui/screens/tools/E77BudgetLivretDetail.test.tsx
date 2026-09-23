import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetDepositCategory } from '@/domain/entities/budgetDepositCategory'
import { E77BudgetLivretDetail } from './E77BudgetLivretDetail'

function makeAccount(overrides: Partial<BudgetAccount> = {}): BudgetAccount {
  return {
    id: 'account-1',
    name: 'Livret A',
    created_at: '2026-07-21T10:00:00.000Z',
    updated_at: '2026-07-21T10:00:00.000Z',
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

function makeCategory(overrides: Partial<BudgetDepositCategory> = {}): BudgetDepositCategory {
  return {
    id: 'category-1',
    account_id: 'account-1',
    name: 'Vacances',
    position: 0,
    created_at: '2026-07-21T10:00:00.000Z',
    updated_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

function renderScreen(overrides: Parameters<typeof makeAppContext>[0] = {}) {
  return makeAppContext({
    route: { name: 'budget-livret-detail', accountId: 'account-1' },
    ...overrides,
  })
}

describe('E77BudgetLivretDetail', () => {
  it('le retour utilise back("budget-livrets")', async () => {
    const ctx = renderScreen({ budgetAccounts: [makeAccount()] })
    renderWithApp(<E77BudgetLivretDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('budget-livrets')
  })

  it('affiche le solde et les mouvements du livret', () => {
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit(), makeDeposit({ id: 'deposit-2', amount: -20, date: '2026-01-05', label: 'Retrait courses' })],
    }))
    expect(screen.getByText(/30,00/)).toBeDefined()
    expect(screen.getByText(/05\/01\/2026.*Retrait.*20,00.*Retrait courses/)).toBeDefined()
  })

  it('ajoute un mouvement avec montant, motif et date', async () => {
    const createBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      createBudgetDeposit,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un mouvement' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un mouvement' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '25')
    await userEvent.type(within(dialog).getByLabelText('Motif'), 'Épargne du mois')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetDeposit).toHaveBeenCalledWith('account-1', 25, 'Épargne du mois', todayDate(), undefined)
  })

  it('bloque un retrait qui dépasse le solde du livret', async () => {
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit({ amount: 50 })],
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un mouvement' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un mouvement' })
    await userEvent.selectOptions(within(dialog).getByLabelText('Type'), 'withdrawal')
    await userEvent.type(within(dialog).getByLabelText('Montant'), '80')
    expect(within(dialog).getByRole('button', { name: 'Enregistrer' }).hasAttribute('disabled')).toBe(true)
  })

  it('modifie un mouvement existant', async () => {
    const updateBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit({ amount: 50, label: 'Dépôt initial' })],
      updateBudgetDeposit,
    }))
    await userEvent.click(screen.getByRole('button', { name: /Modifier le mouvement/ }))
    const dialog = screen.getByRole('dialog', { name: 'Modifier le mouvement' })
    await userEvent.clear(within(dialog).getByLabelText('Montant'))
    await userEvent.type(within(dialog).getByLabelText('Montant'), '70')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(updateBudgetDeposit).toHaveBeenCalledWith('deposit-1', 70, 'Dépôt initial', todayDate(), undefined)
  })

  it('supprime un mouvement', async () => {
    const deleteBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit()],
      deleteBudgetDeposit,
    }))
    await userEvent.click(screen.getByRole('button', { name: /Supprimer le mouvement/ }))
    expect(deleteBudgetDeposit).toHaveBeenCalledWith('deposit-1')
  })

  it('affiche la somme roulante de chaque sous-catégorie, groupée dans les mouvements (#a1317d93)', () => {
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDepositCategories: [makeCategory()],
      budgetDeposits: [
        makeDeposit({ id: 'deposit-cat', amount: 30, category_id: 'category-1', label: 'Acompte' }),
        makeDeposit({ id: 'deposit-hors', amount: 20, label: 'Non classé', date: '2026-01-05' }),
      ],
    }))
    const categories = within(screen.getByRole('region', { name: 'Catégories' }))
    expect(categories.getByText('Vacances')).toBeDefined()
    expect(categories.getByText(/30,00/)).toBeDefined()

    const movements = within(screen.getByRole('region', { name: 'Mouvements' }))
    expect(movements.getByRole('heading', { name: /Vacances.*30,00/ })).toBeDefined()
    expect(movements.getByRole('heading', { name: 'Hors catégorie' })).toBeDefined()
    expect(movements.getByText(/Acompte/)).toBeDefined()
    expect(movements.getByText(/Non classé/)).toBeDefined()
  })

  it('crée une sous-catégorie de livret', async () => {
    const createBudgetDepositCategory = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      createBudgetDepositCategory,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une catégorie' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter une catégorie' })
    await userEvent.type(within(dialog).getByLabelText('Nom'), 'Vacances')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Créer' }))
    expect(createBudgetDepositCategory).toHaveBeenCalledWith('account-1', 'Vacances')
  })

  it('renomme une sous-catégorie de livret', async () => {
    const renameBudgetDepositCategory = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDepositCategories: [makeCategory()],
      renameBudgetDepositCategory,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Renommer Vacances' }))
    const dialog = screen.getByRole('dialog', { name: 'Renommer la catégorie' })
    const input = within(dialog).getByLabelText('Nouveau nom de la catégorie')
    await userEvent.clear(input)
    await userEvent.type(input, 'Projets')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(renameBudgetDepositCategory).toHaveBeenCalledWith('category-1', 'Projets')
  })

  it('supprime une sous-catégorie sans mouvement sans confirmation', async () => {
    const deleteBudgetDepositCategory = vi.fn().mockResolvedValue('deleted')
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDepositCategories: [makeCategory()],
      deleteBudgetDepositCategory,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer Vacances' }))
    expect(deleteBudgetDepositCategory).toHaveBeenCalledWith('category-1')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('demande confirmation avant de supprimer une sous-catégorie qui a des mouvements', async () => {
    const deleteBudgetDepositCategory = vi.fn().mockResolvedValue('needs_confirmation')
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDepositCategories: [makeCategory()],
      budgetDeposits: [makeDeposit({ category_id: 'category-1' })],
      deleteBudgetDepositCategory,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer Vacances' }))
    const dialog = await screen.findByRole('dialog', { name: 'Supprimer la catégorie' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))
    expect(deleteBudgetDepositCategory).toHaveBeenLastCalledWith('category-1', true)
  })

  it('ajoute un mouvement rattaché à une sous-catégorie', async () => {
    const createBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({
      budgetAccounts: [makeAccount()],
      budgetDepositCategories: [makeCategory()],
      createBudgetDeposit,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un mouvement' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un mouvement' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '25')
    await userEvent.selectOptions(within(dialog).getByLabelText('Catégorie'), 'category-1')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetDeposit).toHaveBeenCalledWith('account-1', 25, '', todayDate(), 'category-1')
  })

  it('affiche un message si le livret n’existe plus', () => {
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({ budgetAccounts: [] }))
    expect(screen.getByText('Ce livret n\'existe plus.')).toBeDefined()
  })
})
