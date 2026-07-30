import { useState } from 'react'
import { newId, subTaskRepo, taskRepo, taskV2Repo, todayDate } from '@/app/repositories'
import {
  createTaskV2 as createTaskV2Rule,
  scheduleTaskV2 as scheduleTaskV2Rule,
  toggleTaskV2Completion as toggleTaskV2CompletionRule,
  toggleEssentialV2 as toggleEssentialV2Rule,
  setEnergyCostV2 as setEnergyCostV2Rule,
  reportTaskV2 as reportTaskV2Rule,
  renameTaskV2 as renameTaskV2Rule,
} from '@/domain/rules/taskRulesV2'
import type { TaskV2, TaskStatusV2 } from '@/domain/entities/taskV2'
import type { SubTask } from '@/domain/entities/subTask'

export interface PendingPlanTask {
  kind: 'task' | 'subtask'
  title: string
  sourceTaskId?: string
  taskId?: string
  subTaskId?: string
}

export interface PlannedSubTask extends SubTask {
  parentTitle: string
}

export type MovingPlanItem =
  | { kind: 'task'; task: TaskV2; report: boolean }
  | { kind: 'subtask'; subTask: PlannedSubTask; report: boolean }

/**
 * Tâches planifiées (V2) et opérations de placement sur le planning.
 * `reloadTasks` rafraîchit les tâches V1 quand une tâche source est consommée.
 */
export function usePlanningState(reloadTasks: () => Promise<void>) {
  const [todayPlannedTasks, setTodayPlannedTasks] = useState<TaskV2[]>([])
  const [pendingPlanTask, setPendingPlanTask] = useState<PendingPlanTask | null>(null)
  const [movingTask, setMovingTask] = useState<MovingPlanItem | null>(null)
  const [planningTargetDate, setPlanningTargetDate] = useState<string | null>(null)

  async function load() {
    setTodayPlannedTasks(await taskV2Repo.getByDate(todayDate()))
  }

  function reset() {
    setTodayPlannedTasks([])
  }

  async function createTaskV2Dest(title: string, status: TaskStatusV2): Promise<string> {
    const now = new Date().toISOString()
    const task = createTaskV2Rule(newId(), title, status, false, now)
    await taskV2Repo.create(task)
    return task.id
  }

  async function scheduleV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    await taskV2Repo.update(scheduleTaskV2Rule(task, date, start, end, new Date().toISOString()))
    await load()
  }

  async function getPlannedTasksForDate(date: string): Promise<TaskV2[]> {
    const tasks = await taskV2Repo.getByDate(date)
    return tasks.sort((a, b) => (a.scheduled_start ?? '').localeCompare(b.scheduled_start ?? ''))
  }

  async function completeV2Task(taskId: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    await taskV2Repo.update(toggleTaskV2CompletionRule(task, new Date().toISOString()))
    await load()
  }

  async function renameV2Task(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const task = await taskV2Repo.getById(id)
    if (!task) return
    await taskV2Repo.update(renameTaskV2Rule(task, trimmed, new Date().toISOString()))
    await load()
  }

  async function deleteV2Task(id: string) {
    await taskV2Repo.delete(id)
    await load()
  }

  async function reportV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    await taskV2Repo.update(reportTaskV2Rule(task, date, start, end, new Date().toISOString()))
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
    const base = createTaskV2Rule(newId(), title, 'planned', false, now)
    let scheduled = scheduleTaskV2Rule(base, date, start, end, now)
    scheduled = setEnergyCostV2Rule(scheduled, energyCost, now)
    if (essential) scheduled = toggleEssentialV2Rule(scheduled, now)
    await taskV2Repo.create(scheduled)
    if (sourceTaskId) {
      const subs = await subTaskRepo.getByTaskId(sourceTaskId)
      await Promise.all(subs.map((st) => subTaskRepo.delete(st.id)))
      await taskRepo.delete(sourceTaskId)
      await reloadTasks()
    }
    await load()
    setPendingPlanTask({ kind: 'task', title, taskId: scheduled.id })
    return scheduled.id
  }

  function startMoveTask(task: TaskV2, report: boolean) {
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
