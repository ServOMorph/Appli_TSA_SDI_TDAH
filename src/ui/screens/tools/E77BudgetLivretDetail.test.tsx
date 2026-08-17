import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
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
    expect(createBudgetDeposit).toHaveBeenCalledWith('account-1', 25, 'Épargne du mois', todayDate())
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
    expect(updateBudgetDeposit).toHaveBeenCalledWith('deposit-1', 70, 'Dépôt initial', todayDate())
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

  it('affiche un message si le livret n’existe plus', () => {
    renderWithApp(<E77BudgetLivretDetail />, renderScreen({ budgetAccounts: [] }))
    expect(screen.getByText('Ce livret n\'existe plus.')).toBeDefined()
  })
})
