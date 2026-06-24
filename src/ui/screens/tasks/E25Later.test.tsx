import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E25Later } from './E25Later'
import type { Task } from '@/domain/entities/task'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Tâche plus tard',
    status: 'later',
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

describe('E25Later', () => {
  describe('état vide', () => {
    it('affiche le message vide', () => {
      renderWithApp(<E25Later />)
      expect(screen.getByText('Aucune tâche reportée.')).toBeDefined()
    })
  })

  describe('avec tâches', () => {
    it('affiche les tâches plus tard', () => {
      const ctx = makeAppContext({ laterTasks: [makeTask({ title: 'Faire les impôts' })] })
      renderWithApp(<E25Later />, ctx)
      expect(screen.getByText('Faire les impôts')).toBeDefined()
    })

    it('déplace vers Aujourd\'hui si moins de 3 tâches', async () => {
      const task = makeTask({ id: 'abc', title: 'Faire les impôts' })
      const ctx = makeAppContext({ laterTasks: [task], todayTasks: [] })
      renderWithApp(<E25Later />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Faire les impôts vers Aujourd'hui"))
      expect(ctx.moveTask).toHaveBeenCalledWith('abc', 'today')
    })

    it('ouvre le détail au clic sur le titre', async () => {
      const task = makeTask({ id: 'abc', title: 'Faire les impôts' })
      const ctx = makeAppContext({ laterTasks: [task] })
      renderWithApp(<E25Later />, ctx)
      await userEvent.click(screen.getByText('Faire les impôts'))
      expect(ctx.selectTask).toHaveBeenCalledWith('abc')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })
  })

  describe('modale M04 (limite 3 tâches)', () => {
    it('affiche la modale M04 si aujourd\'hui a déjà 3 tâches', async () => {
      const laterTask = makeTask({ id: 'new', title: 'Nouvelle tâche' })
      const todayTasks = [
        makeTask({ id: 't1', title: 'T1', status: 'today' }),
        makeTask({ id: 't2', title: 'T2', status: 'today' }),
        makeTask({ id: 't3', title: 'T3', status: 'today' }),
      ]
      const ctx = makeAppContext({ laterTasks: [laterTask], todayTasks })
      renderWithApp(<E25Later />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Nouvelle tâche vers Aujourd'hui"))
      expect(screen.getByRole('dialog', { name: 'Remplacer une tâche' })).toBeDefined()
    })

    it('choisir une tâche à remplacer appelle moveTask deux fois', async () => {
      const laterTask = makeTask({ id: 'new', title: 'Nouvelle tâche' })
      const todayTasks = [
        makeTask({ id: 't1', title: 'T1', status: 'today' }),
        makeTask({ id: 't2', title: 'T2', status: 'today' }),
        makeTask({ id: 't3', title: 'T3', status: 'today' }),
      ]
      const ctx = makeAppContext({ laterTasks: [laterTask], todayTasks })
      renderWithApp(<E25Later />, ctx)
      await userEvent.click(screen.getByLabelText("Déplacer Nouvelle tâche vers Aujourd'hui"))
      await userEvent.click(screen.getByLabelText('Remplacer par T2'))
      await waitFor(() => {
        expect(ctx.moveTask).toHaveBeenCalledWith('t2', 'inbox')
        expect(ctx.moveTask).toHaveBeenCalledWith('new', 'today')
      })
    })
  })

  describe('navigation', () => {
    it('Retour navigue vers dashboard', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E25Later />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })

    it("Voir l'inbox navigue vers inbox", async () => {
      const ctx = makeAppContext()
      renderWithApp(<E25Later />, ctx)
      await userEvent.click(screen.getByRole('button', { name: "Voir l'inbox" }))
      expect(ctx.goTo).toHaveBeenCalledWith('inbox')
    })
  })
})
