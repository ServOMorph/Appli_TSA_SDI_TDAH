import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  type NavStack,
  type Route,
  type Screen,
  push as pushRoute,
  pop as popRoute,
  currentRoute,
  previousRoute,
  canGoBack as stackCanGoBack,
} from '@/app/navigation'
import { energyRepo, settingsRepo, todayDate, userRepo } from '@/app/repositories'
import { useBudgetState } from '@/app/contexts/useBudgetState'
import { useEnergyState } from '@/app/contexts/useEnergyState'
import { useListsState } from '@/app/contexts/useListsState'
import { useSettingsState } from '@/app/contexts/useSettingsState'
import { useTasksState } from '@/app/contexts/useTasksState'
import { usePlanningState } from '@/app/contexts/usePlanningState'
import { isOverloaded } from '@/domain/rules/energyRules'
import { getRemainingPlannedCost } from '@/domain/rules/taskRules'

export type { Screen, Route } from '@/app/navigation'
export type { PendingPlanTask, PlannedSubTask, MovingPlanItem } from '@/app/contexts/usePlanningState'

type NavigationValue = {
  screen: Screen
  route: Route
  goTo: (s: Screen | Route) => void
  goToPath: (routes: (Screen | Route)[]) => void
  back: (fallback?: Screen | Route) => void
  canGoBack: boolean
  originScreen: Screen | null
}

type SessionValue = {
  loading: boolean
  overloadMode: boolean
  completeOnboarding: () => Promise<void>
  deleteAllData: () => Promise<void>
  refreshDashboard: () => Promise<void>
}

type AppContextValue = NavigationValue &
  SessionValue &
  Omit<ReturnType<typeof useTasksState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof usePlanningState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useEnergyState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useListsState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useBudgetState>, 'load' | 'reset'> &
  Omit<
    ReturnType<typeof useSettingsState>,
    'load' | 'reset' | 'setCurrentUser' | 'setSettings' | 'clearDatabase' | 'completeOnboarding'
  >

export const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<NavStack>([{ name: 'welcome' }])
  const [loading, setLoading] = useState(true)

  const route = currentRoute(stack)
  const goTo = useCallback((target: Screen | Route) => setStack((prev) => pushRoute(prev, target)), [])
  const goToPath = useCallback(
    (routes: (Screen | Route)[]) => setStack((prev) => routes.reduce<NavStack>(pushRoute, prev)),
    [],
  )
  const back = useCallback(
    (fallback?: Screen | Route) =>
      setStack((prev) => (stackCanGoBack(prev) ? popRoute(prev) : fallback ? pushRoute(prev, fallback) : prev)),
    [],
  )

  const tasks = useTasksState()
  const planning = usePlanningState(tasks.load)
  const energy = useEnergyState()
  const lists = useListsState()
  const budget = useBudgetState()
  const session = useSettingsState()

  const { load: loadTasks, reset: resetTasks, ...tasksValue } = tasks
  const { load: loadPlanning, reset: resetPlanning, ...planningValue } = planning
  const { load: loadEnergy, reset: resetEnergy, ...energyValue } = energy
  const { load: loadLists, reset: resetLists, ...listsValue } = lists
  const { load: loadBudget, reset: resetBudget, ...budgetValue } = budget
  const {
    reset: resetSession,
    setCurrentUser,
    setSettings,
    clearDatabase,
    completeOnboarding: markOnboardingComplete,
    ...sessionValue
  } = session

  const overloadMode = isOverloaded(energy.todayEnergy, getRemainingPlannedCost(planning.todayPlannedTasks))

  async function loadAll() {
    await Promise.all([loadTasks(), loadPlanning(), loadEnergy(), loadLists(), loadBudget()])
  }

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
        if (s) setSettings(s)
        const entry = await energyRepo.getByDate(todayDate())
        await loadAll()
        setStack([{ name: entry ? 'dashboard' : 'energy-checkin' }])
      }
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function wipeAllData() {
    await clearDatabase()
    resetTasks()
    resetPlanning()
    resetEnergy()
    resetLists()
    resetBudget()
    resetSession()
    setStack([{ name: 'welcome' }])
  }

  async function completeOnboarding() {
    if (await markOnboardingComplete()) setStack([{ name: 'dashboard' }])
  }

  return (
    <AppContext.Provider
      value={{
        screen: route.name,
        route,
        goTo,
        goToPath,
        back,
        canGoBack: stackCanGoBack(stack),
        originScreen: previousRoute(stack)?.name ?? null,
        loading,
        overloadMode,
        completeOnboarding,
        deleteAllData: wipeAllData,
        refreshDashboard: loadAll,
        ...tasksValue,
        ...planningValue,
        ...energyValue,
        ...listsValue,
        ...budgetValue,
        ...sessionValue,
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
