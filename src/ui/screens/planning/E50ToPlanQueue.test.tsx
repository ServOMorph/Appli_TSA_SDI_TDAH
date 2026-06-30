import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E50ToPlanQueue } from './E50ToPlanQueue'
import type { TaskV2 } from '@/domain/entities/taskV2'

function makeTaskV2(overrides: Partial<TaskV2> = {}): TaskV2 {
  return {
    id: 'tv2-1',
    title: 'Préparer réunion',
    status: 'to_plan',
    essential: false,
    position: 0,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

describe('E50ToPlanQueue', () => {
  describe('file vide', () => {
    it('affiche le message de fin quand aucune tâche', () => {
      renderWithApp(<E50ToPlanQueue />)
      expect(screen.getByText('Toutes les tâches ont été planifiées.')).toBeDefined()
    })

    it('affiche le bouton retour tableau de bord quand file vide', () => {
      renderWithApp(<E50ToPlanQueue />)
      expect(screen.getByRole('button', { name: 'Retour au tableau de bord' })).toBeDefined()
    })

    it('navigue vers dashboard depuis la page de fin', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E50ToPlanQueue />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour au tableau de bord' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })
  })

  describe('file avec tâches', () => {
    it('affiche le titre de la première tâche', () => {
      const ctx = makeAppContext({
        toPlanTasks: [makeTaskV2({ title: 'Préparer réunion' })],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)
      expect(screen.getByLabelText('Tâche à planifier')).toBeDefined()
      expect(screen.getByText('Préparer réunion')).toBeDefined()
    })

    it('affiche les champs date, début et fin', () => {
      const ctx = makeAppContext({
        toPlanTasks: [makeTaskV2()],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)
      expect(screen.getByLabelText('Date')).toBeDefined()
      expect(screen.getByLabelText('Début')).toBeDefined()
      expect(screen.getByLabelText('Fin')).toBeDefined()
    })

    it('affiche le bouton Planifier', () => {
      const ctx = makeAppContext({
        toPlanTasks: [makeTaskV2()],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)
      expect(screen.getByRole('button', { name: 'Planifier' })).toBeDefined()
    })

    it('affiche le bouton Arrêter', () => {
      const ctx = makeAppContext({
        toPlanTasks: [makeTaskV2()],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)
      expect(screen.getByRole('button', { name: 'Arrêter' })).toBeDefined()
    })

    it('clic sur Arrêter navigue vers dashboard', async () => {
      const ctx = makeAppContext({
        toPlanTasks: [makeTaskV2()],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Arrêter' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })

    it('clic sur ← navigue vers dashboard', async () => {
      const ctx = makeAppContext({
        toPlanTasks: [makeTaskV2()],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })

    it('clic sur Planifier appelle scheduleV2Task avec les valeurs saisies', async () => {
      const task = makeTaskV2({ id: 'tv2-1' })
      const ctx = makeAppContext({
        toPlanTasks: [task],
      })
      renderWithApp(<E50ToPlanQueue />, ctx)

      const dateInput = screen.getByLabelText('Date') as HTMLInputElement
      const startInput = screen.getByLabelText('Début') as HTMLInputElement
      const endInput = screen.getByLabelText('Fin') as HTMLInputElement

      await userEvent.clear(dateInput)
      await userEvent.type(dateInput, '2026-07-01')
      await userEvent.clear(startInput)
      await userEvent.type(startInput, '10:00')
      await userEvent.clear(endInput)
      await userEvent.type(endInput, '10:30')

      await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))

      expect(ctx.scheduleV2Task).toHaveBeenCalledWith('tv2-1', expect.any(String), expect.any(String), expect.any(String))
    })
  })

  describe('enchaînement séquentiel', () => {
    it('passe à la tâche suivante après Planifier', async () => {
      const tasks = [
        makeTaskV2({ id: 'tv2-1', title: 'Tâche A' }),
        makeTaskV2({ id: 'tv2-2', title: 'Tâche B' }),
      ]
      const ctx = makeAppContext({ toPlanTasks: tasks })
      renderWithApp(<E50ToPlanQueue />, ctx)

      expect(screen.getByText('Tâche A')).toBeDefined()

      await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))

      expect(ctx.scheduleV2Task).toHaveBeenCalledWith('tv2-1', expect.any(String), expect.any(String), expect.any(String))
    })

    it('affiche la page de fin après la dernière tâche planifiée', async () => {
      const tasks = [makeTaskV2({ id: 'tv2-1', title: 'Tâche unique' })]
      const ctx = makeAppContext({ toPlanTasks: tasks })
      renderWithApp(<E50ToPlanQueue />, ctx)

      await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))

      expect(screen.getByText('Toutes les tâches ont été planifiées.')).toBeDefined()
    })
  })
})
