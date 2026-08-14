import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  type NavStack,
  type Route,
  type Screen,
  push as pushRoute,
  pop as popRoute,
  replace as replaceRoute,
  currentRoute,
  previousRoute,
  canGoBack as stackCanGoBack,
} from '@/app/navigation'
import { energyRepo, settingsRepo, todayDate, userRepo } from '@/app/repositories'
import { useBudgetState } from '@/app/contexts/useBudgetState'
import { useEnergyState } from '@/app/contexts/useEnergyState'
import { useListsState } from '@/app/contexts/useListsState'
import { useToolsState } from '@/app/contexts/useToolsState'
import { useSettingsState, type ImportResult } from '@/app/contexts/useSettingsState'
import { useTasksState } from '@/app/contexts/useTasksState'
import { usePlanningState } from '@/app/contexts/usePlanningState'
import { isOverloaded } from '@/domain/rules/energyRules'
import { getRemainingPlannedCost } from '@/domain/rules/taskRules'

export type { Screen, Route } from '@/app/navigation'
export type { PlannedSubTask } from '@/app/contexts/usePlanningState'

type NavigationValue = {
  screen: Screen
  route: Route
  goTo: (s: Screen | Route) => void
  goToPath: (routes: (Screen | Route)[]) => void
  replace: (s: Screen | Route) => void
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
  importData: (raw: unknown) => Promise<ImportResult>
}

type AppContextValue = NavigationValue &
  SessionValue &
  Omit<ReturnType<typeof useTasksState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof usePlanningState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useEnergyState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useListsState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useToolsState>, 'load' | 'reset'> &
  Omit<ReturnType<typeof useBudgetState>, 'load' | 'reset'> &
  Omit<
    ReturnType<typeof useSettingsState>,
    'load' | 'reset' | 'setCurrentUser' | 'setSettings' | 'clearDatabase' | 'completeOnboarding' | 'importData'
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
  const replace = useCallback((target: Screen | Route) => setStack((prev) => replaceRoute(prev, target)), [])
  const back = useCallback(
    (fallback?: Screen | Route) =>
      setStack((prev) => (stackCanGoBack(prev) ? popRoute(prev) : fallback ? pushRoute(prev, fallback) : prev)),
    [],
  )

  const tasks = useTasksState()
  const planning = usePlanningState(tasks.load)
  const energy = useEnergyState()
  const lists = useListsState()
  const tools = useToolsState(lists.load)
  const budget = useBudgetState()
  const session = useSettingsState()

  const { load: loadTasks, reset: resetTasks, ...tasksValue } = tasks
  const { load: loadPlanning, reset: resetPlanning, ...planningValue } = planning
  const { load: loadEnergy, reset: resetEnergy, ...energyValue } = energy
  const { load: loadLists, reset: resetLists, ...listsValue } = lists
  const { load: loadTools, reset: resetTools, ...toolsValue } = tools
  const { load: loadBudget, reset: resetBudget, ...budgetValue } = budget
  const {
    reset: resetSession,
    setCurrentUser,
    setSettings,
    clearDatabase,
    completeOnboarding: markOnboardingComplete,
    createUser: createUserAndSeedTools,
    importData: importDataRaw,
    ...sessionValue
  } = session

  async function createUser(profile: Parameters<typeof createUserAndSeedTools>[0]) {
    await createUserAndSeedTools(profile)
    await Promise.all([loadLists(), loadTools()])
  }

  const overloadMode = isOverloaded(energy.todayEnergy, getRemainingPlannedCost(planning.todayPlannedTasks))

  async function loadAll() {
    await Promise.all([loadTasks(), loadPlanning(), loadEnergy(), loadLists(), loadTools(), loadBudget()])
  }

  useEffect(() => {
    async function init() {
      try {
        const user = await userRepo.getFirst()
        if (user) {
          if (!user.onboarding_completed) {
            await wipeAllData()
            return
          }
          setCurrentUser(user)
          const s = await settingsRepo.getByUserId(user.id)
          if (s) setSettings(s)
          const entry = await energyRepo.getByDate(todayDate())
          await loadAll()
          setStack([{ name: entry ? 'dashboard' : 'energy-checkin' }])
        }
      } catch (error) {
        console.error("Échec de l'initialisation de l'application", error)
      } finally {
        setLoading(false)
      }
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
    resetTools()
    resetBudget()
    resetSession()
    setStack([{ name: 'welcome' }])
  }

  async function completeOnboarding() {
    if (await markOnboardingComplete()) setStack([{ name: 'dashboard' }])
  }

  async function importData(raw: unknown): Promise<ImportResult> {
    const result = await importDataRaw(raw)
    if (result.ok) {
      await loadAll()
      const entry = await energyRepo.getByDate(todayDate())
      setStack([{ name: entry ? 'dashboard' : 'energy-checkin' }])
    }
    return result
  }

  return (
    <AppContext.Provider
      value={{
        screen: route.name,
        route,
        goTo,
        goToPath,
        replace,
        back,
        canGoBack: stackCanGoBack(stack),
        originScreen: previousRoute(stack)?.name ?? null,
        loading,
        overloadMode,
        completeOnboarding,
        deleteAllData: wipeAllData,
        refreshDashboard: loadAll,
        importData,
        ...tasksValue,
        ...planningValue,
        ...energyValue,
        ...listsValue,
        ...toolsValue,
        ...budgetValue,
        ...sessionValue,
        createUser,
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
