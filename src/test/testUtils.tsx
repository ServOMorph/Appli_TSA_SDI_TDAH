import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { AppContext } from '@/app/AppContext'
import type { Screen } from '@/app/AppContext'

export function makeAppContext(overrides: Partial<Parameters<typeof AppContext.Provider>[0]['value']> = {}) {
  return {
    screen: 'welcome' as Screen,
    goTo: vi.fn(),
    loading: false,
    currentUser: null,
    todayTasks: [],
    todaySubTasksMap: {},
    inboxTasks: [],
    laterTasks: [],
    todayEnergy: null,
    todayEnergyStatus: null,
    settings: null,
    overloadMode: false,
    setOverloadMode: vi.fn(),
    updateSettings: vi.fn().mockResolvedValue(undefined),
    exportData: vi.fn().mockResolvedValue(undefined),
    deleteAllData: vi.fn().mockResolvedValue(undefined),
    selectedTaskId: null,
    selectTask: vi.fn(),
    taskDetailOrigin: null,
    setTaskDetailOrigin: vi.fn(),
    createUser: vi.fn().mockResolvedValue(undefined),
    saveTodayEnergy: vi.fn().mockResolvedValue(undefined),
    skipTodayEnergy: vi.fn().mockResolvedValue(undefined),
    addTask: vi.fn().mockResolvedValue(undefined),
    createTaskInbox: vi.fn().mockResolvedValue(undefined),
    moveTask: vi.fn().mockResolvedValue(undefined),
    completeTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    addSubTask: vi.fn().mockResolvedValue(undefined),
    deleteSubTask: vi.fn().mockResolvedValue(undefined),
    toggleSubTask: vi.fn().mockResolvedValue(undefined),
    reorderSubTasks: vi.fn().mockResolvedValue(undefined),
    getSubTasks: vi.fn().mockResolvedValue([]),
    updateTaskTitle: vi.fn().mockResolvedValue(undefined),
    reorderTodayTasks: vi.fn().mockResolvedValue(undefined),
    refreshDashboard: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

export function renderWithApp(ui: React.ReactNode, ctx = makeAppContext()) {
  return render(<AppContext.Provider value={ctx}>{ui}</AppContext.Provider>)
}
