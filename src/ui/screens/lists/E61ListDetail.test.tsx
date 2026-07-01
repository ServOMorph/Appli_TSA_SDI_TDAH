import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E61ListDetail } from './E61ListDetail'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'

function makeList(overrides: Partial<List> = {}): List {
  return {
    id: 'list-1',
    name: 'Musiques',
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

function makeListItem(overrides: Partial<ListItem> = {}): ListItem {
  return {
    id: 'item-1',
    list_id: 'list-1',
    title: 'Hotel California',
    position: 0,
    created_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

describe('E61ListDetail', () => {
  describe('état vide', () => {
    it('affiche le message vide quand aucun élément', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByText('Cette liste est vide.')).toBeDefined()
      })
    })

    it('affiche le bouton "Ajouter un élément"', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ajouter un élément' })).toBeDefined()
      })
    })

    it('affiche le nom de la liste dans le titre', () => {
      const ctx = makeAppContext({
        lists: [makeList({ name: 'Musiques' })],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      expect(screen.getByText('Musiques')).toBeDefined()
    })
  })

  describe('avec des éléments', () => {
    it('affiche les titres des éléments', async () => {
      const items = [
        makeListItem({ id: 'i1', title: 'Hotel California' }),
        makeListItem({ id: 'i2', title: 'Bohemian Rhapsody' }),
      ]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByText('Hotel California')).toBeDefined()
        expect(screen.getByText('Bohemian Rhapsody')).toBeDefined()
      })
    })

    it('affiche le bouton supprimer pour chaque élément', async () => {
      const items = [makeListItem({ title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Supprimer Hotel California' })).toBeDefined()
      })
    })

    it('clic supprimer appelle deleteListItem', async () => {
      const items = [makeListItem({ id: 'i1', title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Supprimer Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer Hotel California' }))
      expect(ctx.deleteListItem).toHaveBeenCalledWith('i1')
    })
  })

  describe('bouton retour', () => {
    it('clic sur ← navigue vers lists', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('lists')
    })
  })

  describe('formulaire ajout élément', () => {
    it('clic sur "Ajouter un élément" affiche le formulaire', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      expect(screen.getByLabelText('Élément')).toBeDefined()
      expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeDefined()
    })

    it('le bouton Ajouter est désactivé si le titre est vide', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      const btn = screen.getByRole('button', { name: 'Ajouter' }) as HTMLButtonElement
      expect(btn.disabled).toBe(true)
    })

    it('clic Ajouter appelle addListItem avec le titre saisi', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.type(screen.getByLabelText('Élément'), 'Hotel California')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
      expect(ctx.addListItem).toHaveBeenCalledWith('list-1', 'Hotel California')
    })

    it('clic Annuler ferme le formulaire', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByLabelText('Élément')).toBeNull()
      expect(screen.getByRole('button', { name: 'Ajouter un élément' })).toBeDefined()
    })
  })
})
