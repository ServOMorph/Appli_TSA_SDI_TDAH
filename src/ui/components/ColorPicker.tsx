interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
}

const DEFAULT_COLOR = '#4a7c99'

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
}

const swatchStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  padding: 0,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  background: 'none',
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div style={rowStyle}>
      <input
        type="color"
        aria-label="Choisir une couleur"
        value={value ?? DEFAULT_COLOR}
        onChange={(e) => onChange(e.target.value)}
        style={swatchStyle}
      />
      <span style={{ color: 'var(--color-text-muted)' }}>{value ?? 'Aucune couleur'}</span>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem' }}
        >
          Retirer
        </button>
      )}
    </div>
  )
}
