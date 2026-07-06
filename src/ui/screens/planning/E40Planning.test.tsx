import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { E40Planning } from './E40Planning'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { TaskV2 } from '@/domain/entities/taskV2'

function makeTaskV2(overrides: Partial<TaskV2> = {}): TaskV2 {
  return {
    id: 'task-1',
    title: 'Médecin',
    status: 'planned',
    essential: false,
    position: 0,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
    created_at: '2026-06-30T10:00:00Z',
    updated_at: '2026-06-30T10:00:00Z',
    completed_at: null,
    ...overrides,
  }
}

describe('E40Planning', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  it('affiche les créneaux par demi-heure de 0h00 à 23h30', async () => {
    renderWithApp(<E40Planning />)
    await waitFor(() => {
      expect(screen.getByText('0h00')).toBeInTheDocument()
    })
    expect(screen.getByText('0h30')).toBeInTheDocument()
    expect(screen.getByText('23h30')).toBeInTheDocument()
    expect(screen.getByText('14h00')).toBeInTheDocument()
    expect(screen.getByText('14h30')).toBeInTheDocument()
  })

  it('retour navigue vers dashboard et efface la tâche en attente', async () => {
    const goTo = vi.fn()
    const clearPendingPlanTask = vi.fn()
    renderWithApp(<E40Planning />, makeAppContext({ goTo, clearPendingPlanTask }))
    await userEvent.click(screen.getByRole('button', { name: /retour/i }))
    expect(clearPendingPlanTask).toHaveBeenCalled()
    expect(goTo).toHaveBeenCalledWith('dashboard')
  })

  it('navigation précédent charge le jour précédent', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    await userEvent.click(screen.getByRole('button', { name: /jour précédent/i }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))
  })

  it('navigation suivant charge le jour suivant', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    await userEvent.click(screen.getByRole('button', { name: /jour suivant/i }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
  })

  it('affiche une tâche planifiée dans son créneau horaire', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
  })

  it('affiche une tâche terminée en gardant la case visible (P4a)', async () => {
    const task = makeTaskV2({
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
      status: 'completed',
    })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
  })

  it('tap case vide sans tâche en attente propose d\'ajouter une tâche (P5)', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom de la tâche')).toBeInTheDocument()
  })

  it('créer une tâche directement dans une case vide appelle schedulePendingTask sans sourceTaskId', async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        schedulePendingTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))

    expect(schedulePendingTask).toHaveBeenCalledWith('Appel dentiste', '2026-06-30', '10:00', '10:30', undefined)
  })

  it('le bouton Planifier est désactivé tant qu\'aucun titre n\'est saisi', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('button', { name: 'Planifier' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel')
    expect(screen.getByRole('button', { name: 'Planifier' })).toBeEnabled()
  })

  it('tap sur une tâche existante ouvre le picker de déplacement', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /médecin — déplacer/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/déplacer « médecin »/i)).toBeInTheDocument()
  })

  it('sélectionner une heure dans le picker de déplacement appelle scheduleV2Task', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /médecin — déplacer/i }))
    await userEvent.click(screen.getByRole('button', { name: '14h00' }))

    expect(scheduleV2Task).toHaveBeenCalledWith('t1', '2026-06-30', '14:00', '14:30')
  })

  it('avec une tâche en attente (pendingPlanTask), le tap sur un créneau vide affiche directement la confirmation', async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        schedulePendingTask,
        pendingPlanTask: { title: 'Laver machine', sourceTaskId: 'abc' },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/placer « laver machine » à 10h00/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Nom de la tâche')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /valider/i }))
    expect(schedulePendingTask).toHaveBeenCalledWith('Laver machine', '2026-06-30', '10:00', '10:30', 'abc')
  })

  it('avec une tâche en attente, cliquer sur un créneau déjà occupé refuse et affiche un message (pas de déplacement de l\'autre tâche)', async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    const occupying = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        schedulePendingTask,
        pendingPlanTask: { title: 'Laver machine' },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([occupying]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /médecin — déplacer/i }))

    expect(screen.queryByText(/déplacer « médecin »/i)).not.toBeInTheDocument()
    expect(schedulePendingTask).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupé/i)
  })

  it('fermer le picker ferme le dialogue', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
