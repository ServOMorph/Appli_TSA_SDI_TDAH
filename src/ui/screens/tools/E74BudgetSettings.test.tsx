import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import { E74BudgetSettings } from './E74BudgetSettings'

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

describe('E74BudgetSettings', () => {
  it('crée une catégorie avec ses paramètres', async () => {
    const createBudgetCategory = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E74BudgetSettings />, makeAppContext({ createBudgetCategory }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une catégorie' }))
    await userEvent.type(screen.getByLabelText('Nom'), 'Loyer')
    await userEvent.selectOptions(screen.getByLabelText('Périodicité'), 'month')
    await userEvent.type(screen.getByLabelText('Montant'), '600')
    await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
    expect(createBudgetCategory).toHaveBeenCalledWith('Loyer', 'expense', 'month', 600)
  })

  it('ouvre la fiche d’une catégorie', async () => {
    const ctx = makeAppContext({ budgetCategories: [makeCategory()] })
    renderWithApp(<E74BudgetSettings />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Courses' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'budget-category-detail', categoryId: 'category-1', date: todayDate() })
  })

  it('liste tous les dépôts d’un livret, pas seulement ceux de la période courante', () => {
    renderWithApp(<E74BudgetSettings />, makeAppContext({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit(), makeDeposit({ id: 'deposit-2', amount: 30, date: '2026-01-05' })],
    }))
    expect(screen.getByText(/Solde.*80,00/)).toBeDefined()
    expect(screen.getByText(/05\/01\/2026.*Dépôt.*30,00/)).toBeDefined()
  })

  it('crée et renomme un livret', async () => {
    const createBudgetAccount = vi.fn().mockResolvedValue(undefined)
    const renameBudgetAccount = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E74BudgetSettings />, makeAppContext({ budgetAccounts: [makeAccount()], createBudgetAccount, renameBudgetAccount }))
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

  it('saisit un dépôt et supprime un livret après confirmation', async () => {
    const createBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    const deleteBudgetAccount = vi.fn().mockResolvedValueOnce('needs_confirmation').mockResolvedValueOnce('deleted')
    renderWithApp(<E74BudgetSettings />, makeAppContext({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit()],
      createBudgetDeposit,
      deleteBudgetAccount,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un mouvement' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un mouvement' })
    await userEvent.type(within(dialog).getByLabelText('Montant'), '25')
    await userEvent.selectOptions(within(dialog).getByLabelText('Périodicité'), 'week')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetDeposit).toHaveBeenCalledWith('account-1', 25, 'week')

    await userEvent.click(screen.getByRole('button', { name: 'Supprimer Livret A' }))
    const confirm = screen.getByRole('dialog', { name: 'Supprimer le livret' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Supprimer' }))
    expect(deleteBudgetAccount).toHaveBeenNthCalledWith(1, 'account-1')
    expect(deleteBudgetAccount).toHaveBeenNthCalledWith(2, 'account-1', true)
  })

  it('retire de l’argent d’un livret, montant envoyé négatif', async () => {
    const createBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E74BudgetSettings />, makeAppContext({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit()],
      createBudgetDeposit,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un mouvement' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un mouvement' })
    await userEvent.selectOptions(within(dialog).getByLabelText('Type'), 'withdrawal')
    await userEvent.type(within(dialog).getByLabelText('Montant'), '20')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetDeposit).toHaveBeenCalledWith('account-1', -20, 'month')
  })

  it('bloque un retrait qui dépasse le solde du livret', async () => {
    renderWithApp(<E74BudgetSettings />, makeAppContext({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit({ amount: 50 })],
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un mouvement' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter un mouvement' })
    await userEvent.selectOptions(within(dialog).getByLabelText('Type'), 'withdrawal')
    await userEvent.type(within(dialog).getByLabelText('Montant'), '80')
    expect(within(dialog).getByRole('button', { name: 'Enregistrer' }).hasAttribute('disabled')).toBe(true)
  })

  it('affiche un retrait dans la liste des mouvements du livret', () => {
    renderWithApp(<E74BudgetSettings />, makeAppContext({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit({ id: 'deposit-2', amount: -20, date: '2026-01-05' })],
    }))
    expect(screen.getByText(/05\/01\/2026.*Retrait.*20,00/)).toBeDefined()
  })

  it('supprime un dépôt', async () => {
    const deleteBudgetDeposit = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E74BudgetSettings />, makeAppContext({
      budgetAccounts: [makeAccount()],
      budgetDeposits: [makeDeposit()],
      deleteBudgetDeposit,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer le dépôt 50' }))
    expect(deleteBudgetDeposit).toHaveBeenCalledWith('deposit-1')
  })

  it('le retour repart vers le Budget', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E74BudgetSettings />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('budget')
  })
})
