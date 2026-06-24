import type { Task } from '@/domain/entities/task'
import { sortByPosition } from './taskRules'

export type ActionType = 'task' | 'empty'

export interface ActionImmediate {
  type: ActionType
  task?: Task
}

export function getActionImmediate(todayTasks: Task[]): ActionImmediate {
  const sorted = sortByPosition(todayTasks)
  const firstIncomplete = sorted.find((t) => t.status === 'today')

  if (firstIncomplete) {
    return { type: 'task', task: firstIncomplete }
  }

  return { type: 'empty' }
}
