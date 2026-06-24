import { describe, it, expect } from 'vitest'
import { hasCheckedInToday, getLatestFilledValue, getTodayEntry } from './energyRules'
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
})
