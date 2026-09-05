import { useApp } from '@/app/AppContext'

export function FeedbackFab() {
  const { screen, goTo } = useApp()
  if (screen === 'feedback' || screen === 'feedback-list') return null

  return (
    <button
      type="button"
      aria-label="Signaler un retour"
      onClick={() => goTo({ name: 'feedback', sourceScreen: screen })}
      style={{
        position: 'fixed',
        right: 'var(--spacing-lg)',
        bottom: 'calc(var(--bottomnav-h) + var(--spacing-lg))',
        zIndex: 40,
        width: 52,
        height: 52,
        border: 'none',
        borderRadius: '50%',
        background: 'var(--color-accent)',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        fontSize: '1.4rem',
      }}
    >
      +
    </button>
  )
}
