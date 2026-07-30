import { SLOTS_PER_DAY, taskOccupiesSlot, taskSlotRange, type Scheduled } from '@/domain/rules/taskRulesV2'

export const SLOT_INDEXES = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i)

export function slotTime(slot: number): string {
  const hour = Math.floor(slot / 2)
  const minute = slot % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
}

export function slotLabel(slot: number): string {
  const hour = Math.floor(slot / 2)
  const minute = slot % 2 === 0 ? '00' : '30'
  return `${hour}h${minute}`
}

export function slotFromDate(date: Date): number {
  return date.getHours() * 2 + (date.getMinutes() >= 30 ? 1 : 0)
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function formatPlanningDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function slotSpan(item: Scheduled): number {
  const range = taskSlotRange(item)
  return range ? range.end - range.start + 1 : 1
}

export function isRangeAvailable(
  occupied: Scheduled[],
  start: number,
  end: number,
  exclude?: (item: Scheduled) => boolean,
): boolean {
  if (start < 0 || end >= SLOTS_PER_DAY || end < start) return false
  return !occupied.some(
    (item) =>
      !exclude?.(item) &&
      SLOT_INDEXES.slice(start, end + 1).some((slot) => taskOccupiesSlot(item, slot)),
  )
}

export function normalizeRange(a: number, b: number): { start: number; end: number } {
  return { start: Math.min(a, b), end: Math.max(a, b) }
}

export function moveTargetRange(item: Scheduled, slot: number): { start: number; end: number } {
  const length = slotSpan(item)
  return { start: slot, end: slot + length - 1 }
}

export const COLLAPSED_SLOT_COUNT = 6
export const COLLAPSED_SLOTS_BEFORE = 1

/**
 * Créneaux affichés par le planning replié : une fenêtre ancrée sur le créneau
 * courant, décalée pour rester entière en début et en fin de journée.
 */
export function visibleSlotWindow(
  currentSlot: number,
  count: number = COLLAPSED_SLOT_COUNT,
  before: number = COLLAPSED_SLOTS_BEFORE,
): number[] {
  const size = Math.min(count, SLOTS_PER_DAY)
  const maxStart = SLOTS_PER_DAY - size
  const start = Math.max(0, Math.min(currentSlot - before, maxStart))
  return SLOT_INDEXES.slice(start, start + size)
}
