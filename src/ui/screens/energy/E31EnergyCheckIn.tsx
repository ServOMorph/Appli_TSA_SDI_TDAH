import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const SPOON_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function E31EnergyCheckIn() {
  const { todayEnergy, saveTodayEnergy, skipTodayEnergy, goTo } = useApp()
  const [selected, setSelected] = useState<number | null>(todayEnergy)

  async function confirm() {
    if (selected !== null) {
      await saveTodayEnergy(selected)
    }
    goTo('energy-view')
  }

  async function skip() {
    await skipTodayEnergy()
    goTo('energy-view')
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
        justifyContent: 'center',
      }}
    >
      <button style={backBtnStyle} onClick={() => goTo('energy-view')} aria-label="Retour">
        ← Retour
      </button>

      <div>
        <h1>Mon énergie aujourd'hui</h1>
        <p>Combien d'énergie avez-vous aujourd'hui ?</p>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
        }}
      >
        {SPOON_OPTIONS.map((n) => (
          <button
            key={n}
            aria-pressed={selected === n}
            onClick={() => setSelected(n)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              border: selected === n
                ? '2px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              backgroundColor: selected === n ? 'var(--color-primary)' : 'var(--color-surface)',
              color: selected === n ? '#ffffff' : 'var(--color-text)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <Button fullWidth onClick={confirm} disabled={selected === null}>
        Valider
      </Button>
      <Button variant="secondary" fullWidth onClick={skip}>
        Ignorer
      </Button>
    </main>
  )
}
