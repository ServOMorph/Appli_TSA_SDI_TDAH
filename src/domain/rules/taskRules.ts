import type { Task, TaskStatus } from '@/domain/entities/task'
import { isValidEnergyValue } from '@/domain/rules/energyRules'

export function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position)
}

export function nextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((i) => i.position)) + 1
}

export function createTask(
  id: string,
  title: string,
  status: TaskStatus,
  essential: boolean,
  now: string,
  parentId: string | null = null,
  position = 0,
): Task {
  return {
    id,
    parent_id: parentId,
    title,
    description: '',
    status,
    essential,
    energy_cost: null,
    postponed: false,
    position,
    scheduled_date: null,
    scheduled_start: null,
    scheduled_end: null,
    duration_minutes: null,
    icon: null,
    color: null,
    recurrence_id: null,
    is_recurrence_root: false,
    recurrence_exception: false,
    created_at: now,
    updated_at: now,
    completed_at: null,
  }
}

export function isCompleted(task: Pick<Task, 'status'>): boolean {
  return task.status === 'completed'
}

export function isSubTask(task: Pick<Task, 'parent_id'>): boolean {
  return task.parent_id !== null
}

export function getSubTasks(tasks: Task[], parentId: string): Task[] {
  return sortByPosition(tasks.filter((t) => t.parent_id === parentId))
}

export function getSubTaskCounts(subTasks: Pick<Task, 'status'>[]): { done: number; total: number } {
  return {
    done: subTasks.filter(isCompleted).length,
    total: subTasks.length,
  }
}

export function completeTask(task: Task, now: string): Task {
  return {
    ...task,
    status: 'completed',
    completed_at: now,
    updated_at: now,
  }
}

/** Rétablit l'état non terminé : planifié si la tâche porte un créneau, en réception sinon. */
export function uncompleteTask(task: Task, now: string): Task {
  return {
    ...task,
    status: task.scheduled_date ? 'planned' : 'inbox',
    completed_at: null,
    updated_at: now,
  }
}

export function toggleTaskCompletion(task: Task, now: string): Task {
  return isCompleted(task) ? uncompleteTask(task, now) : completeTask(task, now)
}

export function scheduleTask(task: Task, date: string, start: string, end: string, now: string): Task {
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

export function reportTask(task: Task, date: string, start: string, end: string, now: string): Task {
  return {
    ...scheduleTask(task, date, start, end, now),
    postponed: true,
  }
}

/** Additionne des minutes à une heure "HH:MM", en s'arrêtant à la fin de la journée affichée (23:59). */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = Math.min(h * 60 + m + Math.max(0, minutes), 23 * 60 + 59)
  const endH = Math.floor(total / 60)
  const endM = total % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

export function renameTask(task: Task, title: string, now: string): Task {
  return {
    ...task,
    title,
    updated_at: now,
  }
}

export function toggleEssential(task: Task, now: string): Task {
  return {
    ...task,
    essential: !task.essential,
    updated_at: now,
  }
}

export function setEnergyCost(task: Task, cost: number | null, now: string): Task {
  if (cost !== null && !isValidEnergyValue(cost)) return task
  return {
    ...task,
    energy_cost: cost,
    updated_at: now,
  }
}

export function getRemainingPlannedCost(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === 'planned')
    .reduce((sum, t) => sum + (t.energy_cost ?? 0), 0)
}

export const SLOTS_PER_DAY = 48

function timeToSlotIndex(time: string): number | null {
  const [h, m] = time.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 2 + (m >= 30 ? 1 : 0)
}

export interface Scheduled {
  scheduled_start: string | null
  scheduled_end: string | null
}

export function taskSlotRange(task: Scheduled): { start: number; end: number } | null {
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

export function taskOccupiesSlot(task: Scheduled, slot: number): boolean {
  const range = taskSlotRange(task)
  if (!range) return false
  return slot >= range.start && slot <= range.end
}
