import type { RecurrenceRuleInput } from '@/app/contexts/usePlanningState'
import type { RecurrenceFrequency, RecurrenceEndType } from '@/domain/entities/taskRecurrence'

interface RecurrenceEditorProps {
  value: RecurrenceRuleInput
  onChange: (value: RecurrenceRuleInput) => void
}

const FREQUENCIES: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'daily', label: 'Jour' },
  { value: 'weekly', label: 'Semaine' },
  { value: 'monthly', label: 'Mois' },
  { value: 'yearly', label: 'Année' },
]

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'M' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
]

const colStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }
const selectStyle: React.CSSProperties = {
  padding: '8px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
}
const numberInputStyle: React.CSSProperties = { ...selectStyle, width: '60px' }

function weekdayBtnStyle(selected: boolean): React.CSSProperties {
  return {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: selected ? 'var(--color-accent)' : 'var(--color-surface)',
    color: selected ? '#fff' : 'var(--color-text)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  }
}

export function RecurrenceEditor({ value, onChange }: RecurrenceEditorProps) {
  function toggleWeekday(day: number) {
    const current = value.weekdays ?? []
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    onChange({ ...value, weekdays: next })
  }

  return (
    <div style={colStyle} role="group" aria-label="Règle de récurrence">
      <div style={rowStyle}>
        <label htmlFor="recurrence-interval" style={{ color: 'var(--color-text-muted)' }}>
          Tous les
        </label>
        <input
          id="recurrence-interval"
          type="number"
          min={1}
          value={value.interval}
          onChange={(e) => onChange({ ...value, interval: Math.max(1, Number(e.target.value)) })}
          style={numberInputStyle}
        />
        <select
          aria-label="Fréquence"
          value={value.frequency}
          onChange={(e) => onChange({ ...value, frequency: e.target.value as RecurrenceFrequency })}
          style={selectStyle}
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}(s)</option>
          ))}
        </select>
      </div>

      {value.frequency === 'weekly' && (
        <div style={rowStyle} role="group" aria-label="Jours de la semaine">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              aria-label={d.label}
              aria-pressed={(value.weekdays ?? []).includes(d.value)}
              onClick={() => toggleWeekday(d.value)}
              style={weekdayBtnStyle((value.weekdays ?? []).includes(d.value))}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <div style={colStyle}>
        <label style={rowStyle}>
          <input
            type="radio"
            name="recurrence-end"
            checked={value.end_type === 'never'}
            onChange={() => onChange({ ...value, end_type: 'never' as RecurrenceEndType, end_date: null, end_count: null })}
          />
          Jamais
        </label>
        <label style={rowStyle}>
          <input
            type="radio"
            name="recurrence-end"
            checked={value.end_type === 'date'}
            onChange={() => onChange({ ...value, end_type: 'date' as RecurrenceEndType, end_count: null })}
          />
          Le
          <input
            type="date"
            aria-label="Date de fin"
            value={value.end_date ?? ''}
            disabled={value.end_type !== 'date'}
            onChange={(e) => onChange({ ...value, end_date: e.target.value })}
            style={selectStyle}
          />
        </label>
        <label style={rowStyle}>
          <input
            type="radio"
            name="recurrence-end"
            checked={value.end_type === 'count'}
            onChange={() => onChange({ ...value, end_type: 'count' as RecurrenceEndType, end_date: null, end_count: value.end_count ?? 1 })}
          />
          Après
          <input
            type="number"
            min={1}
            aria-label="Nombre d'occurrences"
            value={value.end_count ?? 1}
            disabled={value.end_type !== 'count'}
            onChange={(e) => onChange({ ...value, end_count: Math.max(1, Number(e.target.value)) })}
            style={numberInputStyle}
          />
          occurrence(s)
        </label>
      </div>
    </div>
  )
}
