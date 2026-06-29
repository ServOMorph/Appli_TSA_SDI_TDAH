import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E24Today } from './E24Today'
import type { Task } from '@/domain/entities/task'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Appeler le médecin',
    status: 'today',
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

describe('E24Today', () => {
  describe('état vide (D24A)', () => {
    it('affiche le message vide', () => {
      renderWithApp(<E24Today />)
      expect(screen.getByText("Aucune tâche sélectionnée aujourd'hui.")).toBeDefined()
    })

    it('n\'affiche pas le message limite', () => {
      renderWithApp(<E24Today />)
      expect(screen.queryByText(/3 tâches aujourd'hui/)).toBeNull()
    })
  })

  describe('état limite (D24B)', () => {
    it('affiche le message limite quand 3 tâches', () => {
      const ctx = makeAppContext({
        todayTasks: [
          makeTask({ id: '1', title: 'T1' }),
          makeTask({ id: '2', title: 'T2' }),
          makeTask({ id: '3', title: 'T3' }),
        ],
      })
      renderWithApp(<E24Today />, ctx)
      expect(screen.getByText("Vous avez déjà 3 tâches aujourd'hui.")).toBeDefined()
    })
  })

  describe('avec tâches', () => {
    it('affiche les tâches du jour', () => {
      const ctx = makeAppContext({ todayTasks: [makeTask({ title: 'Faire la vaisselle' })] })
      renderWithApp(<E24Today />, ctx)
      expect(screen.getByText('Faire la vaisselle')).toBeDefined()
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

    it("Voir le Todo navigue vers inbox", async () => {
      const ctx = makeAppContext()
      renderWithApp(<E24Today />, ctx)
      await userEvent.click(screen.getByRole('button', { name: "Voir le Todo" }))
      expect(ctx.goTo).toHaveBeenCalledWith('inbox')
    })
  })
})
