import { describe, expect, it } from 'vitest'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'
import {
  getAccountBalance,
  getGaugeLevel,
  getGaugeRatio,
  getMonCompteUsage,
  getPeriodBounds,
  getSpentForCategory,
  getMontantTotal,
  getTotalDeposits,
  getTotalIncomeEntries,
  isDateInPeriod,
} from './budgetRules'

const category = (overrides: Partial<BudgetCategory> = {}): BudgetCategory => ({
  id: 'courses',
  name: 'Courses',
  period: 'week',
  amount: 60,
  position: 0,
  created_at: '2026-07-21T00:00:00Z',
  updated_at: '2026-07-21T00:00:00Z',
  ...overrides,
})

const entry = (overrides: Partial<BudgetEntry> = {}): BudgetEntry => ({
  id: 'entry-1',
  category_id: 'courses',
  amount: 20,
  date: '2026-07-21',
  created_at: '2026-07-21T00:00:00Z',
  ...overrides,
})

const deposit = (overrides: Partial<BudgetDeposit> = {}): BudgetDeposit => ({
  id: 'deposit-1',
  account_id: 'livret-a',
  amount: 50,
  date: '2026-07-21',
  created_at: '2026-07-21T00:00:00Z',
  ...overrides,
})

const incomeEntry = (overrides: Partial<BudgetIncomeEntry> = {}): BudgetIncomeEntry => ({
  id: 'income-1',
  amount: 500,
  date: '2026-07-21',
  created_at: '2026-07-21T00:00:00Z',
  ...overrides,
})

describe('budgetRules', () => {
  describe('period bounds', () => {
    it('calculates Monday to Sunday for a week', () => {
      expect(getPeriodBounds('week', '2026-07-22')).toEqual({
        startDate: '2026-07-20',
        endDate: '2026-07-26',
      })
    })

    it('calculates a week across a year boundary', () => {
      expect(getPeriodBounds('week', '2027-01-01')).toEqual({
        startDate: '2026-12-28',
        endDate: '2027-01-03',
      })
    })

    it('calculates calendar months including leap years', () => {
      expect(getPeriodBounds('month', '2028-02-15')).toEqual({
        startDate: '2028-02-01',
        endDate: '2028-02-29',
      })
    })

    it('includes both period bounds', () => {
      const bounds = getPeriodBounds('week', '2026-07-22')
      expect(isDateInPeriod('2026-07-20', bounds)).toBe(true)
      expect(isDateInPeriod('2026-07-26', bounds)).toBe(true)
      expect(isDateInPeriod('2026-07-27', bounds)).toBe(false)
    })
  })

  describe('category amounts', () => {
    const bounds = { startDate: '2026-07-20', endDate: '2026-07-26' }

    it('calculates spent amounts for a category in one period', () => {
      const entries = [
        entry({ amount: 15 }),
        entry({ id: 'outside', amount: 30, date: '2026-07-27' }),
        entry({ id: 'other-category', category_id: 'plaisir', amount: 10 }),
      ]

      expect(getSpentForCategory(entries, 'courses', bounds)).toBe(15)
    })
  })

  describe('budget totals', () => {
    it('sums all deposits and withdrawals, tous livrets confondus', () => {
      const deposits = [
        deposit({ amount: 100 }),
        deposit({ id: 'other-date', amount: 50, date: '2026-07-27' }),
        deposit({ id: 'withdrawal', amount: -30 }),
      ]
      expect(getTotalDeposits(deposits)).toBe(120)
    })

    it('sums all income entries, regardless of date', () => {
      const entries = [
        incomeEntry({ amount: 500 }),
        incomeEntry({ id: 'other', amount: 300, date: '2026-07-25' }),
        incomeEntry({ id: 'older', amount: 999, date: '2026-06-30' }),
      ]
      expect(getTotalIncomeEntries(entries)).toBe(1799)
    })

    it('calcule l’usage de « Mon compte » : chaque dépense « semaine » compte ×4, chaque dépense « mois » compte ×1', () => {
      const accountCategories = [
        category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
        category({ id: 'courses', period: 'week', amount: 60 }),
      ]
      const accountEntries = [
        entry({ id: 'rent-entry', category_id: 'rent', amount: 600 }),
        entry({ id: 'courses-entry', category_id: 'courses', amount: 20 }),
      ]
      expect(getMonCompteUsage(accountCategories, accountEntries)).toBe(600 + 20 * 4)
    })

    it('déduit les livrets et « Mon compte » du montant total', () => {
      const entries = [incomeEntry({ amount: 2000 })]
      const deposits = [deposit({ amount: 100 })]
      const accountCategories = [
        category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
        category({ id: 'courses', period: 'week', amount: 60 }),
      ]
      const accountEntries = [
        entry({ id: 'rent-entry', category_id: 'rent', amount: 600 }),
        entry({ id: 'courses-entry', category_id: 'courses', amount: 20 }),
      ]
      expect(getMontantTotal(entries, deposits, accountCategories, accountEntries)).toBe(
        2000 - 100 - (600 + 20 * 4),
      )
    })

    it('calculates cumulative account balances', () => {
      const deposits = [
        deposit({ amount: 100 }),
        deposit({ id: 'older', amount: 50, date: '2026-06-01' }),
        deposit({ id: 'other', account_id: 'livret-jeune', amount: 30 }),
      ]
      expect(getAccountBalance(deposits, 'livret-a')).toBe(150)
    })
  })

  describe('seuils de jauge', () => {
    it('borne le remplissage entre 0 et 1', () => {
      expect(getGaugeRatio(0, 60)).toBe(0)
      expect(getGaugeRatio(30, 60)).toBe(0.5)
      expect(getGaugeRatio(90, 60)).toBe(1)
      expect(getGaugeRatio(10, 0)).toBe(1)
      expect(getGaugeRatio(0, 0)).toBe(0)
    })

    it('passe en ambre à 80 % de consommation et en rouge au dépassement', () => {
      expect(getGaugeLevel(47, 60)).toBe('ok')
      expect(getGaugeLevel(48, 60)).toBe('warning')
      expect(getGaugeLevel(60, 60)).toBe('warning')
      expect(getGaugeLevel(61, 60)).toBe('over')
    })

    it('reste neutre sur un budget nul non consommé', () => {
      expect(getGaugeLevel(0, 0)).toBe('ok')
      expect(getGaugeLevel(5, 0)).toBe('over')
    })
  })
})
