import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E61ListDetail } from './E61ListDetail'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListCategory } from '@/domain/entities/listCategory'
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
    category_id: 'cat-1',
    description: '',
    created_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

function makeCategory(overrides: Partial<ListCategory> = {}): ListCategory {
  return {
    id: 'cat-1',
    list_id: 'list-1',
    name: 'Général',
    position: 0,
    created_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

async function goToCategory(name: string) {
  await waitFor(() => screen.getByRole('button', { name: new RegExp(`^${name}`) }))
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
}

describe('E61ListDetail', () => {
  describe('écran de sélection de catégorie', () => {
    it('affiche le message vide quand la liste n\'a aucune catégorie', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByText("Cette liste n'a pas encore de catégorie.")).toBeDefined()
      })
    })

    it('liste les catégories de la liste', async () => {
      const categories = [makeCategory({ id: 'cat-ete', name: 'Été' }), makeCategory({ id: 'cat-hiver', name: 'Hiver', position: 1 })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListCategories: vi.fn().mockResolvedValue(categories),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Été/ })).toBeDefined()
        expect(screen.getByRole('button', { name: /^Hiver/ })).toBeDefined()
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

    it('clic sur "Ajouter une catégorie" crée la catégorie et l\'affiche dans la liste', async () => {
      const createListCategory = vi.fn().mockResolvedValue('cat-new')
      const getListCategories = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([makeCategory({ id: 'cat-new', name: 'Automne' })])
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        createListCategory,
        getListCategories,
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter une catégorie' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une catégorie' }))
      await userEvent.type(screen.getByLabelText('Nom de la catégorie'), 'Automne')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
      expect(createListCategory).toHaveBeenCalledWith('list-1', 'Automne')
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Automne/ })).toBeDefined()
      })
    })

    it('garde le formulaire d’ajout de catégorie dans la largeur de l’écran', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)

      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une catégorie' }))

      expect(screen.getByRole('main')).toHaveStyle({ width: '100%' })
      expect(screen.getByLabelText('Nom de la catégorie')).toHaveStyle({ width: '100%' })
    })
  })

  describe('bouton retour', () => {
    it('clic sur ← depuis l\'écran des catégories dépile la navigation, avec tools en repli', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
      })
      renderWithApp(<E61ListDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.back).toHaveBeenCalledWith('tools')
    })

    it('clic sur ← depuis les éléments d\'une catégorie revient à l\'écran des catégories', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListCategories: vi.fn().mockResolvedValue([makeCategory({ name: 'Été' })]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Été')
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.back).not.toHaveBeenCalled()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Été/ })).toBeDefined()
      })
    })
  })

  describe('éléments d\'une catégorie', () => {
    it('restaure la catégorie indiquée par la route après le retour du détail', async () => {
      const ctx = makeAppContext({
        route: { name: 'list-detail', categoryId: 'cat-1' },
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue([makeListItem()]),
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)

      expect(await screen.findByText('Hotel California')).toBeInTheDocument()
    })

    it('affiche les titres des éléments de la catégorie sélectionnée', async () => {
      const items = [
        makeListItem({ id: 'i1', title: 'Hotel California' }),
        makeListItem({ id: 'i2', title: 'Bohemian Rhapsody' }),
      ]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
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

  describe('suppression d\'une catégorie', () => {
    it('demande confirmation puis appelle deleteListCategory sans supprimer la liste', async () => {
      const deleteListCategory = vi.fn().mockResolvedValue(undefined)
      const deleteTool = vi.fn().mockResolvedValue(undefined)
      const categories = [makeCategory({ id: 'cat-ete', name: 'Été' }), makeCategory({ id: 'cat-hiver', name: 'Hiver', position: 1 })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        tools: [makeTool()],
        getListCategories: vi.fn().mockResolvedValue(categories),
        deleteListCategory,
        deleteTool,
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Supprimer la catégorie Été' }))
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer la catégorie Été' }))
      const dialog = screen.getByRole('dialog', { name: 'Supprimer la catégorie' })
      await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))
      expect(deleteListCategory).toHaveBeenCalledWith('cat-ete')
      expect(deleteTool).not.toHaveBeenCalled()
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^Été/ })).toBeNull()
        expect(screen.getByRole('button', { name: /^Hiver/ })).toBeDefined()
      })
    })

    it('annuler ferme la confirmation sans supprimer', async () => {
      const deleteListCategory = vi.fn().mockResolvedValue(undefined)
      const categories = [makeCategory({ id: 'cat-ete', name: 'Été' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        tools: [makeTool()],
        getListCategories: vi.fn().mockResolvedValue(categories),
        deleteListCategory,
      })
      renderWithApp(<E61ListDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Supprimer la catégorie Été' }))
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer la catégorie Été' }))
      const dialog = screen.getByRole('dialog', { name: 'Supprimer la catégorie' })
      await userEvent.click(within(dialog).getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByRole('dialog', { name: 'Supprimer la catégorie' })).toBeNull()
      expect(deleteListCategory).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: /^Été/ })).toBeDefined()
    })
  })

  describe('coche (E27)', () => {
    it('clic sur la coche appelle toggleListItem', async () => {
      const items = [makeListItem({ id: 'i1', title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await waitFor(() => screen.getByRole('button', { name: 'Cocher Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Cocher Hotel California' }))
      expect(ctx.toggleListItem).toHaveBeenCalledWith('i1')
    })

    it('cliquer sur le titre d\'un élément ouvre son détail (LI2)', async () => {
      const items = [makeListItem({ id: 'i1', title: 'Hotel California' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await waitFor(() => screen.getByRole('button', { name: 'Hotel California' }))
      await userEvent.click(screen.getByRole('button', { name: 'Hotel California' }))
      expect(ctx.selectListItem).toHaveBeenCalledWith('i1')
      expect(ctx.goTo).toHaveBeenCalledWith('list-item-detail')
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await waitFor(() => screen.getByText('Coché'))
      const titles = screen.getAllByText(/Coché|Non coché/).map((el) => el.textContent)
      expect(titles).toEqual(['Non coché', 'Coché'])
    })
  })

  describe('catégories (E28)', () => {
    it('les items d\'une catégorie ne montrent pas ceux d\'une autre', async () => {
      const categories = [makeCategory({ id: 'cat-ete', name: 'Été', position: 0 }), makeCategory({ id: 'cat-hiver', name: 'Hiver', position: 1 })]
      const items = [
        makeListItem({ id: 'i1', title: 'T-shirt', category_id: 'cat-ete' }),
        makeListItem({ id: 'i2', title: 'Pull', category_id: 'cat-hiver' }),
      ]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListItems: vi.fn().mockResolvedValue(items),
        getListCategories: vi.fn().mockResolvedValue(categories),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Été')
      await waitFor(() => {
        expect(screen.getByText('T-shirt')).toBeDefined()
        expect(screen.queryByText('Pull')).toBeNull()
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
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
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      const btn = screen.getByRole('button', { name: 'Ajouter' }) as HTMLButtonElement
      expect(btn.disabled).toBe(true)
    })

    it('clic Ajouter avec une catégorie existante appelle addListItem avec cette catégorie', async () => {
      const categories = [makeCategory({ id: 'cat-1', name: 'Général' })]
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListCategories: vi.fn().mockResolvedValue(categories),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.type(screen.getByLabelText('Élément'), 'Hotel California')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
      expect(ctx.addListItem).toHaveBeenCalledWith('list-1', 'Hotel California', 'cat-1')
    })

    it('le formulaire ne propose plus de champ catégorie libre', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      expect(screen.queryByLabelText('Nouvelle catégorie')).toBeNull()
      expect(screen.queryByLabelText('Catégorie')).toBeNull()
    })

    it('clic Annuler ferme le formulaire', async () => {
      const ctx = makeAppContext({
        lists: [makeList()],
        selectedListId: 'list-1',
        getListCategories: vi.fn().mockResolvedValue([makeCategory()]),
      })
      renderWithApp(<E61ListDetail />, ctx)
      await goToCategory('Général')
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter un élément' }))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByLabelText('Élément')).toBeNull()
      expect(screen.getByRole('button', { name: 'Ajouter un élément' })).toBeDefined()
    })
  })
})
