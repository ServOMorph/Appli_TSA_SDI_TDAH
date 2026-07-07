import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E10Dashboard } from './E10Dashboard'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'
import type { TaskV2 } from '@/domain/entities/taskV2'

function makeTaskV2(overrides: Partial<TaskV2> = {}): TaskV2 {
  return {
    id: 'taskv2-1',
    title: 'Tâche planifiée',
    status: 'planned',
    essential: true,
    position: 0,
    scheduled_date: '2026-07-01',
    scheduled_start: '09:00',
    scheduled_end: '09:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  }
}

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
    it('affiche le message Rien à faire aujourd\'hui', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByText('Rien à faire aujourd\'hui')).toBeDefined()
    })

    it('affiche le bouton Ajouter une tâche', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeDefined()
    })

    it('navigue vers task-create-v2 au clic sur Ajouter une tâche', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
      expect(ctx.goTo).toHaveBeenCalledWith('task-create-v2')
    })
  })

  describe('avec tâches (Tâche du jour)', () => {
    it('affiche les tâches du jour sans limite de nombre (Q1)', () => {
      const ctx = makeAppContext({
        todayTasks: [
          makeTask({ id: '1', title: 'T1', position: 0 }),
          makeTask({ id: '2', title: 'T2', position: 1 }),
          makeTask({ id: '3', title: 'T3', position: 2 }),
          makeTask({ id: '4', title: 'T4', position: 3 }),
        ],
      })
      const { container } = renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('T4')).toBeDefined()
      expect(container.querySelectorAll('[aria-label="Tâche du jour"] > div > *').length).toBe(4)
    })

    it("affiche l'énergie si énergie renseignée", () => {
      const ctx = makeAppContext({
        todayEnergy: 7,
        todayEnergyStatus: 'filled',
        todayTasks: [makeTask()],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByLabelText(/7 énergie/i)).toBeDefined()
    })
  })

  describe('navigation vers E22', () => {
    it('clic sur une tâche dans la liste du jour ouvre E22', async () => {
      const ctx = makeAppContext({
        todayTasks: [makeTask({ id: 'task-1', title: 'Appeler le médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByText('Appeler le médecin'))
      expect(ctx.selectTask).toHaveBeenCalledWith('task-1')
      expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
    })
  })

  describe('sous-tâches', () => {
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

    it('clic sur badge énergie navigue vers energy-view', async () => {
      const ctx = makeAppContext({ todayEnergy: 7, todayEnergyStatus: 'filled' })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByLabelText(/7 énergie/i))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
    })

    it('affiche "Énergie ignorée" si todayEnergyStatus skipped', () => {
      const ctx = makeAppContext({ todayEnergyStatus: 'skipped' })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Énergie ignorée')).toBeDefined()
    })
  })

  describe('activation surcharge (D10C)', () => {
    it('affiche le bouton Mode surcharge désactivé et non cliquable en mode normal', () => {
      renderWithApp(<E10Dashboard />)
      const btn = screen.getByRole('button', { name: 'Mode surcharge désactivé' }) as HTMLButtonElement
      expect(btn.disabled).toBe(true)
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

    it('navigue vers inbox via la nav segmentée', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
      expect(ctx.goTo).toHaveBeenCalledWith('inbox')
    })

    it("n'affiche plus de segment Aujourd'hui (D4)", () => {
      renderWithApp(<E10Dashboard />)
      const group = screen.getByRole('group', { name: 'Listes de tâches' })
      expect(within(group).queryByRole('button', { name: "Aujourd'hui" })).toBeNull()
    })

    it('affiche une pastille sur Todo si des tâches sont en attente', () => {
      const ctx = makeAppContext({ inboxTasks: [makeTask({ id: 'i1' })] })
      renderWithApp(<E10Dashboard />, ctx)
      const todoButton = screen.getByRole('button', { name: 'Todo' })
      expect(todoButton.querySelector('[aria-hidden="true"]')).not.toBeNull()
    })

    it("n'affiche pas de pastille sur Todo si aucune tâche en attente", () => {
      const ctx = makeAppContext({ inboxTasks: [] })
      renderWithApp(<E10Dashboard />, ctx)
      const todoButton = screen.getByRole('button', { name: 'Todo' })
      expect(todoButton.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('navigue vers planning via la nav segmentée', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      const group = screen.getByRole('group', { name: 'Listes de tâches' })
      await userEvent.click(within(group).getByRole('button', { name: 'Planning' }))
      expect(ctx.goTo).toHaveBeenCalledWith('planning')
    })

    it('navigue vers lists via la nav segmentée', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Listes' }))
      expect(ctx.goTo).toHaveBeenCalledWith('lists')
    })

    it('n\'affiche pas d\'icône Planning dans la TopBar', () => {
      renderWithApp(<E10Dashboard />)
      const header = screen.getByRole('banner')
      expect(within(header).queryByRole('button', { name: 'Planning' })).toBeNull()
    })
  })

  describe('planning du jour (V2-9)', () => {
    it('affiche un message si rien n\'est planifié', async () => {
      renderWithApp(<E10Dashboard />)
      expect(await screen.findByText('Rien de planifié aujourd\'hui.')).toBeDefined()
    })

    it('affiche une tâche planifiée du jour', async () => {
      const ctx = makeAppContext({
        getPlannedTasksForDate: async () => [makeTaskV2({ title: 'RDV médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByText(/RDV médecin/)).toBeDefined()
    })

    it('affiche une tâche planifiée terminée sans bouton Terminer (P4a)', async () => {
      const ctx = makeAppContext({
        getPlannedTasksForDate: async () => [makeTaskV2({ title: 'RDV médecin', status: 'completed' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByText(/RDV médecin/)).toBeDefined()
      expect(screen.queryByLabelText(/Terminer RDV médecin/)).toBeNull()
    })

    it('affiche la section Planning du jour en mode surcharge (E6)', async () => {
      const ctx = makeAppContext({
        overloadMode: true,
        getPlannedTasksForDate: async () => [
          makeTaskV2({ id: 'a', title: 'Tâche planifiée', essential: false }),
        ],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByText(/Tâche planifiée/)).toBeDefined()
    })
  })

  describe('mode surcharge (D10B)', () => {
    it('affiche le bandeau Mode surcharge actif sans changer de page', () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Mode surcharge actif', { selector: 'p' })).toBeDefined()
      expect(screen.getByRole('heading', { name: 'Appli pour AuDHD' })).toBeDefined()
    })

    it('affiche le bouton Mode surcharge actif et cliquable', () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      const btn = screen.getByRole('button', { name: 'Détail du mode surcharge' }) as HTMLButtonElement
      expect(btn.disabled).toBe(false)
    })

    it('affiche une explication au clic sur le bouton actif', async () => {
      const ctx = makeAppContext({ overloadMode: true, todayEnergy: 4 })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Détail du mode surcharge' }))
      expect(screen.getByText(/disponible aujourd'hui/)).toBeDefined()
    })

    it('navigue vers le centre de récupération au clic', async () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Centre récupération' }))
      expect(ctx.goTo).toHaveBeenCalledWith('overload-recovery')
    })

    it('masque la section Tâche du jour en mode surcharge', () => {
      const ctx = makeAppContext({
        overloadMode: true,
        todayTasks: [makeTask({ title: 'Tâche urgente' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.queryByText('Tâche urgente')).toBeNull()
    })
  })
})
