import { AppProvider, useApp } from '@/app/AppContext'
import { E01Welcome } from '@/ui/screens/onboarding/E01Welcome'
import { E02Profile } from '@/ui/screens/onboarding/E02Profile'
import { E03Energy } from '@/ui/screens/onboarding/E03Energy'
import { E04FirstTask } from '@/ui/screens/onboarding/E04FirstTask'
import { E10Dashboard } from '@/ui/screens/dashboard/E10Dashboard'
import { E20Inbox } from '@/ui/screens/tasks/E20Inbox'
import { E21CreateTask } from '@/ui/screens/tasks/E21CreateTask'
import { E22TaskDetail } from '@/ui/screens/tasks/E22TaskDetail'
import { E23Decompose } from '@/ui/screens/tasks/E23Decompose'
import { E24Today } from '@/ui/screens/tasks/E24Today'
import { E25Later } from '@/ui/screens/tasks/E25Later'
import { E30EnergyView } from '@/ui/screens/energy/E30EnergyView'
import { E31EnergyCheckIn } from '@/ui/screens/energy/E31EnergyCheckIn'
import { E90OverloadRecovery } from '@/ui/screens/overload/E90OverloadRecovery'
import { E110Settings } from '@/ui/screens/settings/E110Settings'
import { E111Profile } from '@/ui/screens/settings/E111Profile'
import { E112Accessibility } from '@/ui/screens/settings/E112Accessibility'
import { E113Stimulation } from '@/ui/screens/settings/E113Stimulation'
import { E114Organisation } from '@/ui/screens/settings/E114Organisation'
import { E116Privacy } from '@/ui/screens/settings/E116Privacy'
import { E117Export } from '@/ui/screens/settings/E117Export'
import { DevResetButton } from '@/ui/components/DevResetButton'

function AppScreens() {
  const { screen, loading } = useApp()

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
      case 'welcome':              return <E01Welcome />
      case 'profile':              return <E02Profile />
      case 'energy':               return <E03Energy />
      case 'first-task':           return <E04FirstTask />
      case 'dashboard':            return <E10Dashboard />
      case 'inbox':                return <E20Inbox />
      case 'task-create':          return <E21CreateTask />
      case 'task-detail':          return <E22TaskDetail />
      case 'task-decompose':       return <E23Decompose />
      case 'today':                return <E24Today />
      case 'later':                return <E25Later />
      case 'energy-view':          return <E30EnergyView />
      case 'energy-checkin':       return <E31EnergyCheckIn />
      case 'overload-recovery':    return <E90OverloadRecovery />
      case 'settings':             return <E110Settings />
      case 'settings-profile':     return <E111Profile />
      case 'settings-accessibility': return <E112Accessibility />
      case 'settings-stimulation': return <E113Stimulation />
      case 'settings-organisation': return <E114Organisation />
      case 'settings-privacy':     return <E116Privacy />
      case 'settings-export':      return <E117Export />
    }
  }

  return (
    <>
      <DevResetButton />
      {renderScreen()}
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
