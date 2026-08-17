import type { BudgetCategory, BudgetPeriod } from '@/domain/entities/budgetCategory'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'

export interface BudgetPeriodBounds {
  startDate: string
  endDate: string
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`)
}

export function getPeriodBounds(period: BudgetPeriod, date: string): BudgetPeriodBounds {
  const reference = parseDate(date)

  if (period === 'month') {
    const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1))
    const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0))
    return { startDate: toDateString(start), endDate: toDateString(end) }
  }

  const day = reference.getUTCDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  const start = new Date(reference)
  start.setUTCDate(start.getUTCDate() - daysSinceMonday)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  return { startDate: toDateString(start), endDate: toDateString(end) }
}

export function getCurrentPeriodBounds(period: BudgetPeriod, now: string): BudgetPeriodBounds {
  return getPeriodBounds(period, now.slice(0, 10))
}

export function isDateInPeriod(date: string, bounds: BudgetPeriodBounds): boolean {
  return date >= bounds.startDate && date <= bounds.endDate
}

export function getSpentForCategory(
  entries: BudgetEntry[],
  categoryId: string,
  bounds: BudgetPeriodBounds,
): number {
  return entries
    .filter((entry) => entry.category_id === categoryId && isDateInPeriod(entry.date, bounds))
    .reduce((total, entry) => total + entry.amount, 0)
}

export function getRemainingForCategory(
  category: BudgetCategory,
  entries: BudgetEntry[],
  bounds: BudgetPeriodBounds,
): number {
  return category.amount - getSpentForCategory(entries, category.id, bounds)
}

export function getTotalIncome(categories: BudgetCategory[], period: BudgetPeriod): number {
  return categories
    .filter((category) => category.kind === 'income' && category.period === period)
    .reduce((total, category) => total + category.amount, 0)
}

export function getTotalBudgeted(categories: BudgetCategory[], period: BudgetPeriod): number {
  return categories
    .filter((category) => category.kind === 'expense' && category.period === period)
    .reduce((total, category) => total + category.amount, 0)
}

export function getTotalDeposits(
  deposits: BudgetDeposit[],
  period: BudgetPeriod,
  bounds: BudgetPeriodBounds,
): number {
  return deposits
    .filter((deposit) => deposit.period === period && isDateInPeriod(deposit.date, bounds))
    .reduce((total, deposit) => total + deposit.amount, 0)
}

export function getUnbudgetedRemainder(
  categories: BudgetCategory[],
  deposits: BudgetDeposit[],
  period: BudgetPeriod,
  bounds: BudgetPeriodBounds,
): number {
  return (
    getTotalIncome(categories, period) -
    getTotalBudgeted(categories, period) -
    getTotalDeposits(deposits, period, bounds)
  )
}

/** Total dépensé sur les catégories de dépense d'une période. */
export function getTotalSpent(
  categories: BudgetCategory[],
  entries: BudgetEntry[],
  period: BudgetPeriod,
  bounds: BudgetPeriodBounds,
): number {
  return categories
    .filter((category) => category.kind === 'expense' && category.period === period)
    .reduce((total, category) => total + getSpentForCategory(entries, category.id, bounds), 0)
}

/** Ce qu'il reste à dépenser sur une période : budgétisé en dépense moins dépensé. */
export function getTotalRemaining(
  categories: BudgetCategory[],
  entries: BudgetEntry[],
  period: BudgetPeriod,
  bounds: BudgetPeriodBounds,
): number {
  return getTotalBudgeted(categories, period) - getTotalSpent(categories, entries, period, bounds)
}

export const GAUGE_WARNING_RATIO = 0.8

export type GaugeLevel = 'ok' | 'warning' | 'over'

/** Part consommée d'un budget, bornée à [0, 1] pour le remplissage d'une jauge. */
export function getGaugeRatio(spent: number, budgeted: number): number {
  if (budgeted <= 0) return spent > 0 ? 1 : 0
  return Math.min(1, Math.max(0, spent / budgeted))
}

export function getGaugeLevel(spent: number, budgeted: number): GaugeLevel {
  if (spent > budgeted) return 'over'
  if (budgeted <= 0) return 'ok'
  return spent / budgeted >= GAUGE_WARNING_RATIO ? 'warning' : 'ok'
}

/** Somme des revenus saisis par l'utilisateur dans la période donnée (Montant total). */
export function getTotalIncomeEntries(entries: BudgetIncomeEntry[], bounds: BudgetPeriodBounds): number {
  return entries
    .filter((entry) => isDateInPeriod(entry.date, bounds))
    .reduce((total, entry) => total + entry.amount, 0)
}

export function getAccountBalance(deposits: BudgetDeposit[], accountId: string): number {
  return deposits
    .filter((deposit) => deposit.account_id === accountId)
    .reduce((total, deposit) => total + deposit.amount, 0)
}
