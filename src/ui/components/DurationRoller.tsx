interface DurationRollerProps {
  minutes: number | null
  onChange: (minutes: number | null) => void
}

const MAX_DAYS = 30

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-sm)',
  minWidth: 0,
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
  minWidth: 0,
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
}

function toParts(minutes: number | null): { days: number; hours: number; mins: number } {
  const total = minutes ?? 0
  const days = Math.floor(total / (24 * 60))
  const hours = Math.floor((total % (24 * 60)) / 60)
  const mins = total % 60
  return { days, hours, mins }
}

function toMinutes(days: number, hours: number, mins: number): number | null {
  const total = days * 24 * 60 + hours * 60 + mins
  return total > 0 ? total : null
}

export function DurationRoller({ minutes, onChange }: DurationRollerProps) {
  const { days, hours, mins } = toParts(minutes)

  function update(partial: Partial<{ days: number; hours: number; mins: number }>) {
    onChange(toMinutes(partial.days ?? days, partial.hours ?? hours, partial.mins ?? mins))
  }

  return (
    <div style={rowStyle} role="group" aria-label="Durée">
      <div style={fieldStyle}>
        <label htmlFor="duration-days" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Jours
        </label>
        <select
          id="duration-days"
          value={days}
          onChange={(e) => update({ days: Number(e.target.value) })}
          style={selectStyle}
        >
          {Array.from({ length: MAX_DAYS + 1 }, (_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
      <div style={fieldStyle}>
        <label htmlFor="duration-hours" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Heures
        </label>
        <select
          id="duration-hours"
          value={hours}
          onChange={(e) => update({ hours: Number(e.target.value) })}
          style={selectStyle}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
      <div style={fieldStyle}>
        <label htmlFor="duration-minutes" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Minutes
        </label>
        <select
          id="duration-minutes"
          value={mins}
          onChange={(e) => update({ mins: Number(e.target.value) })}
          style={selectStyle}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
