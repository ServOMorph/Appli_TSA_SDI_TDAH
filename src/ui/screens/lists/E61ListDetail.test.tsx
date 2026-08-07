import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E61ListDetail } from './E61ListDetail'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { Tool } from '@/domain/entities/tool'

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: 'tool-1',
    type: 'liste',
    folder_id: null,
    list_id: 'list-1',
    position: 0,
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

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
    checked: false,
    section: null,
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

  describe('suppression de la liste', () => {
    it('demande confirmation puis appelle deleteTool et repart vers tools', async () => {
      const deleteTool = vi.fn().mockResolvedValue(undefined)
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        tools: [makeTool()],
        deleteTool,
      })
      renderWithApp(<E61ListDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer la liste' }))
      const dialog = screen.getByRole('dialog', { name: 'Supprimer la liste' })
      await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))
      expect(deleteTool).toHaveBeenCalledWith('tool-1')
      expect(ctx.back).toHaveBeenCalledWith('tools')
    })

    it('annuler ferme la confirmation sans supprimer', async () => {
      const deleteTool = vi.fn().mockResolvedValue(undefined)
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        tools: [makeTool()],
        deleteTool,
      })
      renderWithApp(<E61ListDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer la liste' }))
      const dialog = screen.getByRole('dialog', { name: 'Supprimer la liste' })
      await userEvent.click(within(dialog).getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByRole('dialog', { name: 'Supprimer la liste' })).toBeNull()
      expect(deleteTool).not.toHaveBeenCalled()
    })
  })

  describe('bouton retour', () => {
    it('clic sur ← dépile la navigation, avec tools en repli', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.back).toHaveBeenCalledWith('tools')
    })
  })

  describe('coche (E27)', () => {
    it('clic sur la coche appelle toggleListItem', async () => {
      const items = [makeListItem({ id: 'i1', title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Cocher Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Cocher Hotel California' }))
      expect(ctx.toggleListItem).toHaveBeenCalledWith('i1')
    })

    it('les items cochés apparaissent sous les non cochés', async () => {
      const items = [
        makeListItem({ id: 'i1', title: 'Coché', checked: true, position: 0 }),
        makeListItem({ id: 'i2', title: 'Non coché', checked: false, position: 1 }),
      ]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByText('Coché'))
      const titles = screen.getAllByText(/Coché|Non coché/).map((el) => el.textContent)
      expect(titles).toEqual(['Non coché', 'Coché'])
    })
  })

  describe('rubriques (E28)', () => {
    it('regroupe les items par rubrique', async () => {
      const items = [
        makeListItem({ id: 'i1', title: 'T-shirt', section: 'Été' }),
        makeListItem({ id: 'i2', title: 'Pull', section: 'Hiver' }),
      ]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Été' })).toBeDefined()
        expect(screen.getByRole('heading', { name: 'Hiver' })).toBeDefined()
      })
    })
  })

  describe('réveil (E29)', () => {
    it('ouvre la mini-modale de planification au clic sur le réveil', async () => {
      const items = [makeListItem({ id: 'i1', title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Planifier Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Planifier Hotel California' }))
      expect(screen.getByRole('dialog', { name: 'Planifier Hotel California' })).toBeDefined()
    })

    it('la validation crée une tâche planifiée ponctuelle via createDetailedTask', async () => {
      const items = [makeListItem({ id: 'i1', title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Planifier Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Planifier Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))
      expect(ctx.createDetailedTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Hotel California', status: 'planned', recurrence: null }),
      )
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
      expect(ctx.addListItem).toHaveBeenCalledWith('list-1', 'Hotel California', null)
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
