import type { Routine } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'

export function createRoutine(id: string, name: string, now: string, color: string | null = null): Routine {
  return { id, name, color, created_at: now, updated_at: now }
}

export function createRoutineStep(
  id: string,
  routineId: string,
  title: string,
  position: number,
  now: string,
  durationMinutes: number | null = null,
  weekday: number | null = null,
): RoutineStep {
  return { id, routine_id: routineId, title, position, duration_minutes: durationMinutes, weekday, created_at: now, updated_at: now }
}

/**
 * Étapes effectives d'une routine pour un jour de semaine donné : les étapes communes
 * (`weekday: null`) tant que ce jour n'a pas été détaché, sinon uniquement celles propres à ce
 * jour (`weekday` égal au jour), triées par position.
 */
export function resolveRoutineStepsForWeekday(steps: RoutineStep[], weekday: number, overridden: boolean): RoutineStep[] {
  return steps.filter((s) => (overridden ? s.weekday === weekday : s.weekday === null)).sort((a, b) => a.position - b.position)
}

/** Les 4 chiffres saisis au pavé numérique, dans l'ordre : dizaine heures, unité heures, dizaine minutes, unité minutes. */
export type KeypadDigits = [string | null, string | null, string | null, string | null]

export function emptyKeypadDigits(): KeypadDigits {
  return [null, null, null, null]
}

/** Position du prochain chiffre attendu (0 à 3), ou -1 si les 4 chiffres sont déjà saisis. */
function nextKeypadPosition(digits: KeypadDigits): number {
  return digits.findIndex((d) => d === null)
}

/** Un chiffre n'est acceptable que s'il garde l'heure dans 00:00-23:59. */
export function isKeypadDigitAllowed(digits: KeypadDigits, digit: string): boolean {
  const position = nextKeypadPosition(digits)
  if (position === -1) return false
  const value = Number(digit)
  if (position === 0) return value <= 2
  if (position === 1) return digits[0] === '2' ? value <= 3 : true
  if (position === 2) return value <= 5
  return true
}

export function pressKeypadDigit(digits: KeypadDigits, digit: string): KeypadDigits {
  if (!isKeypadDigitAllowed(digits, digit)) return digits
  const position = nextKeypadPosition(digits)
  const next = [...digits] as KeypadDigits
  next[position] = digit
  return next
}

/** "HH:MM" une fois les 4 chiffres saisis, sinon null. */
export function keypadTime(digits: KeypadDigits): string | null {
  if (digits.some((d) => d === null)) return null
  return `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`
}

/** Une occurrence de routine (un jour donné) est terminée quand toutes ses étapes le sont, jamais si elle n'en a aucune. */
export function isRoutineOccurrenceCompleted(stepIds: string[], completedStepIds: Set<string>): boolean {
  return stepIds.length > 0 && stepIds.every((id) => completedStepIds.has(id))
}
