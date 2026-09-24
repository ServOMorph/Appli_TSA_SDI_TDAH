import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RoutineWeekdayPicker } from './RoutineWeekdayPicker'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'

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

// 2026-06-30 est un mardi ; sa semaine va du lundi 2026-06-29 au dimanche 2026-07-05.
describe('RoutineWeekdayPicker', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-06-30T14:30:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche les 7 jours de la semaine en cours, lundi à dimanche', () => {
    render(<RoutineWeekdayPicker schedules={[]} onDayClick={vi.fn()} />)
    for (const [label, day] of [['lun', 29], ['mar', 30], ['mer', 1], ['jeu', 2], ['ven', 3], ['sam', 4], ['dim', 5]] as const) {
      expect(screen.getByLabelText(new RegExp(`^${label} ${day}`))).toBeInTheDocument()
    }
  })

  it('un jour sans planning n\'affiche pas d\'horaire et appelle onDayClick au clic', async () => {
    const onDayClick = vi.fn()
    const user = userEvent.setup()
    render(<RoutineWeekdayPicker schedules={[]} onDayClick={onDayClick} />)
    const monday = screen.getByLabelText(/^lun 29/)
    expect(monday).toHaveAttribute('aria-pressed', 'false')
    await user.click(monday)
    expect(onDayClick).toHaveBeenCalledWith(1)
  })

  it('plusieurs jours peuvent être planifiés simultanément', () => {
    const schedules = [
      makeSchedule({ id: 's1', weekday: 1, time: '08:00' }),
      makeSchedule({ id: 's2', weekday: 3, time: '18:30' }),
    ]
    render(<RoutineWeekdayPicker schedules={schedules} onDayClick={vi.fn()} />)
    const monday = screen.getByLabelText(/^lun 29.*08:00/)
    const wednesday = screen.getByLabelText(/^mer 1.*18:30/)
    expect(monday).toHaveAttribute('aria-pressed', 'true')
    expect(wednesday).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText(/^mar 30/)).toHaveAttribute('aria-pressed', 'false')
  })

  it('navigue à la semaine suivante puis précédente', async () => {
    const user = userEvent.setup()
    render(<RoutineWeekdayPicker schedules={[]} onDayClick={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Semaine suivante' }))
    expect(screen.getByLabelText(/^lun 6/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^dim 12/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Semaine précédente' }))
    await user.click(screen.getByRole('button', { name: 'Semaine précédente' }))
    expect(screen.getByLabelText(/^lun 22/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^dim 28/)).toBeInTheDocument()
  })
})
