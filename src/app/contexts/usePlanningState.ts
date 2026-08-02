import { useState } from 'react'
import { newId, taskRepo, todayDate } from '@/app/repositories'
import {
  createTask as createTaskRule,
  scheduleTask as scheduleTaskRule,
  toggleTaskCompletion as toggleTaskCompletionRule,
  toggleEssential as toggleEssentialRule,
  setEnergyCost as setEnergyCostRule,
  reportTask as reportTaskRule,
  renameTask as renameTaskRule,
} from '@/domain/rules/taskRules'
import type { Task, TaskStatus } from '@/domain/entities/task'

export interface PendingPlanTask {
  kind: 'task' | 'subtask'
  title: string
  sourceTaskId?: string
  taskId?: string
  subTaskId?: string
}

export interface PlannedSubTask extends Task {
  parentTitle: string
}

export type MovingPlanItem =
  | { kind: 'task'; task: Task; report: boolean }
  | { kind: 'subtask'; subTask: PlannedSubTask; report: boolean }

/**
 * Tâches planifiées et opérations de placement sur le planning.
 * `reloadTasks` rafraîchit la réception et la journée quand une tâche source est consommée.
 */
export function usePlanningState(reloadTasks: () => Promise<void>) {
  const [todayPlannedTasks, setTodayPlannedTasks] = useState<Task[]>([])
  const [pendingPlanTask, setPendingPlanTask] = useState<PendingPlanTask | null>(null)
  const [movingTask, setMovingTask] = useState<MovingPlanItem | null>(null)
  const [planningTargetDate, setPlanningTargetDate] = useState<string | null>(null)

  async function load() {
    setTodayPlannedTasks(await taskRepo.getRootByDate(todayDate()))
  }

  function reset() {
    setTodayPlannedTasks([])
  }

  async function createTaskV2Dest(title: string, status: TaskStatus): Promise<string> {
    const now = new Date().toISOString()
    const task = createTaskRule(newId(), title, status, false, now)
    await taskRepo.create(task)
    return task.id
  }

  async function scheduleV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskRepo.getById(taskId)
    if (!task) return
    await taskRepo.update(scheduleTaskRule(task, date, start, end, new Date().toISOString()))
    await load()
  }

  async function getPlannedTasksForDate(date: string): Promise<Task[]> {
    const tasks = await taskRepo.getRootByDate(date)
    return tasks.sort((a, b) => (a.scheduled_start ?? '').localeCompare(b.scheduled_start ?? ''))
  }

  async function completeV2Task(taskId: string) {
    const task = await taskRepo.getById(taskId)
    if (!task) return
    await taskRepo.update(toggleTaskCompletionRule(task, new Date().toISOString()))
    await load()
  }

  async function renameV2Task(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update(renameTaskRule(task, trimmed, new Date().toISOString()))
    await load()
  }

  async function deleteV2Task(id: string) {
    await taskRepo.deleteWithChildren(id)
    await load()
  }

  async function reportV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskRepo.getById(taskId)
    if (!task) return
    await taskRepo.update(reportTaskRule(task, date, start, end, new Date().toISOString()))
    await load()
  }

  function startPlanTask(title: string, sourceTaskId?: string) {
    setPendingPlanTask({ kind: 'task', title, sourceTaskId })
  }

  function startPlanSubTask(subTaskId: string, title: string) {
    setPendingPlanTask({ kind: 'subtask', title, subTaskId })
  }

  function clearPendingPlanTask() {
    setPendingPlanTask(null)
  }

  async function schedulePendingTask(
    title: string,
    date: string,
    start: string,
    end: string,
    sourceTaskId?: string,
    energyCost: number | null = null,
    essential = false,
  ): Promise<string> {
    const now = new Date().toISOString()
    const base = createTaskRule(newId(), title, 'planned', false, now)
    let scheduled = scheduleTaskRule(base, date, start, end, now)
    scheduled = setEnergyCostRule(scheduled, energyCost, now)
    if (essential) scheduled = toggleEssentialRule(scheduled, now)
    await taskRepo.create(scheduled)
    if (sourceTaskId) {
      await taskRepo.deleteWithChildren(sourceTaskId)
      await reloadTasks()
    }
    await load()
    setPendingPlanTask({ kind: 'task', title, taskId: scheduled.id })
    return scheduled.id
  }

  function startMoveTask(task: Task, report: boolean) {
    setMovingTask({ kind: 'task', task, report })
  }

  function startMoveSubTask(subTask: PlannedSubTask, report: boolean) {
    setMovingTask({ kind: 'subtask', subTask, report })
  }

  function clearMoveTask() {
    setMovingTask(null)
  }

  return {
    todayPlannedTasks,
    pendingPlanTask,
    movingTask,
    planningTargetDate,
    setPlanningTargetDate,
    createTaskV2Dest,
    scheduleV2Task,
    getPlannedTasksForDate,
    completeV2Task,
    renameV2Task,
    deleteV2Task,
    reportV2Task,
    startPlanTask,
    startPlanSubTask,
    clearPendingPlanTask,
    schedulePendingTask,
    startMoveTask,
    startMoveSubTask,
    clearMoveTask,
    load,
    reset,
  }
}
