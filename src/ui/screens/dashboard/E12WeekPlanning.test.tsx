import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { E12WeekPlanning } from './E12WeekPlanning'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { makeTask } from '@/test/factories'
import type { Route } from '@/app/AppContext'

// 2026-06-30 est un mardi ; sa semaine va du lundi 2026-06-29 au dimanche 2026-07-05.
const WEEK_ROUTE: Route = { name: 'planning', date: '2026-06-30' }

function renderWeek(ctx = makeAppContext({ route: WEEK_ROUTE })) {
  return renderWithApp(<E12WeekPlanning />, ctx)
}

describe('E12WeekPlanning', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche les 7 jours de la semaine avec leurs tâches en icônes (#22)', async () => {
    const getPlannedTasksForDate = vi.fn(async (d: string) =>
      d === '2026-07-01' ? [makeTask({ id: 't1', title: 'Médecin', icon: 'health', status: 'planned' })] : [],
    )
    renderWeek(makeAppContext({ route: WEEK_ROUTE, getPlannedTasksForDate }))

    expect(await screen.findByRole('region', { name: 'Planning de la semaine' })).toBeInTheDocument()
    for (const d of [
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
    ]) {
      expect(screen.getByLabelText(`Tâches du ${d}`)).toBeInTheDocument()
    }
    expect(await screen.findByRole('button', { name: 'Médecin' })).toBeInTheDocument()
  })

  it('glisser vers la gauche affiche la semaine suivante (#22)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWeek(makeAppContext({ route: WEEK_ROUTE, getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))

    const grid = screen.getByLabelText('Planning de la semaine')
    fireEvent.touchStart(grid, { touches: [{ clientX: 240 }] })
    fireEvent.touchEnd(grid, { changedTouches: [{ clientX: 120 }] })

    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-07-06'))
  })

  it('glisser vers la droite affiche la semaine précédente (#22)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWeek(makeAppContext({ route: WEEK_ROUTE, getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))

    const grid = screen.getByLabelText('Planning de la semaine')
    fireEvent.touchStart(grid, { touches: [{ clientX: 120 }] })
    fireEvent.touchEnd(grid, { changedTouches: [{ clientX: 240 }] })

    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-22'))
  })

  it('le bouton Aujourd’hui recentre sur la semaine du jour (#22)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWeek(
      makeAppContext({ route: { name: 'planning', date: '2026-09-01' }, getPlannedTasksForDate }),
    )
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-08-31'))

    await userEvent.click(screen.getByRole('button', { name: "Aujourd'hui" }))

    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))
    await waitFor(() => expect(screen.queryByRole('button', { name: "Aujourd'hui" })).toBeNull())
  })

  it('n’affiche pas le bouton Aujourd’hui quand la semaine du jour est déjà affichée', async () => {
    renderWeek(makeAppContext({ route: WEEK_ROUTE, getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await screen.findByRole('region', { name: 'Planning de la semaine' })
    expect(screen.queryByRole('button', { name: "Aujourd'hui" })).toBeNull()
  })

  it('ouvre la fiche d’une tâche au clic sur son icône (#22)', async () => {
    const selectTask = vi.fn()
    const goTo = vi.fn()
    const getPlannedTasksForDate = vi.fn(async (d: string) =>
      d === '2026-06-30' ? [makeTask({ id: 't9', title: 'Dentiste', icon: 'health', status: 'planned' })] : [],
    )
    renderWeek(makeAppContext({ route: WEEK_ROUTE, getPlannedTasksForDate, selectTask, goTo }))

    await userEvent.click(await screen.findByRole('button', { name: 'Dentiste' }))
    expect(selectTask).toHaveBeenCalledWith('t9')
    expect(goTo).toHaveBeenCalledWith('task-detail')
  })

  it('choisir un mois via le sélecteur place la vue sur la première semaine du mois (#22)', async () => {
    const getPlannedTasksForDate = vi.fn().mockResolvedValue([])
    renderWeek(makeAppContext({ route: WEEK_ROUTE, getPlannedTasksForDate }))
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-06-29'))

    await userEvent.click(screen.getByRole('button', { name: /choisir un mois/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Sep' }))

    // 2026-09-01 est un mardi → lundi de sa semaine = 2026-08-31.
    await waitFor(() => expect(getPlannedTasksForDate).toHaveBeenCalledWith('2026-08-31'))
  })

  it('revient à l’accueil via Retour (#22)', async () => {
    const back = vi.fn()
    renderWeek(makeAppContext({ route: WEEK_ROUTE, back, getPlannedTasksForDate: vi.fn().mockResolvedValue([]) }))
    await userEvent.click(await screen.findByRole('button', { name: 'Retour' }))
    expect(back).toHaveBeenCalledWith('dashboard')
  })
})
