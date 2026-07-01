import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E71RoutineDetail } from './E71RoutineDetail'
import type { Routine } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: 'r1',
    name: 'Routine matin',
    type: 'morning',
    duration_minutes: 90,
    scheduled_date: null,
    scheduled_start: null,
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }
}

function makeStep(overrides: Partial<RoutineStep> = {}): RoutineStep {
  return {
    id: 's1',
    routine_id: 'r1',
    title: 'Lever',
    position: 0,
    is_completed: false,
    created_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('E71RoutineDetail', () => {
  describe('état vide', () => {
    it('affiche le message vide quand aucune étape', async () => {
      const ctx = makeAppContext({ routines: [makeRoutine()], selectedRoutineId: 'r1' })
      renderWithApp(<E71RoutineDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByText("Cette routine n'a pas d'étape.")).toBeDefined()
      })
    })

    it('affiche le nom de la routine dans le titre', () => {
      const ctx = makeAppContext({ routines: [makeRoutine({ name: 'Routine matin' })], selectedRoutineId: 'r1' })
      renderWithApp(<E71RoutineDetail />, ctx)
      expect(screen.getByText('Routine matin')).toBeDefined()
    })
  })

  describe('avec des étapes', () => {
    it('affiche les titres des étapes', async () => {
      const steps = [makeStep({ id: 's1', title: 'Lever' }), makeStep({ id: 's2', title: 'Douche' })]
      const ctx = makeAppContext({
        routines: [makeRoutine()],
        selectedRoutineId: 'r1',
        getRoutineSteps: vi.fn().mockResolvedValue(steps),
      })
      renderWithApp(<E71RoutineDetail />, ctx)
      await waitFor(() => {
        expect(screen.getByText('Lever')).toBeDefined()
        expect(screen.getByText('Douche')).toBeDefined()
      })
    })

    it('coche une étape appelle toggleRoutineStep', async () => {
      const step = makeStep({ id: 's1', title: 'Lever' })
      const ctx = makeAppContext({
        routines: [makeRoutine()],
        selectedRoutineId: 'r1',
        getRoutineSteps: vi.fn().mockResolvedValue([step]),
      })
      renderWithApp(<E71RoutineDetail />, ctx)
      await waitFor(() => screen.getByLabelText('Étape Lever'))
      await userEvent.click(screen.getByLabelText('Étape Lever'))
      expect(ctx.toggleRoutineStep).toHaveBeenCalledWith(step)
    })

    it('clic supprimer appelle deleteRoutineStep', async () => {
      const step = makeStep({ id: 's1', title: 'Lever' })
      const ctx = makeAppContext({
        routines: [makeRoutine()],
        selectedRoutineId: 'r1',
        getRoutineSteps: vi.fn().mockResolvedValue([step]),
      })
      renderWithApp(<E71RoutineDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Supprimer Lever' }))
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer Lever' }))
      expect(ctx.deleteRoutineStep).toHaveBeenCalledWith('s1')
    })
  })

  describe('bouton retour', () => {
    it('clic sur ← navigue vers routines', async () => {
      const ctx = makeAppContext({ routines: [makeRoutine()], selectedRoutineId: 'r1' })
      renderWithApp(<E71RoutineDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('routines')
    })
  })

  describe('formulaire ajout étape', () => {
    it('clic Ajouter appelle addRoutineStep avec le titre saisi', async () => {
      const ctx = makeAppContext({ routines: [makeRoutine()], selectedRoutineId: 'r1' })
      renderWithApp(<E71RoutineDetail />, ctx)
      await waitFor(() => screen.getByRole('button', { name: 'Ajouter une étape' }))
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une étape' }))
      await userEvent.type(screen.getByLabelText('Étape'), 'Lever')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
      expect(ctx.addRoutineStep).toHaveBeenCalledWith('r1', 'Lever')
    })
  })

  describe('réservation de créneau', () => {
    it('affiche la date déjà planifiée', () => {
      const ctx = makeAppContext({
        routines: [makeRoutine({ scheduled_date: '2026-07-02', scheduled_start: '07:00' })],
        selectedRoutineId: 'r1',
      })
      renderWithApp(<E71RoutineDetail />, ctx)
      expect(screen.getByText('Prévue le 2026-07-02 à 07:00')).toBeDefined()
    })

    it('clic sur "Placer dans le planning" appelle scheduleRoutine', async () => {
      const ctx = makeAppContext({ routines: [makeRoutine()], selectedRoutineId: 'r1' })
      renderWithApp(<E71RoutineDetail />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Placer dans le planning' }))
      expect(ctx.scheduleRoutine).toHaveBeenCalledWith('r1', expect.any(String), expect.stringMatching(/^\d{2}:00$/))
    })
  })
})
