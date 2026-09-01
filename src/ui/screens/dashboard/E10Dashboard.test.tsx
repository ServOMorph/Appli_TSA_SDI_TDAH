import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E10Dashboard, PLANNING_HEIGHT_PX } from './E10Dashboard'
import type { Task } from '@/domain/entities/task'
import { makeTask as baseTask } from '@/test/factories'
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'

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

async function renderDashboard(ctx = makeAppContext()) {
  renderWithApp(<E10Dashboard />, ctx)
  await screen.findByText('Rien de planifié ce jour-là.')
}

describe('E10Dashboard', () => {
  describe('énergie (intégration)', () => {
    it('affiche la pill Mon énergie si todayEnergyStatus null', async () => {
      await renderDashboard()
      expect(screen.getByRole('button', { name: 'Renseigner mon énergie' })).toBeDefined()
    })

    it('clic sur la pill énergie navigue vers la modification de l’énergie', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Renseigner mon énergie' }))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-checkin')
    })

    it('clic sur badge énergie navigue vers la modification de l’énergie', async () => {
      const ctx = makeAppContext({ todayEnergy: 7, todayEnergyStatus: 'filled' })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByLabelText(/sur 7 disponible/i))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-checkin')
    })

    it('affiche énergie planifiée et énergie disponible côte à côte (E14, Q1)', async () => {
      const ctx = makeAppContext({
        todayEnergy: 7,
        todayEnergyStatus: 'filled',
        todayPlannedTasks: [makeTaskV2({ energy_cost: 5 })],
      })
      await renderDashboard(ctx)
      expect(screen.getByLabelText("5 énergie planifiée sur 7 disponible aujourd'hui")).toBeDefined()
      expect(screen.getByText('5 / 7')).toBeDefined()
    })

    it('affiche "Énergie ignorée" si todayEnergyStatus skipped', async () => {
      const ctx = makeAppContext({ todayEnergyStatus: 'skipped' })
      await renderDashboard(ctx)
      expect(screen.getByText('Énergie ignorée')).toBeDefined()
    })
  })

  describe('activation surcharge (D10C)', () => {
    it('affiche le bouton Mode surcharge grisé en mode normal (E7)', async () => {
      await renderDashboard()
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
    it('affiche le titre AuDHD', async () => {
      await renderDashboard()
      expect(screen.getByRole('heading', { name: 'AuDHD' })).toBeDefined()
    })

    it('navigue vers ressources au clic sur le document', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Ressources' }))
      expect(ctx.goTo).toHaveBeenCalledWith('resources')
    })

    it('navigue vers les tests à faire et affiche une pastille si un test est nouveau', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      expect(screen.getByLabelText('Nouveaux tests disponibles')).toBeDefined()
      await userEvent.click(screen.getByRole('button', { name: 'Tests à faire, nouveaux tests disponibles' }))
      expect(ctx.goTo).toHaveBeenCalledWith('manual-tests')
    })

    it('masque la pastille des tests quand tous les tests ont déjà été vus', async () => {
      const ctx = makeAppContext({
        manualTestResults: manualTestsCatalog.map((test) => ({
          id: `result-${test.id}`,
          test_id: test.id,
          test_revision: test.revision,
          status: 'ok' as const,
          comment: null,
          created_at: '2026-08-14T10:00:00.000Z',
        })),
      })
      await renderDashboard(ctx)
      expect(screen.queryByLabelText('Nouveaux tests disponibles')).toBeNull()
      expect(screen.getByRole('button', { name: 'Tests à faire' })).toBeDefined()
    })

    it('masque la pastille dès qu’un test a un résultat, même « Non validé »', async () => {
      const ctx = makeAppContext({
        manualTestResults: manualTestsCatalog.map((test) => ({
          id: `result-${test.id}`,
          test_id: test.id,
          test_revision: test.revision,
          status: 'nok' as const,
          comment: 'Retour de test',
          created_at: '2026-08-14T10:00:00.000Z',
        })),
      })
      await renderDashboard(ctx)
      expect(screen.queryByLabelText('Nouveaux tests disponibles')).toBeNull()
    })

    it('affiche la pastille quand un test révisé n’a été validé que sur une ancienne révision', async () => {
      const revised = manualTestsCatalog.find((test) => test.revision !== undefined)!
      const ctx = makeAppContext({
        manualTestResults: manualTestsCatalog.map((test) => ({
          id: `result-${test.id}`,
          test_id: test.id,
          test_revision: test.id === revised.id ? (revised.revision ?? 0) - 1 : test.revision,
          status: 'ok' as const,
          comment: null,
          created_at: '2026-08-14T10:00:00.000Z',
        })),
      })
      await renderDashboard(ctx)
      expect(screen.getByLabelText('Nouveaux tests disponibles')).toBeDefined()
    })

    it('n\'affiche pas d\'icône Planning dans la TopBar', async () => {
      await renderDashboard()
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

    it('affiche le bandeau de dates du planning et la zone widgets', async () => {
      const ctx = makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) })
      renderWithApp(<E10Dashboard />, ctx)
      expect(await screen.findByRole('region', { name: 'Planning du jour' })).not.toBeNull()
      expect(screen.getByRole('region', { name: 'Outils' })).toBeDefined()
    })

    it('n’expose plus de poignée pour plier ou déplier le planning (#20)', async () => {
      renderWithApp(<E10Dashboard />, makeAppContext())
      await screen.findByRole('region', { name: 'Planning du jour' })
      expect(screen.queryByRole('button', { name: 'Déplier le planning' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Replier le planning' })).toBeNull()
    })

    it('donne au planning une hauteur fixe, quelle que soit la route (#20)', async () => {
      for (const ctx of [makeAppContext(), makeAppContext({ route: { name: 'planning' }, screen: 'planning' })]) {
        const { unmount } = renderWithApp(<E10Dashboard />, ctx)
        const board = await screen.findByRole('region', { name: 'Planning du jour' })
        const container = board.parentElement as HTMLElement
        expect(container.style.height).toBe(`${PLANNING_HEIGHT_PX}px`)
        unmount()
      }
    })

    it('fait défiler la liste des tâches à l’intérieur du planning (#20)', async () => {
      const ctx = makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) })
      renderWithApp(<E10Dashboard />, ctx)
      const board = await screen.findByRole('region', { name: 'Planning du jour' })
      const list = screen.getByText('Rien de planifié ce jour-là.').parentElement as HTMLElement
      expect(list.style.overflowY).toBe('auto')
      expect((board.parentElement as HTMLElement).style.overflow).toBe('hidden')
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

  describe('zone widgets (E24)', () => {
    it('le "+" ouvre le sélecteur de création d\'outil', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      const zone = screen.getByRole('region', { name: 'Outils' })
      await userEvent.click(within(zone).getByRole('button', { name: 'Ajouter un outil' }))
      expect(screen.getByRole('dialog', { name: 'Ajouter un outil' })).toBeDefined()
    })

    it('affiche un outil liste racine avec le nom de la liste et navigue vers list-detail au clic', async () => {
      const ctx = makeAppContext({
        lists: [{ id: 'l1', name: 'Courses', created_at: '', updated_at: '' }],
        tools: [{ id: 't1', type: 'liste', folder_id: null, list_id: 'l1', position: 0, created_at: '', updated_at: '' }],
      })
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Courses' }))
      expect(ctx.selectList).toHaveBeenCalledWith('l1')
      expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
    })

    it('le widget Comptes navigue vers l’écran Comptes', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E10Dashboard />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Comptes' }))
      expect(ctx.goTo).toHaveBeenCalledWith('budget-account')
    })
  })

  describe('mode surcharge (D10B)', () => {
    it('affiche le bandeau Mode surcharge actif sans changer de page', async () => {
      const ctx = makeAppContext({ overloadMode: true })
      await renderDashboard(ctx)
      expect(screen.getByText('Mode surcharge actif', { selector: 'p' })).toBeDefined()
      expect(screen.getByRole('heading', { name: 'AuDHD' })).toBeDefined()
    })

    it('affiche la pastille de surcharge active et cliquable (E21)', async () => {
      const ctx = makeAppContext({ overloadMode: true })
      await renderDashboard(ctx)
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
  })
})
