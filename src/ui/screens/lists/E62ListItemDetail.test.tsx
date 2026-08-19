import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E62ListItemDetail } from './E62ListItemDetail'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'

function makeItem(overrides: Partial<ListItem> = {}): ListItem {
  return {
    id: 'item-1',
    list_id: 'list-1',
    title: 'Hotel California',
    position: 0,
    checked: false,
    category_id: 'cat-1',
    description: '',
    created_at: '2026-08-18T00:00:00.000Z',
    ...overrides,
  }
}

function makeSubTask(overrides: Partial<ListItemSubTask> = {}): ListItemSubTask {
  return {
    id: 'sub-1',
    list_item_id: 'item-1',
    title: 'Étape 1',
    position: 0,
    checked: false,
    created_at: '2026-08-18T00:00:00.000Z',
    ...overrides,
  }
}

describe('E62ListItemDetail', () => {
  it('affiche le titre et la description de l\'élément', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem({ description: 'Acheter la version vinyle' })),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => {
      expect(screen.getByText('Hotel California')).toBeDefined()
      expect(screen.getByLabelText('Description')).toHaveValue('Acheter la version vinyle')
    })
  })

  it('enregistre la description modifiée à la perte du focus', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Hotel California')).toBeDefined())
    const textarea = screen.getByLabelText('Description')
    await userEvent.type(textarea, 'Nouvelle description')
    await userEvent.tab()
    expect(ctx.updateListItemDescription).toHaveBeenCalledWith('item-1', 'Nouvelle description')
  })

  it('affiche le message vide quand il n\'y a pas de sous-tâche', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Aucune sous-tâche.')).toBeDefined())
  })

  it('affiche les sous-tâches toujours dépliées', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
      getListItemSubTasks: vi.fn().mockResolvedValue([makeSubTask({ title: 'Vérifier le stock' })]),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => {
      expect(screen.getByText('Vérifier le stock')).toBeDefined()
    })
  })

  it('ajoute une sous-tâche et recharge la liste', async () => {
    const getListItemSubTasks = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([makeSubTask({ title: 'Vérifier le stock' })])
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
      getListItemSubTasks,
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Aucune sous-tâche.')).toBeDefined())
    await userEvent.type(screen.getByLabelText('Nouvelle sous-tâche'), 'Vérifier le stock')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(ctx.addListItemSubTask).toHaveBeenCalledWith('item-1', 'Vérifier le stock')
    await waitFor(() => expect(screen.getByText('Vérifier le stock')).toBeDefined())
  })

  it('coche une sous-tâche', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
      getListItemSubTasks: vi.fn().mockResolvedValue([makeSubTask({ title: 'Vérifier le stock' })]),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Vérifier le stock')).toBeDefined())
    await userEvent.click(screen.getByLabelText('Cocher Vérifier le stock'))
    expect(ctx.toggleListItemSubTask).toHaveBeenCalledWith('sub-1')
  })

  it('supprime une sous-tâche', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
      getListItemSubTasks: vi.fn().mockResolvedValue([makeSubTask({ title: 'Vérifier le stock' })]),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Vérifier le stock')).toBeDefined())
    await userEvent.click(screen.getByLabelText('Supprimer Vérifier le stock'))
    expect(ctx.deleteListItemSubTask).toHaveBeenCalledWith('sub-1')
  })

  it('le bouton Retour revient au détail de la liste', async () => {
    const ctx = makeAppContext({
      selectedListItemId: 'item-1',
      getListItem: vi.fn().mockResolvedValue(makeItem()),
    })
    renderWithApp(<E62ListItemDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Hotel California')).toBeDefined())
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('list-detail')
  })
})
