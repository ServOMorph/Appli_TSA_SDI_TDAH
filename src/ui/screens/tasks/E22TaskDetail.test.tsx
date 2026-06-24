import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E22TaskDetail } from './E22TaskDetail'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Appeler le médecin',
    status: 'inbox',
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

function makeSubTask(overrides: Partial<SubTask> = {}): SubTask {
  return {
    id: 'st-1',
    task_id: 'task-1',
    title: 'Prendre le téléphone',
    is_completed: false,
    position: 0,
    ...overrides,
  }
}

describe('E22TaskDetail', () => {
  it('affiche tâche introuvable si aucun selectedTaskId', () => {
    renderWithApp(<E22TaskDetail />)
    expect(screen.getByText('Tâche introuvable.')).toBeDefined()
  })

  it('affiche le titre de la tâche sélectionnée', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E22TaskDetail />, ctx)
    expect(screen.getByRole('heading', { name: 'Appeler le médecin' })).toBeDefined()
  })

  it('affiche les sous-étapes chargées', async () => {
    const task = makeTask()
    const subTask = makeSubTask()
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks: vi.fn().mockResolvedValue([subTask]),
    })
    renderWithApp(<E22TaskDetail />, ctx)
    await waitFor(() => {
      expect(screen.getByLabelText('Prendre le téléphone')).toBeDefined()
    })
  })

  it('Terminer appelle completeTask et navigue vers dashboard', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E22TaskDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Terminer' }))
    expect(ctx.completeTask).toHaveBeenCalledWith('task-1')
    await waitFor(() => {
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })
  })

  it('Décomposer navigue vers task-decompose', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E22TaskDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Décomposer' }))
    expect(ctx.goTo).toHaveBeenCalledWith('task-decompose')
  })

  describe('modale M01 (suppression)', () => {
    it('Supprimer affiche la modale de confirmation', async () => {
      const task = makeTask()
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      expect(screen.getByRole('dialog', { name: 'Supprimer la tâche' })).toBeDefined()
    })

    it('Annuler dans la modale ferme sans supprimer', async () => {
      const task = makeTask()
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(ctx.deleteTask).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('Confirmer suppression appelle deleteTask et navigue', async () => {
      const task = makeTask()
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      const confirmBtn = screen.getAllByRole('button', { name: 'Supprimer' }).find(
        (b) => b.closest('[role="dialog"]'),
      )
      await userEvent.click(confirmBtn!)
      expect(ctx.deleteTask).toHaveBeenCalledWith('task-1')
    })
  })

  describe('navigation retour selon statut', () => {
    it('retour vers inbox pour tâche inbox', async () => {
      const task = makeTask({ status: 'inbox' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('inbox')
    })

    it('retour vers today pour tâche today', async () => {
      const task = makeTask({ status: 'today' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', todayTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('today')
    })

    it('retour vers later pour tâche later', async () => {
      const task = makeTask({ status: 'later' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', laterTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('later')
    })
  })
})
