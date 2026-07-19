import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, fireEvent, act } from '@testing-library/react'
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

function mockGridRect() {
  const grid = screen.getByRole('grid')
  vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    right: 300,
    top: 0,
    bottom: 800,
    width: 300,
    height: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect)
}

function mockElementFromPoint(element: Element) {
  ;(document as unknown as { elementFromPoint: (x: number, y: number) => Element | null }).elementFromPoint = () => element
}

describe('E40Planning', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  afterEach(() => {
    delete (document as unknown as { elementFromPoint?: unknown }).elementFromPoint
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
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).toHaveStyle({
      backgroundColor: 'color-mix(in srgb, #4a7c99 22%, var(--color-surface))',
    })
  })

  it('rend une plage comme une seule tâche, avec le titre seulement au début (E2c)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:30' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).toBeInTheDocument())
    expect(screen.getAllByText('Médecin')).toHaveLength(1)
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h30 : Médecin (suite)' })).toHaveStyle({ marginTop: '-1px' })
    expect(screen.getByRole('gridcell', { name: 'Créneau 10h00 : Médecin (suite)' })).toBeInTheDocument()
  })

  it('refuse une plage qui recouvre un créneau intermédiaire occupé (E2b)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '10:00', scheduled_end: '10:30' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00' }))
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h30' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupé/i)
  })

  it('repositionne la tâche active sur une nouvelle plage sans rouvrir le formulaire (E5)', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        pendingPlanTask: { title: 'McDo', taskId: 'active-1' },
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

  it('sélectionne un créneau de début puis ouvre le formulaire au second clic (E2a)', async () => {
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('10h00')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/Début sélectionné à 10h00/)).toBeInTheDocument()
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
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))

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
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel')
    expect(screen.getByRole('button', { name: 'Valider' })).toBeEnabled()
  })

  it('tap sur une tâche existante ouvre le menu d\'actions (E6)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    expect(screen.getByRole('dialog', { name: 'Actions sur la tâche' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Déplacer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Renommer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
  })

  it('Déplacer depuis le menu appelle startMoveTask et ferme le menu (E6)', async () => {
    const startMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        startMoveTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    await userEvent.click(screen.getByRole('button', { name: 'Déplacer' }))

    expect(startMoveTask).toHaveBeenCalledWith(task, false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('avec une tâche en cours de déplacement, le bandeau est affiché', async () => {
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        movingTask: { task, report: false },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    expect(await screen.findByText(/« médecin » est en cours de déplacement\./i)).toBeInTheDocument()
  })

  it('avec une tâche en cours de déplacement, cliquer une case appelle scheduleV2Task puis clearMoveTask', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const clearMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        clearMoveTask,
        movingTask: { task, report: false },
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
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        clearMoveTask,
        movingTask: { task, report: false },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Annuler le déplacement de Médecin' }))

    expect(clearMoveTask).toHaveBeenCalled()
    expect(scheduleV2Task).not.toHaveBeenCalled()
  })

  it('déplacer vers une case déjà occupée affiche une erreur et n\'appelle pas clearMoveTask', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const clearMoveTask = vi.fn()
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    const other = makeTaskV2({ id: 't2', title: 'Autre', scheduled_date: '2026-06-30', scheduled_start: '14:00', scheduled_end: '14:30' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        scheduleV2Task,
        clearMoveTask,
        movingTask: { task, report: false },
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
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        renameV2Task,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
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
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        deleteV2Task,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(deleteV2Task).toHaveBeenCalledWith('t1')
  })

  it('avec une tâche en attente, la plage ouvre directement les détails', async () => {
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
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByText(/placer « laver machine » de 10h00 à 10h00/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Nom de la tâche')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))
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

    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' }))

    expect(screen.queryByText(/déplacer « médecin »/i)).not.toBeInTheDocument()
    expect(schedulePendingTask).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/déjà occupé/i)
  })

  it('sélectionner un coût en énergie et cocher obligatoire les transmet à schedulePendingTask (D5)', async () => {
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
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    await userEvent.type(screen.getByLabelText('Nom de la tâche'), 'Appel dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Obligatoire' }))
    await userEvent.click(screen.getByRole('button', { name: 'Placer' }))

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
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        overloadMode: true,
        startMoveTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([task]),
      }),
    )
    const btn = await screen.findByLabelText(/Reporter Shopping/)
    await userEvent.click(btn)

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
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        movingTask: { task, report: true },
        getPlannedTasksForDate,
      }),
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
    renderWithApp(
      <E40Planning />,
      makeAppContext({
        reportV2Task,
        movingTask: { task, report: true },
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      }),
    )
    await waitFor(() => expect(screen.getByText('11h00')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 11h00' }))

    expect(reportV2Task).toHaveBeenCalledWith('t1', '2026-07-01', '11:00', '12:00')
  })

  it('affiche une case à cocher non cochée sur une tâche planifiée (P2)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).not.toBeChecked()
  })

  it('cocher une tâche appelle completeV2Task et recharge le planning', async () => {
    const completeV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
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
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).not.toBeDisabled()
    expect(screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })).toHaveStyle({
      backgroundColor: '#4a7c99',
    })
  })

  it('après avoir planifié une tâche, le jour affiché ne change pas (P6)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(
      <E40Planning />,
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

  it('n’affiche plus le bouton Répéter demain (D3)', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.queryByLabelText('Répéter Médecin demain')).toBeNull()
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
    await userEvent.click(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('affiche le badge Reporté sur une tâche marquée comme reportée', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00', postponed: true })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByText('Reporté')).toBeInTheDocument()
  })

  it('appui bref sur une tâche ouvre le menu sans la déplacer (E1)', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ scheduleV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 100, clientY: 100 })
    fireEvent.pointerUp(cell, { clientX: 100, clientY: 100 })
    expect(screen.getByRole('dialog', { name: 'Actions sur la tâche' })).toBeInTheDocument()
    expect(scheduleV2Task).not.toHaveBeenCalled()
  })

  it('appui long puis relâcher sur un créneau pose la tâche sous le curseur (E1)', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ scheduleV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockElementFromPoint(screen.getByRole('gridcell', { name: 'Créneau 10h00' }))

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 100, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    fireEvent.pointerUp(window, { clientX: 100, clientY: 180 })

    await waitFor(() => expect(scheduleV2Task).toHaveBeenCalled())
    expect(scheduleV2Task).toHaveBeenCalledWith('t1', '2026-06-30', '10:00', '10:30')
  })

  it('maintenir la tâche à droite du planning bascule sur le jour suivant, relâcher dans la zone annule (E1)', async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    const getPlannedTasksForDate = vi.fn().mockImplementation((date: string) =>
      Promise.resolve(date === '2026-06-30' ? [task] : []),
    )
    renderWithApp(
      <E40Planning />,
      makeAppContext({ scheduleV2Task, getPlannedTasksForDate }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockGridRect()

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 150, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    act(() => {
      fireEvent.pointerMove(window, { clientX: 350, clientY: 100 })
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })

    expect(screen.getByText('mercredi 1 juillet')).toBeInTheDocument()

    await act(async () => {
      fireEvent.pointerUp(window, { clientX: 350, clientY: 100 })
    })
    expect(scheduleV2Task).not.toHaveBeenCalled()
  })

  it('rester dans la zone de droite fait défiler plusieurs jours de suite (E1)', async () => {
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    const getPlannedTasksForDate = vi.fn().mockImplementation((date: string) =>
      Promise.resolve(date === '2026-06-30' ? [task] : []),
    )
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockGridRect()

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 150, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    act(() => {
      fireEvent.pointerMove(window, { clientX: 350, clientY: 100 })
    })
    await waitFor(() => expect(screen.getByText('jeudi 2 juillet')).toBeInTheDocument(), { timeout: 3000 })

    await act(async () => {
      fireEvent.pointerUp(window, { clientX: 350, clientY: 100 })
    })
  })

  it("maintenir à gauche ne fait rien quand le planning affiche aujourd'hui (E1)", async () => {
    const scheduleV2Task = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderWithApp(
      <E40Planning />,
      makeAppContext({ scheduleV2Task, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockGridRect()

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 150, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    act(() => {
      fireEvent.pointerMove(window, { clientX: -50, clientY: 100 })
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })

    expect(screen.getByText('mardi 30 juin')).toBeInTheDocument()
    expect(screen.getByText('Retour impossible')).toBeInTheDocument()

    await act(async () => {
      fireEvent.pointerUp(window, { clientX: -50, clientY: 100 })
    })
    expect(scheduleV2Task).not.toHaveBeenCalled()
  })

  it('maintenir à gauche depuis un jour futur revient au jour précédent (E1)', async () => {
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-07-01', scheduled_start: '09:00', scheduled_end: '09:30' })
    const getPlannedTasksForDate = vi.fn().mockImplementation((date: string) =>
      Promise.resolve(date === '2026-07-01' ? [task] : []),
    )
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))
    await userEvent.click(screen.getByRole('button', { name: /jour suivant/i }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockGridRect()

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 150, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    act(() => {
      fireEvent.pointerMove(window, { clientX: -50, clientY: 100 })
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })

    expect(screen.getByText('mardi 30 juin')).toBeInTheDocument()

    await act(async () => {
      fireEvent.pointerUp(window, { clientX: -50, clientY: 100 })
    })
  })

  it('après une bascule de jour, relâcher sur un créneau du jour affiché pose la tâche à ce créneau ET l\'affiche dans le planning (E1)', async () => {
    let currentTask = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    const scheduleV2Task = vi.fn(async (_taskId: string, date: string, start: string, end: string) => {
      currentTask = { ...currentTask, scheduled_date: date, scheduled_start: start, scheduled_end: end }
    })
    const getPlannedTasksForDate = vi.fn((date: string) =>
      Promise.resolve(currentTask.scheduled_date === date ? [currentTask] : []),
    )
    renderWithApp(
      <E40Planning />,
      makeAppContext({ scheduleV2Task, getPlannedTasksForDate }),
    )
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockGridRect()

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 150, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    act(() => {
      fireEvent.pointerMove(window, { clientX: 350, clientY: 100 })
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })
    expect(screen.getByText('mercredi 1 juillet')).toBeInTheDocument()

    mockElementFromPoint(screen.getByRole('gridcell', { name: 'Créneau 14h00' }))
    await act(async () => {
      fireEvent.pointerUp(window, { clientX: 150, clientY: 300 })
    })

    await waitFor(() => expect(scheduleV2Task).toHaveBeenCalledWith('t1', '2026-07-01', '14:00', '14:30'))
    await waitFor(() => expect(screen.getByRole('gridcell', { name: 'Créneau 14h00 : Médecin' })).toBeInTheDocument())
  })

  it("affiche un overlay avec le titre de la tâche et l'aperçu de la cible pendant le glisser (E1)", async () => {
    const task = makeTaskV2({ id: 't1', title: 'Médecin', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    const getPlannedTasksForDate = vi.fn().mockImplementation((date: string) =>
      Promise.resolve(date === '2026-06-30' ? [task] : []),
    )
    renderWithApp(<E40Planning />, makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    mockGridRect()

    const cell = screen.getByRole('gridcell', { name: 'Créneau 9h00 : Médecin' })
    fireEvent.pointerDown(cell, { clientX: 150, clientY: 100 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
    })
    act(() => {
      fireEvent.pointerMove(window, { clientX: 350, clientY: 100 })
    })

    expect(screen.getAllByText('Médecin').length).toBeGreaterThan(1)
    expect(screen.getByText(/→ .*juillet/i)).toBeInTheDocument()

    await act(async () => {
      fireEvent.pointerUp(window, { clientX: 350, clientY: 100 })
    })
  })
})
