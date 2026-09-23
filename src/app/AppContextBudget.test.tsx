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
    budgetDepositCategories,
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
    createBudgetDepositCategory,
    renameBudgetDepositCategory,
    deleteBudgetDepositCategory,
  } = useApp()
  const category = budgetCategories.find((item) => item.name === 'Courses')
  const account = budgetAccounts.find((item) => item.name === 'Livret A')
  const depositCategory = budgetDepositCategories.find((item) => item.account_id === account?.id)

  return (
    <>
      <div data-testid="ready">{String(!loading)}</div>
      <div data-testid="category">{category ? `${category.name}|${category.amount}` : 'none'}</div>
      <div data-testid="account">{account?.name ?? 'none'}</div>
      <div data-testid="entry-count">{budgetEntries.length}</div>
      <div data-testid="deposit-count">{budgetDeposits.length}</div>
      <div data-testid="deposit-category">{depositCategory?.name ?? 'none'}</div>
      <div data-testid="uncategorized-deposit-count">{budgetDeposits.filter((d) => !d.category_id).length}</div>
      <button onClick={() => deleteAllData()}>effacer</button>
      <button onClick={() => createBudgetCategory('Courses', 'week', 60)}>créer catégorie</button>
      <button onClick={() => createBudgetCategory('Box', 'month', 120)}>créer dépense mensuelle</button>
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
      <button onClick={() => account && createBudgetDepositCategory(account.id, 'Vacances')}>créer sous-catégorie</button>
      <button onClick={() => depositCategory && renameBudgetDepositCategory(depositCategory.id, 'Projets')}>renommer sous-catégorie</button>
      <button onClick={() => account && depositCategory && createBudgetDeposit(account.id, 30, 'Acompte', undefined, depositCategory.id)}>
        créer dépôt catégorisé
      </button>
      <button onClick={() => depositCategory && deleteBudgetDepositCategory(depositCategory.id, true)}>supprimer sous-catégorie</button>
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

  it('persiste les sous-catégories de livret et détache leurs mouvements à la suppression (#a1317d93)', async () => {
    render(<AppProvider><BudgetPanel /></AppProvider>)
    await waitFor(() => expect(screen.getByTestId('ready').textContent).toBe('true'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'effacer' }))
    })
    await userEvent.click(screen.getByRole('button', { name: 'créer livret' }))
    await waitFor(() => expect(screen.getByTestId('account').textContent).toBe('Livret A'))

    await userEvent.click(screen.getByRole('button', { name: 'créer sous-catégorie' }))
    await waitFor(() => expect(screen.getByTestId('deposit-category').textContent).toBe('Vacances'))
    await userEvent.click(screen.getByRole('button', { name: 'renommer sous-catégorie' }))
    await waitFor(() => expect(screen.getByTestId('deposit-category').textContent).toBe('Projets'))

    await userEvent.click(screen.getByRole('button', { name: 'créer dépôt catégorisé' }))
    await waitFor(() => expect(screen.getByTestId('deposit-count').textContent).toBe('1'))
    expect(screen.getByTestId('uncategorized-deposit-count').textContent).toBe('0')

    await userEvent.click(screen.getByRole('button', { name: 'supprimer sous-catégorie' }))
    await waitFor(() => expect(screen.getByTestId('deposit-category').textContent).toBe('none'))
    await waitFor(() => expect(screen.getByTestId('uncategorized-deposit-count').textContent).toBe('1'))
    expect(screen.getByTestId('deposit-count').textContent).toBe('1')
  })

  it('supprime les sous-catégories de livret quand le livret est supprimé (#a1317d93)', async () => {
    render(<AppProvider><BudgetPanel /></AppProvider>)
    await waitFor(() => expect(screen.getByTestId('ready').textContent).toBe('true'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'effacer' }))
    })
    await userEvent.click(screen.getByRole('button', { name: 'créer livret' }))
    await waitFor(() => expect(screen.getByTestId('account').textContent).toBe('Livret A'))
    await userEvent.click(screen.getByRole('button', { name: 'créer sous-catégorie' }))
    await waitFor(() => expect(screen.getByTestId('deposit-category').textContent).toBe('Vacances'))

    await userEvent.click(screen.getByRole('button', { name: 'supprimer livret' }))
    await waitFor(() => expect(screen.getByTestId('account').textContent).toBe('none'))
    await waitFor(() => expect(screen.getByTestId('deposit-category').textContent).toBe('none'))
  })
})
