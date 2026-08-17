import { AppProvider, useApp } from '@/app/AppContext'
import { E01Welcome } from '@/ui/screens/onboarding/E01Welcome'
import { E02Profile } from '@/ui/screens/onboarding/E02Profile'
import { E03Energy } from '@/ui/screens/onboarding/E03Energy'
import { E10Dashboard } from '@/ui/screens/dashboard/E10Dashboard'
import { E20Inbox } from '@/ui/screens/tasks/E20Inbox'
import { E21CreateTaskV2 } from '@/ui/screens/tasks/E21CreateTaskV2'
import { E22TaskDetail } from '@/ui/screens/tasks/E22TaskDetail'
import { E23Decompose } from '@/ui/screens/tasks/E23Decompose'
import { E24EditTask } from '@/ui/screens/tasks/E24EditTask'
import { E30EnergyView } from '@/ui/screens/energy/E30EnergyView'
import { E31EnergyCheckIn } from '@/ui/screens/energy/E31EnergyCheckIn'
import { E90OverloadRecovery } from '@/ui/screens/overload/E90OverloadRecovery'
import { E120Resources } from '@/ui/screens/resources/E120Resources'
import { E121ManualTests } from '@/ui/screens/tests/E121ManualTests'
import { E110Settings } from '@/ui/screens/settings/E110Settings'
import { E111Profile } from '@/ui/screens/settings/E111Profile'
import { E112Accessibility } from '@/ui/screens/settings/E112Accessibility'
import { E116Privacy } from '@/ui/screens/settings/E116Privacy'
import { E117Export } from '@/ui/screens/settings/E117Export'
import { E61ListDetail } from '@/ui/screens/lists/E61ListDetail'
import { E70Tools } from '@/ui/screens/tools/E70Tools'
import { E72FolderDetail } from '@/ui/screens/tools/E72FolderDetail'
import { E71Budget } from '@/ui/screens/tools/E71Budget'
import { E73CategoryDetail } from '@/ui/screens/tools/E73CategoryDetail'
import { E74BudgetSettings } from '@/ui/screens/tools/E74BudgetSettings'
import { E75BudgetAccount } from '@/ui/screens/tools/E75BudgetAccount'
import { E76BudgetLivrets } from '@/ui/screens/tools/E76BudgetLivrets'
import { E77BudgetLivretDetail } from '@/ui/screens/tools/E77BudgetLivretDetail'
import { DevResetButton } from '@/ui/components/DevResetButton'
import { BottomNav, type BottomNavTab } from '@/ui/components/BottomNav'
import type { Screen } from '@/app/AppContext'

export const NO_NAV_SCREENS: Screen[] = ['welcome', 'profile', 'energy', 'energy-checkin']

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          color: 'var(--color-text-muted)',
        }}
        role="status"
        aria-live="polite"
      >
        Chargement...
      </div>
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
      case 'planning':
        return <E10Dashboard />
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
      case 'energy-view':
        return <E30EnergyView />
      case 'energy-checkin':
        return <E31EnergyCheckIn />
      case 'overload-recovery':
        return <E90OverloadRecovery />
      case 'resources':
        return <E120Resources />
      case 'manual-tests':
        return <E121ManualTests />
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
      case 'tools':
        return <E70Tools />
      case 'folder-detail':
        return <E72FolderDetail />
      case 'budget':
        return <E71Budget />
      case 'budget-account':
        return <E75BudgetAccount />
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
      {renderScreen()}
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
