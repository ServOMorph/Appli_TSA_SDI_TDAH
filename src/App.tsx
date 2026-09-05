import { lazy, Suspense } from 'react'
import { AppProvider, useApp } from '@/app/AppContext'
import { E10Dashboard } from '@/ui/screens/dashboard/E10Dashboard'
import { DevResetButton } from '@/ui/components/DevResetButton'
import { BottomNav, type BottomNavTab } from '@/ui/components/BottomNav'
import { ScreenLoading } from '@/ui/components/ScreenLoading'
import { LazyScreenBoundary } from '@/ui/components/LazyScreenBoundary'
import { ScreenCodeBadge } from '@/ui/components/ScreenCodeBadge'
import { FeedbackFab } from '@/ui/components/FeedbackFab'
import type { Screen } from '@/app/AppContext'

// `E10Dashboard` reste en import statique : c'est l'écran d'atterrissage de Marie. Tous les
// autres sont chargés en différé (roadmap_bundle_2026-08-31.md, Phase 2) — un seul écran est
// visible à la fois, mais les 29 restants pesaient plein pot dans le chunk initial. Les exports
// nommés imposent l'interop `.then((m) => ({ default: m.X }))` : `React.lazy` exige un défaut.
const E01Welcome = lazy(() => import('@/ui/screens/onboarding/E01Welcome').then((m) => ({ default: m.E01Welcome })))
const E12WeekPlanning = lazy(() =>
  import('@/ui/screens/dashboard/E12WeekPlanning').then((m) => ({ default: m.E12WeekPlanning })),
)
const E02Profile = lazy(() => import('@/ui/screens/onboarding/E02Profile').then((m) => ({ default: m.E02Profile })))
const E03Energy = lazy(() => import('@/ui/screens/onboarding/E03Energy').then((m) => ({ default: m.E03Energy })))
const E20Inbox = lazy(() => import('@/ui/screens/tasks/E20Inbox').then((m) => ({ default: m.E20Inbox })))
const E21CreateTaskV2 = lazy(() =>
  import('@/ui/screens/tasks/E21CreateTaskV2').then((m) => ({ default: m.E21CreateTaskV2 })),
)
const E22TaskDetail = lazy(() =>
  import('@/ui/screens/tasks/E22TaskDetail').then((m) => ({ default: m.E22TaskDetail })),
)
const E23Decompose = lazy(() =>
  import('@/ui/screens/tasks/E23Decompose').then((m) => ({ default: m.E23Decompose })),
)
const E24EditTask = lazy(() => import('@/ui/screens/tasks/E24EditTask').then((m) => ({ default: m.E24EditTask })))
const E31EnergyCheckIn = lazy(() =>
  import('@/ui/screens/energy/E31EnergyCheckIn').then((m) => ({ default: m.E31EnergyCheckIn })),
)
const E90OverloadRecovery = lazy(() =>
  import('@/ui/screens/overload/E90OverloadRecovery').then((m) => ({ default: m.E90OverloadRecovery })),
)
const E120Resources = lazy(() =>
  import('@/ui/screens/resources/E120Resources').then((m) => ({ default: m.E120Resources })),
)
const E121ManualTests = lazy(() =>
  import('@/ui/screens/tests/E121ManualTests').then((m) => ({ default: m.E121ManualTests })),
)
const E122FeedbackCapture = lazy(() =>
  import('@/ui/screens/feedback/E122FeedbackCapture').then((m) => ({ default: m.E122FeedbackCapture })),
)
const E123FeedbackList = lazy(() =>
  import('@/ui/screens/feedback/E123FeedbackList').then((m) => ({ default: m.E123FeedbackList })),
)
const E110Settings = lazy(() =>
  import('@/ui/screens/settings/E110Settings').then((m) => ({ default: m.E110Settings })),
)
const E111Profile = lazy(() =>
  import('@/ui/screens/settings/E111Profile').then((m) => ({ default: m.E111Profile })),
)
const E112Accessibility = lazy(() =>
  import('@/ui/screens/settings/E112Accessibility').then((m) => ({ default: m.E112Accessibility })),
)
const E116Privacy = lazy(() =>
  import('@/ui/screens/settings/E116Privacy').then((m) => ({ default: m.E116Privacy })),
)
const E117Export = lazy(() =>
  import('@/ui/screens/settings/E117Export').then((m) => ({ default: m.E117Export })),
)
const E61ListDetail = lazy(() =>
  import('@/ui/screens/lists/E61ListDetail').then((m) => ({ default: m.E61ListDetail })),
)
const E62ListItemDetail = lazy(() =>
  import('@/ui/screens/lists/E62ListItemDetail').then((m) => ({ default: m.E62ListItemDetail })),
)
const E70Tools = lazy(() => import('@/ui/screens/tools/E70Tools').then((m) => ({ default: m.E70Tools })))
const E72FolderDetail = lazy(() =>
  import('@/ui/screens/tools/E72FolderDetail').then((m) => ({ default: m.E72FolderDetail })),
)
const E71Budget = lazy(() => import('@/ui/screens/tools/E71Budget').then((m) => ({ default: m.E71Budget })))
const E73CategoryDetail = lazy(() =>
  import('@/ui/screens/tools/E73CategoryDetail').then((m) => ({ default: m.E73CategoryDetail })),
)
const E74BudgetSettings = lazy(() =>
  import('@/ui/screens/tools/E74BudgetSettings').then((m) => ({ default: m.E74BudgetSettings })),
)
const E75BudgetAccount = lazy(() =>
  import('@/ui/screens/tools/E75BudgetAccount').then((m) => ({ default: m.E75BudgetAccount })),
)
const E76BudgetLivrets = lazy(() =>
  import('@/ui/screens/tools/E76BudgetLivrets').then((m) => ({ default: m.E76BudgetLivrets })),
)
const E77BudgetLivretDetail = lazy(() =>
  import('@/ui/screens/tools/E77BudgetLivretDetail').then((m) => ({ default: m.E77BudgetLivretDetail })),
)
const E78BudgetPrevisions = lazy(() =>
  import('@/ui/screens/tools/E78BudgetPrevisions').then((m) => ({ default: m.E78BudgetPrevisions })),
)

