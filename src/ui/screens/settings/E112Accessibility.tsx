import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { toolLabel } from '@/ui/components/ToolWidgetCard'
import type { FontSize } from '@/domain/entities/settings'
import { DEFAULT_AMBIANCE_COLOR } from '@/ui/styles/ambiance'

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

const DEFAULT_TOOL_COLOR = '#4a7c99'

export function E112Accessibility() {
  const { settings, updateSettings, goTo, tools, lists, updateToolColor } = useApp()

  const fontSize: FontSize = settings?.font_size ?? 'medium'
  const reducedMotion = settings?.reduced_motion ?? false
  const darkMode = settings?.dark_mode ?? false
  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR
  const monCompteColor = settings?.mon_compte_color ?? null

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        paddingBottom: 'var(--bottomnav-h)',
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
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

      <Card>
        <label
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Couleur d'ambiance</span>
          <input
            type="color"
            value={ambianceColor}
            onChange={(e) => updateSettings({ ambiance_color: e.target.value })}
            aria-label="Couleur d'ambiance"
            style={{ width: '40px', height: '32px', cursor: 'pointer', border: 'none', padding: 0 }}
          />
        </label>
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
          Couleur des outils
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
            <span style={{ color: 'var(--color-text)' }}>Mon compte</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="color"
                aria-label="Couleur de fond pour Mon compte"
                value={monCompteColor ?? DEFAULT_TOOL_COLOR}
                onChange={(e) => updateSettings({ mon_compte_color: e.target.value })}
                style={{ width: '40px', height: '32px', cursor: 'pointer', border: 'none', padding: 0 }}
              />
              {monCompteColor && (
                <button
                  type="button"
                  aria-label="Retirer la couleur de Mon compte"
                  onClick={() => updateSettings({ mon_compte_color: undefined })}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.125rem', lineHeight: 1, padding: 0 }}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          {tools.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun autre outil à personnaliser.</p>
          ) : (
            tools.map((tool) => {
              const list = tool.list_id ? lists.find((item) => item.id === tool.list_id) : undefined
              const label = toolLabel(tool, list?.name)
              return (
                <div key={tool.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
                  <span style={{ color: 'var(--color-text)' }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input
                      type="color"
                      aria-label={`Couleur de fond pour ${label}`}
                      value={tool.color ?? DEFAULT_TOOL_COLOR}
                      onChange={(e) => updateToolColor(tool.id, e.target.value)}
                      style={{ width: '40px', height: '32px', cursor: 'pointer', border: 'none', padding: 0 }}
                    />
                    {tool.color && (
                      <button
                        type="button"
                        aria-label={`Retirer la couleur de ${label}`}
                        onClick={() => updateToolColor(tool.id, null)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.125rem', lineHeight: 1, padding: 0 }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

    </main>
  )
}
