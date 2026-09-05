import type { TaskCategory } from '@/domain/entities/taskCategory'

export function createTaskCategory(
  id: string,
  name: string,
  color: string,
  position: number,
  now: string,
): TaskCategory {
  return { id, name, color, position, created_at: now }
}
