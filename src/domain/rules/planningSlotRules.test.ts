import { describe, it, expect } from 'vitest'
import { addDays, formatPlanningDate, formatDayBadge, dateStrip, weekStrip } from '@/domain/rules/planningSlotRules'

describe('addDays', () => {
  it('décale la date du nombre de jours demandé', () => {
    expect(addDays('2026-07-30', 1)).toBe('2026-07-31')
    expect(addDays('2026-07-30', -1)).toBe('2026-07-29')
    expect(addDays('2026-07-30', 0)).toBe('2026-07-30')
  })

  it('franchit les bornes de mois et d année', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('gère le 29 février d une année bissextile', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
  })
})

describe('formatPlanningDate', () => {
  it('rend le jour de la semaine, le quantième et le mois en français', () => {
    expect(formatPlanningDate('2026-07-30')).toBe('jeudi 30 juillet')
  })
})

describe('formatDayBadge', () => {
  it('rend le jour de semaine abrégé et le quantième', () => {
    expect(formatDayBadge('2026-07-30')).toEqual({ weekday: 'jeu', day: 30 })
  })
})

describe('dateStrip', () => {
  it('centre une fenêtre de dates sur le jour donné', () => {
    expect(dateStrip('2026-07-30', 2)).toEqual([
      '2026-07-28',
      '2026-07-29',
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
    ])
  })

  it('accepte un rayon nul', () => {
    expect(dateStrip('2026-07-30', 0)).toEqual(['2026-07-30'])
  })
})

describe('weekStrip', () => {
  it('rend lundi → dimanche pour un jour en milieu de semaine', () => {
    // 2026-07-30 est un jeudi
    expect(weekStrip('2026-07-30')).toEqual([
      '2026-07-27',
      '2026-07-28',
      '2026-07-29',
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
      '2026-08-02',
    ])
  })

  it('garde la même semaine quel que soit le jour fourni, dimanche inclus', () => {
    const monday = weekStrip('2026-07-27')
    expect(weekStrip('2026-08-02')).toEqual(monday)
    expect(monday[0]).toBe('2026-07-27')
    expect(monday[6]).toBe('2026-08-02')
  })
})
