import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E22TaskDetail } from './E22TaskDetail'
import type { Task } from '@/domain/entities/task'
import { makeTask as baseTask, makeSubTask as baseSubTask } from '@/test/factories'

function makeTask(overrides: Partial<Task> = {}): Task {
  return baseTask({ title: 'Appeler le médecin', status: 'inbox', ...overrides })
}

function makeSubTask(overrides: Partial<Task> = {}): Task {
  return baseSubTask({ title: 'Prendre le téléphone', ...overrides })
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
      expect(screen.getByText('Prendre le téléphone')).toBeDefined()
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

  it('donner un horaire à une sous-étape appelle scheduleSubTask (E9c)', async () => {
    const task = makeTask()
    const subTask = makeSubTask({ id: 'st-1', title: 'Prendre le téléphone', scheduled_date: null, scheduled_start: null })
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks: vi.fn().mockResolvedValue([subTask]),
    })
    renderWithApp(<E22TaskDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Prendre le téléphone')).toBeDefined())
    await userEvent.click(screen.getByLabelText('Horaire de Prendre le téléphone'))
    await userEvent.type(screen.getByLabelText('Heure de Prendre le téléphone'), '09:00')
    expect(ctx.scheduleSubTask).toHaveBeenCalledWith('st-1', expect.any(String), '09:00', '09:00')
  })

  it('Renommer une sous-étape appelle renameSubTask et recharge la liste', async () => {
    const task = makeTask()
    const subTask = makeSubTask({ id: 'st-1', title: 'Prendre le téléphone' })
    const getSubTasks = vi.fn()
      .mockResolvedValueOnce([subTask])
      .mockResolvedValueOnce([{ ...subTask, title: 'Appeler le secrétariat' }])
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks,
    })
    renderWithApp(<E22TaskDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Prendre le téléphone')).toBeDefined())
    await userEvent.click(screen.getByLabelText('Renommer Prendre le téléphone'))
    const input = screen.getByLabelText('Nouveau nom')
    await userEvent.clear(input)
    await userEvent.type(input, 'Appeler le secrétariat')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(ctx.renameSubTask).toHaveBeenCalledWith('st-1', 'Appeler le secrétariat')
    await waitFor(() => {
      expect(screen.getByText('Appeler le secrétariat')).toBeDefined()
    })
    expect(screen.queryByRole('dialog', { name: 'Renommer la sous-étape' })).toBeNull()
  })

  it('Planifier appelle planTaskToday sans avertissement même avec des sous-étapes', async () => {
    const task = makeTask()
    const subTask = makeSubTask({ id: 'st-1', title: 'Prendre le téléphone' })
    const ctx = makeAppContext({
      selectedTaskId: 'task-1',
      inboxTasks: [task],
      getSubTasks: vi.fn().mockResolvedValue([subTask]),
    })
    renderWithApp(<E22TaskDetail />, ctx)
    await waitFor(() => expect(screen.getByText('Prendre le téléphone')).toBeDefined())
    await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))
    expect(ctx.planTaskToday).toHaveBeenCalledWith('task-1')
    expect(screen.queryByRole('dialog', { name: 'Sous-tâches perdues' })).toBeNull()
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

  describe('progression des sous-étapes', () => {
    it('coche une sous-étape et recharge la liste', async () => {
      const task = makeTask()
      const st = makeSubTask()
      const done = makeSubTask({ status: 'completed' })
      const getSubTasks = vi.fn().mockResolvedValueOnce([st]).mockResolvedValueOnce([done])
      const ctx = makeAppContext({
        selectedTaskId: 'task-1',
        inboxTasks: [task],
        getSubTasks,
      })
      renderWithApp(<E22TaskDetail />, ctx)
      await waitFor(() => expect(screen.getByText('Prendre le téléphone')).toBeDefined())
      await userEvent.click(screen.getByLabelText('Marquer terminée : Prendre le téléphone'))
      expect(ctx.toggleSubTask).toHaveBeenCalledWith(st)
      await waitFor(() => {
        expect(screen.getByLabelText('Marquer non terminée : Prendre le téléphone')).toBeDefined()
      })
    })

    it('affiche une sous-étape terminée comme barrée', async () => {
      const task = makeTask()
      const done = makeSubTask({ status: 'completed' })
      const ctx = makeAppContext({
        selectedTaskId: 'task-1',
        inboxTasks: [task],
        getSubTasks: vi.fn().mockResolvedValue([done]),
      })
      renderWithApp(<E22TaskDetail />, ctx)
      await waitFor(() => {
        const checkbox = screen.getByLabelText('Marquer non terminée : Prendre le téléphone') as HTMLInputElement
        expect(checkbox.checked).toBe(true)
      })
    })
  })

  describe('champs éditables (M4)', () => {
    it('affiche et modifie l\'icône', async () => {
      const task = makeTask({ icon: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Icône Aucune' }))
      await userEvent.click(screen.getByRole('button', { name: 'Sport' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { icon: 'sport' }, 'occurrence')
    })

    it('modifie l\'heure de début', async () => {
      const task = makeTask({ scheduled_date: '2026-08-10', scheduled_start: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Horaire Non planifié' }))
      await userEvent.type(screen.getByLabelText("Modifier l'heure de début"), '09:00')
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { startTime: '09:00' }, 'occurrence')
    })

    it('modifie le coût en énergie', async () => {
      const task = makeTask({ energy_cost: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Coût en énergie Non défini' }))
      await userEvent.click(screen.getByRole('group', { name: 'Modifier le coût en énergie' }).querySelector('button:nth-child(5)')!)
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { energyCost: 5 }, 'occurrence')
    })

    it('une tâche récurrente ouvre le choix occurrence/série avant d\'appliquer une modification', async () => {
      const task = makeTask({ recurrence_id: 'rec-1', energy_cost: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Coût en énergie Non défini' }))
      await userEvent.click(screen.getByRole('group', { name: 'Modifier le coût en énergie' }).querySelector('button:nth-child(5)')!)
      expect(ctx.updateTaskFields).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog', { name: 'Modifier la série récurrente' })).toBeDefined()
      await userEvent.click(screen.getByRole('button', { name: 'Toutes les occurrences' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { energyCost: 5 }, 'series')
    })

    it('une tâche récurrente ouvre le choix occurrence/série avant la suppression', async () => {
      const task = makeTask({ recurrence_id: 'rec-1' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      const confirmBtn = screen.getAllByRole('button', { name: 'Supprimer' }).find((b) => b.closest('[role="dialog"]'))
      await userEvent.click(confirmBtn!)
      expect(ctx.deleteTaskScoped).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog', { name: 'Modifier la série récurrente' })).toBeDefined()
      await userEvent.click(screen.getByRole('button', { name: 'Cette occurrence' }))
      expect(ctx.deleteTaskScoped).toHaveBeenCalledWith('task-1', 'occurrence')
    })
  })

  describe('Dupliquer (M4)', () => {
    it('appelle duplicateTaskById et navigue vers l\'écran d\'origine', async () => {
      const task = makeTask({ status: 'inbox' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Dupliquer' }))
      expect(ctx.duplicateTaskById).toHaveBeenCalledWith('task-1')
      expect(ctx.goTo).toHaveBeenCalledWith('inbox')
    })
  })

  describe('navigation retour selon statut', () => {
    it('retour vers inbox pour tâche inbox', async () => {
      const task = makeTask({ status: 'inbox' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.back).toHaveBeenCalledWith('inbox')
    })

    it('retour vers dashboard pour tâche today', async () => {
      const task = makeTask({ status: 'today' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', todayTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.back).toHaveBeenCalledWith('dashboard')
    })

  })
})
