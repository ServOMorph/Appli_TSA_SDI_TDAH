import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanningBoard } from './PlanningBoard'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask } from '@/app/AppContext'
import { makeTask as baseTask, makePlannedSubTask } from '@/test/factories'

function makeSubTaskV2(overrides: Partial<PlannedSubTask> = {}): PlannedSubTask {
  return makePlannedSubTask(overrides)
}

function makeTaskV2(overrides: Partial<Task> = {}): Task {
  return baseTask({ title: 'Médecin', status: 'planned', ...overrides })
}

function renderExpanded(ctx = makeAppContext()) {
  return renderWithApp(<PlanningBoard collapsed={false} />, ctx)
}

describe('PlanningBoard — déplié', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  it('affiche le bandeau de dates centré sur le jour affiché', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByLabelText('2026-06-30')).toBeInTheDocument())
    expect(screen.getByLabelText('2026-06-28')).toBeInTheDocument()
    expect(screen.getByLabelText('2026-07-02')).toBeInTheDocument()
  })

  it('glisser vers la gauche charge le jour suivant', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    const strip = screen.getByLabelText('2026-06-30').parentElement as HTMLElement
    fireEvent.touchStart(strip, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(strip, { changedTouches: [{ clientX: 100 }] })
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-01'))
  })

  it('glisser vers la droite charge le jour précédent', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    const strip = screen.getByLabelText('2026-06-30').parentElement as HTMLElement
    fireEvent.touchStart(strip, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(strip, { changedTouches: [{ clientX: 200 }] })
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))
  })

  it('encadre le bandeau de dates avec la couleur d’ambiance (AP2)', async () => {
    const ctx = makeAppContext({
      getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
      settings: { id: 's1', user_id: 'u1', dark_mode: false, font_size: 'medium', reduced_motion: false, ambiance_color: '#ff00aa' },
    })
    renderExpanded(ctx)
    await waitFor(() => expect(screen.getByLabelText('2026-06-30')).toBeInTheDocument())
    const strip = screen.getByLabelText('2026-06-30').parentElement as HTMLElement
    expect(strip.style.border).toContain('rgb(255, 0, 170)')
  })

  it('suit le doigt pendant le glissement du bandeau (AP2)', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByLabelText('2026-06-30')).toBeInTheDocument())

    const strip = screen.getByLabelText('2026-06-30').parentElement as HTMLElement
    fireEvent.touchStart(strip, { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(strip, { touches: [{ clientX: 170 }] })
    expect(strip.style.transform).toBe('translateX(-30px)')

    fireEvent.touchEnd(strip, { changedTouches: [{ clientX: 170 }] })
    expect(strip.style.transform).toBe('translateX(0px)')
  })

  it('ne propose plus de flèches de navigation par semaine', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.getByLabelText('2026-06-30')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /semaine précédente/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /semaine suivante/i })).toBeNull()
  })

  it('choisir un mois via le sélecteur mois/année charge ce mois', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderExpanded(makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))

    await userEvent.click(screen.getByRole('button', { name: /choisir un mois/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Sep' }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-09-30'))
  })

  it('affiche une tâche planifiée avec son horaire, son titre et son coût énergie', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00', energy_cost: 7 })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByLabelText('7 énergie')).toBeInTheDocument()
  })

  it('affiche une tâche sans horaire en tête de liste', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: null, scheduled_end: null })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByText('Sans horaire')).toBeInTheDocument()
  })

  it('cliquer une tâche sélectionne la tâche et ouvre sa fiche', async () => {
    const selectTask = vi.fn()
    const goTo = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ selectTask, goTo, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    await userEvent.click(screen.getByText('Médecin'))
    expect(selectTask).toHaveBeenCalledWith('t1')
    expect(goTo).toHaveBeenCalledWith('task-detail')
  })

  it('affiche une case à cocher non cochée sur une tâche planifiée et cocher appelle completeTaskById', async () => {
    const completeTaskById = vi.fn().mockResolvedValue(undefined)
    const goTo = vi.fn()
    const task = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ completeTaskById, goTo, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())

    const checkbox = screen.getByRole('checkbox', { name: 'Terminer Médecin' })
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    expect(completeTaskById).toHaveBeenCalledWith('t1')
    expect(goTo).not.toHaveBeenCalled()
  })

  it('affiche une case cochée sur une tâche déjà terminée', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00', status: 'completed' })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByRole('checkbox', { name: 'Terminer Médecin' })).toBeChecked()
  })

  it('affiche le badge Reporté sur une tâche marquée comme reportée', async () => {
    const task = makeTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00', postponed: true })
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Médecin')).toBeInTheDocument())
    expect(screen.getByText('Reporté')).toBeInTheDocument()
  })

  it('affiche le bouton Reporter sur une tâche non-obligatoire du jour en surcharge', async () => {
    const task = makeTaskV2({ title: 'Shopping', essential: false, scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ overloadMode: true, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    expect(await screen.findByLabelText(/Reporter Shopping/)).toBeInTheDocument()
  })

  it("n'affiche pas le bouton Reporter sur une tâche obligatoire en surcharge", async () => {
    const task = makeTaskV2({ title: 'McDo', essential: true, scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ overloadMode: true, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('McDo')).toBeInTheDocument())
    expect(screen.queryByLabelText(/Reporter McDo/)).toBeNull()
  })

  it("n'affiche pas le bouton Reporter hors surcharge", async () => {
    const task = makeTaskV2({ title: 'Shopping', essential: false, scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ overloadMode: false, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await waitFor(() => expect(screen.getByText('Shopping')).toBeInTheDocument())
    expect(screen.queryByLabelText(/Reporter Shopping/)).toBeNull()
  })

  it('Reporter appelle reportTaskById avec le lendemain et le même horaire (E8)', async () => {
    const reportTaskById = vi.fn().mockResolvedValue(undefined)
    const task = makeTaskV2({ id: 't1', title: 'Shopping', essential: false, scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    renderExpanded(makeAppContext({ overloadMode: true, reportTaskById, getPlannedTasksForDate: vi.fn().mockResolvedValue([task]) }))
    await userEvent.click(await screen.findByLabelText(/Reporter Shopping/))

    expect(reportTaskById).toHaveBeenCalledWith('t1', '2026-07-01', '09:00', '10:00')
  })

  it('affiche le compteur de sous-étapes et déplie la liste au clic', async () => {
    const parent = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    const child = baseTask({ id: 'c1', parent_id: 't1', title: 'Étape 1', status: 'inbox' })
    renderExpanded(
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([parent]),
        getSubTasks: vi.fn().mockResolvedValue([child]),
      }),
    )
    const toggle = await screen.findByLabelText('0 sur 1 sous-étapes, déplier')
    expect(screen.queryByText('Étape 1')).toBeNull()

    await userEvent.click(toggle)
    expect(await screen.findByText('Étape 1')).toBeInTheDocument()
  })

  it('cocher une sous-étape dépliée appelle toggleSubTask', async () => {
    const toggleSubTask = vi.fn().mockResolvedValue(undefined)
    const parent = makeTaskV2({ id: 't1', scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '10:00' })
    const child = baseTask({ id: 'c1', parent_id: 't1', title: 'Étape 1', status: 'inbox' })
    renderExpanded(
      makeAppContext({
        toggleSubTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([parent]),
        getSubTasks: vi.fn().mockResolvedValue([child]),
      }),
    )
    const toggle = await screen.findByLabelText('0 sur 1 sous-étapes, déplier')
    await userEvent.click(toggle)
    await userEvent.click(await screen.findByLabelText('Terminer Étape 1'))
    expect(toggleSubTask).toHaveBeenCalledWith(child)
  })

  it('affiche une sous-tâche planifiée indépendamment avec le titre du parent (E9b)', async () => {
    const sub = makeSubTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderExpanded(
      makeAppContext({
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([sub]),
      }),
    )
    expect(await screen.findByText('Rangement - Ranger le bureau')).toBeInTheDocument()
  })

  it("cocher la case d'une sous-tâche planifiée indépendamment appelle toggleSubTask", async () => {
    const toggleSubTask = vi.fn().mockResolvedValue(undefined)
    const sub = makeSubTaskV2({ scheduled_date: '2026-06-30', scheduled_start: '09:00', scheduled_end: '09:30' })
    renderExpanded(
      makeAppContext({
        toggleSubTask,
        getPlannedTasksForDate: vi.fn().mockResolvedValue([]),
        getPlannedSubTasksForDate: vi.fn().mockResolvedValue([sub]),
      }),
    )
    await waitFor(() => expect(screen.getByText('Rangement - Ranger le bureau')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Terminer Rangement - Ranger le bureau'))
    expect(toggleSubTask).toHaveBeenCalledWith(sub)
  })

  it('affiche un message quand rien n’est planifié ce jour-là', async () => {
    renderExpanded(makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    expect(await screen.findByText('Rien de planifié ce jour-là.')).toBeInTheDocument()
  })
})

describe('PlanningBoard — replié', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })

  it('affiche le bandeau de dates comme en mode déplié', async () => {
    renderWithApp(<PlanningBoard collapsed />, makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await waitFor(() => expect(screen.queryByLabelText('2026-06-30')).not.toBeNull())
  })

  it('charge toujours le jour courant, quelle que soit la navigation précédente', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWithApp(<PlanningBoard collapsed />, makeAppContext({ getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-30'))
  })

  it('limite le nombre de lignes affichées', async () => {
    const tasks = Array.from({ length: 6 }, (_, i) =>
      makeTaskV2({ id: `t${i}`, title: `Tâche ${i}`, scheduled_date: '2026-06-30', scheduled_start: `0${i}:00`, scheduled_end: `0${i}:30` }),
    )
    renderWithApp(<PlanningBoard collapsed />, makeAppContext({ getPlannedTasksForDate: vi.fn().mockResolvedValue(tasks) }))
    await waitFor(() => expect(screen.getByText('Tâche 0')).toBeInTheDocument())
    expect(screen.queryByText('Tâche 5')).toBeNull()
  })
})
