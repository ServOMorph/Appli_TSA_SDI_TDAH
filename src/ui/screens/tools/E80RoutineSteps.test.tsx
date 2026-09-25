import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { makeSubTask } from '@/test/factories'
import type { Routine } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'
import { E80RoutineSteps } from './E80RoutineSteps'

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: 'routine-1',
    name: 'Routine du matin',
    color: null,
    created_at: '2026-09-23T00:00:00.000Z',
    updated_at: '2026-09-23T00:00:00.000Z',
    ...overrides,
  }
}

function makeStep(overrides: Partial<RoutineStep> = {}): RoutineStep {
  return {
    id: 'step-1',
    routine_id: 'routine-1',
    title: 'Se brosser les dents',
    position: 0,
    duration_minutes: 5,
    weekday: null,
    created_at: '2026-09-23T00:00:00.000Z',
    updated_at: '2026-09-23T00:00:00.000Z',
    ...overrides,
  }
}

function stepsResult(steps: RoutineStep[], overridden = false) {
  return { steps, overridden }
}

function makeSchedule(overrides: Partial<RoutineSchedule> = {}): RoutineSchedule {
  return {
    id: 'schedule-1',
    routine_id: 'routine-1',
    weekday: 3,
    time: '07:15',
    steps_overridden: false,
    created_at: '2026-09-23T00:00:00.000Z',
    updated_at: '2026-09-23T00:00:00.000Z',
    ...overrides,
  }
}

function renderScreen(ctx = makeAppContext()) {
  return renderWithApp(<E80RoutineSteps />, ctx)
}

const ROUTE = { name: 'routine-steps' as const, date: '2026-09-23' }

