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
import { RoutineRepository } from '@/data/repositories/routineRepository'
import { RoutineStepRepository } from '@/data/repositories/routineStepRepository'
import { createTaskV2 as createTaskV2Rule, scheduleTaskV2 as scheduleTaskV2Rule } from '@/domain/rules/taskRulesV2'
import { createList as createListRule, createListItem as createListItemRule } from '@/domain/rules/listRules'
import {
  createRoutine as createRoutineRule,
  createRoutineStep as createRoutineStepRule,
  scheduleRoutine as scheduleRoutineRule,
  toggleRoutineStep as toggleRoutineStepRule,
} from '@/domain/rules/routineRules'
import type { User, ProfileType } from '@/domain/entities/user'
import type { Task, TaskStatus } from '@/domain/entities/task'
import type { TaskV2, TaskStatusV2 } from '@/domain/entities/taskV2'
import type { SubTask } from '@/domain/entities/subTask'
import type { Settings } from '@/domain/entities/settings'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { Routine, RoutineType } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'

export type Screen =
  | 'welcome'
  | 'profile'
  | 'energy'
  | 'first-task'
  | 'dashboard'
  | 'inbox'
  | 'today'
  | 'later'
  | 'task-create'
  | 'task-create-v2'
  | 'planning'
  | 'to-plan-queue'
  | 'task-detail'
  | 'task-decompose'
  | 'energy-view'
  | 'energy-checkin'
  | 'overload-recovery'
  | 'resources'
  | 'settings'
  | 'settings-profile'
  | 'settings-accessibility'
  | 'settings-stimulation'
  | 'settings-organisation'
  | 'settings-privacy'
  | 'settings-export'
  | 'lists'
  | 'list-detail'
  | 'routines'
  | 'routine-detail'

