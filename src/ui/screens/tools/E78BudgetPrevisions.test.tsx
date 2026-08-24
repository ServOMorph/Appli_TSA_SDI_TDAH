import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import { E78BudgetPrevisions } from './E78BudgetPrevisions'

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

describe('E78BudgetPrevisions', () => {
  it('le retour utilise back("budget")', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E78BudgetPrevisions />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('budget')
  })

  it('ouvre les paramètres du budget', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E78BudgetPrevisions />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Paramètres du budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
  })

  it('affiche Semaine et Mois côte à côte avec le montant prévu par sous-catégorie, sans dépense ni jauge', () => {
    renderWithApp(<E78BudgetPrevisions />, makeAppContext({
      budgetCategories: [
        makeCategory(),
        makeCategory({ id: 'category-2', name: 'Loyer', period: 'month', amount: 600 }),
      ],
    }))
    expect(screen.getByRole('heading', { name: 'Semaine' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Mois' })).toBeDefined()
    expect(screen.getByText('Courses')).toBeDefined()
    expect(screen.getByText(/prévu 60,00.*240,00.*sur le mois/)).toBeDefined()
    expect(screen.getByText('Loyer')).toBeDefined()
    expect(screen.getByText('prévu 600,00 €')).toBeDefined()
    expect(screen.queryByText(/restant/)).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('affiche un message par colonne quand aucune sous-catégorie n’existe', () => {
    renderWithApp(<E78BudgetPrevisions />, makeAppContext({ budgetCategories: [] }))
    expect(within(screen.getByRole('heading', { name: 'Semaine' }).closest('div')!).getByText('Aucune sous-catégorie.')).toBeDefined()
    expect(within(screen.getByRole('heading', { name: 'Mois' }).closest('div')!).getByText('Aucune sous-catégorie.')).toBeDefined()
  })
})
