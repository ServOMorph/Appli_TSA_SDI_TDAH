import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
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

export function E30EnergyView() {
  const { todayEnergy, todayEnergyStatus, goTo } = useApp()

  function renderEnergyState() {
    if (todayEnergyStatus === 'filled' && todayEnergy !== null) {
      return (
        <Card style={{ textAlign: 'center' }}>
          <p
            aria-label={`${todayEnergy} énergie aujourd'hui`}
            style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}
          >
            {todayEnergy}
          </p>
          <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0' }}>énergie aujourd'hui</p>
        </Card>
      )
    }
    if (todayEnergyStatus === 'skipped') {
      return (
        <Card>
          <p style={{ color: 'var(--color-text-muted)' }}>Énergie ignorée pour aujourd'hui</p>
        </Card>
      )
    }
    return (
      <Card>
        <p style={{ color: 'var(--color-text-muted)' }}>Aucun check-in aujourd'hui</p>
      </Card>
    )
  }

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
      <button style={backBtnStyle} onClick={() => goTo('dashboard')} aria-label="Retour">
        ← Retour
      </button>

      <h1>Mon énergie</h1>
      {renderEnergyState()}
      <Button fullWidth onClick={() => goTo('energy-checkin')}>
        {todayEnergyStatus === 'filled' ? 'Modifier' : 'Faire mon check-in'}
      </Button>
    </main>
  )
}
