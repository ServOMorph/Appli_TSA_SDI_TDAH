import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanningBoard } from './PlanningBoard'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask } from '@/app/AppContext'
import { makeTask as baseTask, makePlannedSubTask } from '@/test/factories'

function makeSubTaskV2(overrides: Partial<PlannedSubTask> = {}): PlannedSubTask {
  return makePlannedSubTask(overrides)
}

function makeTaskV2(overrides: Partial<Task> = {}): Task {
  return baseTask({ title: 'Médecin', status: 'planned', ...overrides })
}

function renderExpanded(ctx = makeAppContext(), onRequestExpand = vi.fn()) {
  return renderWithApp(<PlanningBoard collapsed={false} onRequestExpand={onRequestExpand} />, ctx)
}

describe('PlanningBoard — déplié', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  it('affiche les créneaux par demi-heure de 0h00 à 23h30', async () => {
    renderExpanded()
    await waitFor(() => {
      expect(screen.getByText('0h00')).toBeInTheDocument()
    })
    expect(screen.getByText('0h30')).toBeInTheDocument()
    expect(screen.getByText('23h30')).toBeInTheDocument()
    expect(screen.getByText('14h00')).toBeInTheDocument()
    expect(screen.getByText('14h30')).toBeInTheDocument()
  })

  it('ouvre directement sur planningTargetDate si fourni, puis le réinitialise', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    const setPlanningTargetDate = vi.fn()
    renderExpanded(
      makeAppContext({ planningTargetDate: '2026-07-01', setPlanningTargetDate, getPlannedTasksForDate }),
    )
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
    expect(setPlanningTargetDate).toHaveBeenCalledWith(null)
  })

  it('navigation précédent charge le jour précédent', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    await userEvent.click(screen.getByRole('button', { name: /jour précédent/i }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))
  })

  it('navigation suivant charge le jour suivant', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    await userEvent.click(screen.getByRole('button', { name: /jour suivant/i }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
  })

  it('affiche une tâche planifiée dans son créneau horaire', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).toHaveStyle({
      backgroundColor: 'color-mix(in srgb, #4a7c99 22%, var(--color-surface))',
    })
  })

  it('rend une plage comme une seule tâche, avec le titre seulement au début (E2c)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:30' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).toBeInTheDocument())
    expect(screen.getAllByText('Médecin')).toHaveLength(1)
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h30 : Médecin (suite)' })).toHaveStyle({ marginTop: '-1px' })
    expect(screen.getByRole('gridcell', { name: 'Créneau 10h00 : Médecin (suite)' })).toBeInTheDocument()
  })

  it('refuse une plage qui recouvre un créneau intermédiaire occupé (E2b)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '10:00', scheduled_end: '10:30' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h30' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupé/i)
  })

  it('repositionne la tâche active sur une nouvelle plage sans rouvrir le formulaire (E5)', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    renderExpanded(
      makeAppContext({
        pendingPlanTask: { kind: 'task', title: 'McDo', taskId: 'active-1' },
        scheduleV2Task,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText(/McDo.*cours de planification/)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 11h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 12h00' }))
    expect(scheduleV2Task).toHaveBeenCalledWith('active-1', '2026-06-30', '11:00', '12:30')
    expect(screen.queryByRole('dialog', { name: 'Choisir une tâche' })).toBeNull()
  })

  it('sélectionne un créneau de début puis ouvre le formulaire au second clic (E2a)', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/Début sélectionné à 10h00/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom de la tâche')).toBeInTheDocument()
  })

  it('créer une tâche directement dans une case vide appelle schedulePendingTask sans sourceTaskId', async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    renderExpanded(
      makeAppContext({ schedulePendingTask, getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))

    expect(schedulePendingTask).toHaveBeenCalledWith('Appel dentiste', '2026-06-30', '10:00', '10:30', undefined, null, false)
  })

  it("le bouton Valider est désactivé tant qu'aucun titre n'est saisi", async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel')
    expect(screen.getByRole('button', { name: 'Valider' })).toBeEnabled()
  })

  it("clic sur une tâche existante ouvre le menu d'actions (E6)", async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    expect(screen.getByRole('dialog', { name: 'Actions sur la tâche' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Déplacer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Renommer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
  })

  it('Déplacer depuis le menu appelle startMoveTask et ferme le menu (E6)', async () => {
    const startMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({ startMoveTask, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    await userEvent.click(screen.getByRole('button', { name: 'Déplacer' }))

    expect(startMoveTask).toHaveBeenCalledWith(task, false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('avec une tâche en cours de déplacement, le bandeau est affiché', async () => {
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({
        movingTask: { kind: 'task', task, report: false },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    expect(await screen.findByText(/« médecin » est en cours de déplacement\./i)).toBeInTheDocument()
  })

  it('avec une tâche en cours de déplacement, cliquer une case appelle scheduleV2Task puis clearMoveTask', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const clearMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({
        scheduleV2Task,
        clearMoveTask,
        movingTask: { kind: 'task', task, report: false },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 14h00' }))

    expect(scheduleV2Task).toHaveBeenCalledWith('t1', '2026-06-30', '14:00', '15:00')
    await waitFor(() => expect(clearMoveTask).toHaveBeenCalled())
  })

  it('« Annuler » appelle clearMoveTask sans déplacer la tâche', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const clearMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({
        scheduleV2Task,
        clearMoveTask,
        movingTask: { kind: 'task', task, report: false },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Annuler le déplacement de Médecin' }))

    expect(clearMoveTask).toHaveBeenCalled()
    expect(scheduleV2Task).not.toHaveBeenCalled()
  })

  it("déplacer vers une case déjà occupée affiche une erreur et n'appelle pas clearMoveTask", async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const clearMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    const other = makeTaskV2({ id: 't2', title: 'Autre', scheduled_date: '2026-06-30', scheduled_start: '14:00', scheduled_end: '14:30' })
    renderExpanded(
      makeAppContext({
        scheduleV2Task,
        clearMoveTask,
        movingTask: { kind: 'task', task, report: false },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task, other]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Autre')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 14h00 : Autre' }))

    expect(scheduleV2Task).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupée/i)
    expect(clearMoveTask).not.toHaveBeenCalled()
  })

  it('Renommer depuis le menu appelle renameV2Task (E6)', async () => {
    const renameV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({ renameV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    await userEvent.click(screen.getByRole('button', { name: 'Renommer' }))
    const input = screen.getByLabelText('Nouveau nom')
    await userEvent.clear(input)
    await userEvent.type(input, 'Dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(renameV2Task).toHaveBeenCalledWith('t1', 'Dentiste')
  })

  it('Supprimer depuis le menu appelle deleteV2Task (E6)', async () => {
    const deleteV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({ deleteV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(deleteV2Task).toHaveBeenCalledWith('t1')
  })

  it('avec une tâche en attente, la plage ouvre directement les détails', async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    renderExpanded(
      makeAppContext({
        schedulePendingTask,
        pendingPlanTask: { kind: 'task', title: 'Laver machine', sourceTaskId: 'abc' },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/placer « laver machine » de 10h00 à 10h00/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Nom de la tâche')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))
    expect(schedulePendingTask).toHaveBeenCalledWith('Laver machine', '2026-06-30', '10:00', '10:30', 'abc', null, false)
  })

  it("avec une tâche en attente, cliquer sur un créneau déjà occupé refuse et affiche un message", async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    const occupying = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({
        schedulePendingTask,
        pendingPlanTask: { kind: 'task', title: 'Laver machine' },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([occupying]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))

    expect(screen.queryByText(/déplacer « médecin »/i)).not.toBeInTheDocument()
    expect(schedulePendingTask).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupé/i)
  })

  it('sélectionner un coût en énergie et cocher obligatoire les transmet à schedulePendingTask (D5)', async () => {
    const schedulePendingTask = vi.fn().mockResolvedValue(undefined)
    renderExpanded(
      makeAppContext({ schedulePendingTask, getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Obligatoire' }))
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))

    expect(schedulePendingTask).toHaveBeenCalledWith('Appel dentiste', '2026-06-30', '10:00', '10:30', undefined, 5, true)
  })

  it('coût énergie non défini par défaut (E3, aucune valeur imposée)', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByRole('group', { name: 'Coût en énergie' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).not.toHaveStyle({ color: '#fff' })
    expect(screen.getByRole('checkbox', { name: 'Obligatoire' })).not.toBeChecked()
  })

  it('affiche le coût énergie sur la case du planning', async () => {
    const task = makeTaskV2({
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
      energy_cost: 7,
    })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
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
    renderExpanded(
      makeAppContext({ overloadMode: true, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
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
    renderExpanded(
      makeAppContext({ overloadMode: true, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
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
    renderExpanded(
      makeAppContext({ overloadMode: false, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Shopping')).toBeInTheDocument())
    expect(screen.queryByLabelText(/Reporter Shopping/)).toBeNull()
  })

  it('Reporter appelle startMoveTask avec report=true (E8)', async () => {
    const startMoveTask = vi.fn()
    const task = makeTaskV2({
      id: 't1',
      title: 'Shopping',
      essential: false,
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
    })
    renderExpanded(
      makeAppContext({
        overloadMode: true,
        startMoveTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await userEvent.click(await screen.findByLabelText(/Reporter Shopping/))

    expect(startMoveTask).toHaveBeenCalledWith(task, true)
  })

  it('avec une tâche en cours de report, le planning bascule sur le lendemain et affiche le bandeau', async () => {
    const task = makeTaskV2({
      id: 't1',
      title: 'Shopping',
      essential: false,
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
    })
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(
      makeAppContext({ movingTask: { kind: 'task', task, report: true }, getPlannedTasksForDate }),
    )
    expect(await screen.findByText(/« shopping » est en cours de déplacement\./i)).toBeInTheDocument()
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
  })

  it('avec une tâche en cours de report, cliquer une case appelle reportV2Task sur le jour affiché', async () => {
    const reportV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({
      id: 't1',
      title: 'Shopping',
      essential: false,
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
    })
    renderExpanded(
      makeAppContext({
        reportV2Task,
        movingTask: { kind: 'task', task, report: true },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('11h00')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 11h00' }))

    expect(reportV2Task).toHaveBeenCalledWith('t1', '2026-07-01', '11:00', '12:00')
  })

  it('affiche une case à cocher non cochée sur une tâche planifiée (P2)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).not.toBeChecked()
  })

  it('cocher une tâche appelle completeV2Task et recharge le planning', async () => {
    const completeV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(
      makeAppContext({ completeV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('checkbox', { name: 'Terminer Médecin' }))
    expect(completeV2Task).toHaveBeenCalledWith('t1')
  })

  it('affiche une case cochée et une teinte intensifiée sur une tâche déjà terminée', async () => {
    const task = makeTaskV2({
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '10:00',
      status: 'completed',
    })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).not.toBeDisabled()
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).toHaveStyle({
      backgroundColor: '#4a7c99',
    })
  })

  it('après avoir planifié une tâche, le jour affiché ne change pas (P6)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(
      makeAppContext({ schedulePendingTask: vi.fn().mockResolvedValue(undefined), getPlannedTasksForDate }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'McDo')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))

    expect(getPlannedTasksForDate).not.toHaveBeenCalledWith('2026-07-01')
  })

  it('fermer le picker ferme le dialogue', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('affiche le badge Reporté sur une tâche marquée comme reportée', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00', postponed: true })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByText('Reporté')).toBeInTheDocument()
  })

  it("n'expose plus de glisser-déposer : aucune case n'est neutralisée pour le tactile (Q10)", async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).not.toHaveStyle({
      touchAction: 'none',
    })
  })
})

describe('PlanningBoard — replié', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  it("n'affiche qu'une fenêtre de créneaux autour de l'heure courante", async () => {
    renderWithApp(<PlanningBoard collapsed onRequestExpand={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('14h30')).toBeInTheDocument())
    expect(screen.getByText('14h00')).toBeInTheDocument()
    expect(screen.getByText('16h30')).toBeInTheDocument()
    expect(screen.queryByText('0h00')).toBeNull()
    expect(screen.queryByText('23h30')).toBeNull()
  })

  it("n'affiche pas la navigation par jour", async () => {
    renderWithApp(<PlanningBoard collapsed onRequestExpand={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('14h30')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /jour précédent/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /jour suivant/i })).toBeNull()
  })

  it('démarrer un déplacement depuis le menu demande le dépliement', async () => {
    const onRequestExpand = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '15:00', scheduled_end: '15:30' })
    renderWithApp(
      <PlanningBoard collapsed onRequestExpand={onRequestExpand} />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 15h00 : Médecin' }))
    await userEvent.click(screen.getByRole('button', { name: 'Déplacer' }))

    expect(onRequestExpand).toHaveBeenCalled()
  })
})

describe('PlanningBoard — sous-tâches planifiables (E9)', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  it('affiche une sous-tâche planifiée avec le titre du parent et son propre titre en dessous (E9b)', async () => {
    const sub = makeSubTaskV2({
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '09:30',
    })
    renderExpanded(
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([sub]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Rangement')).toBeInTheDocument())
    expect(screen.getByText('- Ranger le bureau')).toBeInTheDocument()
  })

  it('avec une sous-tâche en attente, choisir un créneau appelle scheduleSubTaskV2', async () => {
    const scheduleSubTaskV2 = vi.fn().mockResolvedValue(undefined)
    renderExpanded(
      makeAppContext({
        scheduleSubTaskV2,
        pendingPlanTask: { kind: 'subtask', title: 'Ranger le bureau', subTaskId: 'sub-1' },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText(/Ranger le bureau.*cours de planification/)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(scheduleSubTaskV2).toHaveBeenCalledWith('sub-1', '2026-06-30', '10:00', '10:30')
  })

  it('le menu sur une sous-tâche propose Déplacer/Renommer/Supprimer et les branche sur les fonctions sous-tâche (E6)', async () => {
    const startMoveSubTask = vi.fn()
    const renameSubTaskV2 = vi.fn().mockResolvedValue(undefined)
    const deleteSubTask = vi.fn().mockResolvedValue(undefined)
    const sub = makeSubTaskV2({
      id: 'sub-1',
      scheduled_date: '2026-06-30',
      scheduled_start: '09:00',
      scheduled_end: '09:30',
    })
    renderExpanded(
      makeAppContext({
        startMoveSubTask,
        renameSubTaskV2,
        deleteSubTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([sub]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Rangement')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: /Créneau 9h00/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Déplacer' }))
    expect(startMoveSubTask).toHaveBeenCalledWith(sub, false)

    await userEvent.click(screen.getByRole('gridcell', { name: /Créneau 9h00/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Renommer' }))
    const input = screen.getByLabelText('Nouveau nom')
    await userEvent.clear(input)
    await userEvent.type(input, 'Trier les papiers')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(renameSubTaskV2).toHaveBeenCalledWith('sub-1', 'Trier les papiers')

    await userEvent.click(screen.getByRole('gridcell', { name: /Créneau 9h00/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(deleteSubTask).toHaveBeenCalledWith('sub-1')
  })

  it('avec une sous-tâche en cours de déplacement, le bandeau affiche parent et sous-titre (E8)', async () => {
    const sub = makeSubTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderExpanded(
      makeAppContext({
        movingTask: { kind: 'subtask', subTask: sub, report: true },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([sub]),
      }),
    )
    expect(await screen.findByText(/« rangement - ranger le bureau » est en cours de déplacement\./i)).toBeInTheDocument()
  })

  it("cocher la case d'une sous-tâche planifiée appelle toggleSubTask", async () => {
    const toggleSubTask = vi.fn().mockResolvedValue(undefined)
    const sub = makeSubTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderExpanded(
      makeAppContext({
        toggleSubTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([sub]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Rangement')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Terminer Rangement - Ranger le bureau'))
    expect(toggleSubTask).toHaveBeenCalledWith(sub)
  })
})
