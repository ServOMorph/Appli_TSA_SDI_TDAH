import { useState } from 'react'

interface DurationRollerProps {
  minutes: number | null
  onChange: (minutes: number | null) => void
  maxMinutes?: number
}

type Unit = 'days' | 'hours' | 'mins'

const UNITS: { key: Unit; label: string; max: number }[] = [
  { key: 'days', label: 'Jours', max: 30 },
  { key: 'hours', label: 'Heures', max: 23 },
  { key: 'mins', label: 'Minutes', max: 59 },
]

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

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

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--spacing-sm)',
  marginTop: 'var(--spacing-sm)',
}

function unitButtonStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
    border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '1.25rem',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    boxSizing: 'border-box',
  }
}

function keyStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '14px',
    fontSize: '1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-body)',
  }
}

function toParts(minutes: number | null): Record<Unit, number> {
  const total = minutes ?? 0
  return {
    days: Math.floor(total / (24 * 60)),
    hours: Math.floor((total % (24 * 60)) / 60),
    mins: total % 60,
  }
}

function toMinutes(parts: Record<Unit, number>, maxMinutes?: number): number | null {
  const raw = parts.days * 24 * 60 + parts.hours * 60 + parts.mins
  const total = maxMinutes === undefined ? raw : Math.min(raw, maxMinutes)
  return total > 0 ? total : null
}

export function DurationRoller({ minutes, onChange, maxMinutes }: DurationRollerProps) {
  const [active, setActive] = useState<Unit | null>(null)
  const parts = toParts(minutes)
  const activeUnit = UNITS.find((u) => u.key === active)

  function setUnit(unit: Unit, value: number) {
    onChange(toMinutes({ ...parts, [unit]: value }, maxMinutes))
  }

  function pressDigit(digit: string) {
    if (!activeUnit) return
    const appended = parts[activeUnit.key] * 10 + Number(digit)
    setUnit(activeUnit.key, appended <= activeUnit.max ? appended : Number(digit))
  }

  const atLimit = maxMinutes !== undefined && (minutes ?? 0) >= maxMinutes

  return (
    <div>
      <div style={rowStyle} role="group" aria-label="Durée">
        {UNITS.map((unit) => (
          <div key={unit.key} style={fieldStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{unit.label}</span>
            <button
              type="button"
              aria-label={unit.label}
              aria-pressed={active === unit.key}
              onClick={() => setActive((current) => (current === unit.key ? null : unit.key))}
              style={unitButtonStyle(active === unit.key)}
            >
              {parts[unit.key]}
            </button>
          </div>
        ))}
      </div>
      {activeUnit && (
        <div style={gridStyle} role="group" aria-label={`Chiffres pour ${activeUnit.label.toLowerCase()}`}>
          {DIGITS.map((digit) => (
            <button key={digit} type="button" onClick={() => pressDigit(digit)} style={keyStyle(false)}>
              {digit}
            </button>
          ))}
          <button type="button" aria-label="Effacer" onClick={() => setUnit(activeUnit.key, 0)} style={keyStyle(false)}>
            Effacer
          </button>
          <button type="button" onClick={() => pressDigit('0')} style={keyStyle(false)}>
            0
          </button>
          <button type="button" onClick={() => setActive(null)} style={keyStyle(false)}>
            OK
          </button>
        </div>
      )}
      {atLimit && (
        <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Durée limitée pour finir avant minuit.
        </p>
      )}
    </div>
  )
}
