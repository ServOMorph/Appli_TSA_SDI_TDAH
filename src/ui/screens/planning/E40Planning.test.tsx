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

  it('ouvre directement sur planningTargetDate si fourni, puis le réinitialise', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    const setPlanningTargetDate = vi.fn()
    renderWithApp(
      <E40Planning />,
      makeAppContext({ planningTargetDate: '2026-07-01', setPlanningTargetDate, getPlannedTasksForDate }),
    )
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
    expect(setPlanningTargetDate).toHaveBeenCalledWith(null)
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
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Passer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Non' }))

    expect(schedulePendingTask).toHaveBeenCalledWith('Appel dentiste', '2026-06-30', '10:00', '10:30', undefined, null, false)
  })

  it('le bouton Valider est désactivé tant qu\'aucun titre n\'est saisi', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel')
    expect(screen.getByRole('button', { name: 'Valider' })).toBeEnabled()
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
    await userEvent.click(screen.getByRole('button', { name: 'Passer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Non' }))
    expect(schedulePendingTask).toHaveBeenCalledWith('Laver machine', '2026-06-30', '10:00', '10:30', 'abc', null, false)
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

  it('sélectionner un coût en énergie et choisir obligatoire les transmet à schedulePendingTask (E1/E2)', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('button', { name: 'Oui' }))

    expect(schedulePendingTask).toHaveBeenCalledWith('Appel dentiste', '2026-06-30', '10:00', '10:30', undefined, 5, true)
  })

  it('coût énergie non défini par défaut (E3, aucune valeur imposée)', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByRole('group', { name: 'Coût en énergie' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).not.toHaveStyle({ color: '#fff' })
    expect(screen.getByRole('button', { name: 'Passer' })).toBeInTheDocument()
  })

  it('affiche le coût énergie sur la case du planning', async () => {
    const task = makeTaskV2({
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
      energy_cost: 7,
    })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByLabelText('7 énergie')).toBeInTheDocument()
  })

  it('affiche le bouton Reporter sur une tâche non-obligatoire du jour en surcharge', async () => {
    const task = makeTaskV2({
      title: 'Shopping',
      essential: false,
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
    })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        overloadMode: true,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    expect(await screen.findByLabelText(/Reporter Shopping/)).toBeInTheDocument()
  })

  it("n'affiche pas le bouton Reporter sur une tâche obligatoire en surcharge", async () => {
    const task = makeTaskV2({
      title: 'McDo',
      essential: true,
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
    })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        overloadMode: true,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('McDo')).toBeInTheDocument())
    expect(screen.queryByLabelText(/Reporter McDo/)).toBeNull()
  })

  it("n'affiche pas le bouton Reporter hors surcharge", async () => {
    const task = makeTaskV2({
      title: 'Shopping',
      essential: false,
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
    })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        overloadMode: false,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Shopping')).toBeInTheDocument())
    expect(screen.queryByLabelText(/Reporter Shopping/)).toBeNull()
  })

  it('reporte la tâche au lendemain au clic sur Reporter et recharge le planning', async () => {
    const postponeTask = vi.fn().mockResolvedValue(undefined)
    const getPlannedTasksForDate = vi
      .fn()
      .mockResolvedValueOnce([
        makeTaskV2({
          id: 't1',
          title: 'Shopping',
          essential: false,
          scheduled_date: '2026-06-30',
          scheduled_start: '09:00',
          scheduled_end: '10:00',
        }),
      ])
      .mockResolvedValue([])
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        overloadMode: true,
        postponeTask,
        getPlannedTasksForDate,
      }),
    )
    const btn = await screen.findByLabelText(/Reporter Shopping/)
    await userEvent.click(btn)
    expect(postponeTask).toHaveBeenCalledWith('t1')
  })

  it('affiche le bouton Terminer sur une tâche planifiée non terminée (P2)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByLabelText('Terminer Médecin')).toBeInTheDocument()
  })

  it('clic sur Terminer appelle completeV2Task et recharge le planning', async () => {
    const completeV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ completeV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Terminer Médecin'))
    expect(completeV2Task).toHaveBeenCalledWith('t1')
  })

  it("n'affiche pas le bouton Terminer sur une tâche déjà terminée", async () => {
    const task = makeTaskV2({
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
      status: 'completed',
    })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.queryByLabelText('Terminer Médecin')).toBeNull()
  })

  it('après avoir planifié une tâche, le jour affiché ne change pas (P6)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(
      <E40Planning />,
      makeAppContext({ schedulePendingTask: vi.fn().mockResolvedValue(undefined), getPlannedTasksForDate }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'McDo')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Passer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Non' }))

    expect(getPlannedTasksForDate).not.toHaveBeenCalledWith('2026-07-01')
  })

  it('affiche le bouton Répéter demain sur une tâche planifiée (P6)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByLabelText('Répéter Médecin demain')).toBeInTheDocument()
  })

  it('clic sur Répéter demain appelle repeatTaskTomorrow et recharge le planning (P6)', async () => {
    const repeatTaskTomorrow = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ repeatTaskTomorrow, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Répéter Médecin demain'))
    expect(repeatTaskTomorrow).toHaveBeenCalledWith('t1')
  })

  it('après Répéter demain, le planning affiche directement le jour du duplicata (P6)', async () => {
    const repeatTaskTomorrow = vi.fn().mockResolvedValue('2026-07-01')
    const getPlannedTasksForDate = vi
      .fn()
      .mockResolvedValueOnce([
        makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' }),
      ])
      .mockResolvedValue([])
    renderWithApp(
      <E40Planning />,
      makeAppContext({ repeatTaskTomorrow, getPlannedTasksForDate }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Répéter Médecin demain'))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
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
