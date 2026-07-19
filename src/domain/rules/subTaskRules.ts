import type { SubTask } from '@/domain/entities/subTask'

export function scheduleSubTask(subTask: SubTask, date: string, start: string, end: string): SubTask {
  return {
    ...subTask,
    scheduled_date: date,
    scheduled_start: start,
    scheduled_end: end,
    postponed: false,
  }
}

export function reportSubTask(subTask: SubTask, date: string, start: string, end: string): SubTask {
  return {
    ...scheduleSubTask(subTask, date, start, end),
    postponed: true,
  }
}

export function renameSubTask(subTask: SubTask, title: string): SubTask {
  return {
    ...subTask,
    title,
  }
}
