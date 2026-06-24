import { createContext, useContext, useEffect, useState } from 'react'
import { AppDatabase } from '@/data/db'
import { UserRepository } from '@/data/repositories/userRepository'
import { TaskRepository } from '@/data/repositories/taskRepository'
import { EnergyEntryRepository } from '@/data/repositories/energyEntryRepository'
import { SettingsRepository } from '@/data/repositories/settingsRepository'
import type { User, ProfileType } from '@/domain/entities/user'
import type { Task } from '@/domain/entities/task'
import type { Settings } from '@/domain/entities/settings'

export type Screen = 'welcome' | 'profile' | 'energy' | 'first-task' | 'dashboard'

interface AppContextValue {
  screen: Screen
  goTo: (s: Screen) => void
  loading: boolean
  currentUser: User | null
  todayTasks: Task[]
  todayEnergy: number | null
  overloadMode: boolean
  setOverloadMode: (v: boolean) => void
  createUser: (profile: ProfileType) => Promise<void>
  saveTodayEnergy: (value: number) => Promise<void>
  skipTodayEnergy: () => Promise<void>
  addTask: (title: string) => Promise<void>
  refreshDashboard: () => Promise<void>
}

export const AppContext = createContext<AppContextValue | null>(null)

const db = new AppDatabase()
const userRepo = new UserRepository(db)
const taskRepo = new TaskRepository(db)
const energyRepo = new EnergyEntryRepository(db)
const settingsRepo = new SettingsRepository(db)

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function newId(): string {
  return crypto.randomUUID()
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null)
  const [overloadMode, setOverloadModeState] = useState(false)

  useEffect(() => {
    async function init() {
      const user = await userRepo.getFirst()
      if (user) {
        setCurrentUser(user)
        const settings = await settingsRepo.getByUserId(user.id)
        if (settings?.overload_mode) setOverloadModeState(true)
        await loadDashboard()
        setScreen('dashboard')
      }
      setLoading(false)
    }
    init()
  }, [])

  async function loadDashboard() {
    const [tasks, entry] = await Promise.all([
      taskRepo.getTodayTasks(),
      energyRepo.getByDate(todayDate()),
    ])
    setTodayTasks(tasks)
    setTodayEnergy(entry?.value ?? null)
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
  }

  async function skipTodayEnergy() {
    const date = todayDate()
    const existing = await energyRepo.getByDate(date)
    if (!existing) {
      await energyRepo.create({ id: newId(), value: null, status: 'skipped', entry_date: date })
    }
    setTodayEnergy(null)
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

  async function refreshDashboard() {
    await loadDashboard()
  }

  async function setOverloadMode(v: boolean) {
    setOverloadModeState(v)
    if (currentUser) {
      const settings = await settingsRepo.getByUserId(currentUser.id)
      if (settings) {
        await settingsRepo.update({ ...settings, overload_mode: v })
      }
    }
  }

  return (
    <AppContext.Provider
      value={{
        screen,
        goTo: setScreen,
        loading,
        currentUser,
        todayTasks,
        todayEnergy,
        overloadMode,
        setOverloadMode,
        createUser,
        saveTodayEnergy,
        skipTodayEnergy,
        addTask,
        refreshDashboard,
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
