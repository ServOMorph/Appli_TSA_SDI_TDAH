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
        justifyContent: 'space-between',
        height: '100svh',
        overflow: 'hidden',
        padding: 'clamp(16px, 4svh, 32px)',
        gap: 'var(--spacing-md)',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <h1 className="sr-only">Bienvenue</h1>
      <img
        src="/images/welcome-hero.png"
        alt="Bienvenue - Appli TSA SDI TDAH"
        style={{
          width: '100%',
          maxHeight: 'calc(100svh - 96px)',
          minHeight: 0,
          objectFit: 'contain',
          borderRadius: 'var(--radius-md)',
        }}
      />
      <Button fullWidth onClick={() => goTo('profile')} style={{ flex: '0 0 auto' }}>
        Entrer
      </Button>
    </main>
  )
}
