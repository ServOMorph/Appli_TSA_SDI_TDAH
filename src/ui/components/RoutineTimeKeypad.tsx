import { useState } from 'react'
import {
  emptyKeypadDigits,
  isKeypadDigitAllowed,
  keypadTime,
  pressKeypadDigit,
  type KeypadDigits,
} from '@/domain/rules/routineRules'

interface RoutineTimeKeypadProps {
  onComplete: (time: string) => void
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const displayStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '2rem',
  fontFamily: 'var(--font-body)',
  letterSpacing: '0.1em',
  margin: 0,
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--spacing-sm)',
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

export function RoutineTimeKeypad({ onComplete }: RoutineTimeKeypadProps) {
  const [digits, setDigits] = useState<KeypadDigits>(emptyKeypadDigits())
  const complete = digits.every((d) => d !== null)

  function press(digit: string) {
    if (complete) return
    const next = pressKeypadDigit(digits, digit)
    setDigits(next)
    const time = keypadTime(next)
    if (time) onComplete(time)
  }

  function reset() {
    setDigits(emptyKeypadDigits())
  }

  const display = `${digits[0] ?? '_'}${digits[1] ?? '_'}:${digits[2] ?? '_'}${digits[3] ?? '_'}`

  return (
    <div>
      <p aria-label="Heure saisie" style={displayStyle}>{display}</p>
      <div style={gridStyle} role="group" aria-label="Pavé numérique">
        {DIGITS.map((digit) => {
          const disabled = complete || !isKeypadDigitAllowed(digits, digit)
          return (
            <button key={digit} type="button" onClick={() => press(digit)} disabled={disabled} style={keyStyle(disabled)}>
              {digit}
            </button>
          )
        })}
        <button type="button" aria-label="Effacer" onClick={reset} style={keyStyle(false)}>
          Effacer
        </button>
        <button
          type="button"
          onClick={() => press('0')}
          disabled={complete || !isKeypadDigitAllowed(digits, '0')}
          style={keyStyle(complete || !isKeypadDigitAllowed(digits, '0'))}
        >
          0
        </button>
      </div>
    </div>
  )
}
