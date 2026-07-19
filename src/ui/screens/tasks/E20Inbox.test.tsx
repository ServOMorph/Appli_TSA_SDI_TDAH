import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E20Inbox } from './E20Inbox'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Tâche inbox',
    status: 'inbox',
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
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
      const subs: SubTask[] = [
        { id: 'st-1', task_id: 'abc', title: 'Étape 1', is_completed: true, position: 0, scheduled_date: null, scheduled_start: null, scheduled_end: null },
        { id: 'st-2', task_id: 'abc', title: 'Étape 2', is_completed: false, position: 1, scheduled_date: null, scheduled_start: null, scheduled_end: null },
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

    it("déplace vers Tâche du jour sans limite de nombre", async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const todayTasks = [
        makeTask({ id: 't1', title: 'T1', status: 'today' }),
        makeTask({ id: 't2', title: 'T2', status: 'today' }),
        makeTask({ id: 't3', title: 'T3', status: 'today' }),
      ]
      const ctx = makeAppContext({ inboxTasks: [task], todayTasks })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Déplacer Lire livre vers Tâche du jour'))
      expect(ctx.moveTask).toHaveBeenCalledWith('abc', 'today')
    })
  })

  describe('navigation', () => {
    it('retour navigue vers dashboard', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })

    it('Ajouter une tâche navigue vers task-create-v2', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
      expect(ctx.goTo).toHaveBeenCalledWith('task-create-v2')
    })
  })

  describe('planifier et mettre dans une liste', () => {
    it('planifier une tâche place la tâche en attente (sans la persister) puis navigue vers planning', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task] })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Planifier Lire livre'))
      expect(ctx.startPlanTask).toHaveBeenCalledWith('Lire livre', 'abc')
      expect(ctx.goTo).toHaveBeenCalledWith('planning')
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
        createList: vi.fn().mockResolvedValue('new-list-1'),
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Ajouter Lire livre à une liste'))
      expect(screen.getByText("Aucune liste pour l'instant.")).toBeDefined()
      await userEvent.type(screen.getByLabelText('Nom de la nouvelle liste'), 'Livres')
      await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
      expect(ctx.createList).toHaveBeenCalledWith('Livres')
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

    it('avertit avant de planifier une tâche ayant des sous-tâches', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const sub: SubTask = { id: 'st-1', task_id: 'abc', title: 'Chapitre 1', is_completed: false, position: 0, scheduled_date: null, scheduled_start: null, scheduled_end: null }
      const ctx = makeAppContext({
        inboxTasks: [task],
        inboxSubTasksMap: { abc: [sub] },
      })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText('Planifier Lire livre'))
      expect(screen.getByRole('dialog', { name: 'Sous-tâches perdues' })).toBeDefined()
      expect(ctx.startPlanTask).not.toHaveBeenCalled()
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(ctx.startPlanTask).toHaveBeenCalledWith('Lire livre', 'abc')
    })

    it('avertit avant de mettre dans une liste une tâche ayant des sous-tâches', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const sub: SubTask = { id: 'st-1', task_id: 'abc', title: 'Chapitre 1', is_completed: false, position: 0, scheduled_date: null, scheduled_start: null, scheduled_end: null }
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
