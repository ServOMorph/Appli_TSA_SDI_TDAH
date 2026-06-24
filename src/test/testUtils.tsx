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
    todayEnergy: null,
    overloadMode: false,
    setOverloadMode: vi.fn(),
    createUser: vi.fn().mockResolvedValue(undefined),
    saveTodayEnergy: vi.fn().mockResolvedValue(undefined),
    skipTodayEnergy: vi.fn().mockResolvedValue(undefined),
    addTask: vi.fn().mockResolvedValue(undefined),
    refreshDashboard: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

export function renderWithApp(ui: React.ReactNode, ctx = makeAppContext()) {
  return render(<AppContext.Provider value={ctx}>{ui}</AppContext.Provider>)
}
