import { createContext, useContext, useEffect, useState } from 'react'
import { AppDatabase } from '@/data/db'
import { UserRepository } from '@/data/repositories/userRepository'
import { TaskRepository } from '@/data/repositories/taskRepository'
import { TaskV2Repository } from '@/data/repositories/taskV2Repository'
import { SubTaskRepository } from '@/data/repositories/subTaskRepository'
import { EnergyEntryRepository } from '@/data/repositories/energyEntryRepository'
import { SettingsRepository } from '@/data/repositories/settingsRepository'
import { ListRepository } from '@/data/repositories/listRepository'
import { ListItemRepository } from '@/data/repositories/listItemRepository'
import { createTaskV2 as createTaskV2Rule, scheduleTaskV2 as scheduleTaskV2Rule, toggleTaskV2Completion as toggleTaskV2CompletionRule, toggleEssentialV2 as toggleEssentialV2Rule, setEnergyCostV2 as setEnergyCostV2Rule, reportTaskV2 as reportTaskV2Rule, renameTaskV2 as renameTaskV2Rule, getRemainingPlannedCost } from '@/domain/rules/taskRulesV2'
import { scheduleSubTask as scheduleSubTaskRule, reportSubTask as reportSubTaskRule, renameSubTask as renameSubTaskRule } from '@/domain/rules/subTaskRules'
import { isOverloaded } from '@/domain/rules/energyRules'
import { createList as createListRule, createListItem as createListItemRule } from '@/domain/rules/listRules'
import type { User, ProfileType } from '@/domain/entities/user'
import type { Task, TaskStatus } from '@/domain/entities/task'
import type { TaskV2, TaskStatusV2 } from '@/domain/entities/taskV2'
import type { SubTask } from '@/domain/entities/subTask'
import type { Settings } from '@/domain/entities/settings'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'

export type Screen =
  | 'welcome'
  | 'profile'
  | 'energy'
  | 'dashboard'
  | 'inbox'
  | 'today'
  | 'task-create-v2'
  | 'planning'
  | 'task-detail'
  | 'task-decompose'
  | 'energy-view'
  | 'energy-checkin'
  | 'overload-recovery'
  | 'resources'
  | 'settings'
  | 'settings-profile'
  | 'settings-accessibility'
  | 'settings-privacy'
  | 'settings-export'
  | 'lists'
  | 'list-detail'
  | 'tools'

