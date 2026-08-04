import { TASK_ICONS } from '@/domain/rules/taskAppearance'
import { TaskIcon } from '@/ui/components/TaskIcon'

interface IconPickerProps {
  value: string | null
  onChange: (icon: string | null) => void
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 'var(--spacing-xs)',
}

function iconButtonStyle(selected: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 4px',
    borderRadius: 'var(--radius-sm)',
    border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
    backgroundColor: selected ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-body)',
  }
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div style={gridStyle} role="group" aria-label="Choisir une icône">
      {TASK_ICONS.map((icon) => (
        <button
          key={icon.id}
          type="button"
          aria-pressed={value === icon.id}
          aria-label={icon.label}
          style={iconButtonStyle(value === icon.id)}
          onClick={() => onChange(value === icon.id ? null : icon.id)}
        >
          <TaskIcon icon={icon.id} size={22} />
          <span>{icon.label}</span>
        </button>
      ))}
    </div>
  )
}
