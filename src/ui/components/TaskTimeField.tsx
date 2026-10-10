import { useState } from 'react'
import { RoutineTimeKeypad } from '@/ui/components/RoutineTimeKeypad'

interface TaskTimeFieldProps {
  label: string
  value: string
  onChange: (time: string) => void
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '1.25rem',
  fontFamily: 'var(--font-body)',
  textAlign: 'left',
  cursor: 'pointer',
  boxSizing: 'border-box',
}

export function TaskTimeField({ label, value, onChange }: TaskTimeFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={buttonStyle}
      >
        {value || 'Choisir l\'heure'}
      </button>
      {open && (
        <RoutineTimeKeypad
          onComplete={(time) => {
            onChange(time)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
