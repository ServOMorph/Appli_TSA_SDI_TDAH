import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import { E76BudgetLivrets } from './E76BudgetLivrets'

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

describe('E76BudgetLivrets', () => {
  it('le retour utilise back("budget")', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E76BudgetLivrets />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('budget')
  })

  it('propose la configuration si aucun livret n’existe', async () => {
    const ctx = makeAppContext({ budgetAccounts: [] })
    renderWithApp(<E76BudgetLivrets />, ctx)
    expect(screen.getByText('Aucun livret configuré.')).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Configurer un livret' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
  })

  it('affiche le total et le solde de chaque livret', async () => {
    const ctx = makeAppContext({
      budgetAccounts: [makeAccount({ id: 'account-1', name: 'Livret A' }), makeAccount({ id: 'account-2', name: 'Livret B' })],
      budgetDeposits: [makeDeposit({ account_id: 'account-1', amount: 50 }), makeDeposit({ id: 'deposit-2', account_id: 'account-2', amount: 30 })],
    })
    renderWithApp(<E76BudgetLivrets />, ctx)
    expect(screen.getByText(/80,00/)).toBeDefined()
    expect(screen.getByText('Livret A')).toBeDefined()
    expect(screen.getByText('Livret B')).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Livret A' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'budget-livret-detail', accountId: 'account-1' })
  })

  it('ouvre les paramètres du budget', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E76BudgetLivrets />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Paramètres du budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
  })
})
