import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E10Dashboard } from './E10Dashboard'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'

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

function makeSubTask(overrides: Partial<SubTask> = {}): SubTask {
  return {
    id: 'st-1',
    task_id: 'task-1',
    title: 'Ouvrir le template',
    is_completed: false,
    position: 0,
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
    it("affiche l'action immédiate (première tâche)", () => {
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

    it('affiche le souffle si énergie renseignée', () => {
      const ctx = makeAppContext({
        todayEnergy: 7,
        todayEnergyStatus: 'filled',
        todayTasks: [makeTask()],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByLabelText(/7 souffle/i)).toBeDefined()
    })

    it("limite l'affichage à 3 tâches", () => {
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

  describe('navigation vers E22', () => {
    it('clic sur une tâche dans la liste du jour ouvre E22', async () => {
      const ctx = makeAppContext({
        todayTasks: [makeTask({ id: 'task-1', title: 'Appeler le médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      const buttons = screen.getAllByRole('button', { name: 'Appeler le médecin' })
      await userEvent.click(buttons[0])
      expect(ctx.selectTask).toHaveBeenCalledWith('task-1')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })

    it("clic sur l'action immédiate ouvre E22", async () => {
      const ctx = makeAppContext({
        todayTasks: [makeTask({ id: 'task-1', title: 'Appeler le médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      const buttons = screen.getAllByRole('button', { name: /Appeler le médecin/i })
      await userEvent.click(buttons[0])
      expect(ctx.selectTask).toHaveBeenCalledWith('task-1')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })
  })

  describe('sous-tâches (Prop 1 + Prop 2)', () => {
    it("affiche la prochaine sous-tâche dans l'action immédiate", () => {
      const task = makeTask({ id: 'task-1', title: 'Rédiger rapport' })
      const ctx = makeAppContext({
        todayTasks: [task],
        todaySubTasksMap: {
          'task-1': [
            makeSubTask({
              id: 'st-1',
              title: 'Ouvrir le template',
              position: 0,
              is_completed: false,
            }),
          ],
        },
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Prochaine étape : Ouvrir le template')).toBeDefined()
    })

    it("n'affiche pas de sous-tâche si toutes complétées", () => {
      const task = makeTask({ id: 'task-1' })
      const ctx = makeAppContext({
        todayTasks: [task],
        todaySubTasksMap: {
          'task-1': [makeSubTask({ is_completed: true })],
        },
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.queryByText(/Prochaine étape/)).toBeNull()
    })

    it('affiche le badge de progression dans la liste du jour', () => {
      const task = makeTask({ id: 'task-1', title: 'Rédiger rapport' })
      const ctx = makeAppContext({
        todayTasks: [task],
        todaySubTasksMap: {
          'task-1': [
            makeSubTask({ id: 'st-1', is_completed: true }),
            makeSubTask({ id: 'st-2', is_completed: false }),
            makeSubTask({ id: 'st-3', is_completed: false }),
          ],
        },
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByLabelText('1 sur 3 étapes')).toBeDefined()
    })

    it("n'affiche pas de badge si la tâche n'a pas de sous-tâches", () => {
      const task = makeTask({ id: 'task-1' })
      const ctx = makeAppContext({
        todayTasks: [task],
        todaySubTasksMap: {},
      })
      const { container } = renderWithApp(<E10Dashboard />, ctx)
      expect(container.querySelector('[aria-label$="étapes"]')).toBeNull()
    })
  })

  describe('énergie (intégration)', () => {
    it('affiche la pill Mon énergie si todayEnergyStatus null', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('button', { name: 'Renseigner mon énergie' })).toBeDefined()
    })

    it('clic sur la pill énergie navigue vers energy-view', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Renseigner mon énergie' }))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
    })

    it('clic sur badge souffle navigue vers energy-view', async () => {
      const ctx = makeAppContext({ todayEnergy: 7, todayEnergyStatus: 'filled' })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByLabelText(/7 souffle/i))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
    })

    it('affiche "Énergie ignorée" si todayEnergyStatus skipped', () => {
      const ctx = makeAppContext({ todayEnergyStatus: 'skipped' })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Énergie ignorée')).toBeDefined()
    })
  })

  describe('activation surcharge (D10C)', () => {
    it('affiche la pill Mode surcharge en mode normal', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('button', { name: 'Activer le mode surcharge' })).toBeDefined()
    })

    it('appelle setOverloadMode(true) au clic', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Activer le mode surcharge' }))
      expect(ctx.setOverloadMode).toHaveBeenCalledWith(true)
    })
  })

  describe('navigation top bar', () => {
    it('affiche le titre Appli pour AuDHD', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeDefined()
    })

    it('navigue vers settings au clic sur la roue', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Paramètres' }))
      expect(ctx.goTo).toHaveBeenCalledWith('settings')
    })

    it('navigue vers ressources au clic sur le document', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ressources' }))
      expect(ctx.goTo).toHaveBeenCalledWith('resources')
    })

    it('navigue vers inbox / today / later via la nav segmentée', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Inbox' }))
      expect(ctx.goTo).toHaveBeenCalledWith('inbox')
      await userEvent.click(screen.getByRole('button', { name: "Aujourd'hui" }))
      expect(ctx.goTo).toHaveBeenCalledWith('today')
      await userEvent.click(screen.getByRole('button', { name: 'Plus tard' }))
      expect(ctx.goTo).toHaveBeenCalledWith('later')
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

    it("affiche l'action immédiate en mode surcharge", () => {
      const ctx = makeAppContext({
        overloadMode: true,
        todayTasks: [makeTask({ title: 'Tâche urgente' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Tâche urgente')).toBeDefined()
    })
  })
})
