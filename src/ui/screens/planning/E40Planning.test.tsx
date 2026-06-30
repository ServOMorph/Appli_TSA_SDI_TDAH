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

  it('affiche les créneaux horaires de 6h à 22h', async () => {
    renderWithApp(<E40Planning />)
    await waitFor(() => {
      expect(screen.getByText('6h')).toBeInTheDocument()
    })
    expect(screen.getByText('22h')).toBeInTheDocument()
    expect(screen.getByText('14h')).toBeInTheDocument()
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
    await waitFor(() => expect(screen.getByText('10h')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: /créneau 10h/i }))
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
    await waitFor(() => expect(screen.getByText('10h')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: /créneau 10h/i }))
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
    await waitFor(() => expect(screen.getByText('10h')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: /créneau 10h/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Appel dentiste' }))

    expect(scheduleV2Task).toHaveBeenCalledWith('u1', '2026-06-30', '10:00', '11:00')
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

    expect(scheduleV2Task).toHaveBeenCalledWith('t1', '2026-06-30', '14:00', '15:00')
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
    await waitFor(() => expect(screen.getByText('10h')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: /créneau 10h/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
