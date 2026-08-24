import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { Route } from '@/app/AppContext'
import { E73CategoryDetail } from './E73CategoryDetail'

const route: Route = { name: 'budget-category-detail', categoryId: 'category-1', date: '2026-07-22' }

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
    date: '2026-07-21',
    created_at: '2026-07-21T10:00:00.000Z',
    ...overrides,
  }
}

describe('E73CategoryDetail', () => {
  it('affiche le restant, la jauge et l’historique de la période consultée en date française', () => {
    renderWithApp(<E73CategoryDetail />, makeAppContext({
      route,
      budgetCategories: [makeCategory()],
      budgetEntries: [makeEntry(), makeEntry({ id: 'entry-2', amount: 999, date: '2026-08-01', label: 'Hors période' })],
    }))
    expect(screen.getByRole('heading', { name: 'Courses' })).toBeDefined()
    expect(screen.getByText(/20,00.*dépensés sur 60,00/)).toBeDefined()
    expect(screen.getByRole('progressbar', { name: 'Budget consommé pour Courses' }).getAttribute('aria-valuenow')).toBe('33')
    expect(screen.getByText(/21\/07\/2026.*Intermarché.*20,00/)).toBeDefined()
    expect(screen.queryByText(/Hors période/)).toBeNull()
  })

  it('reste lisible quand la catégorie a été supprimée', () => {
    renderWithApp(<E73CategoryDetail />, makeAppContext({ route, budgetCategories: [] }))
    expect(screen.getByText("Cette catégorie n'existe plus.")).toBeDefined()
  })

  it('renomme et modifie le montant depuis la fiche', async () => {
    const renameBudgetCategory = vi.fn().mockResolvedValue(undefined)
    const updateBudgetCategoryAmount = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E73CategoryDetail />, makeAppContext({
      route,
      budgetCategories: [makeCategory()],
      renameBudgetCategory,
      updateBudgetCategoryAmount,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Renommer' }))
    await userEvent.clear(screen.getByLabelText('Nouveau nom de la catégorie'))
    await userEvent.type(screen.getByLabelText('Nouveau nom de la catégorie'), 'Courses maison')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(renameBudgetCategory).toHaveBeenCalledWith('category-1', 'Courses maison')

    await userEvent.click(screen.getByRole('button', { name: 'Modifier le montant' }))
    await userEvent.clear(screen.getByLabelText('Nouveau montant'))
    await userEvent.type(screen.getByLabelText('Nouveau montant'), '75')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(updateBudgetCategoryAmount).toHaveBeenCalledWith('category-1', 75)
  })

  it('saisit une dépense pour la catégorie affichée, sans champ de sélection', async () => {
    const createBudgetEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E73CategoryDetail />, makeAppContext({
      route,
      budgetCategories: [makeCategory()],
      createBudgetEntry,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une dépense' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter une dépense' })
    expect(within(dialog).queryByRole('group')).toBeNull()
    await userEvent.type(within(dialog).getByLabelText('Montant'), '15')
    await userEvent.type(within(dialog).getByLabelText('Libellé (facultatif)'), 'Marché')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(createBudgetEntry).toHaveBeenCalledWith('category-1', 15, 'Marché', '2026-07-22')
  })

  it('demande confirmation puis revient au Budget après suppression', async () => {
    const deleteBudgetCategory = vi.fn().mockResolvedValueOnce('needs_confirmation').mockResolvedValueOnce('deleted')
    const ctx = makeAppContext({ route, budgetCategories: [makeCategory()], deleteBudgetCategory })
    renderWithApp(<E73CategoryDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer la catégorie' }))
    const dialog = screen.getByRole('dialog', { name: 'Supprimer la catégorie' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))
    expect(deleteBudgetCategory).toHaveBeenNthCalledWith(1, 'category-1')
    expect(deleteBudgetCategory).toHaveBeenNthCalledWith(2, 'category-1', true)
    expect(ctx.back).toHaveBeenCalledWith('budget-account')
  })

  it('supprime une dépense de l’historique', async () => {
    const deleteBudgetEntry = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E73CategoryDetail />, makeAppContext({
      route,
      budgetCategories: [makeCategory()],
      budgetEntries: [makeEntry()],
      deleteBudgetEntry,
    }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer la dépense Intermarché' }))
    expect(deleteBudgetEntry).toHaveBeenCalledWith('entry-1')
  })
})
