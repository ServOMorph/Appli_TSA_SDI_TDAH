import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { FontSize } from '@/domain/entities/settings'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const fontSizeLabels: Record<FontSize, string> = {
  small: 'Petite',
  medium: 'Normale',
  large: 'Grande',
}

export function E112Accessibility() {
  const { settings, updateSettings, goTo } = useApp()

  const fontSize: FontSize = settings?.font_size ?? 'medium'
  const reducedMotion = settings?.reduced_motion ?? false
  const darkMode = settings?.dark_mode ?? false

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

      <h1>Accessibilité</h1>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
          Taille du texte
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
            <Button
              key={size}
              variant={fontSize === size ? 'primary' : 'secondary'}
              onClick={() => updateSettings({ font_size: size })}
              aria-pressed={fontSize === size}
            >
              {fontSizeLabels[size]}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <label
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Réduire les animations</span>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => updateSettings({ reduced_motion: e.target.checked })}
            aria-label="Réduire les animations"
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </label>
      </Card>

      <Card>
        <label
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Mode sombre</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => updateSettings({ dark_mode: e.target.checked })}
            aria-label="Mode sombre"
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </label>
      </Card>

    </main>
  )
}
