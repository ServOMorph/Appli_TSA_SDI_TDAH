import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E22TaskDetail } from './E22TaskDetail'
import type { Task } from '@/domain/entities/task'
import type { TaskCategory } from '@/domain/entities/taskCategory'
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

  it('affiche uniquement le menu simplifié (Décomposer/Dupliquer/Supprimer)', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E22TaskDetail />, ctx)
    expect(screen.queryByRole('button', { name: 'Modifier' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Tâche du jour' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Planifier' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Liste' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Terminer' })).toBeNull()
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

  describe('édition en ligne des champs (#37)', () => {
    it('bandeau : la couleur de la tâche teinte le fond, pas la couleur d’ambiance', async () => {
      const task = makeTask({ color: '#22aa55', scheduled_date: '2026-09-05' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      const heading = screen.getByRole('heading', { name: 'Appeler le médecin' })
      const banner = heading.closest('button')?.parentElement?.parentElement as HTMLElement
      expect(banner.style.backgroundColor).toBe('rgb(34, 170, 85)')
    })

    it('clic sur le titre : édition inline, Entrée enregistre', async () => {
      const task = makeTask()
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier le titre' }))
      const input = screen.getByLabelText('Titre de la tâche')
      await userEvent.clear(input)
      await userEvent.type(input, 'Appeler le dentiste{Enter}')
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { title: 'Appeler le dentiste' }, 'occurrence')
    })

    it('clic sur Icône : affiche IconPicker, sélectionner enregistre et replie', async () => {
      const task = makeTask({ icon: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Icône' }))
      await userEvent.click(screen.getByRole('button', { name: 'Sport' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { icon: 'sport' }, 'occurrence')
      expect(screen.queryByRole('group', { name: 'Choisir une icône' })).toBeNull()
    })

    it('clic sur Couleur : affiche le sélecteur natif, changer enregistre', async () => {
      const task = makeTask({ color: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Couleur' }))
      fireEvent.change(screen.getByLabelText('Choisir une couleur'), { target: { value: '#ff8800' } })
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { color: '#ff8800' }, 'occurrence')
    })

    it('clic sur Couleur : propose les catégories configurées', async () => {
      const task = makeTask({ color: null })
      const category: TaskCategory = { id: 'cat-1', name: 'Voyage', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' }
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task], taskCategories: [category] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Couleur' }))
      await userEvent.click(screen.getByRole('button', { name: 'Voyage' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { color: '#4a7c99' }, 'occurrence')
    })

    it('clic sur Date : changer la date enregistre', async () => {
      const task = makeTask({ scheduled_date: '2026-09-05' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Date' }))
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-09-10' } })
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { date: '2026-09-10' }, 'occurrence')
    })

    it('clic sur Horaire : heure + durée, Enregistrer envoie les deux', async () => {
      const task = makeTask({ scheduled_start: null, duration_minutes: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Horaire' }))
      fireEvent.change(screen.getByLabelText('Heure'), { target: { value: '09:00' } })
      await userEvent.selectOptions(screen.getByLabelText('Heures'), '1')
      await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { startTime: '09:00', durationMinutes: 60 }, 'occurrence')
    })

    it('clic sur Coût en énergie : sélectionner une valeur enregistre et replie', async () => {
      const task = makeTask({ energy_cost: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Coût en énergie' }))
      await userEvent.click(screen.getByRole('button', { name: '5' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { energyCost: 5 }, 'occurrence')
      expect(screen.queryByRole('group', { name: 'Coût en énergie' })).toBeNull()
    })

    it('coche Obligatoire : enregistre immédiatement sans dépliage', async () => {
      const task = makeTask({ essential: false })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByLabelText('Obligatoire'))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { essential: true }, 'occurrence')
    })

    it('clic sur Description : la modification est enregistrée au blur', async () => {
      const task = makeTask({ description: '' })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Description' }))
      const textarea = screen.getByLabelText('Description')
      await userEvent.type(textarea, 'Apporter le carnet de santé')
      fireEvent.blur(textarea)
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { description: 'Apporter le carnet de santé' }, 'occurrence')
    })

    it('tâche récurrente : propose occurrence/série avant d’enregistrer un champ modifié', async () => {
      const task = makeTask({ recurrence_id: 'rec-1', energy_cost: null })
      const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Modifier Coût en énergie' }))
      await userEvent.click(screen.getByRole('button', { name: '5' }))
      expect(ctx.updateTaskFields).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog', { name: 'Modifier la série récurrente' })).toBeDefined()
      await userEvent.click(screen.getByRole('button', { name: 'Toutes les occurrences' }))
      expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', { energyCost: 5 }, 'series')
    })

    it('une tâche récurrente ouvre aussi le choix occurrence/série avant la suppression', async () => {
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

    it('retour vers dashboard pour tâche planifiée', async () => {
      const task = makeTask({ id: 'task-1', status: 'planned' })
      const ctx = makeAppContext({
        selectedTaskId: 'task-1',
        getTaskById: vi.fn().mockResolvedValue(task),
      })
      renderWithApp(<E22TaskDetail />, ctx)
      await userEvent.click(await screen.findByRole('button', { name: 'Retour' }))
      expect(ctx.back).toHaveBeenCalledWith('dashboard')
    })

  })
})
