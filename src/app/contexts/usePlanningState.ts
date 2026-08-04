import { useState } from 'react'
import { newId, taskRepo, taskRecurrenceRepo, todayDate } from '@/app/repositories'
import {
  createTask as createTaskRule,
  scheduleTask as scheduleTaskRule,
  toggleTaskCompletion as toggleTaskCompletionRule,
  toggleEssential as toggleEssentialRule,
  setEnergyCost as setEnergyCostRule,
  reportTask as reportTaskRule,
  renameTask as renameTaskRule,
  addMinutesToTime,
} from '@/domain/rules/taskRules'
import { generateOccurrenceDates, isValidRecurrence } from '@/domain/rules/taskRecurrenceRules'
import type { Task, TaskStatus } from '@/domain/entities/task'
import type { RecurrenceFrequency, RecurrenceEndType } from '@/domain/entities/taskRecurrence'

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

export interface RecurrenceRuleInput {
  frequency: RecurrenceFrequency
  interval: number
  weekdays: number[] | null
  end_type: RecurrenceEndType
  end_date: string | null
  end_count: number | null
}

export interface DetailedTaskInput {
  title: string
  description: string
  icon: string | null
  color: string | null
  energyCost: number | null
  essential: boolean
  durationMinutes: number | null
  date: string | null
  startTime: string | null
  status: TaskStatus
  recurrence: RecurrenceRuleInput | null
}

export type TaskEditScope = 'occurrence' | 'series'

export interface TaskFieldEdit {
  title?: string
  description?: string
  icon?: string | null
  color?: string | null
  energyCost?: number | null
  essential?: boolean
  date?: string
  startTime?: string | null
  durationMinutes?: number | null
}

