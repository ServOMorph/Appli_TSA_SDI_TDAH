import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

export function E114Organisation() {
  const { goTo } = useApp()

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
      }}
    >
      <button style={backBtnStyle} onClick={() => goTo('settings')} aria-label="Retour">
        ← Retour
      </button>

      <h1>Organisation</h1>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Ordre des modules</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          La personnalisation de l'ordre des modules sera disponible en V1.
        </p>
      </Card>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Affichage des modules</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          La sélection des modules visibles sera disponible en V1.
        </p>
      </Card>

    </main>
  )
}
