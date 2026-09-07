import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E20Inbox } from './E20Inbox'
import type { Task } from '@/domain/entities/task'
import { makeTask as baseTask, makeSubTask } from '@/test/factories'

function makeTask(overrides: Partial<Task> = {}): Task {
  return baseTask({ title: 'Tâche inbox', status: 'inbox', ...overrides })
}

describe('E20Inbox', () => {
  describe('état vide (D20A)', () => {
    it('affiche le message vide', () => {
      renderWithApp(<E20Inbox />)
      expect(screen.getByText('Aucune tâche enregistrée.')).toBeDefined()
    })

    it('affiche le bouton Ajouter une tâche', () => {
      renderWithApp(<E20Inbox />)
      expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeDefined()
    })
  })

  describe('avec tâches', () => {
    it('affiche les tâches inbox', () => {
      const ctx = makeAppContext({ inboxTasks: [makeTask({ title: 'Acheter pain' })] })
      renderWithApp(<E20Inbox />, ctx)
      expect(screen.getByText('Acheter pain')).toBeDefined()
    })

    it('ouvre le détail au clic sur le titre', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task] })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByText('Lire livre'))
      expect(ctx.selectTask).toHaveBeenCalledWith('abc')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })

    it('affiche la progression des sous-étapes', () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const subs: Task[] = [
        makeSubTask({ id: 'st-1', parent_id: 'abc', title: 'Étape 1', status: 'completed', position: 0 }),
        makeSubTask({ id: 'st-2', parent_id: 'abc', title: 'Étape 2', status: 'inbox', position: 1 }),
      ]
      const ctx = makeAppContext({ inboxTasks: [task], inboxSubTasksMap: { abc: subs } })
      renderWithApp(<E20Inbox />, ctx)
      expect(screen.getByLabelText('1 sur 2 étapes')).toBeDefined()
    })

    it('n\'affiche pas de progression sans sous-étape', () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task] })
      renderWithApp(<E20Inbox />, ctx)
      expect(screen.queryByLabelText(/sur .* étapes/)).toBeNull()
    })

    it("n'affiche plus le bouton Tâche du jour", () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task] })
      renderWithApp(<E20Inbox />, ctx)
      expect(screen.queryByLabelText(/vers Tâche du jour/)).toBeNull()
      expect(screen.queryByRole('button', { name: 'Tâche du jour' })).toBeNull()
    })
  })

  describe('navigation', () => {
    it('retour navigue vers tools', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('tools')
    })

    it('Ajouter une tâche ouvre un champ titre seul, sans navigation', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
      expect(ctx.goTo).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Titre de la tâche')).toBeDefined()
    })

    it('valider le champ titre appelle createTaskInbox et referme le champ', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
      await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Acheter du pain')
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      expect(ctx.createTaskInbox).toHaveBeenCalledWith('Acheter du pain')
      expect(ctx.goTo).not.toHaveBeenCalledWith('task-create-v2')
      expect(screen.queryByLabelText('Titre de la tâche')).toBeNull()
    })
  })

  describe('planifier et mettre dans une liste', () => {
    it('planifier une tâche la place au jour courant puis ouvre sa fiche', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task] })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Planifier Lire livre'))
      expect(ctx.planTaskToday).toHaveBeenCalledWith('abc')
      expect(ctx.selectTask).toHaveBeenCalledWith('abc')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })

    it('ouvre le sélecteur de liste au clic sur Liste', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({
        inboxTasks: [task],
        lists: [{ id: 'l1', name: 'Livres', created_at: '', updated_at: '' }],
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Ajouter Lire livre à une liste'))
      expect(screen.getByRole('dialog', { name: 'Choisir une liste' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Ajouter à Livres' })).toBeDefined()
    })

    it('choisir une liste appelle moveTodoTaskToList et ferme la modale', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({
        inboxTasks: [task],
        lists: [{ id: 'l1', name: 'Livres', created_at: '', updated_at: '' }],
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Ajouter Lire livre à une liste'))
      await userEvent.click(screen.getByLabelText('Ajouter à Livres'))
      expect(ctx.moveTodoTaskToList).toHaveBeenCalledWith('abc', 'l1')
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('affiche un message si aucune liste et permet d\'en créer une rattachée à la tâche', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({
        inboxTasks: [task],
        lists: [],
        createToolList: vi.fn().mockResolvedValue('new-list-1'),
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Ajouter Lire livre à une liste'))
      expect(screen.getByText("Aucune liste pour l'instant.")).toBeDefined()
      await userEvent.type(screen.getByLabelText('Nom de la nouvelle liste'), 'Livres')
      await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
      expect(ctx.createToolList).toHaveBeenCalledWith('Livres', null)
      expect(ctx.moveTodoTaskToList).toHaveBeenCalledWith('abc', 'new-list-1')
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('annuler le sélecteur de liste ferme la modale', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({
        inboxTasks: [task],
        lists: [{ id: 'l1', name: 'Livres', created_at: '', updated_at: '' }],
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Ajouter Lire livre à une liste'))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('planifier une tâche ayant des sous-tâches ne demande plus de confirmation (les sous-tâches sont conservées)', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const sub: Task = makeSubTask({ id: 'st-1', parent_id: 'abc', title: 'Chapitre 1', status: 'inbox' })
      const ctx = makeAppContext({
        inboxTasks: [task],
        inboxSubTasksMap: { abc: [sub] },
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Planifier Lire livre'))
      expect(screen.queryByRole('dialog', { name: 'Sous-tâches perdues' })).toBeNull()
      expect(ctx.planTaskToday).toHaveBeenCalledWith('abc')
    })

    it('avertit avant de mettre dans une liste une tâche ayant des sous-tâches', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const sub: Task = makeSubTask({ id: 'st-1', parent_id: 'abc', title: 'Chapitre 1', status: 'inbox' })
      const ctx = makeAppContext({
        inboxTasks: [task],
        inboxSubTasksMap: { abc: [sub] },
        lists: [{ id: 'l1', name: 'Livres', created_at: '', updated_at: '' }],
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Ajouter Lire livre à une liste'))
      expect(screen.getByRole('dialog', { name: 'Sous-tâches perdues' })).toBeDefined()
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(screen.getByRole('dialog', { name: 'Choisir une liste' })).toBeDefined()
    })
  })
})
