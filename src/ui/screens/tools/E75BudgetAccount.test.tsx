import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { todayDate } from '@/app/repositories'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import { E75BudgetAccount } from './E75BudgetAccount'

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

describe('E75BudgetAccount', () => {
  it('le retour utilise back("budget")', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E75BudgetAccount />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('budget')
  })

  it('ouvre les paramètres du budget', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E75BudgetAccount />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Paramètres du budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget-settings')
  })

  it('affiche Semaine et Mois côte à côte avec prévu/restant et jauge par sous-catégorie', () => {
    renderWithApp(<E75BudgetAccount />, makeAppContext({
      budgetCategories: [makeCategory(), makeCategory({ id: 'category-2', name: 'Loyer', period: 'month', amount: 600 })],
      budgetEntries: [makeEntry()],
    }))
    expect(screen.getByRole('heading', { name: 'Semaine' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Mois' })).toBeDefined()
    const courses = screen.getByRole('button', { name: 'Ouvrir Courses' })
    expect(within(courses).getByText(/40,00.*restant/)).toBeDefined()
    expect(within(courses).getByText('prévu 60,00 €')).toBeDefined()
    const loyer = screen.getByRole('button', { name: 'Ouvrir Loyer' })
    expect(within(loyer).getByText('prévu 600,00 €')).toBeDefined()
    expect(screen.getAllByRole('progressbar')).toHaveLength(2)
  })

  it('fait défiler la période Semaine sans changer la période Mois', async () => {
    renderWithApp(<E75BudgetAccount />, makeAppContext({
      budgetCategories: [makeCategory(), makeCategory({ id: 'category-2', name: 'Loyer', period: 'month', amount: 600 })],
      budgetEntries: [makeEntry()],
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Période précédente (Semaine)' }))
    const courses = screen.getByRole('button', { name: 'Ouvrir Courses' })
    expect(within(courses).getByText(/60,00.*restant/)).toBeDefined()
    const loyer = screen.getByRole('button', { name: 'Ouvrir Loyer' })
    expect(within(loyer).getByText('prévu 600,00 €')).toBeDefined()
  })

  it('ouvre la fiche d’une catégorie avec la période consultée', async () => {
    const ctx = makeAppContext({ budgetCategories: [makeCategory()] })
    renderWithApp(<E75BudgetAccount />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Courses' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'budget-category-detail', categoryId: 'category-1', date: todayDate() })
  })

  it('saisit une dépense avec sa catégorie en pastille et sa date', async () => {
    const createBudgetEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E75BudgetAccount />, makeAppContext({
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

  it('désactive la saisie de dépense tant qu’aucune catégorie n’existe', () => {
    renderWithApp(<E75BudgetAccount />, makeAppContext({ budgetCategories: [] }))
    expect(screen.getByRole('button', { name: 'Ajouter une dépense' }).hasAttribute('disabled')).toBe(true)
  })
})
