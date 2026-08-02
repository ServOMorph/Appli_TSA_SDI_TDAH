import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E24Today } from './E24Today'
import type { Task } from '@/domain/entities/task'
import { makeTask as baseTask, makeSubTask } from '@/test/factories'

function makeTask(overrides: Partial<Task> = {}): Task {
  return baseTask({ title: 'Appeler le médecin', status: 'today', ...overrides })
}

describe('E24Today', () => {
  describe('état vide (D24A)', () => {
    it('affiche le message vide', () => {
      renderWithApp(<E24Today />)
      expect(screen.getByText("Aucune tâche sélectionnée aujourd'hui.")).toBeDefined()
    })
  })

  describe('sans limite de nombre (Q1)', () => {
    it("n'affiche pas de message de limite même avec plus de 3 tâches", () => {
      const ctx = makeAppContext({
        todayTasks: [
          makeTask({ id: '1', title: 'T1' }),
          makeTask({ id: '2', title: 'T2' }),
          makeTask({ id: '3', title: 'T3' }),
          makeTask({ id: '4', title: 'T4' }),
        ],
      })
      renderWithApp(<E24Today />, ctx)
      expect(screen.queryByText(/3 tâches aujourd'hui/)).toBeNull()
      expect(screen.getByText('T4')).toBeDefined()
    })
  })

  describe('avec tâches', () => {
    it('affiche les tâches du jour', () => {
      const ctx = makeAppContext({ todayTasks: [makeTask({ title: 'Faire la vaisselle' })] })
      renderWithApp(<E24Today />, ctx)
      expect(screen.getByText('Faire la vaisselle')).toBeDefined()
    })

    it('conserve une tâche terminée avec une teinte intensifiée', () => {
      const ctx = makeAppContext({
        todayTasks: [makeTask({ title: 'Faire la vaisselle', status: 'completed', completed_at: new Date().toISOString() })],
      })
      renderWithApp(<E24Today />, ctx)
      const title = screen.getByRole('button', { name: 'Faire la vaisselle' })
      expect(title).toHaveStyle({ color: '#fff', textDecoration: 'line-through' })
      expect(screen.queryByLabelText('Terminer Faire la vaisselle')).toBeNull()
    })

    it('affiche la progression des sous-étapes', () => {
      const task = makeTask({ id: 'abc', title: 'Appeler médecin' })
      const subs: Task[] = [
        makeSubTask({ id: 'st-1', parent_id: 'abc', title: 'Étape 1', status: 'completed', position: 0 }),
        makeSubTask({ id: 'st-2', parent_id: 'abc', title: 'Étape 2', status: 'inbox', position: 1 }),
      ]
      const ctx = makeAppContext({ todayTasks: [task], todaySubTasksMap: { abc: subs } })
      renderWithApp(<E24Today />, ctx)
      expect(screen.getByLabelText('1 sur 2 étapes')).toBeDefined()
    })

    it('n\'affiche pas de progression sans sous-étape', () => {
      const task = makeTask({ id: 'abc', title: 'Appeler médecin' })
      const ctx = makeAppContext({ todayTasks: [task] })
      renderWithApp(<E24Today />, ctx)
      expect(screen.queryByLabelText(/sur .* étapes/)).toBeNull()
    })

    it('affiche la prochaine sous-étape non terminée', () => {
      const task = makeTask({ id: 'abc', title: 'Appeler médecin' })
      const subs: Task[] = [
        makeSubTask({ id: 'st-1', parent_id: 'abc', title: 'Étape 1', status: 'completed', position: 0 }),
        makeSubTask({ id: 'st-2', parent_id: 'abc', title: 'Étape 2', status: 'inbox', position: 1 }),
      ]
      const ctx = makeAppContext({ todayTasks: [task], todaySubTasksMap: { abc: subs } })
      renderWithApp(<E24Today />, ctx)
      expect(screen.getByText('Prochaine étape : Étape 2')).toBeDefined()
    })

    it('n\'affiche pas de prochaine étape si toutes les sous-étapes sont terminées', () => {
      const task = makeTask({ id: 'abc', title: 'Appeler médecin' })
      const subs: Task[] = [
        makeSubTask({ id: 'st-1', parent_id: 'abc', title: 'Étape 1', status: 'completed', position: 0 }),
      ]
      const ctx = makeAppContext({ todayTasks: [task], todaySubTasksMap: { abc: subs } })
      renderWithApp(<E24Today />, ctx)
      expect(screen.queryByText(/Prochaine étape/)).toBeNull()
    })

    it('Terminer appelle completeTask', async () => {
      const task = makeTask({ id: 'abc', title: 'Faire la vaisselle' })
      const ctx = makeAppContext({ todayTasks: [task] })
      renderWithApp(<E24Today />, ctx)
      await userEvent.click(screen.getByLabelText('Terminer Faire la vaisselle'))
      expect(ctx.completeTask).toHaveBeenCalledWith('abc')
    })

    it('Retirer appelle moveTask vers inbox', async () => {
      const task = makeTask({ id: 'abc', title: 'Faire la vaisselle' })
      const ctx = makeAppContext({ todayTasks: [task] })
      renderWithApp(<E24Today />, ctx)
      await userEvent.click(screen.getByLabelText('Retirer Faire la vaisselle'))
      expect(ctx.moveTask).toHaveBeenCalledWith('abc', 'inbox')
    })

    it('clic sur le titre ouvre le détail', async () => {
      const task = makeTask({ id: 'abc', title: 'Faire la vaisselle' })
      const ctx = makeAppContext({ todayTasks: [task] })
      renderWithApp(<E24Today />, ctx)
      await userEvent.click(screen.getByText('Faire la vaisselle'))
      expect(ctx.selectTask).toHaveBeenCalledWith('abc')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })
  })

  describe('navigation', () => {
    it('Retour navigue vers dashboard', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E24Today />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })
  })
})
