import type { Task } from '@/domain/entities/task'

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
