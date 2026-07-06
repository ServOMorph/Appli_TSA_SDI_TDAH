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

  it('retour navigue vers dashboard', async () => {
    const goTo = vi.fn()
    renderWithApp(<E40Planning />, makeAppContext({ goTo }))
    await userEvent.click(screen.getByRole('button', { name: /retour/i }))
    expect(goTo).toHaveBeenCalledWith('dashboard')
  })

  it('navigation précédent charge le jour précédent', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate, getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    await userEvent.click(screen.getByRole('button', { name: /jour précédent/i }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))
  })

  it('navigation suivant charge le jour suivant', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate, getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([]) }))
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
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
  })

  it('tap case vide ouvre le picker de tâches', async () => {
    const task = makeTaskV2({ id: 'u1', title: 'Appel dentiste', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Appel dentiste')).toBeInTheDocument()
  })

  it('picker tâches vide affiche un message explicatif', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/aucune tâche à planifier/i)).toBeInTheDocument()
  })

  it('sélectionner une tâche dans le picker appelle scheduleV2Task', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 'u1', title: 'Appel dentiste', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('button', { name: 'Appel dentiste' }))
    await userEvent.click(screen.getByRole('button', { name: /valider/i }))

    expect(scheduleV2Task).toHaveBeenCalledWith('u1', '2026-06-30', '10:00', '10:30')
  })

  it('le bouton valider est désactivé tant qu\'aucune tâche n\'est sélectionnée', async () => {
    const task = makeTaskV2({ id: 'u1', title: 'Appel dentiste', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('button', { name: /valider/i })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Appel dentiste' }))
    expect(screen.getByRole('button', { name: /valider/i })).toBeEnabled()
  })

  it('tap sur une tâche existante ouvre le picker de déplacement', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([]),
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
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /médecin — déplacer/i }))
    await userEvent.click(screen.getByRole('button', { name: '14h00' }))

    expect(scheduleV2Task).toHaveBeenCalledWith('t1', '2026-06-30', '14:00', '14:30')
  })

  it('avec une tâche en attente (selectedTaskId), le tap sur un créneau vide affiche directement la confirmation sans liste', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 'u1', title: 'Laver machine', scheduled_date: null })
    const otherTask = makeTaskV2({ id: 'u2', title: 'Truc planifier', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        selectedTaskId: 'u1',
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([task, otherTask]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/placer « laver machine » à 10h00/i)).toBeInTheDocument()
    expect(screen.queryByText('Truc planifier')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /valider/i }))
    expect(scheduleV2Task).toHaveBeenCalledWith('u1', '2026-06-30', '10:00', '10:30')
  })

  it('valide la tâche en attente et désélectionne la tâche après planification', async () => {
    const selectTask = vi.fn()
    const task = makeTaskV2({ id: 'u1', title: 'Laver machine', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        selectTask,
        selectedTaskId: 'u1',
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('button', { name: /valider/i }))

    expect(selectTask).toHaveBeenCalledWith(null)
  })

  it('avec une tâche en attente, cliquer sur un créneau déjà occupé refuse et affiche un message (pas de déplacement de l\'autre tâche)', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const occupying = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    const pending = makeTaskV2({ id: 'u1', title: 'Laver machine', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        selectedTaskId: 'u1',
        getPlannedTasksForDate: vi.fn().mockResolvedValue([occupying]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([pending]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /médecin — déplacer/i }))

    expect(screen.queryByText(/déplacer « médecin »/i)).not.toBeInTheDocument()
    expect(scheduleV2Task).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupé/i)
  })

  it('fermer le picker ferme le dialogue', async () => {
    const task = makeTaskV2({ id: 'u1', title: 'Appel', scheduled_date: null })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getUnscheduledPlannedTasks: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
