import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E23Decompose } from './E23Decompose'
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

describe('E23Decompose', () => {
  it('affiche le message vide si pas de sous-étapes', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E23Decompose />, ctx)
    await waitFor(() => {
      expect(screen.getByText('Aucune sous-étape.')).toBeDefined()
    })
  })

  it('affiche les sous-étapes chargées', async () => {
    const task = makeTask()
    const st = makeSubTask()
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks: vi.fn().mockResolvedValue([st]),
    })
    renderWithApp(<E23Decompose />, ctx)
    await waitFor(() => {
      expect(screen.getByText('Prendre le téléphone')).toBeDefined()
    })
  })

  it('ajoute une sous-étape et recharge la liste', async () => {
    const task = makeTask()
    const st = makeSubTask()
    const getSubTasks = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([st])
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks,
    })
    renderWithApp(<E23Decompose />, ctx)
    await waitFor(() => expect(screen.getByText('Aucune sous-étape.')).toBeDefined())
    await userEvent.type(screen.getByLabelText('Nouvelle sous-étape'), 'Prendre le téléphone')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(ctx.addSubTask).toHaveBeenCalledWith('task-1', 'Prendre le téléphone')
    await waitFor(() => {
      expect(screen.getByText('Prendre le téléphone')).toBeDefined()
    })
  })

  it('supprime une sous-étape et recharge la liste', async () => {
    const task = makeTask()
    const st = makeSubTask()
    const getSubTasks = vi.fn()
      .mockResolvedValueOnce([st])
      .mockResolvedValueOnce([])
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks,
    })
    renderWithApp(<E23Decompose />, ctx)
    await waitFor(() => expect(screen.getByText('Prendre le téléphone')).toBeDefined())
    await userEvent.click(screen.getByLabelText('Supprimer Prendre le téléphone'))
    expect(ctx.deleteSubTask).toHaveBeenCalledWith('st-1')
    await waitFor(() => {
      expect(screen.queryByText('Prendre le téléphone')).toBeNull()
    })
  })

  it('le bouton Ajouter est désactivé si le champ est vide', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E23Decompose />, ctx)
    const btn = screen.getByRole('button', { name: 'Ajouter' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('Retour navigue vers task-detail', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E23Decompose />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
  })
})