describe('E80RoutineSteps', () => {
  it('affiche le nom de la routine et la date', async () => {
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([])),
      }),
    )
    expect(await screen.findByRole('heading', { name: 'Routine du matin' })).toBeInTheDocument()
    expect(screen.getByText('Mercredi 23 septembre')).toBeInTheDocument()
  })

  it("affiche un message quand la routine n'a pas encore d'étape", async () => {
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([])),
      }),
    )
    expect(await screen.findByText("Cette routine n'a pas encore d'étape.")).toBeInTheDocument()
  })

  it('affiche les étapes dans l’ordre et coche celles déjà terminées ce jour-là', async () => {
    const steps = [
      makeStep({ id: 'step-1', title: 'Se brosser les dents', position: 0 }),
      makeStep({ id: 'step-2', title: 'Se coiffer', position: 1, duration_minutes: null }),
    ]
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult(steps)),
        getRoutineStepCompletionsForDate: vi.fn().mockResolvedValue(new Set(['step-1'])),
      }),
    )
    const first = await screen.findByRole('checkbox', { name: 'Terminer Se brosser les dents' })
    const second = await screen.findByRole('checkbox', { name: 'Terminer Se coiffer' })
    expect(first).toBeChecked()
    expect(second).not.toBeChecked()
  })

  it('cocher une étape appelle toggleRoutineStepCompletion avec la routine, l’étape et la date', async () => {
    const toggleRoutineStepCompletion = vi.fn().mockResolvedValue(undefined)
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([makeStep()])),
        toggleRoutineStepCompletion,
      }),
    )
    const checkbox = await screen.findByRole('checkbox', { name: 'Terminer Se brosser les dents' })
    await userEvent.click(checkbox)
    expect(toggleRoutineStepCompletion).toHaveBeenCalledWith('routine-1', 'step-1', '2026-09-23')
  })

  it('déplier une étape affiche ses sous-tâches, cocher en appelle toggleSubTask', async () => {
    const toggleSubTask = vi.fn().mockResolvedValue(undefined)
    const subTask = makeSubTask({ id: 'sub-1', parent_id: 'step-1', title: 'Mouiller la brosse', status: 'inbox' })
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([makeStep()])),
        getSubTasks: vi.fn().mockResolvedValue([subTask]),
        toggleSubTask,
      }),
    )
    await userEvent.click(await screen.findByLabelText('0 sur 1 sous-tâches, déplier'))
    const subCheckbox = await screen.findByRole('checkbox', { name: 'Cocher Mouiller la brosse' })
    await userEvent.click(subCheckbox)
    expect(toggleSubTask).toHaveBeenCalledWith(subTask)
  })

  it('ajouter une sous-tâche depuis une étape dépliée appelle addSubTask', async () => {
    const addSubTask = vi.fn().mockResolvedValue(undefined)
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([makeStep()])),
        addSubTask,
      }),
    )
    await userEvent.click(await screen.findByLabelText('0 sur 0 sous-tâches, déplier'))
    await userEvent.click(await screen.findByLabelText('Ajouter une sous-tâche à Se brosser les dents'))
    await userEvent.type(screen.getByLabelText('Nom de la sous-tâche'), 'Mouiller la brosse')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    await waitFor(() => expect(addSubTask).toHaveBeenCalledWith('step-1', 'Mouiller la brosse'))
  })

  it('le bouton retour ramène au tableau de bord', async () => {
    const back = vi.fn()
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([])),
        back,
      }),
    )
    await userEvent.click(await screen.findByLabelText('Retour'))
    expect(back).toHaveBeenCalledWith('dashboard')
  })

  it("affiche un état de secours si la routine n'existe plus", async () => {
    renderScreen(makeAppContext({ route: ROUTE, routines: [], selectedRoutineId: null }))
    expect(await screen.findByText("Cette routine n'existe plus.")).toBeInTheDocument()
  })

  it("n'affiche pas le bouton « Modifier ce jour » si la routine n'est pas planifiée ce jour-là", async () => {
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([makeStep()])),
        getRoutineSchedules: vi.fn().mockResolvedValue([]),
      }),
    )
    await screen.findByRole('heading', { name: 'Routine du matin' })
    expect(screen.queryByLabelText('Modifier les étapes de ce jour')).not.toBeInTheDocument()
  })

  it('détache le jour au premier clic sur « Modifier ce jour » puis permet d’ajouter une étape propre à ce jour', async () => {
    const detachRoutineDay = vi.fn().mockResolvedValue(undefined)
    const addRoutineStep = vi.fn().mockResolvedValue(undefined)
    const getRoutineStepsForDate = vi
      .fn()
      .mockResolvedValueOnce(stepsResult([makeStep()], false))
      .mockResolvedValue(stepsResult([makeStep({ id: 'step-1-copie' })], true))
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate,
        getRoutineSchedules: vi.fn().mockResolvedValue([makeSchedule()]),
        detachRoutineDay,
        addRoutineStep,
      }),
    )
    await userEvent.click(await screen.findByLabelText('Modifier les étapes de ce jour'))
    expect(detachRoutineDay).toHaveBeenCalledWith('routine-1', 3, '2026-09-23')

    await userEvent.click(await screen.findByRole('button', { name: 'Ajouter une étape' }))
    await userEvent.type(screen.getByLabelText('Titre'), 'Pyjama')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    await waitFor(() => expect(addRoutineStep).toHaveBeenCalledWith('routine-1', 'Pyjama', null, 3))
  })

  it('n’appelle pas detachRoutineDay si le jour est déjà détaché en entrant en édition', async () => {
    const detachRoutineDay = vi.fn().mockResolvedValue(undefined)
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([makeStep()], true)),
        getRoutineSchedules: vi.fn().mockResolvedValue([makeSchedule({ steps_overridden: true })]),
        detachRoutineDay,
      }),
    )
    await userEvent.click(await screen.findByLabelText('Modifier les étapes de ce jour'))
    expect(await screen.findByLabelText('Revenir à la version commune')).toBeInTheDocument()
    expect(detachRoutineDay).not.toHaveBeenCalled()
  })

  it('« Revenir à la version commune » appelle reattachRoutineDay', async () => {
    const reattachRoutineDay = vi.fn().mockResolvedValue(undefined)
    renderScreen(
      makeAppContext({
        route: ROUTE,
        routines: [makeRoutine()],
        selectedRoutineId: 'routine-1',
        getRoutineStepsForDate: vi.fn().mockResolvedValue(stepsResult([makeStep()], true)),
        getRoutineSchedules: vi.fn().mockResolvedValue([makeSchedule({ steps_overridden: true })]),
        reattachRoutineDay,
      }),
    )
    await userEvent.click(await screen.findByLabelText('Modifier les étapes de ce jour'))
    await userEvent.click(await screen.findByLabelText('Revenir à la version commune'))
    expect(reattachRoutineDay).toHaveBeenCalledWith('routine-1', 3)
  })
})