interface AppContextValue {
  screen: Screen
  goTo: (s: Screen) => void
  loading: boolean
  currentUser: User | null
  settings: Settings | null
  todayTasks: Task[]
  todaySubTasksMap: Record<string, SubTask[]>
  inboxTasks: Task[]
  laterTasks: Task[]
  todayEnergy: number | null
  todayEnergyStatus: 'filled' | 'skipped' | null
  overloadMode: boolean
  setOverloadMode: (v: boolean) => void
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  exportData: () => Promise<void>
  deleteAllData: () => Promise<void>
  selectedTaskId: string | null
  selectTask: (id: string | null) => void
  taskDetailOrigin: Screen | null
  setTaskDetailOrigin: (s: Screen) => void
  createUser: (profile: ProfileType) => Promise<void>
  saveTodayEnergy: (value: number) => Promise<void>
  skipTodayEnergy: () => Promise<void>
  addTask: (title: string) => Promise<void>
  createTaskInbox: (title: string) => Promise<void>
  toPlanTasks: TaskV2[]
  createTaskV2Dest: (title: string, status: TaskStatusV2) => Promise<void>
  scheduleV2Task: (taskId: string, date: string, start: string, end: string) => Promise<void>
  getPlannedTasksForDate: (date: string) => Promise<TaskV2[]>
  getUnscheduledPlannedTasks: () => Promise<TaskV2[]>
  moveTask: (id: string, status: TaskStatus) => Promise<void>
  completeTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addSubTask: (taskId: string, title: string) => Promise<void>
  deleteSubTask: (id: string) => Promise<void>
  toggleSubTask: (subTask: SubTask) => Promise<void>
  reorderSubTasks: (taskId: string, ids: string[]) => Promise<void>
  getSubTasks: (taskId: string) => Promise<SubTask[]>
  updateTaskTitle: (id: string, title: string) => Promise<void>
  reorderTodayTasks: (ids: string[]) => Promise<void>
  refreshDashboard: () => Promise<void>
  lists: List[]
  selectedListId: string | null
  selectList: (id: string | null) => void
  createList: (name: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  getListItems: (listId: string) => Promise<ListItem[]>
  addListItem: (listId: string, title: string) => Promise<void>
  deleteListItem: (id: string) => Promise<void>
  routines: Routine[]
  selectedRoutineId: string | null
  selectRoutine: (id: string | null) => void
  createRoutine: (name: string, type: RoutineType, durationMinutes: number) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  getRoutineSteps: (routineId: string) => Promise<RoutineStep[]>
  addRoutineStep: (routineId: string, title: string) => Promise<void>
  deleteRoutineStep: (id: string) => Promise<void>
  toggleRoutineStep: (step: RoutineStep) => Promise<void>
  scheduleRoutine: (routineId: string, date: string, start: string) => Promise<void>
  getRoutinesForDate: (date: string) => Promise<Routine[]>
}

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
const routineRepo = new RoutineRepository(db)
const routineStepRepo = new RoutineStepRepository(db)

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
  const [laterTasks, setLaterTasks] = useState<Task[]>([])
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null)
  const [todayEnergyStatus, setTodayEnergyStatus] = useState<'filled' | 'skipped' | null>(null)
  const [overloadMode, setOverloadModeState] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskDetailOrigin, setTaskDetailOrigin] = useState<Screen | null>(null)
  const [toPlanTasks, setToPlanTasks] = useState<TaskV2[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const user = await userRepo.getFirst()
      if (user) {
        setCurrentUser(user)
        const s = await settingsRepo.getByUserId(user.id)
        if (s) {
          setSettings(s)
          if (s.overload_mode) setOverloadModeState(true)
        }
        await loadAll()
        setScreen('dashboard')
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
    root.dataset.stimulation = settings.stimulation_mode
  }, [settings])

  async function loadAll() {
    const [inbox, today, later, entry, toPlan, listsData, routinesData] = await Promise.all([
      taskRepo.getByStatus('inbox'),
      taskRepo.getTodayTasks(),
      taskRepo.getByStatus('later'),
      energyRepo.getByDate(todayDate()),
      taskV2Repo.getToPlantasks(),
      listRepo.getAll(),
      routineRepo.getAll(),
    ])
    const subTaskArrays = await Promise.all(today.map((t) => subTaskRepo.getByTaskId(t.id)))
    const subTasksMap: Record<string, SubTask[]> = {}
    today.forEach((t, i) => {
      subTasksMap[t.id] = subTaskArrays[i]
    })
    setInboxTasks(inbox)
    setTodayTasks(today)
    setTodaySubTasksMap(subTasksMap)
    setLaterTasks(later)
    setTodayEnergy(entry?.value ?? null)
    setTodayEnergyStatus(entry?.status ?? null)
    setToPlanTasks(toPlan)
    setLists(listsData)
    setRoutines(routinesData)
  }

  async function createUser(profile: ProfileType) {
    const now = new Date().toISOString()
    const userId = newId()
    const user: User = {
      id: userId,
      profile_type: profile,
      created_at: now,
      updated_at: now,
    }
    const defaultSettings: Settings = {
      id: newId(),
      user_id: userId,
      stimulation_mode: 'standard',
      dark_mode: false,
      font_size: 'medium',
      reduced_motion: false,
      overload_mode: false,
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

  async function createTaskV2Dest(title: string, status: TaskStatusV2) {
    const now = new Date().toISOString()
    const task = createTaskV2Rule(newId(), title, status, false, now)
    await taskV2Repo.create(task)
  }

  async function scheduleV2Task(taskId: string, date: string, start: string, end: string) {
    const task = await taskV2Repo.getById(taskId)
    if (!task) return
    const updated = scheduleTaskV2Rule(task, date, start, end, new Date().toISOString())
    await taskV2Repo.update(updated)
    setToPlanTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  async function getPlannedTasksForDate(date: string): Promise<TaskV2[]> {
    return taskV2Repo.getByDate(date)
  }

  async function getUnscheduledPlannedTasks(): Promise<TaskV2[]> {
    const planned = await taskV2Repo.getPlannedTasks()
    return planned.filter((t) => t.scheduled_date === null)
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
    }
    await subTaskRepo.create(subTask)
    await loadAll()
  }

  async function deleteSubTask(id: string) {
    await subTaskRepo.delete(id)
  }

  async function toggleSubTask(subTask: SubTask) {
    await subTaskRepo.update({ ...subTask, is_completed: !subTask.is_completed })
  }

  async function reorderSubTasks(_taskId: string, ids: string[]) {
    await subTaskRepo.reorder(ids)
    await loadAll()
  }

  async function getSubTasks(taskId: string): Promise<SubTask[]> {
    return subTaskRepo.getByTaskId(taskId)
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

  async function createList(name: string) {
    const now = new Date().toISOString()
    const list = createListRule(newId(), name, now)
    await listRepo.create(list)
    setLists((prev) => [...prev, list])
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

  async function createRoutine(name: string, type: RoutineType, durationMinutes: number) {
    const now = new Date().toISOString()
    const routine = createRoutineRule(newId(), name, type, durationMinutes, now)
    await routineRepo.create(routine)
    setRoutines((prev) => [...prev, routine])
  }

  async function deleteRoutine(id: string) {
    const steps = await routineStepRepo.getByRoutineId(id)
    await Promise.all(steps.map((s) => routineStepRepo.delete(s.id)))
    await routineRepo.delete(id)
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  async function getRoutineSteps(routineId: string): Promise<RoutineStep[]> {
    return routineStepRepo.getByRoutineId(routineId)
  }

  async function addRoutineStep(routineId: string, title: string) {
    const existing = await routineStepRepo.getByRoutineId(routineId)
    const now = new Date().toISOString()
    const step = createRoutineStepRule(newId(), routineId, title, existing.length, now)
    await routineStepRepo.create(step)
  }

  async function deleteRoutineStep(id: string) {
    await routineStepRepo.delete(id)
  }

  async function toggleRoutineStep(step: RoutineStep) {
    const updated = toggleRoutineStepRule(step)
    await routineStepRepo.update(updated)
  }

  async function scheduleRoutine(routineId: string, date: string, start: string) {
    const routine = routines.find((r) => r.id === routineId) ?? (await routineRepo.getById(routineId))
    if (!routine) return
    const now = new Date().toISOString()
    const updated = scheduleRoutineRule(routine, date, start, now)
    await routineRepo.update(updated)
    setRoutines((prev) => prev.map((r) => (r.id === routineId ? updated : r)))
  }

  async function getRoutinesForDate(date: string): Promise<Routine[]> {
    const all = await routineRepo.getAll()
    return all.filter((r) => r.scheduled_date === date)
  }

  async function setOverloadMode(v: boolean) {
    setOverloadModeState(v)
    if (currentUser) {
      const s = await settingsRepo.getByUserId(currentUser.id)
      if (s) {
        const updated = { ...s, overload_mode: v }
        await settingsRepo.update(updated)
        setSettings(updated)
      }
    }
  }

  async function updateSettings(patch: Partial<Settings>) {
    if (!currentUser) return
    const s = await settingsRepo.getByUserId(currentUser.id)
    if (!s) return
    const updated = { ...s, ...patch }
    await settingsRepo.update(updated)
    setSettings(updated)
    if (patch.overload_mode !== undefined) setOverloadModeState(patch.overload_mode)
  }

  async function exportData() {
    if (!currentUser) return
    const [user, tasks, subTasks, energyEntries, settingsData] = await Promise.all([
      userRepo.getFirst(),
      db.tasks.toArray(),
      db.subTasks.toArray(),
      db.energyEntries.toArray(),
      settingsRepo.getByUserId(currentUser.id),
    ])
    const payload = {
      export_date: new Date().toISOString(),
      version: '1.0',
      user,
      tasks,
      sub_tasks: subTasks,
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

  async function deleteAllData() {
    await Promise.all([
      db.users.clear(),
      db.tasks.clear(),
      db.subTasks.clear(),
      db.energyEntries.clear(),
      db.settings.clear(),
      db.lists.clear(),
      db.listItems.clear(),
      db.routines.clear(),
      db.routineSteps.clear(),
    ])
    setCurrentUser(null)
    setSettings(null)
    setTodayTasks([])
    setInboxTasks([])
    setLaterTasks([])
    setTodayEnergy(null)
    setTodayEnergyStatus(null)
    setOverloadModeState(false)
    setSelectedTaskId(null)
    setLists([])
    setSelectedListId(null)
    setRoutines([])
    setSelectedRoutineId(null)
    setScreen('welcome')
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
        laterTasks,
        todayEnergy,
        todayEnergyStatus,
        overloadMode,
        setOverloadMode,
        updateSettings,
        exportData,
        deleteAllData,
        selectedTaskId,
        selectTask: setSelectedTaskId,
        taskDetailOrigin,
        setTaskDetailOrigin,
        createUser,
        saveTodayEnergy,
        skipTodayEnergy,
        addTask,
        createTaskInbox,
        toPlanTasks,
        createTaskV2Dest,
        scheduleV2Task,
        getPlannedTasksForDate,
        getUnscheduledPlannedTasks,
        moveTask,
        completeTask,
        deleteTask,
        addSubTask,
        deleteSubTask,
        toggleSubTask,
        reorderSubTasks,
        getSubTasks,
        updateTaskTitle,
        reorderTodayTasks,
        refreshDashboard,
        lists,
        selectedListId,
        selectList: setSelectedListId,
        createList,
        deleteList,
        getListItems,
        addListItem,
        deleteListItem,
        routines,
        selectedRoutineId,
        selectRoutine: setSelectedRoutineId,
        createRoutine,
        deleteRoutine,
        getRoutineSteps,
        addRoutineStep,
        deleteRoutineStep,
        toggleRoutineStep,
        scheduleRoutine,
        getRoutinesForDate,
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
