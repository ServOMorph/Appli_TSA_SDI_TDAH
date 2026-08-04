import { useState } from 'react'
import { listItemRepo, newId, taskRepo } from '@/app/repositories'
import {
  createTask as createTaskRule,
  scheduleTask as scheduleTaskRule,
  reportTask as reportTaskRule,
  renameTask as renameTaskRule,
  toggleTaskCompletion as toggleTaskCompletionRule,
  completeTask as completeTaskRule,
} from '@/domain/rules/taskRules'
import { createListItem as createListItemRule } from '@/domain/rules/listRules'
import type { Task, TaskStatus } from '@/domain/entities/task'
import type { PlannedSubTask } from '@/app/contexts/usePlanningState'

/** Tâches de la réception et de la journée, et leurs sous-étapes. */
export function useTasksState() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [todaySubTasksMap, setTodaySubTasksMap] = useState<Record<string, Task[]>>({})
  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [inboxSubTasksMap, setInboxSubTasksMap] = useState<Record<string, Task[]>>({})
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  async function loadSubTasksMap(tasks: Task[]): Promise<Record<string, Task[]>> {
    const arrays = await Promise.all(tasks.map((t) => taskRepo.getChildren(t.id)))
    const map: Record<string, Task[]> = {}
    tasks.forEach((t, i) => {
      map[t.id] = arrays[i]
    })
    return map
  }

  async function load() {
    const [inbox, today] = await Promise.all([taskRepo.getByStatus('inbox'), taskRepo.getTodayTasks()])
    const [inboxMap, todayMap] = await Promise.all([loadSubTasksMap(inbox), loadSubTasksMap(today)])
    setInboxTasks(inbox)
    setInboxSubTasksMap(inboxMap)
    setTodayTasks(today)
    setTodaySubTasksMap(todayMap)
  }

  function reset() {
    setTodayTasks([])
    setInboxTasks([])
    setSelectedTaskId(null)
  }

  async function addTask(title: string) {
    const now = new Date().toISOString()
    const task = createTaskRule(newId(), title, 'today', false, now, null, todayTasks.length)
    await taskRepo.create(task)
    setTodayTasks((prev) => [...prev, task])
  }

  async function createTaskInbox(title: string) {
    const now = new Date().toISOString()
    const task = createTaskRule(newId(), title, 'inbox', false, now, null, inboxTasks.length)
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
    await taskRepo.deleteWithChildren(taskId)
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
    await taskRepo.update(completeTaskRule(task, new Date().toISOString()))
    await load()
  }

  async function deleteTask(id: string) {
    await taskRepo.deleteWithChildren(id)
    await load()
  }

  async function updateTaskTitle(id: string, title: string) {
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update(renameTaskRule(task, title, new Date().toISOString()))
    await load()
  }

  async function reorderTodayTasks(ids: string[]) {
    await taskRepo.reorder(ids)
    await load()
  }

  async function addSubTask(taskId: string, title: string) {
    const existing = await taskRepo.getChildren(taskId)
    const now = new Date().toISOString()
    const subTask = createTaskRule(newId(), title, 'inbox', false, now, taskId, existing.length)
    await taskRepo.create(subTask)
    await load()
  }

  async function deleteSubTask(id: string) {
    await taskRepo.delete(id)
  }

  async function toggleSubTask(subTask: Task) {
    await taskRepo.update(toggleTaskCompletionRule(subTask, new Date().toISOString()))
    await load()
  }

  async function reorderSubTasks(_taskId: string, ids: string[]) {
    await taskRepo.reorder(ids)
    await load()
  }

  async function getSubTasks(taskId: string): Promise<Task[]> {
    return taskRepo.getChildren(taskId)
  }

  async function getPlannedSubTasksForDate(date: string): Promise<PlannedSubTask[]> {
    const subs = await taskRepo.getChildrenByDate(date)
    const parents = await Promise.all(subs.map((s) => (s.parent_id ? taskRepo.getById(s.parent_id) : undefined)))
    return subs.map((s, i) => ({ ...s, parentTitle: parents[i]?.title ?? '' }))
  }

  async function scheduleSubTask(subTaskId: string, date: string, start: string, end: string) {
    const subTask = await taskRepo.getById(subTaskId)
    if (!subTask) return
    await taskRepo.update(scheduleTaskRule(subTask, date, start, end, new Date().toISOString()))
  }

  async function reportSubTask(subTaskId: string, date: string, start: string, end: string) {
    const subTask = await taskRepo.getById(subTaskId)
    if (!subTask) return
    await taskRepo.update(reportTaskRule(subTask, date, start, end, new Date().toISOString()))
  }

  async function renameSubTask(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const subTask = await taskRepo.getById(id)
    if (!subTask) return
    await taskRepo.update(renameTaskRule(subTask, trimmed, new Date().toISOString()))
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
    scheduleSubTask,
    reportSubTask,
    renameSubTask,
    load,
    reset,
  }
}
