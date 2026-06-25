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

const profileLabels: Record<string, string> = {
  audhd: 'AuDHD (TSA + TDAH)',
  asd: 'TSA sans TDAH',
  adhd: 'TDAH sans TSA',
}

export function E111Profile() {
  const { currentUser, goTo } = useApp()

  const profileLabel = currentUser?.profile_type
    ? (profileLabels[currentUser.profile_type] ?? currentUser.profile_type)
    : 'Non défini'

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

      <h1>Profil</h1>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Type de profil
        </p>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }} aria-label="type de profil">
          {profileLabel}
        </p>
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Informations
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Les données de profil sont stockées localement sur votre appareil.
        </p>
      </Card>

    </main>
  )
}
