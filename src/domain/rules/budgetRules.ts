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

export function isDateInPeriod(date: string, bounds: BudgetPeriodBounds): boolean {
  return date >= bounds.startDate && date <= bounds.endDate
}

/** Montant prévu pour la période affichée, avec une modification temporaire éventuelle. */
export function getBudgetedAmount(category: BudgetCategory, referenceDate: string): number {
  const bounds = getPeriodBounds(category.period, referenceDate)
  if (
    category.temporary_amount !== undefined &&
    category.temporary_start_date === bounds.startDate &&
    category.temporary_end_date === bounds.endDate
  ) {
    return category.temporary_amount
  }
  return category.amount
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

/** Somme de tous les mouvements de livrets, tous livrets confondus (montant signé). */
export function getTotalDeposits(deposits: BudgetDeposit[]): number {
  return deposits.reduce((total, deposit) => total + deposit.amount, 0)
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

/** Somme de tous les revenus saisis par l'utilisateur (Montant total). */
export function getTotalIncomeEntries(entries: BudgetIncomeEntry[]): number {
  return entries.reduce((total, entry) => total + entry.amount, 0)
}

/** Poids appliqué à une dépense « Mon compte » sur le Montant total selon la périodicité de sa sous-catégorie. */
export function getMonCompteWeight(period: BudgetPeriod): number {
  return period === 'week' ? 4 : 1
}

/**
 * Montant retiré du Montant total par les prévisions de « Mon compte » : chaque sous-catégorie
 * « mois » compte son montant prévu une fois, chaque sous-catégorie « semaine » compte son
 * montant prévu quatre fois.
 */
export function getMonComptePrevisions(categories: BudgetCategory[]): number {
  return categories.reduce((total, category) => total + category.amount * getMonCompteWeight(category.period), 0)
}

/**
 * Solde affiché en tête de l'écran « Mon compte » (#28) : la prévision « Mon compte » du Budget
 * (semaine ×4, mois ×1), diminuée de toutes les dépenses des sous-catégories du mois de
 * `referenceDate`. Contrairement à la page Budget, où la valeur reste fixe, ce solde baisse à
 * chaque dépense saisie et se « reconfigure » au changement de mois.
 */
export function getMonCompteSolde(
  categories: BudgetCategory[],
  entries: BudgetEntry[],
  referenceDate: string,
): number {
  const monthBounds = getPeriodBounds('month', referenceDate)
  const categoryIds = new Set(categories.map((category) => category.id))
  const spent = entries
    .filter((entry) => categoryIds.has(entry.category_id) && isDateInPeriod(entry.date, monthBounds))
    .reduce((total, entry) => total + entry.amount, 0)
  return getMonComptePrevisions(categories) - spent
}

/** Montant total après effet des livrets et des prévisions de « Mon compte » (revenus - livrets - prévisions). */
export function getMontantTotal(
  incomeEntries: BudgetIncomeEntry[],
  deposits: BudgetDeposit[],
  categories: BudgetCategory[],
): number {
  return getTotalIncomeEntries(incomeEntries) - getTotalDeposits(deposits) - getMonComptePrevisions(categories)
}

export function getAccountBalance(deposits: BudgetDeposit[], accountId: string): number {
  return deposits
    .filter((deposit) => deposit.account_id === accountId)
    .reduce((total, deposit) => total + deposit.amount, 0)
}
