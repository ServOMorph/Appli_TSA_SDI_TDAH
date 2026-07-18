import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { BatteryIcon } from '@/ui/components/BatteryIcon'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const SPOON_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)
const SPOON_ROWS = [SPOON_OPTIONS.slice(0, 6), SPOON_OPTIONS.slice(6)]

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
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <BatteryIcon size={24} />
          Mon énergie maintenant
        </h1>
        <p>Combien d'énergie avez-vous maintenant ?</p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}
      >
        {SPOON_ROWS.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {row.map((n) => (
              <button
                key={n}
                aria-pressed={selected === n}
                onClick={() => setSelected(n)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  border: selected === n
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                  backgroundColor: selected === n ? 'var(--color-accent)' : 'var(--color-surface)',
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
