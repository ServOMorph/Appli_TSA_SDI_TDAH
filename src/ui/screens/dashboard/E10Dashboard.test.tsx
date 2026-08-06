import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E10Dashboard } from './E10Dashboard'
import type { Task } from '@/domain/entities/task'
import { makeTask as baseTask, makeSubTask } from '@/test/factories'

function makeTaskV2(overrides: Partial<Task> = {}): Task {
  return baseTask({
    id: 'taskv2-1',
    title: 'Tâche planifiée',
    status: 'planned',
    essential: true,
    scheduled_date: '2026-07-01',
    scheduled_start: '09:00',
    scheduled_end: '09:30',
    ...overrides,
  })
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return baseTask({ title: 'Appeler le médecin', status: 'today', ...overrides })
}

describe('E10Dashboard', () => {
  describe('état vide (D10A)', () => {
    it('affiche le message Rien à faire aujourd\'hui', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByText('Rien à faire aujourd\'hui')).toBeDefined()
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
      expect(screen.getByLabelText(/sur 7 disponible/i)).toBeDefined()
    })

    it('conserve une tâche du jour terminée avec une teinte intensifiée (P3)', () => {
      const ctx = makeAppContext({
        todayTasks: [makeTask({ title: 'Tâche terminée', status: 'completed', completed_at: new Date().toISOString() })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Tâche terminée', { selector: 'button' })).toHaveStyle({
        color: '#fff',
        textDecoration: 'line-through',
      })
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
            makeSubTask({ id: 'st-1', status: 'completed' }),
            makeSubTask({ id: 'st-2', status: 'inbox' }),
            makeSubTask({ id: 'st-3', status: 'inbox' }),
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
      await userEvent.click(screen.getByLabelText(/sur 7 disponible/i))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
    })

    it('affiche énergie planifiée et énergie disponible côte à côte (E14, Q1)', () => {
      const ctx = makeAppContext({
        todayEnergy: 7,
        todayEnergyStatus: 'filled',
        todayPlannedTasks: [makeTaskV2({ energy_cost: 5 })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByLabelText("5 énergie planifiée sur 7 disponible aujourd'hui")).toBeDefined()
      expect(screen.getByText('5 / 7')).toBeDefined()
    })

    it('affiche "Énergie ignorée" si todayEnergyStatus skipped', () => {
      const ctx = makeAppContext({ todayEnergyStatus: 'skipped' })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Énergie ignorée')).toBeDefined()
    })
  })

  describe('activation surcharge (D10C)', () => {
    it('affiche le bouton Mode surcharge grisé en mode normal (E7)', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('button', { name: 'Détail du mode surcharge' }).textContent).toBe('Mode surcharge')
    })

    it('ouvre une modale explicative au clic sur le bouton en mode normal (E7)', async () => {
      renderWithApp(<E10Dashboard />)
      await userEvent.click(screen.getByRole('button', { name: 'Détail du mode surcharge' }))
      const modal = screen.getByRole('dialog', { name: 'Mode surcharge' })
      expect(modal).toHaveTextContent(/s'active automatiquement/)
      await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
      expect(screen.queryByRole('dialog', { name: 'Mode surcharge' })).toBeNull()
    })
  })

  describe('navigation top bar', () => {
    it('affiche le titre AuDHD', () => {
      renderWithApp(<E10Dashboard />)
      expect(screen.getByRole('heading', { name: 'AuDHD' })).toBeDefined()
    })

    it('navigue vers ressources au clic sur le document', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ressources' }))
      expect(ctx.goTo).toHaveBeenCalledWith('resources')
    })

    it('n\'affiche pas d\'icône Planning dans la TopBar', () => {
      renderWithApp(<E10Dashboard />)
      const header = screen.getByRole('banner')
      expect(within(header).queryByRole('button', { name: 'Planning' })).toBeNull()
    })
  })

  describe('accueil fusionné (E19, Q8)', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-07-01T09:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("replié : n'affiche pas le bandeau de dates", async () => {
      const ctx = makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) })
      renderWithApp(<E10Dashboard />, ctx)
      await screen.findByRole('heading', { name: 'Tâche du jour' })
      expect(screen.queryByRole('button', { name: /jour précédent/i })).toBeNull()
    })

    it('replié : affiche la tâche du jour et la zone widgets', async () => {
      const ctx = makeAppContext({ todayTasks: [makeTask({ title: 'Appeler le médecin' })] })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByRole('heading', { name: 'Tâche du jour' })).toBeDefined()
      expect(screen.getByRole('region', { name: 'Outils' })).toBeDefined()
    })

    it('replié : la poignée déplie le planning (E18)', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(await screen.findByRole('button', { name: 'Déplier le planning' }))
      expect(ctx.goTo).toHaveBeenCalledWith('planning')
    })

    it('déplié : affiche le bandeau de dates du planning et masque tâche du jour et widgets', async () => {
      const ctx = makeAppContext({
        route: { name: 'planning' },
        screen: 'planning',
        todayTasks: [makeTask({ title: 'Appeler le médecin' })],
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByRole('button', { name: /jour précédent/i })).toBeDefined()
      expect(screen.queryByRole('heading', { name: 'Tâche du jour' })).toBeNull()
      expect(screen.queryByRole('region', { name: 'Outils' })).toBeNull()
    })

    it('déplié : la poignée replie vers l\'accueil (E18)', async () => {
      const ctx = makeAppContext({ route: { name: 'planning' }, screen: 'planning' })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(await screen.findByRole('button', { name: 'Replier le planning' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })

    it('affiche une tâche planifiée du jour dans son créneau', async () => {
      const ctx = makeAppContext({
        getPlannedTasksForDate: async () => [makeTaskV2({ title: 'RDV médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByText('RDV médecin')).toBeDefined()
    })

    it('cocher une tâche planifiée la termine', async () => {
      const ctx = makeAppContext({
        getPlannedTasksForDate: async () => [makeTaskV2({ title: 'RDV médecin' })],
      })
      renderWithApp(<E10Dashboard />, ctx)
      const checkbox = await screen.findByRole('checkbox', { name: 'Terminer RDV médecin' })
      expect(checkbox).not.toBeChecked()
      await userEvent.click(checkbox)
      expect(ctx.completeTaskById).toHaveBeenCalledWith('taskv2-1')
    })
  })

  describe('zone widgets provisoire (E24)', () => {
    it('ouvre les outils depuis la zone widgets', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      const zone = screen.getByRole('region', { name: 'Outils' })
      await userEvent.click(within(zone).getByRole('button', { name: 'Outils' }))
      expect(ctx.goTo).toHaveBeenCalledWith('tools')
    })

    it('ouvre les listes depuis la zone widgets', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Listes' }))
      expect(ctx.goTo).toHaveBeenCalledWith('lists')
    })
  })

  describe('mode surcharge (D10B)', () => {
    it('affiche le bandeau Mode surcharge actif sans changer de page', () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByText('Mode surcharge actif', { selector: 'p' })).toBeDefined()
      expect(screen.getByRole('heading', { name: 'AuDHD' })).toBeDefined()
    })

    it('affiche la pastille de surcharge active et cliquable (E21)', () => {
      const ctx = makeAppContext({ overloadMode: true })
      renderWithApp(<E10Dashboard />, ctx)
      const btn = screen.getByRole('button', {
        name: 'Mode surcharge actif, ouvrir le centre récupération',
      }) as HTMLButtonElement
      expect(btn.disabled).toBe(false)
    })

    it('la pastille active navigue vers le centre de récupération (E21)', async () => {
      const ctx = makeAppContext({ overloadMode: true, todayEnergy: 4 })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(
        screen.getByRole('button', { name: 'Mode surcharge actif, ouvrir le centre récupération' }),
      )
      expect(ctx.goTo).toHaveBeenCalledWith('overload-recovery')
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