const RECURRENCE_MATERIALIZATION_DAYS = 90

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

  async function createTaskDest(title: string, status: TaskStatus): Promise<string> {
    const now = new Date().toISOString()
    const task = createTaskRule(newId(), title, status, false, now)
    await taskRepo.create(task)
    return task.id
  }

  async function scheduleTask(taskId: string, date: string, start: string, end: string) {
    const task = await taskRepo.getById(taskId)
    if (!task) return
    await taskRepo.update(scheduleTaskRule(task, date, start, end, new Date().toISOString()))
    await load()
  }

  async function getPlannedTasksForDate(date: string): Promise<Task[]> {
    const tasks = await taskRepo.getRootByDate(date)
    return tasks.sort((a, b) => (a.scheduled_start ?? '').localeCompare(b.scheduled_start ?? ''))
  }

  async function completeTaskById(taskId: string) {
    const task = await taskRepo.getById(taskId)
    if (!task) return
    await taskRepo.update(toggleTaskCompletionRule(task, new Date().toISOString()))
    await load()
  }

  async function renameTaskById(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update(renameTaskRule(task, trimmed, new Date().toISOString()))
    await load()
  }

  async function deleteTaskById(id: string) {
    await taskRepo.deleteWithChildren(id)
    await load()
  }

  async function reportTaskById(taskId: string, date: string, start: string, end: string) {
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

  /**
   * Crée une tâche avec l'ensemble des champs de la fiche (icône, couleur, description,
   * durée, récurrence). Si `input.recurrence` est fourni et valide, matérialise aussi les
   * occurrences futures sur une fenêtre de {@link RECURRENCE_MATERIALIZATION_DAYS} jours.
   */
  async function createDetailedTask(input: DetailedTaskInput, sourceTaskId?: string): Promise<string> {
    const trimmed = input.title.trim()
    const now = new Date().toISOString()
    let task = createTaskRule(newId(), trimmed, input.status, input.essential, now)
    task = { ...task, description: input.description, icon: input.icon, color: input.color }
    task = setEnergyCostRule(task, input.energyCost, now)

    if (input.date && input.startTime) {
      const end = addMinutesToTime(input.startTime, input.durationMinutes ?? 0)
      task = scheduleTaskRule(task, input.date, input.startTime, end, now)
    }

    const occurrences: Task[] = []
    if (input.recurrence && input.date && isValidRecurrence(input.recurrence)) {
      const recurrenceId = newId()
      const recurrence = {
        id: recurrenceId,
        frequency: input.recurrence.frequency,
        interval: input.recurrence.interval,
        weekdays: input.recurrence.weekdays,
        end_type: input.recurrence.end_type,
        end_date: input.recurrence.end_date,
        end_count: input.recurrence.end_count,
        created_at: now,
        updated_at: now,
      }
      await taskRecurrenceRepo.create(recurrence)
      task = { ...task, recurrence_id: recurrenceId, is_recurrence_root: true }

      const windowEnd = new Date(Date.UTC(...(input.date.split('-').map(Number) as [number, number, number])))
      windowEnd.setUTCDate(windowEnd.getUTCDate() + RECURRENCE_MATERIALIZATION_DAYS)
      const dates = generateOccurrenceDates(
        recurrence,
        input.date,
        input.date,
        windowEnd.toISOString().slice(0, 10),
      ).filter((d) => d !== input.date)

      for (const date of dates) {
        let occurrence = createTaskRule(newId(), trimmed, input.status, input.essential, now)
        occurrence = { ...occurrence, description: input.description, icon: input.icon, color: input.color }
        occurrence = setEnergyCostRule(occurrence, input.energyCost, now)
        if (input.startTime) {
          const end = addMinutesToTime(input.startTime, input.durationMinutes ?? 0)
          occurrence = scheduleTaskRule(occurrence, date, input.startTime, end, now)
        }
        occurrence = { ...occurrence, recurrence_id: recurrenceId, is_recurrence_root: false }
        occurrences.push(occurrence)
      }
    }

    await taskRepo.create(task)
    for (const occurrence of occurrences) {
      await taskRepo.create(occurrence)
    }
    if (sourceTaskId) {
      await taskRepo.deleteWithChildren(sourceTaskId)
    }
    await reloadTasks()
    await load()
    return task.id
  }

  /** Charge une tâche directement depuis le dépôt, sans dépendre des listes déjà en mémoire. */
  async function getTaskById(id: string): Promise<Task | undefined> {
    return taskRepo.getById(id)
  }

  async function duplicateTaskById(id: string): Promise<string | undefined> {
    const task = await taskRepo.getById(id)
    if (!task) return undefined
    const now = new Date().toISOString()
    const copy: Task = {
      ...task,
      id: newId(),
      title: `${task.title} (copie)`,
      status: task.status === 'completed' ? 'inbox' : task.status,
      recurrence_id: null,
      is_recurrence_root: false,
      recurrence_exception: false,
      created_at: now,
      updated_at: now,
      completed_at: null,
    }
    await taskRepo.create(copy)
    await reloadTasks()
    await load()
    return copy.id
  }

  function applyFieldEdit(task: Task, edit: TaskFieldEdit, includeDate: boolean, now: string): Task {
    let next = { ...task }
    if (edit.title !== undefined) next.title = edit.title
    if (edit.description !== undefined) next.description = edit.description
    if (edit.icon !== undefined) next.icon = edit.icon
    if (edit.color !== undefined) next.color = edit.color
    if (edit.essential !== undefined) next.essential = edit.essential
    if (edit.energyCost !== undefined) next = setEnergyCostRule(next, edit.energyCost, now)
    if (includeDate && edit.date !== undefined) next.scheduled_date = edit.date

    const nextDuration = edit.durationMinutes !== undefined ? edit.durationMinutes : next.duration_minutes
    if (edit.startTime !== undefined) {
      next.scheduled_start = edit.startTime
      next.duration_minutes = nextDuration
      next.scheduled_end = edit.startTime ? addMinutesToTime(edit.startTime, nextDuration ?? 0) : null
    } else if (edit.durationMinutes !== undefined && next.scheduled_start) {
      next.duration_minutes = edit.durationMinutes
      next.scheduled_end = addMinutesToTime(next.scheduled_start, edit.durationMinutes ?? 0)
    }
    next.updated_at = now
    return next
  }

  /**
   * Modifie une tâche. Si elle appartient à une série récurrente : `'occurrence'` détache
   * uniquement cette occurrence (`recurrence_exception: true`), `'series'` propage le
   * changement à cette occurrence et à toutes les occurrences futures non détachées de la
   * série (la date elle-même n'est jamais propagée, seule l'occurrence éditée peut être
   * déplacée à une nouvelle date).
   */
  async function updateTaskFields(id: string, edit: TaskFieldEdit, scope: TaskEditScope = 'occurrence'): Promise<void> {
    const task = await taskRepo.getById(id)
    if (!task) return
    const now = new Date().toISOString()

    if (task.recurrence_id && scope === 'series') {
      const series = await taskRepo.getByRecurrenceId(task.recurrence_id)
      const targets = series.filter(
        (t) => !t.recurrence_exception && (t.scheduled_date ?? '') >= (task.scheduled_date ?? ''),
      )
      for (const target of targets) {
        await taskRepo.update(applyFieldEdit(target, edit, false, now))
      }
    } else {
      let updated = applyFieldEdit(task, edit, true, now)
      if (task.recurrence_id) updated = { ...updated, recurrence_exception: true }
      await taskRepo.update(updated)
    }
    await reloadTasks()
    await load()
  }

  /**
   * Supprime une tâche. `'occurrence'` ne retire que cette occurrence, `'series'` retire
   * cette occurrence et toutes les occurrences futures non détachées de la série.
   */
  async function deleteTaskScoped(id: string, scope: TaskEditScope = 'occurrence'): Promise<void> {
    const task = await taskRepo.getById(id)
    if (!task) return
    if (task.recurrence_id && scope === 'series') {
      const series = await taskRepo.getByRecurrenceId(task.recurrence_id)
      const targets = series.filter(
        (t) => !t.recurrence_exception && (t.scheduled_date ?? '') >= (task.scheduled_date ?? ''),
      )
      for (const target of targets) {
        await taskRepo.deleteWithChildren(target.id)
      }
    } else {
      await taskRepo.deleteWithChildren(id)
    }
    await reloadTasks()
    await load()
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
    createTaskDest,
    scheduleTask,
    getPlannedTasksForDate,
    completeTaskById,
    renameTaskById,
    deleteTaskById,
    reportTaskById,
    startPlanTask,
    startPlanSubTask,
    clearPendingPlanTask,
    schedulePendingTask,
    createDetailedTask,
    getTaskById,
    duplicateTaskById,
    updateTaskFields,
    deleteTaskScoped,
    startMoveTask,
    startMoveSubTask,
    clearMoveTask,
    load,
    reset,
  }
}
