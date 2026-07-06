import { describe, it, expect } from 'vitest'
import {
  hasCheckedInToday,
  getLatestFilledValue,
  getTodayEntry,
  isValidEnergyValue,
  getEnergyLabel,
  isOverloaded,
  ENERGY_MIN,
  ENERGY_MAX,
} from './energyRules'
import type { EnergyEntry } from '@/domain/entities/energyEntry'

const mockEntry = (overrides?: Partial<EnergyEntry>): EnergyEntry => ({
  id: 'entry-1',
  value: 5,
  status: 'filled',
  entry_date: '2026-06-24',
  ...overrides,
})

describe('energyRules', () => {
  describe('hasCheckedInToday', () => {
    it('returns true when filled entry exists for date', () => {
      const entries = [mockEntry({ entry_date: '2026-06-24', status: 'filled' })]
      expect(hasCheckedInToday(entries, '2026-06-24')).toBe(true)
    })

    it('returns false when no filled entry for date', () => {
      const entries = [mockEntry({ entry_date: '2026-06-24', status: 'skipped' })]
      expect(hasCheckedInToday(entries, '2026-06-24')).toBe(false)
    })

    it('returns false for different date', () => {
      const entries = [mockEntry({ entry_date: '2026-06-23' })]
      expect(hasCheckedInToday(entries, '2026-06-24')).toBe(false)
    })

    it('returns false when no entries', () => {
      expect(hasCheckedInToday([], '2026-06-24')).toBe(false)
    })
  })

  describe('getLatestFilledValue', () => {
    it('returns latest filled value', () => {
      const entries = [
        mockEntry({ entry_date: '2026-06-22', value: 3 }),
        mockEntry({ entry_date: '2026-06-24', value: 7 }),
        mockEntry({ entry_date: '2026-06-23', value: 5 }),
      ]
      expect(getLatestFilledValue(entries)).toBe(7)
    })

    it('returns null when no filled entries', () => {
      const entries = [mockEntry({ status: 'skipped', value: null })]
      expect(getLatestFilledValue(entries)).toBe(null)
    })

    it('ignores skipped entries', () => {
      const entries = [
        mockEntry({ entry_date: '2026-06-24', status: 'skipped', value: null }),
        mockEntry({ entry_date: '2026-06-23', status: 'filled', value: 4 }),
      ]
      expect(getLatestFilledValue(entries)).toBe(4)
    })

    it('returns null for empty list', () => {
      expect(getLatestFilledValue([])).toBe(null)
    })
  })

  describe('getTodayEntry', () => {
    it('returns entry for date', () => {
      const entries = [mockEntry({ entry_date: '2026-06-24', value: 5 })]
      const result = getTodayEntry(entries, '2026-06-24')
      expect(result?.value).toBe(5)
    })

    it('returns undefined for non-existent date', () => {
      const entries = [mockEntry({ entry_date: '2026-06-23' })]
      expect(getTodayEntry(entries, '2026-06-24')).toBeUndefined()
    })

    it('returns undefined for empty list', () => {
      expect(getTodayEntry([], '2026-06-24')).toBeUndefined()
    })
  })

  describe('isValidEnergyValue', () => {
    it('accepts the lower bound', () => {
      expect(isValidEnergyValue(ENERGY_MIN)).toBe(true)
    })

    it('accepts the upper bound', () => {
      expect(isValidEnergyValue(ENERGY_MAX)).toBe(true)
    })

    it('rejects below the lower bound', () => {
      expect(isValidEnergyValue(0)).toBe(false)
    })

    it('rejects above the upper bound', () => {
      expect(isValidEnergyValue(13)).toBe(false)
    })

    it('rejects non-integer values', () => {
      expect(isValidEnergyValue(5.5)).toBe(false)
    })
  })

  describe('getEnergyLabel', () => {
    it('returns the value label when filled', () => {
      expect(getEnergyLabel('filled', 7)).toEqual({
        label: '7 énergie',
        ariaLabel: "7 énergie aujourd'hui",
      })
    })

    it('returns the skipped label', () => {
      expect(getEnergyLabel('skipped', null)).toEqual({
        label: 'Énergie ignorée',
        ariaLabel: "Énergie ignorée aujourd'hui",
      })
    })

    it('returns the default label when no status', () => {
      expect(getEnergyLabel(null, null)).toEqual({
        label: 'Mon énergie',
        ariaLabel: 'Renseigner mon énergie',
      })
    })

    it('returns the default label when filled but value is null', () => {
      expect(getEnergyLabel('filled', null)).toEqual({
        label: 'Mon énergie',
        ariaLabel: 'Renseigner mon énergie',
      })
    })
  })

  describe('isOverloaded', () => {
    it('returns false when planned cost equals energy', () => {
      expect(isOverloaded(10, 10)).toBe(false)
    })

    it('returns true when planned cost exceeds energy', () => {
      expect(isOverloaded(10, 11)).toBe(true)
    })

    it('returns false when planned cost is below energy', () => {
      expect(isOverloaded(10, 5)).toBe(false)
    })

    it('returns false when there is no planned cost', () => {
      expect(isOverloaded(10, 0)).toBe(false)
    })

    it('returns false when energy is not set', () => {
      expect(isOverloaded(null, 5)).toBe(false)
    })
  })
})
