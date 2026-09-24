import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { Routine } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'
import type { Tool } from '@/domain/entities/tool'
import { E79RoutineDetail } from './E79RoutineDetail'

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

function makeSchedule(overrides: Partial<RoutineSchedule> = {}): RoutineSchedule {
  return {
    id: 'schedule-1',
    routine_id: 'routine-1',
    weekday: 1,
    time: '08:00',
    steps_overridden: false,
    created_at: '2026-09-23T00:00:00.000Z',
    updated_at: '2026-09-23T00:00:00.000Z',
    ...overrides,
  }
}

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: 'tool-routine-1',
    type: 'routine',
    folder_id: null,
    list_id: null,
    routine_id: 'routine-1',
    position: 0,
    color: null,
    created_at: '2026-09-23T00:00:00.000Z',
    updated_at: '2026-09-23T00:00:00.000Z',
    ...overrides,
  }
}

function renderScreen(overrides: Parameters<typeof makeAppContext>[0] = {}) {
  return makeAppContext({
    route: { name: 'routine-detail' },
    selectedRoutineId: 'routine-1',
    ...overrides,
  })
}

// 2026-06-30 est un mardi ; sa semaine va du lundi 2026-06-29 au dimanche 2026-07-05.
describe('E79RoutineDetail', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche un message si la routine n’existe plus', () => {
    renderWithApp(<E79RoutineDetail />, renderScreen({ routines: [] }))
    expect(screen.getByText('Cette routine n\'existe plus.')).toBeDefined()
  })

  it('le retour utilise back("tools")', async () => {
    const ctx = renderScreen({ routines: [makeRoutine()] })
    renderWithApp(<E79RoutineDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('tools')
  })

  it('affiche les étapes triées avec leur durée', async () => {
    renderWithApp(<E79RoutineDetail />, renderScreen({
      routines: [makeRoutine()],
      getRoutineSteps: vi.fn().mockResolvedValue([makeStep()]),
    }))
    expect(await screen.findByText(/Se brosser les dents/)).toBeDefined()
  })

  it('renomme la routine', async () => {
    const renameRoutine = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E79RoutineDetail />, renderScreen({ routines: [makeRoutine()], renameRoutine }))
    await userEvent.click(screen.getByRole('button', { name: 'Renommer la routine' }))
    const dialog = screen.getByRole('dialog', { name: 'Renommer la routine' })
    const input = within(dialog).getByLabelText('Nouveau nom de la routine')
    await userEvent.clear(input)
    await userEvent.type(input, 'Routine du soir')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(renameRoutine).toHaveBeenCalledWith('routine-1', 'Routine du soir')
  })

  it('change la couleur de la routine', () => {
    const updateRoutineColor = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E79RoutineDetail />, renderScreen({ routines: [makeRoutine()], updateRoutineColor }))
    const input = screen.getByLabelText('Choisir une couleur') as HTMLInputElement
    fireEvent.change(input, { target: { value: '#ff8800' } })
    expect(updateRoutineColor).toHaveBeenCalledWith('routine-1', '#ff8800')
  })

  it('ajoute une étape avec un titre et une durée', async () => {
    const addRoutineStep = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E79RoutineDetail />, renderScreen({ routines: [makeRoutine()], addRoutineStep }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une étape' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajouter une étape' })
    await userEvent.type(within(dialog).getByLabelText('Titre'), 'Petit-déjeuner')
    await userEvent.type(within(dialog).getByLabelText('Durée (minutes, optionnel)'), '15')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Ajouter' }))
    expect(addRoutineStep).toHaveBeenCalledWith('routine-1', 'Petit-déjeuner', 15)
  })

  it('modifie une étape existante', async () => {
    const updateRoutineStep = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E79RoutineDetail />, renderScreen({
      routines: [makeRoutine()],
      getRoutineSteps: vi.fn().mockResolvedValue([makeStep()]),
      updateRoutineStep,
    }))
    const editButton = await screen.findByRole('button', { name: /Modifier Se brosser les dents/ })
    await userEvent.click(editButton)
    const dialog = screen.getByRole('dialog', { name: 'Modifier l\'étape' })
    const input = within(dialog).getByLabelText('Titre')
    await userEvent.clear(input)
    await userEvent.type(input, 'Se laver les mains')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }))
    expect(updateRoutineStep).toHaveBeenCalledWith('step-1', 'Se laver les mains', 5)
  })

  it('supprime une étape', async () => {
    const deleteRoutineStep = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E79RoutineDetail />, renderScreen({
      routines: [makeRoutine()],
      getRoutineSteps: vi.fn().mockResolvedValue([makeStep()]),
      deleteRoutineStep,
    }))
    const deleteButton = await screen.findByRole('button', { name: /Supprimer Se brosser les dents/ })
    await userEvent.click(deleteButton)
    expect(deleteRoutineStep).toHaveBeenCalledWith('step-1')
  })

  it('rend les étapes déplaçables par glisser-déposer, sans flèches monter/descendre', async () => {
    renderWithApp(<E79RoutineDetail />, renderScreen({
      routines: [makeRoutine()],
      getRoutineSteps: vi.fn().mockResolvedValue([
        makeStep({ id: 'step-1', title: 'Premier' }),
        makeStep({ id: 'step-2', title: 'Second', position: 1 }),
      ]),
    }))
    await screen.findByText('Premier')
    expect(document.querySelectorAll('li[aria-roledescription="sortable"]')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Descendre Premier' })).not.toBeInTheDocument()
  })

  it('planifie un jour via le pavé numérique', async () => {
    const setRoutineDaySchedule = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithApp(<E79RoutineDetail />, renderScreen({ routines: [makeRoutine()], setRoutineDaySchedule }))

    await user.click(screen.getByLabelText(/^lun 29/))
    const dialog = screen.getByRole('dialog', { name: 'Planifier lundi' })
    await user.click(within(dialog).getByRole('button', { name: '0' }))
    await user.click(within(dialog).getByRole('button', { name: '8' }))
    await user.click(within(dialog).getByRole('button', { name: '0' }))
    await user.click(within(dialog).getByRole('button', { name: '0' }))

    expect(setRoutineDaySchedule).toHaveBeenCalledWith('routine-1', 1, '08:00')
  })

  it('retire un jour déjà planifié', async () => {
    const removeRoutineDaySchedule = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithApp(<E79RoutineDetail />, renderScreen({
      routines: [makeRoutine()],
      getRoutineSchedules: vi.fn().mockResolvedValue([makeSchedule()]),
      removeRoutineDaySchedule,
    }))

    const monday = await screen.findByLabelText(/^lun 29.*08:00/)
    await user.click(monday)
    const dialog = screen.getByRole('dialog', { name: 'Planifier lundi' })
    expect(within(dialog).getByText('Horaire actuel : 08:00')).toBeDefined()
    await user.click(within(dialog).getByRole('button', { name: 'Retirer lundi' }))

    expect(removeRoutineDaySchedule).toHaveBeenCalledWith('schedule-1')
  })

  it('supprime la routine via l’outil qui la référence', async () => {
    const deleteTool = vi.fn().mockResolvedValue(undefined)
    const ctx = renderScreen({ routines: [makeRoutine()], tools: [makeTool()], deleteTool })
    renderWithApp(<E79RoutineDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer la routine' }))
    const dialog = screen.getByRole('dialog', { name: 'Supprimer la routine' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))
    expect(deleteTool).toHaveBeenCalledWith('tool-routine-1')
    expect(ctx.back).toHaveBeenCalledWith('tools')
  })
})
