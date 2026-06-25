import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'
import type { StimulationMode } from '@/domain/entities/settings'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const modes: { value: StimulationMode; label: string; description: string }[] = [
  {
    value: 'calm',
    label: 'Calme',
    description: 'Interface épurée, peu d\'éléments visuels, priorité au calme.',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Équilibre entre fonctionnalités et clarté.',
  },
  {
    value: 'dynamic',
    label: 'Dynamique',
    description: 'Interface plus riche, retours visuels plus présents.',
  },
]

export function E113Stimulation() {
  const { settings, updateSettings, goTo } = useApp()

  const current: StimulationMode = settings?.stimulation_mode ?? 'standard'

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

      <h1>Stimulation cognitive</h1>

      <p style={{ color: 'var(--color-text-muted)' }}>
        Choisissez le niveau d'intensité qui correspond à vos besoins.
      </p>

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ display: 'none' }}>Mode de stimulation</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {modes.map((mode) => (
            <label key={mode.value} style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="stimulation"
                value={mode.value}
                checked={current === mode.value}
                onChange={() => updateSettings({ stimulation_mode: mode.value })}
                style={{ display: 'none' }}
              />
              <Card
                style={{
                  border: current === mode.value ? '2px solid var(--color-primary)' : undefined,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{mode.label}</p>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {mode.description}
                </p>
              </Card>
            </label>
          ))}
        </div>
      </fieldset>

    </main>
  )
}
