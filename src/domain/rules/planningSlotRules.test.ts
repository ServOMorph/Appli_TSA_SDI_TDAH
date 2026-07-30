import { describe, it, expect } from 'vitest'
import {
  SLOT_INDEXES,
  slotTime,
  slotLabel,
  slotFromDate,
  addDays,
  formatPlanningDate,
  slotSpan,
  isRangeAvailable,
  normalizeRange,
  moveTargetRange,
  visibleSlotWindow,
} from '@/domain/rules/planningSlotRules'

function scheduled(start: string | null, end: string | null) {
  return { scheduled_start: start, scheduled_end: end }
}

describe('SLOT_INDEXES', () => {
  it('couvre les 48 demi-heures de la journée', () => {
    expect(SLOT_INDEXES).toHaveLength(48)
    expect(SLOT_INDEXES[0]).toBe(0)
    expect(SLOT_INDEXES[47]).toBe(47)
  })
})

describe('slotTime', () => {
  it('formate en HH:MM avec padding', () => {
    expect(slotTime(0)).toBe('00:00')
    expect(slotTime(1)).toBe('00:30')
    expect(slotTime(19)).toBe('09:30')
    expect(slotTime(28)).toBe('14:00')
    expect(slotTime(47)).toBe('23:30')
  })
})

describe('slotLabel', () => {
  it('formate en NhMM sans padding sur l heure', () => {
    expect(slotLabel(0)).toBe('0h00')
    expect(slotLabel(1)).toBe('0h30')
    expect(slotLabel(28)).toBe('14h00')
    expect(slotLabel(47)).toBe('23h30')
  })
})

describe('slotFromDate', () => {
  it('mappe une heure sur son créneau de 30 minutes', () => {
    expect(slotFromDate(new Date('2026-07-30T00:00:00'))).toBe(0)
    expect(slotFromDate(new Date('2026-07-30T00:29:00'))).toBe(0)
    expect(slotFromDate(new Date('2026-07-30T00:30:00'))).toBe(1)
    expect(slotFromDate(new Date('2026-07-30T14:15:00'))).toBe(28)
    expect(slotFromDate(new Date('2026-07-30T23:59:00'))).toBe(47)
  })
})

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

describe('slotSpan', () => {
  it('vaut 1 pour une tâche sans horaire', () => {
    expect(slotSpan(scheduled(null, null))).toBe(1)
  })

  it('vaut 1 pour une tâche d une demi-heure', () => {
    expect(slotSpan(scheduled('14:00', '14:30'))).toBe(1)
  })

  it('compte les créneaux occupés pour une plage longue', () => {
    expect(slotSpan(scheduled('14:00', '16:00'))).toBe(4)
  })
})

describe('isRangeAvailable', () => {
  const occupied = [scheduled('14:00', '15:00')]

  it('accepte une plage libre', () => {
    expect(isRangeAvailable(occupied, 20, 23)).toBe(true)
  })

  it('refuse une plage qui recouvre une tâche existante', () => {
    expect(isRangeAvailable(occupied, 28, 29)).toBe(false)
  })

  it('refuse un chevauchement partiel en début comme en fin', () => {
    expect(isRangeAvailable(occupied, 27, 28)).toBe(false)
    expect(isRangeAvailable(occupied, 29, 30)).toBe(false)
  })

  it('accepte une plage adjacente sans recouvrement', () => {
    expect(isRangeAvailable(occupied, 26, 27)).toBe(true)
    expect(isRangeAvailable(occupied, 30, 31)).toBe(true)
  })

  it('refuse une plage qui déborde de la journée', () => {
    expect(isRangeAvailable([], 46, 48)).toBe(false)
    expect(isRangeAvailable([], -1, 2)).toBe(false)
  })

  it('refuse une plage inversée', () => {
    expect(isRangeAvailable([], 10, 9)).toBe(false)
  })

  it('ignore l élément exclu', () => {
    const self = scheduled('14:00', '15:00')
    expect(isRangeAvailable([self], 28, 29)).toBe(false)
    expect(isRangeAvailable([self], 28, 29, (item) => item === self)).toBe(true)
  })

  it('accepte tout créneau quand rien n est planifié', () => {
    expect(isRangeAvailable([], 0, 47)).toBe(true)
  })
})

describe('normalizeRange', () => {
  it('ordonne les bornes quelle que soit la saisie', () => {
    expect(normalizeRange(10, 4)).toEqual({ start: 4, end: 10 })
    expect(normalizeRange(4, 10)).toEqual({ start: 4, end: 10 })
    expect(normalizeRange(7, 7)).toEqual({ start: 7, end: 7 })
  })
})

describe('moveTargetRange', () => {
  it('conserve la durée de la tâche déplacée', () => {
    expect(moveTargetRange(scheduled('14:00', '16:00'), 10)).toEqual({ start: 10, end: 13 })
  })

  it('produit un créneau unique pour une tâche sans horaire', () => {
    expect(moveTargetRange(scheduled(null, null), 10)).toEqual({ start: 10, end: 10 })
  })
})

describe('visibleSlotWindow', () => {
  it('ancre la fenêtre un créneau avant le créneau courant', () => {
    expect(visibleSlotWindow(20)).toEqual([19, 20, 21, 22, 23, 24])
  })

  it('ne déborde pas en début de journée', () => {
    expect(visibleSlotWindow(0)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('ne déborde pas en fin de journée', () => {
    expect(visibleSlotWindow(47)).toEqual([42, 43, 44, 45, 46, 47])
  })

  it('accepte une taille de fenêtre explicite', () => {
    expect(visibleSlotWindow(20, 3, 0)).toEqual([20, 21, 22])
  })
})
