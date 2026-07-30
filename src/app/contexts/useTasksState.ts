import { useState } from 'react'
import { listItemRepo, newId, subTaskRepo, taskRepo } from '@/app/repositories'
import { scheduleSubTask as scheduleSubTaskRule, reportSubTask as reportSubTaskRule, renameSubTask as renameSubTaskRule } from '@/domain/rules/subTaskRules'
import { createListItem as createListItemRule } from '@/domain/rules/listRules'
import type { Task, TaskStatus } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'
import type { PlannedSubTask } from '@/app/contexts/usePlanningState'

/** Tâches V1 (boîte de réception et journée) et leurs sous-tâches. */
export function useTasksState() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [todaySubTasksMap, setTodaySubTasksMap] = useState<Record<string, SubTask[]>>({})
  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [inboxSubTasksMap, setInboxSubTasksMap] = useState<Record<string, SubTask[]>>({})
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  async function load() {
    const [inbox, today] = await Promise.all([taskRepo.getByStatus('inbox'), taskRepo.getTodayTasks()])
    const subTaskArrays = await Promise.all(today.map((t) => subTaskRepo.getByTaskId(t.id)))
    const subTasksMap: Record<string, SubTask[]> = {}
    today.forEach((t, i) => {
      subTasksMap[t.id] = subTaskArrays[i]
    })
    const inboxSubTaskArrays = await Promise.all(inbox.map((t) => subTaskRepo.getByTaskId(t.id)))
    const inboxSubTasksMapNext: Record<string, SubTask[]> = {}
    inbox.forEach((t, i) => {
      inboxSubTasksMapNext[t.id] = inboxSubTaskArrays[i]
    })
    setInboxTasks(inbox)
    setInboxSubTasksMap(inboxSubTasksMapNext)
    setTodayTasks(today)
    setTodaySubTasksMap(subTasksMap)
  }

  function reset() {
    setTodayTasks([])
    setInboxTasks([])
    setSelectedTaskId(null)
  }

  async function addTask(title: string) {
    const now = new Date().toISOString()
    const task: Task = {
      id: newId(),
      title,
      status: 'today',
      position: todayTasks.length,
      created_at: now,
      updated_at: now,
      completed_at: null,
    }
    await taskRepo.create(task)
    setTodayTasks((prev) => [...prev, task])
  }

  async function createTaskInbox(title: string) {
    const now = new Date().toISOString()
    const task: Task = {
      id: newId(),
      title,
      status: 'inbox',
      position: inboxTasks.length,
      created_at: now,
      updated_at: now,
      completed_at: null,
    }
    await taskRepo.create(task)
    setInboxTasks((prev) => [...prev, task])
  }

  async function moveTodoTaskToList(taskId: string, listId: string) {
    const task = await taskRepo.getById(taskId)
    if (!task) return
    const now = new Date().toISOString()
    const existing = await listItemRepo.getByListId(listId)
    const item = createListItemRule(newId(), listId, task.title, existing.length, now)
    await listItemRepo.create(item)
    const subs = await subTaskRepo.getByTaskId(taskId)
    await Promise.all(subs.map((st) => subTaskRepo.delete(st.id)))
    await taskRepo.delete(taskId)
    await load()
  }

  async function moveTask(id: string, status: TaskStatus) {
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update({ ...task, status, updated_at: new Date().toISOString() })
    await load()
  }

  async function completeTask(id: string) {
    const task = await taskRepo.getById(id)
    if (!task) return
    const now = new Date().toISOString()
    await taskRepo.update({ ...task, status: 'completed', completed_at: now, updated_at: now })
    await load()
  }

  async function deleteTask(id: string) {
    const subs = await subTaskRepo.getByTaskId(id)
    await Promise.all(subs.map((st) => subTaskRepo.delete(st.id)))
    await taskRepo.delete(id)
    await load()
  }

  async function updateTaskTitle(id: string, title: string) {
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update({ ...task, title, updated_at: new Date().toISOString() })
    await load()
  }

  async function reorderTodayTasks(ids: string[]) {
    await taskRepo.reorder(ids)
    await load()
  }

  async function addSubTask(taskId: string, title: string) {
    const existing = await subTaskRepo.getByTaskId(taskId)
    const subTask: SubTask = {
      id: newId(),
      task_id: taskId,
      title,
      is_completed: false,
      position: existing.length,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
    }
    await subTaskRepo.create(subTask)
    await load()
  }

  async function deleteSubTask(id: string) {
    await subTaskRepo.delete(id)
  }

  async function toggleSubTask(subTask: SubTask) {
    await subTaskRepo.update({ ...subTask, is_completed: !subTask.is_completed })
    await load()
  }

  async function reorderSubTasks(_taskId: string, ids: string[]) {
    await subTaskRepo.reorder(ids)
    await load()
  }

  async function getSubTasks(taskId: string): Promise<SubTask[]> {
    return subTaskRepo.getByTaskId(taskId)
  }

  async function getPlannedSubTasksForDate(date: string): Promise<PlannedSubTask[]> {
    const subs = await subTaskRepo.getByDate(date)
    const parents = await Promise.all(subs.map((s) => taskRepo.getById(s.task_id)))
    return subs.map((s, i) => ({ ...s, parentTitle: parents[i]?.title ?? '' }))
  }

  async function scheduleSubTaskV2(subTaskId: string, date: string, start: string, end: string) {
    const subTask = await subTaskRepo.getById(subTaskId)
    if (!subTask) return
    await subTaskRepo.update(scheduleSubTaskRule(subTask, date, start, end))
  }

  async function reportSubTaskV2(subTaskId: string, date: string, start: string, end: string) {
    const subTask = await subTaskRepo.getById(subTaskId)
    if (!subTask) return
    await subTaskRepo.update(reportSubTaskRule(subTask, date, start, end))
  }

  async function renameSubTaskV2(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const subTask = await subTaskRepo.getById(id)
    if (!subTask) return
    await subTaskRepo.update(renameSubTaskRule(subTask, trimmed))
  }

  return {
    todayTasks,
    todaySubTasksMap,
    inboxTasks,
    inboxSubTasksMap,
    selectedTaskId,
    selectTask: setSelectedTaskId,
    addTask,
    createTaskInbox,
    moveTodoTaskToList,
    moveTask,
    completeTask,
    deleteTask,
    updateTaskTitle,
    reorderTodayTasks,
    addSubTask,
    deleteSubTask,
    toggleSubTask,
    reorderSubTasks,
    getSubTasks,
    getPlannedSubTasksForDate,
    scheduleSubTaskV2,
    reportSubTaskV2,
    renameSubTaskV2,
    load,
    reset,
  }
}
