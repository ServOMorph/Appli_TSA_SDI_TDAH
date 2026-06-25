import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'
import { sortByPosition } from './taskRules'

export type ActionType = 'task' | 'empty'

export interface ActionImmediate {
  type: ActionType
  task?: Task
  nextSubTask?: SubTask
}

export function getActionImmediate(
  todayTasks: Task[],
  subTasksMap: Record<string, SubTask[]> = {}
): ActionImmediate {
  const sorted = sortByPosition(todayTasks)
  const firstIncomplete = sorted.find((t) => t.status === 'today')

  if (!firstIncomplete) return { type: 'empty' }

  const subTasks = subTasksMap[firstIncomplete.id] ?? []
  const nextSubTask = subTasks
    .filter((st) => !st.is_completed)
    .sort((a, b) => a.position - b.position)[0]

  return { type: 'task', task: firstIncomplete, nextSubTask }
}
