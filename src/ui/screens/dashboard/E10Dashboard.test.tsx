import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E10Dashboard } from './E10Dashboard'
import type { Task } from '@/domain/entities/task'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Appeler le médecin',
    status: 'today',
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

describe('E10Dashboard', () => {
  describe('état vide (D10A)', () => {
    it('affiche le message Que souhaitez-vous ajouter', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getAllByText('Que souhaitez-vous ajouter ?').length).toBeGreaterThan(0)
    })

    it('affiche le bouton Ajouter une tâche', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeDefined()
    })

    it('navigue vers task-create au clic sur Ajouter une tâche', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
      expect(ctx.goTo).toHaveBeenCalledWith('task-create')
    })
  })

  describe('avec tâches', () => {
    it('affiche l\'action immédiate (première tâche)', () => {
      const ctx = makeAppContext({
        todayTasks: [makeTask({ title: 'Appeler le médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getAllByText('Appeler le médecin').length).toBeGreaterThan(0)
    })

    it('affiche les tâches du jour', () => {
      const ctx = makeAppContext({
        todayTasks: [
          makeTask({ id: '1', title: 'Tâche A', position: 0 }),
          makeTask({ id: '2', title: 'Tâche B', position: 1 }),
        ],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getAllByText('Tâche A').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Tâche B').length).toBeGreaterThan(0)
    })

    it('affiche les cuillères si énergie renseignée', () => {
      const ctx = makeAppContext({
        todayEnergy: 7,
        todayTasks: [makeTask()],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByLabelText(/7 cuillères/i)).toBeDefined()
    })

    it('limite l\'affichage à 3 tâches', () => {
      const ctx = makeAppContext({
        todayTasks: [
          makeTask({ id: '1', title: 'T1', position: 0 }),
          makeTask({ id: '2', title: 'T2', position: 1 }),
          makeTask({ id: '3', title: 'T3', position: 2 }),
          makeTask({ id: '4', title: 'T4', position: 3 }),
        ],
      })
      const { container } = renderWithApp(<E10Dashboard />, ctx)
      expect(container.querySelectorAll('[aria-label="Tâches du jour"] > div > *').length).toBe(3)
    })
  })

  describe('mode surcharge (D10B)', () => {
    it('affiche le titre Mode surcharge', () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByRole('heading', { name: 'Mode surcharge' })).toBeDefined()
    })

    it('affiche le bouton pour désactiver la surcharge', () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByRole('button', { name: 'Désactiver le mode surcharge' })).toBeDefined()
    })

    it('appelle setOverloadMode(false) au clic', async () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Désactiver le mode surcharge' }))
      expect(ctx.setOverloadMode).toHaveBeenCalledWith(false)
    })

    it('affiche l\'action immédiate en mode surcharge', () => {
      const ctx = makeAppContext({
        overloadMode: true,
        todayTasks: [makeTask({ title: 'Tâche urgente' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Tâche urgente')).toBeDefined()
    })
  })
})
