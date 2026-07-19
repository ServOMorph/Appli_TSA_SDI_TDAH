import type { TaskV2, TaskStatusV2 } from '@/domain/entities/taskV2'
import { isValidEnergyValue } from '@/domain/rules/energyRules'

export function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position)
}

export function nextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((i) => i.position)) + 1
}

export function createTaskV2(
  id: string,
  title: string,
  status: TaskStatusV2,
  essential: boolean,
  now: string,
): TaskV2 {
  return {
    id,
    title,
    status,
    essential,
    position: 0,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
    created_at: now,
    updated_at: now,
    completed_at: null,
  }
}

export function completeTaskV2(task: TaskV2, now: string): TaskV2 {
  return {
    ...task,
    status: 'completed',
    completed_at: now,
    updated_at: now,
  }
}

export function toggleTaskV2Completion(task: TaskV2, now: string): TaskV2 {
  if (task.status === 'completed') {
    return {
      ...task,
      status: 'planned',
      completed_at: null,
      updated_at: now,
    }
  }
  return completeTaskV2(task, now)
}

export function scheduleTaskV2(
  task: TaskV2,
  date: string,
  start: string,
  end: string,
  now: string,
): TaskV2 {
  return {
    ...task,
    status: 'planned',
    scheduled_date: date,
    scheduled_start: start,
    scheduled_end: end,
    postponed: false,
    updated_at: now,
  }
}

export function reportTaskV2(
  task: TaskV2,
  date: string,
  start: string,
  end: string,
  now: string,
): TaskV2 {
  return {
    ...scheduleTaskV2(task, date, start, end, now),
    postponed: true,
  }
}

export function renameTaskV2(task: TaskV2, title: string, now: string): TaskV2 {
  return {
    ...task,
    title,
    updated_at: now,
  }
}

export const SLOTS_PER_DAY = 48

function timeToSlotIndex(time: string): number | null {
  const [h, m] = time.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 2 + (m >= 30 ? 1 : 0)
}

export function taskSlotRange(task: TaskV2): { start: number; end: number } | null {
  if (!task.scheduled_start) return null
  const start = timeToSlotIndex(task.scheduled_start)
  if (start === null) return null
  let end = start
  if (task.scheduled_end) {
    const endIndex = timeToSlotIndex(task.scheduled_end)
    if (endIndex !== null) {
      end = Math.max(start, Math.min(endIndex - 1, SLOTS_PER_DAY - 1))
    }
  }
  return { start, end }
}

export function taskOccupiesSlot(task: TaskV2, slot: number): boolean {
  const range = taskSlotRange(task)
  if (!range) return false
  return slot >= range.start && slot <= range.end
}

export function toggleEssentialV2(task: TaskV2, now: string): TaskV2 {
  return {
    ...task,
    essential: !task.essential,
    updated_at: now,
  }
}

export function setEnergyCostV2(task: TaskV2, cost: number | null, now: string): TaskV2 {
  if (cost !== null && !isValidEnergyValue(cost)) return task
  return {
    ...task,
    energy_cost: cost,
    updated_at: now,
  }
}

export function getRemainingPlannedCost(tasks: TaskV2[]): number {
  return tasks
    .filter((t) => t.status === 'planned')
    .reduce((sum, t) => sum + (t.energy_cost ?? 0), 0)
}