interface AppContextValue {
  screen: Screen
  goTo: (s: Screen) => void
  loading: boolean
  currentUser: User | null
  settings: Settings | null
  todayTasks: Task[]
  todaySubTasksMap: Record<string, SubTask[]>
  inboxTasks: Task[]
  inboxSubTasksMap: Record<string, SubTask[]>
  todayEnergy: number | null
  todayEnergyStatus: 'filled' | 'skipped' | null
  todayPlannedTasks: TaskV2[]
  overloadMode: boolean
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  exportData: () => Promise<void>
  deleteAllData: () => Promise<void>
  selectedTaskId: string | null
  selectTask: (id: string | null) => void
  taskDetailOrigin: Screen | null
  setTaskDetailOrigin: (s: Screen) => void
  taskCreateOrigin: Screen | null
  setTaskCreateOrigin: (s: Screen) => void
  createUser: (profile: ProfileType) => Promise<void>
  completeOnboarding: () => Promise<void>
  saveTodayEnergy: (value: number) => Promise<void>
  skipTodayEnergy: () => Promise<void>
  addTask: (title: string) => Promise<void>
  createTaskInbox: (title: string) => Promise<void>
  moveTodoTaskToList: (taskId: string, listId: string) => Promise<void>
  createTaskV2Dest: (title: string, status: TaskStatusV2) => Promise<string>
  scheduleV2Task: (taskId: string, date: string, start: string, end: string) => Promise<void>
  getPlannedTasksForDate: (date: string) => Promise<TaskV2[]>
  pendingPlanTask: PendingPlanTask | null
  startPlanTask: (title: string, sourceTaskId?: string) => void
  startPlanSubTask: (subTaskId: string, title: string) => void
  clearPendingPlanTask: () => void
  schedulePendingTask: (
    title: string,
    date: string,
    start: string,
    end: string,
    sourceTaskId?: string,
    energyCost?: number | null,
    essential?: boolean,
  ) => Promise<string>
  moveTask: (id: string, status: TaskStatus) => Promise<void>
  completeTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addSubTask: (taskId: string, title: string) => Promise<void>
  deleteSubTask: (id: string) => Promise<void>
  toggleSubTask: (subTask: SubTask) => Promise<void>
  reorderSubTasks: (taskId: string, ids: string[]) => Promise<void>
  getSubTasks: (taskId: string) => Promise<SubTask[]>
  getPlannedSubTasksForDate: (date: string) => Promise<PlannedSubTask[]>
  scheduleSubTaskV2: (subTaskId: string, date: string, start: string, end: string) => Promise<void>
  reportSubTaskV2: (subTaskId: string, date: string, start: string, end: string) => Promise<void>
  renameSubTaskV2: (id: string, title: string) => Promise<void>
  updateTaskTitle: (id: string, title: string) => Promise<void>
  reorderTodayTasks: (ids: string[]) => Promise<void>
  refreshDashboard: () => Promise<void>
  lists: List[]
  selectedListId: string | null
  selectList: (id: string | null) => void
  createList: (name: string) => Promise<string>
  renameList: (id: string, name: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  completeV2Task: (taskId: string) => Promise<void>
  renameV2Task: (id: string, title: string) => Promise<void>
  deleteV2Task: (id: string) => Promise<void>
  reportV2Task: (taskId: string, date: string, start: string, end: string) => Promise<void>
  movingTask: MovingPlanItem | null
  startMoveTask: (task: TaskV2, report: boolean) => void
  startMoveSubTask: (subTask: PlannedSubTask, report: boolean) => void
  clearMoveTask: () => void
  planningTargetDate: string | null
  setPlanningTargetDate: (date: string | null) => void
  getListItems: (listId: string) => Promise<ListItem[]>
  addListItem: (listId: string, title: string) => Promise<void>
  deleteListItem: (id: string) => Promise<void>
}

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

export const AppContext = createContext<AppContextValue | null>(null)

const db = new AppDatabase()
const userRepo = new UserRepository(db)
const taskRepo = new TaskRepository(db)
const taskV2Repo = new TaskV2Repository(db)
const subTaskRepo = new SubTaskRepository(db)
const energyRepo = new EnergyEntryRepository(db)
const settingsRepo = new SettingsRepository(db)
const listRepo = new ListRepository(db)
const listItemRepo = new ListItemRepository(db)

function todayDate(): string {
  if (import.meta.env.DEV) {
    const fake = localStorage.getItem('dev_fake_date')
    if (fake) return fake
  }
  return new Date().toISOString().slice(0, 10)
}

function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  return [...b]
    .map((v, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + v.toString(16).padStart(2, '0'))
    .join('')
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [todaySubTasksMap, setTodaySubTasksMap] = useState<Record<string, SubTask[]>>({})
  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [inboxSubTasksMap, setInboxSubTasksMap] = useState<Record<string, SubTask[]>>({})
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null)
  const [todayEnergyStatus, setTodayEnergyStatus] = useState<'filled' | 'skipped' | null>(null)
  const [todayPlannedTasks, setTodayPlannedTasks] = useState<TaskV2[]>([])
  const overloadMode = isOverloaded(todayEnergy, getRemainingPlannedCost(todayPlannedTasks))
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskDetailOrigin, setTaskDetailOrigin] = useState<Screen | null>(null)
  const [taskCreateOrigin, setTaskCreateOrigin] = useState<Screen | null>(null)
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [pendingPlanTask, setPendingPlanTask] = useState<PendingPlanTask | null>(null)
  const [movingTask, setMovingTask] = useState<MovingPlanItem | null>(null)
  const [planningTargetDate, setPlanningTargetDate] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const user = await userRepo.getFirst()
      if (user) {
        if (!user.onboarding_completed) {
          await wipeAllData()
          setLoading(false)
          return
        }
        setCurrentUser(user)
        const s = await settingsRepo.getByUserId(user.id)
        if (s) {
          setSettings(s)
        }
        const entry = await energyRepo.getByDate(todayDate())
        await loadAll()
        setScreen(entry ? 'dashboard' : 'energy-checkin')
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    const fontSizes: Record<string, string> = { small: '13px', medium: '16px', large: '22px' }
    root.style.fontSize = fontSizes[settings.font_size] ?? '16px'
    root.classList.toggle('dark-mode', settings.dark_mode)
    root.classList.toggle('reduce-motion', settings.reduced_motion)
    root.style.setProperty('--color-accent', settings.ambiance_color ?? 'var(--color-primary)')
  }, [settings])

  async function loadAll() {
    const [inbox, today, entry, listsData, planned] = await Promise.all([
      taskRepo.getByStatus('inbox'),
      taskRepo.getTodayTasks(),
      energyRepo.getByDate(todayDate()),
      listRepo.getAll(),
      taskV2Repo.getByDate(todayDate()),
    ])
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
    setTodayEnergy(entry?.value ?? null)
    setTodayEnergyStatus(entry?.status ?? null)
    setLists(listsData)
    setTodayPlannedTasks(planned)
  }

  async function refreshTodayPlanned() {
    const planned = await taskV2Repo.getByDate(todayDate())
    setTodayPlannedTasks(planned)
  }

  async function createUser(profile: ProfileType) {
    const now = new Date().toISOString()
    const userId = newId()
    const user: User = {
      id: userId,
      profile_type: profile,
      onboarding_completed: false,
      created_at: now,
      updated_at: now,
    }
    const defaultSettings: Settings = {
      id: newId(),
      user_id: userId,
      dark_mode: false,
      font_size: 'medium',
      reduced_motion: false,
      local_encryption: false,
    }
    await userRepo.create(user)
    await settingsRepo.create(defaultSettings)
    setCurrentUser(user)
  }

  async function saveTodayEnergy(value: number) {
    const date = todayDate()
    const existing = await energyRepo.getByDate(date)
    if (existing) {
      await energyRepo.update({ ...existing, value, status: 'filled' })
    } else {
      await energyRepo.create({ id: newId(), value, status: 'filled', entry_date: date })
    }
    setTodayEnergy(value)
    setTodayEnergyStatus('filled')
  }

  async function skipTodayEnergy() {
    const date = todayDate()
    const existing = await energyRepo.getByDate(date)
    if (!existing) {
      await energyRepo.create({ id: newId(), value: null, status: 'skipped', entry_date: date })
    }
    setTodayEnergy(null)
    setTodayEnergyStatus('skipped')
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

  async function createTaskV2Dest(title: string, status: TaskStatusV2): Promise<string> {
    const now = new Date().toISOString()
    const task = createTaskV2Rule(newId(), title, status, false, now)
    await taskV2Repo.create(task)
    return task.id
  }

  async function scheduleV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    const updated = scheduleTaskV2Rule(task, date, start, end, new Date().toISOString())
    await taskV2Repo.update(updated)
    await refreshTodayPlanned()
  }

  async function getPlannedTasksForDate(date: string): Promise<TaskV2[]> {
    const tasks = await taskV2Repo.getByDate(date)
    return tasks.sort((a, b) => (a.scheduled_start ?? '').localeCompare(b.scheduled_start ?? ''))
  }

  async function completeV2Task(taskId: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    const updated = toggleTaskV2CompletionRule(task, new Date().toISOString())
    await taskV2Repo.update(updated)
    await refreshTodayPlanned()
  }

  async function renameV2Task(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const task = await taskV2Repo.getById(id)
    if (!task) return
    const updated = renameTaskV2Rule(task, trimmed, new Date().toISOString())
    await taskV2Repo.update(updated)
    await refreshTodayPlanned()
  }

  async function deleteV2Task(id: string) {
    await taskV2Repo.delete(id)
    await refreshTodayPlanned()
  }

  async function reportV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    const updated = reportTaskV2Rule(task, date, start, end, new Date().toISOString())
    await taskV2Repo.update(updated)
    await refreshTodayPlanned()
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
      await loadAll()
    }
    await refreshTodayPlanned()
    setPendingPlanTask({ kind: 'task', title, taskId: scheduled.id })
    return scheduled.id
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
    await loadAll()
  }

  async function moveTask(id: string, status: TaskStatus) {
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update({ ...task, status, updated_at: new Date().toISOString() })
    await loadAll()
  }

  async function completeTask(id: string) {
    const task = await taskRepo.getById(id)
    if (!task) return
    const now = new Date().toISOString()
    await taskRepo.update({ ...task, status: 'completed', completed_at: now, updated_at: now })
    await loadAll()
  }

  async function deleteTask(id: string) {
    const subs = await subTaskRepo.getByTaskId(id)
    await Promise.all(subs.map((st) => subTaskRepo.delete(st.id)))
    await taskRepo.delete(id)
    await loadAll()
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
    await loadAll()
  }

  async function deleteSubTask(id: string) {
    await subTaskRepo.delete(id)
  }

  async function toggleSubTask(subTask: SubTask) {
    await subTaskRepo.update({ ...subTask, is_completed: !subTask.is_completed })
    await loadAll()
  }

  async function reorderSubTasks(_taskId: string, ids: string[]) {
    await subTaskRepo.reorder(ids)
    await loadAll()
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

  async function updateTaskTitle(id: string, title: string) {
    const task = await taskRepo.getById(id)
    if (!task) return
    await taskRepo.update({ ...task, title, updated_at: new Date().toISOString() })
    await loadAll()
  }

  async function reorderTodayTasks(ids: string[]) {
    await taskRepo.reorder(ids)
    await loadAll()
  }

  async function refreshDashboard() {
    await loadAll()
  }

  async function createList(name: string): Promise<string> {
    const now = new Date().toISOString()
    const list = createListRule(newId(), name, now)
    await listRepo.create(list)
    setLists((prev) => [...prev, list])
    return list.id
  }

  async function renameList(id: string, name: string) {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    const updated = { ...list, name, updated_at: new Date().toISOString() }
    await listRepo.update(updated)
    setLists((prev) => prev.map((l) => (l.id === id ? updated : l)))
  }

  async function deleteList(id: string) {
    const items = await listItemRepo.getByListId(id)
    await Promise.all(items.map((item) => listItemRepo.delete(item.id)))
    await listRepo.delete(id)
    setLists((prev) => prev.filter((l) => l.id !== id))
  }

  async function getListItems(listId: string): Promise<ListItem[]> {
    return listItemRepo.getByListId(listId)
  }

  async function addListItem(listId: string, title: string) {
    const existing = await listItemRepo.getByListId(listId)
    const now = new Date().toISOString()
    const item = createListItemRule(newId(), listId, title, existing.length, now)
    await listItemRepo.create(item)
  }

  async function deleteListItem(id: string) {
    await listItemRepo.delete(id)
  }

  async function updateSettings(patch: Partial<Settings>) {
    if (!currentUser) return
    const s = await settingsRepo.getByUserId(currentUser.id)
    if (!s) return
    const updated = { ...s, ...patch }
    await settingsRepo.update(updated)
    setSettings(updated)
  }

  async function exportData() {
    if (!currentUser) return
    const [user, tasks, subTasks, tasksV2, lists, listItems, energyEntries, settingsData] = await Promise.all([
      userRepo.getFirst(),
      db.tasks.toArray(),
      db.subTasks.toArray(),
      db.tasksV2.toArray(),
      db.lists.toArray(),
      db.listItems.toArray(),
      db.energyEntries.toArray(),
      settingsRepo.getByUserId(currentUser.id),
    ])
    const payload = {
      export_date: new Date().toISOString(),
      version: '2.0',
      user,
      tasks,
      sub_tasks: subTasks,
      tasks_v2: tasksV2,
      lists,
      list_items: listItems,
      energy_entries: energyEntries,
      settings: settingsData,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-audhd-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function wipeAllData() {
    await Promise.all([
      db.users.clear(),
      db.tasks.clear(),
      db.subTasks.clear(),
      db.energyEntries.clear(),
      db.settings.clear(),
      db.lists.clear(),
      db.listItems.clear(),
      db.tasksV2.clear(),
    ])
    setCurrentUser(null)
    setSettings(null)
    setTodayTasks([])
    setInboxTasks([])
    setTodayEnergy(null)
    setTodayEnergyStatus(null)
    setTodayPlannedTasks([])
    setSelectedTaskId(null)
    setLists([])
    setSelectedListId(null)
    setScreen('welcome')
  }

  async function deleteAllData() {
    await wipeAllData()
  }

  async function completeOnboarding() {
    if (!currentUser) return
    const updated: User = { ...currentUser, onboarding_completed: true, updated_at: new Date().toISOString() }
    await userRepo.update(updated)
    setCurrentUser(updated)
    setScreen('dashboard')
  }

  return (
    <AppContext.Provider
      value={{
        screen,
        goTo: setScreen,
        loading,
        currentUser,
        settings,
        todayTasks,
        todaySubTasksMap,
        inboxTasks,
        inboxSubTasksMap,
        todayEnergy,
        todayEnergyStatus,
        todayPlannedTasks,
        overloadMode,
        updateSettings,
        exportData,
        deleteAllData,
        selectedTaskId,
        selectTask: setSelectedTaskId,
        taskDetailOrigin,
        setTaskDetailOrigin,
        taskCreateOrigin,
        setTaskCreateOrigin,
        createUser,
        completeOnboarding,
        saveTodayEnergy,
        skipTodayEnergy,
        addTask,
        createTaskInbox,
        moveTodoTaskToList,
        createTaskV2Dest,
        scheduleV2Task,
        getPlannedTasksForDate,
        pendingPlanTask,
        startPlanTask,
        startPlanSubTask,
        clearPendingPlanTask,
        schedulePendingTask,
        completeV2Task,
        renameV2Task,
        deleteV2Task,
        reportV2Task,
        movingTask,
        startMoveTask,
        startMoveSubTask,
        clearMoveTask,
        planningTargetDate,
        setPlanningTargetDate,
        moveTask,
        completeTask,
        deleteTask,
        addSubTask,
        deleteSubTask,
        toggleSubTask,
        reorderSubTasks,
        getSubTasks,
        getPlannedSubTasksForDate,
        scheduleSubTaskV2,
        reportSubTaskV2,
        renameSubTaskV2,
        updateTaskTitle,
        reorderTodayTasks,
        refreshDashboard,
        lists,
        selectedListId,
        selectList: setSelectedListId,
        createList,
        renameList,
        deleteList,
        getListItems,
        addListItem,
        deleteListItem,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider')
  return ctx
}
