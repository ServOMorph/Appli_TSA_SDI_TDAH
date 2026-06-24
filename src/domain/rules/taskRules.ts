import type { Task } from '@/domain/entities/task'

export const TASK_TODAY_MAX = 3

export function canAddToToday(tasks: Task[]): boolean {
  const todayCount = tasks.filter((t) => t.status === 'today').length
  return todayCount < TASK_TODAY_MAX
}

export function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position)
}

export function nextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((i) => i.position)) + 1
}

export function completeTask(task: Task, now: string): Task {
  return {
    ...task,
    status: 'completed',
    completed_at: now,
    updated_at: now,
  }
}
