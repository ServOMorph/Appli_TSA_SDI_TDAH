import { describe, expect, it } from 'vitest'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'
import {
  getAccountBalance,
  getCurrentPeriodBounds,
  getGaugeLevel,
  getGaugeRatio,
  getPeriodBounds,
  getRemainingForCategory,
  getSpentForCategory,
  getTotalBudgeted,
  getMontantTotal,
  getTotalAccountUsage,
  getTotalDeposits,
  getTotalIncomeAfterDeposits,
  getTotalIncomeEntries,
  getTotalRemaining,
  getTotalSpent,
  getWeeksInMonth,
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
  period: 'month',
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
      category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
      category({ id: 'courses', period: 'week', amount: 60 }),
    ]
    const bounds = { startDate: '2026-07-20', endDate: '2026-07-26' }

    it('sums budgeted expenses by their period', () => {
      expect(getTotalBudgeted(categories, 'month')).toBe(600)
      expect(getTotalBudgeted(categories, 'week')).toBe(60)
    })

    it('sums only deposits from the selected period and periodicity', () => {
      const deposits = [
        deposit({ amount: 100 }),
        deposit({ id: 'outside', amount: 50, date: '2026-07-27' }),
        deposit({ id: 'wrong-periodicity', amount: 999, period: 'week' }),
      ]
      expect(getTotalDeposits(deposits, 'month', bounds)).toBe(100)
    })

    it('sums income entries within the period, regardless of amount', () => {
      const entries = [
        incomeEntry({ amount: 500 }),
        incomeEntry({ id: 'other', amount: 300, date: '2026-07-25' }),
        incomeEntry({ id: 'outside', amount: 999, date: '2026-06-30' }),
      ]
      expect(getTotalIncomeEntries(entries, bounds)).toBe(800)
    })

    it('soustrait les dépôts du montant total et recrédite les retraits', () => {
      const entries = [incomeEntry({ amount: 800 })]
      const deposits = [deposit({ amount: 100 })]
      expect(getTotalIncomeAfterDeposits(entries, deposits, 'month', bounds)).toBe(700)

      const withdrawal = [deposit({ amount: -100 })]
      expect(getTotalIncomeAfterDeposits(entries, withdrawal, 'month', bounds)).toBe(900)
    })

    it('compte le nombre réel de semaines civiles d’un mois, y compris les cas à 4 et 5 semaines', () => {
      expect(getWeeksInMonth('2026-07-15')).toBe(4)
      expect(getWeeksInMonth('2026-08-15')).toBe(5)
      expect(getWeeksInMonth('2028-02-15')).toBe(4)
    })

    it('calcule l’usage de « Mon compte » : catégories Semaine converties au nombre réel de semaines du mois', () => {
      const accountCategories = [
        category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
        category({ id: 'courses', period: 'week', amount: 60 }),
      ]
      expect(getTotalAccountUsage(accountCategories, 'week', '2026-08-15')).toBe(60)
      expect(getTotalAccountUsage(accountCategories, 'month', '2026-08-15')).toBe(600 + 60 * 5)
      expect(getTotalAccountUsage(accountCategories, 'month', '2026-07-15')).toBe(600 + 60 * 4)
    })

    it('déduit les livrets et « Mon compte » du montant total', () => {
      const entries = [incomeEntry({ amount: 2000, date: '2026-08-05' })]
      const deposits = [deposit({ amount: 100, date: '2026-08-05' })]
      const accountCategories = [
        category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
        category({ id: 'courses', period: 'week', amount: 60 }),
      ]
      const monthBounds = { startDate: '2026-08-01', endDate: '2026-08-31' }
      expect(getMontantTotal(entries, deposits, accountCategories, 'month', monthBounds, '2026-08-15')).toBe(
        2000 - 100 - (600 + 60 * 5),
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

  describe('totaux de période', () => {
    const categories = [
      category({ id: 'salary', name: 'Salaire', kind: 'income', period: 'week', amount: 400 }),
      category({ id: 'courses', period: 'week', amount: 60 }),
      category({ id: 'plaisir', name: 'Plaisir', period: 'week', amount: 40 }),
      category({ id: 'rent', name: 'Loyer', period: 'month', amount: 600 }),
    ]
    const bounds = { startDate: '2026-07-20', endDate: '2026-07-26' }
    const entries = [
      entry({ id: 'e1', category_id: 'courses', amount: 15 }),
      entry({ id: 'e2', category_id: 'plaisir', amount: 10 }),
      entry({ id: 'e3', category_id: 'courses', amount: 30, date: '2026-07-27' }),
      entry({ id: 'e4', category_id: 'rent', amount: 600 }),
    ]

    it('additionne les dépenses de la période, en ignorant les autres périodicités et les autres dates', () => {
      expect(getTotalSpent(categories, entries, 'week', bounds)).toBe(25)
    })

    it('ne compte pas les revenus dans le restant à dépenser', () => {
      expect(getTotalRemaining(categories, entries, 'week', bounds)).toBe(75)
    })

    it('rend un restant négatif quand la période est dépassée', () => {
      const overspent = [entry({ id: 'e5', category_id: 'courses', amount: 200 })]
      expect(getTotalRemaining(categories, overspent, 'week', bounds)).toBe(-100)
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
