import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AppProvider, useApp } from './AppContext'

function BudgetPanel() {
  const {
    loading,
    deleteAllData,
    budgetCategories,
    budgetAccounts,
    budgetEntries,
    budgetDeposits,
    createBudgetCategory,
    renameBudgetCategory,
    updateBudgetCategoryAmount,
    deleteBudgetCategory,
    createBudgetAccount,
    renameBudgetAccount,
    deleteBudgetAccount,
    createBudgetEntry,
    deleteBudgetEntry,
    createBudgetDeposit,
    deleteBudgetDeposit,
  } = useApp()
  const category = budgetCategories.find((item) => item.name === 'Courses')
  const account = budgetAccounts.find((item) => item.name === 'Livret A')

  return (
    <>
      <div data-testid="ready">{String(!loading)}</div>
      <div data-testid="category">{category ? `${category.name}|${category.amount}` : 'none'}</div>
      <div data-testid="account">{account?.name ?? 'none'}</div>
      <div data-testid="entry-count">{budgetEntries.length}</div>
      <div data-testid="deposit-count">{budgetDeposits.length}</div>
      <button onClick={() => deleteAllData()}>effacer</button>
      <button onClick={() => createBudgetCategory('Courses', 'expense', 'week', 60)}>créer catégorie</button>
      <button onClick={() => createBudgetCategory('Box', 'expense', 'month', 120)}>créer dépense mensuelle</button>
      <button onClick={() => category && renameBudgetCategory(category.id, 'Courses')}>renommer catégorie</button>
      <button onClick={() => category && updateBudgetCategoryAmount(category.id, 75)}>modifier catégorie</button>
      <button onClick={() => category && deleteBudgetCategory(category.id, true)}>supprimer catégorie</button>
      <button onClick={() => createBudgetAccount('Livret A')}>créer livret</button>
      <button onClick={() => account && renameBudgetAccount(account.id, 'Livret A')}>renommer livret</button>
      <button onClick={() => account && deleteBudgetAccount(account.id, true)}>supprimer livret</button>
      <button onClick={() => category && createBudgetEntry(category.id, 20, 'Intermarché')}>créer dépense</button>
      <button onClick={() => budgetEntries[0] && deleteBudgetEntry(budgetEntries[0].id)}>supprimer dépense</button>
      <button onClick={() => account && createBudgetDeposit(account.id, 50)}>créer dépôt</button>
      <button onClick={() => budgetDeposits[0] && deleteBudgetDeposit(budgetDeposits[0].id)}>supprimer dépôt</button>
    </>
  )
}

describe('AppProvider — Budget', () => {
  it('persiste les opérations de configuration des catégories et livrets', async () => {
    render(<AppProvider><BudgetPanel /></AppProvider>)
    await waitFor(() => expect(screen.getByTestId('ready').textContent).toBe('true'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'effacer' }))
    })
    await userEvent.click(screen.getByRole('button', { name: 'créer catégorie' }))
    await waitFor(() => expect(screen.getByTestId('category').textContent).toBe('Courses|60'))
    await userEvent.click(screen.getByRole('button', { name: 'renommer catégorie' }))
    await userEvent.click(screen.getByRole('button', { name: 'modifier catégorie' }))
    await waitFor(() => expect(screen.getByTestId('category').textContent).toBe('Courses|75'))
    await userEvent.click(screen.getByRole('button', { name: 'créer livret' }))
    await waitFor(() => expect(screen.getByTestId('account').textContent).toBe('Livret A'))
    await userEvent.click(screen.getByRole('button', { name: 'créer dépense mensuelle' }))
    await userEvent.click(screen.getByRole('button', { name: 'renommer livret' }))
    await userEvent.click(screen.getByRole('button', { name: 'créer dépense' }))
    await waitFor(() => expect(screen.getByTestId('entry-count').textContent).toBe('1'))
    await userEvent.click(screen.getByRole('button', { name: 'supprimer dépense' }))
    await waitFor(() => expect(screen.getByTestId('entry-count').textContent).toBe('0'))
    await userEvent.click(screen.getByRole('button', { name: 'créer dépôt' }))
    await waitFor(() => expect(screen.getByTestId('deposit-count').textContent).toBe('1'))
    await userEvent.click(screen.getByRole('button', { name: 'supprimer dépôt' }))
    await waitFor(() => expect(screen.getByTestId('deposit-count').textContent).toBe('0'))
    await userEvent.click(screen.getByRole('button', { name: 'créer dépense' }))
    await waitFor(() => expect(screen.getByTestId('entry-count').textContent).toBe('1'))
    await userEvent.click(screen.getByRole('button', { name: 'supprimer catégorie' }))
    await waitFor(() => expect(screen.getByTestId('category').textContent).toBe('none'))
    await waitFor(() => expect(screen.getByTestId('entry-count').textContent).toBe('0'))
    await userEvent.click(screen.getByRole('button', { name: 'créer dépôt' }))
    await waitFor(() => expect(screen.getByTestId('deposit-count').textContent).toBe('1'))
    await userEvent.click(screen.getByRole('button', { name: 'supprimer livret' }))
    await waitFor(() => expect(screen.getByTestId('account').textContent).toBe('none'))
    await waitFor(() => expect(screen.getByTestId('deposit-count').textContent).toBe('0'))
  })
})
