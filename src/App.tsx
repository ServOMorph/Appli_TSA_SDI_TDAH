import { AppProvider, useApp } from '@/app/AppContext'
import { E01Welcome } from '@/ui/screens/onboarding/E01Welcome'
import { E02Profile } from '@/ui/screens/onboarding/E02Profile'
import { E03Energy } from '@/ui/screens/onboarding/E03Energy'
import { E04FirstTask } from '@/ui/screens/onboarding/E04FirstTask'
import { E10Dashboard } from '@/ui/screens/dashboard/E10Dashboard'
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

  switch (screen) {
    case 'welcome':
      return <E01Welcome />
    case 'profile':
      return <E02Profile />
    case 'energy':
      return <E03Energy />
    case 'first-task':
      return <E04FirstTask />
    case 'dashboard':
      return <E10Dashboard />
  }
}

export default function App() {
  return (
    <AppProvider>
      <DevResetButton />
      <AppScreens />
    </AppProvider>
  )
}