export const NO_NAV_SCREENS: Screen[] = ['welcome', 'profile', 'energy', 'energy-checkin', 'feedback', 'feedback-list']

export function activeTabFor(screen: Screen): BottomNavTab | null {
  switch (screen) {
    case 'dashboard':
    case 'planning':
      return 'dashboard'
    case 'inbox':
      return 'inbox'
    case 'settings':
      return 'settings'
    default:
      return null
  }
}

export function AppScreens() {
  const { screen, loading, overloadMode, inboxTasks, goTo } = useApp()

  if (loading) {
    return (
      <>
        <ScreenCodeBadge />
        <ScreenLoading />
      </>
    )
  }

  function renderScreen() {
    switch (screen) {
      case 'welcome':
        return <E01Welcome />
      case 'profile':
        return <E02Profile />
      case 'energy':
        return <E03Energy />
      case 'dashboard':
        return <E10Dashboard />
      case 'planning':
        return <E12WeekPlanning />
      case 'inbox':
        return <E20Inbox />
      case 'task-create-v2':
        return <E21CreateTaskV2 />
      case 'task-detail':
        return <E22TaskDetail />
      case 'task-edit':
        return <E24EditTask />
      case 'task-decompose':
        return <E23Decompose />
      case 'energy-checkin':
        return <E31EnergyCheckIn />
      case 'overload-recovery':
        return <E90OverloadRecovery />
      case 'resources':
        return <E120Resources />
      case 'manual-tests':
        return <E121ManualTests />
      case 'feedback':
        return <E122FeedbackCapture />
      case 'feedback-list':
        return <E123FeedbackList />
      case 'settings':
        return <E110Settings />
      case 'settings-profile':
        return <E111Profile />
      case 'settings-accessibility':
        return <E112Accessibility />
      case 'settings-privacy':
        return <E116Privacy />
      case 'settings-export':
        return <E117Export />
      case 'list-detail':
        return <E61ListDetail />
      case 'list-item-detail':
        return <E62ListItemDetail />
      case 'tools':
        return <E70Tools />
      case 'folder-detail':
        return <E72FolderDetail />
      case 'budget':
        return <E71Budget />
      case 'budget-account':
        return <E75BudgetAccount />
      case 'budget-previsions':
        return <E78BudgetPrevisions />
      case 'budget-livrets':
        return <E76BudgetLivrets />
      case 'budget-livret-detail':
        return <E77BudgetLivretDetail />
      case 'budget-category-detail':
        return <E73CategoryDetail />
      case 'budget-settings':
        return <E74BudgetSettings />
    }
  }

  const showNav = !NO_NAV_SCREENS.includes(screen)

  return (
    <>
      <DevResetButton />
      <ScreenCodeBadge />
      <FeedbackFab />
      <LazyScreenBoundary>
        <Suspense fallback={<ScreenLoading />}>{renderScreen()}</Suspense>
      </LazyScreenBoundary>
      {showNav && (
        <BottomNav
          activeTab={activeTabFor(screen)}
          overloadMode={overloadMode}
          inboxHasTasks={inboxTasks.length > 0}
          onAddTask={() => goTo('task-create-v2')}
          onGoInbox={() => goTo('inbox')}
          onGoDashboard={() => goTo('dashboard')}
          onGoSettings={() => goTo('settings')}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppScreens />
    </AppProvider>
  )
}
