import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E20Inbox } from './E20Inbox'
import type { Task } from '@/domain/entities/task'

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

    it('déplace vers Plus tard', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task] })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Lire livre vers À faire plus tard"))
      expect(ctx.moveTask).toHaveBeenCalledWith('abc', 'later')
    })

    it('déplace vers Aujourd\'hui si moins de 3 tâches', async () => {
      const task = makeTask({ id: 'abc', title: 'Lire livre' })
      const ctx = makeAppContext({ inboxTasks: [task], todayTasks: [] })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Lire livre vers Aujourd'hui"))
      expect(ctx.moveTask).toHaveBeenCalledWith('abc', 'today')
    })
  })

  describe('modale M04 (limite 3 tâches)', () => {
    it('affiche la modale M04 si aujourd\'hui a déjà 3 tâches', async () => {
      const inboxTask = makeTask({ id: 'new', title: 'Nouvelle tâche' })
      const todayTasks = [
        makeTask({ id: 't1', title: 'T1', status: 'today' }),
        makeTask({ id: 't2', title: 'T2', status: 'today' }),
        makeTask({ id: 't3', title: 'T3', status: 'today' }),
      ]
      const ctx = makeAppContext({ inboxTasks: [inboxTask], todayTasks })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Nouvelle tâche vers Aujourd'hui"))
      expect(screen.getByRole('dialog', { name: 'Remplacer une tâche' })).toBeDefined()
    })

    it('annuler la modale M04 ferme la modale', async () => {
      const inboxTask = makeTask({ id: 'new', title: 'Nouvelle tâche' })
      const todayTasks = [
        makeTask({ id: 't1', title: 'T1', status: 'today' }),
        makeTask({ id: 't2', title: 'T2', status: 'today' }),
        makeTask({ id: 't3', title: 'T3', status: 'today' }),
      ]
      const ctx = makeAppContext({ inboxTasks: [inboxTask], todayTasks })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Nouvelle tâche vers Aujourd'hui"))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('choisir une tâche à remplacer appelle moveTask deux fois', async () => {
      const inboxTask = makeTask({ id: 'new', title: 'Nouvelle tâche' })
      const todayTasks = [
        makeTask({ id: 't1', title: 'T1', status: 'today' }),
        makeTask({ id: 't2', title: 'T2', status: 'today' }),
        makeTask({ id: 't3', title: 'T3', status: 'today' }),
      ]
      const ctx = makeAppContext({ inboxTasks: [inboxTask], todayTasks })
      renderWithApp(<E20Inbox />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Nouvelle tâche vers Aujourd'hui"))
      await userEvent.click(screen.getByLabelText('Remplacer par T1'))
      await waitFor(() => {
        expect(ctx.moveTask).toHaveBeenCalledWith('t1', 'inbox')
        expect(ctx.moveTask).toHaveBeenCalledWith('new', 'today')
      })
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
})
