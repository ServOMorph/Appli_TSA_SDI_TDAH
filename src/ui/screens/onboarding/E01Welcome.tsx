import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'

export function E01Welcome() {
  const { goTo } = useApp()

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-xl)',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div>
        <h1>Bienvenue</h1>
        <p>Une application conçue pour réduire votre charge mentale quotidienne.</p>
      </div>
      <Button fullWidth onClick={() => goTo('profile')}>
        Commencer
      </Button>
    </main>
  )
}
