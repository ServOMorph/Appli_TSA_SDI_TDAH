import type { TaskRecurrence } from '@/domain/entities/taskRecurrence'

const MAX_SCAN_DAYS = 365 * 5
const DAY_MS = 86400000

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

function startOfWeek(date: Date): Date {
  return addDays(date, -date.getUTCDay())
}

function matchesFrequency(recurrence: TaskRecurrence, anchor: Date, candidate: Date): boolean {
  const interval = Math.max(1, recurrence.interval)
  switch (recurrence.frequency) {
    case 'daily': {
      const days = Math.round((candidate.getTime() - anchor.getTime()) / DAY_MS)
      return days % interval === 0
    }
    case 'weekly': {
      const weekdays = recurrence.weekdays && recurrence.weekdays.length > 0 ? recurrence.weekdays : [anchor.getUTCDay()]
      if (!weekdays.includes(candidate.getUTCDay())) return false
      const weeks = Math.round((startOfWeek(candidate).getTime() - startOfWeek(anchor).getTime()) / (7 * DAY_MS))
      return weeks % interval === 0
    }
    case 'monthly': {
      if (candidate.getUTCDate() !== anchor.getUTCDate()) return false
      const months =
        (candidate.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + (candidate.getUTCMonth() - anchor.getUTCMonth())
      return months % interval === 0
    }
    case 'yearly': {
      if (candidate.getUTCMonth() !== anchor.getUTCMonth() || candidate.getUTCDate() !== anchor.getUTCDate()) return false
      const years = candidate.getUTCFullYear() - anchor.getUTCFullYear()
      return years % interval === 0
    }
    default:
      return false
  }
}

/**
 * Dates d'occurrence d'une série récurrente, comprises entre `fromDate` et `toDate`
 * (inclus). Le comptage des fins par nombre d'occurrences (`end_type: 'count'`) part
 * toujours de `anchorDate`, indépendamment de la fenêtre `fromDate`/`toDate` demandée.
 * Un quantième absent d'un mois (ex. le 31 en février) ne produit simplement aucune
 * occurrence ce mois-là plutôt que d'être reporté.
 */
export function generateOccurrenceDates(
  recurrence: TaskRecurrence,
  anchorDate: string,
  fromDate: string,
  toDate: string,
): string[] {
  const anchor = parseDate(anchorDate)
  const from = parseDate(fromDate)
  const to = parseDate(toDate)
  const endDate = recurrence.end_type === 'date' && recurrence.end_date ? parseDate(recurrence.end_date) : null
  const scanEnd = endDate && endDate.getTime() < to.getTime() ? endDate : to

  const results: string[] = []
  let count = 0
  for (let offset = 0; offset <= MAX_SCAN_DAYS; offset++) {
    const candidate = addDays(anchor, offset)
    if (candidate.getTime() > scanEnd.getTime()) break
    if (!matchesFrequency(recurrence, anchor, candidate)) continue
    count++
    if (recurrence.end_type === 'count' && recurrence.end_count !== null && count > recurrence.end_count) break
    if (candidate.getTime() >= from.getTime()) results.push(formatDate(candidate))
  }
  return results
}

/** Première occurrence strictement après `afterDate`, ou null si la série est terminée. */
export function nextOccurrenceAfter(recurrence: TaskRecurrence, anchorDate: string, afterDate: string): string | null {
  const from = formatDate(addDays(parseDate(afterDate), 1))
  const to = formatDate(addDays(parseDate(from), MAX_SCAN_DAYS))
  return generateOccurrenceDates(recurrence, anchorDate, from, to)[0] ?? null
}

export function isValidRecurrence(
  recurrence: Pick<TaskRecurrence, 'frequency' | 'interval' | 'weekdays' | 'end_type' | 'end_date' | 'end_count'>,
): boolean {
  if (!Number.isInteger(recurrence.interval) || recurrence.interval < 1) return false
  if (recurrence.weekdays && recurrence.weekdays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) return false
  if (recurrence.end_type === 'date' && !recurrence.end_date) return false
  if (recurrence.end_type === 'count' && (!recurrence.end_count || recurrence.end_count < 1)) return false
  return true
}
