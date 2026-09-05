import type { TaskCategory } from '@/domain/entities/taskCategory'

interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
  categories?: TaskCategory[]
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

const categoryRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
}

function categoryButtonStyle(color: string, selected: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    border: selected ? `2px solid ${color}` : '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  }
}

function dotStyle(color: string): React.CSSProperties {
  return {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  }
}

const removeLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.875rem',
}

export function ColorPicker({ value, onChange, categories }: ColorPickerProps) {
  if (categories && categories.length > 0) {
    return (
      <div style={categoryRowStyle}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-label={category.name}
            aria-pressed={value === category.color}
            onClick={() => onChange(category.color)}
            style={categoryButtonStyle(category.color, value === category.color)}
          >
            <span style={dotStyle(category.color)} />
            {category.name}
          </button>
        ))}
        {value && (
          <button type="button" onClick={() => onChange(null)} style={removeLinkStyle}>
            Retirer
          </button>
        )}
      </div>
    )
  }

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
        <button type="button" onClick={() => onChange(null)} style={removeLinkStyle}>
          Retirer
        </button>
      )}
    </div>
  )
}
