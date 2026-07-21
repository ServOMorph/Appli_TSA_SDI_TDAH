import { describe, expect, it } from 'vitest'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import {
  getAccountBalance,
  getCurrentPeriodBounds,
  getPeriodBounds,
  getRemainingForCategory,
  getSpentForCategory,
  getTotalBudgeted,
  getTotalDeposits,
  getTotalIncome,
  getUnbudgetedRemainder,
  isDateInPeriod,
} from './budgetRules'

const category = (overrides: Partial<BudgetCategory> = {}): BudgetCategory => ({
  id: 'courses',
  name: 'Courses',
  kind: 'expense',
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

    it('derives current bounds from injected now', () => {
      expect(getCurrentPeriodBounds('month', '2026-12-31T22:30:00Z')).toEqual({
        startDate: '2026-12-01',
        endDate: '2026-12-31',
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

    it('calculates spent and remaining amounts for a category in one period', () => {
      const entries = [
        entry({ amount: 15 }),
        entry({ id: 'outside', amount: 30, date: '2026-07-27' }),
        entry({ id: 'other-category', category_id: 'plaisir', amount: 10 }),
      ]

      expect(getSpentForCategory(entries, 'courses', bounds)).toBe(15)
      expect(getRemainingForCategory(category(), entries, bounds)).toBe(45)
    })

    it('allows a negative remaining amount when a category is exceeded', () => {
      expect(getRemainingForCategory(category(), [entry({ amount: 75 })], bounds)).toBe(-15)
    })
  })

  describe('budget totals', () => {
    const categories = [
      category({ id: 'salary', name: 'Salaire', kind: 'income', period: 'month', amount: 1500 }),
      category({
        id: 'allowance',
        name: 'Allocation',
        kind: 'income',
        period: 'month',
        amount: 200,
      }),
      category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
      category({ id: 'courses', period: 'week', amount: 60 }),
    ]
    const bounds = { startDate: '2026-07-20', endDate: '2026-07-26' }

    it('sums incomes and budgeted expenses by their period', () => {
      expect(getTotalIncome(categories, 'month')).toBe(1700)
      expect(getTotalBudgeted(categories, 'month')).toBe(600)
      expect(getTotalBudgeted(categories, 'week')).toBe(60)
    })

    it('sums only deposits from the selected period', () => {
      const deposits = [
        deposit({ amount: 100 }),
        deposit({ id: 'outside', amount: 50, date: '2026-07-27' }),
      ]
      expect(getTotalDeposits(deposits, bounds)).toBe(100)
    })

    it('calculates the unbudgeted remainder', () => {
      const deposits = [deposit({ amount: 300 })]
      expect(getUnbudgetedRemainder(categories, deposits, 'month', bounds)).toBe(800)
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
})
