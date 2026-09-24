import { useState } from 'react'
import { addDays, formatDayBadge, formatMonthYear, todayStr, weekStrip } from '@/domain/rules/planningSlotRules'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'

interface RoutineWeekdayPickerProps {
  schedules: RoutineSchedule[]
  onDayClick: (weekday: number) => void
}

const navRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-sm)',
}

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.1rem',
  color: 'var(--color-text)',
  padding: '4px 8px',
}

const daysRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-xs)',
  justifyContent: 'space-between',
}

function dayBtnStyle(scheduled: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 4px',
    borderRadius: 'var(--radius-md)',
    border: scheduled ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
    backgroundColor: scheduled ? 'var(--color-accent)' : 'var(--color-surface)',
    color: scheduled ? '#fff' : 'var(--color-text)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
  }
}

export function RoutineWeekdayPicker({ schedules, onDayClick }: RoutineWeekdayPickerProps) {
  const [referenceDate, setReferenceDate] = useState(todayStr())
  const dates = weekStrip(referenceDate)

  return (
    <div>
      <div style={navRowStyle}>
        <button
          type="button"
          aria-label="Semaine précédente"
          onClick={() => setReferenceDate((d) => addDays(d, -7))}
          style={navBtnStyle}
        >
          ◀
        </button>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{formatMonthYear(dates[0])}</span>
        <button
          type="button"
          aria-label="Semaine suivante"
          onClick={() => setReferenceDate((d) => addDays(d, 7))}
          style={navBtnStyle}
        >
          ▶
        </button>
      </div>
      <div style={daysRowStyle} role="group" aria-label="Jours de la semaine">
        {dates.map((date) => {
          const weekday = new Date(date + 'T12:00:00').getDay()
          const schedule = schedules.find((s) => s.weekday === weekday) ?? null
          const badge = formatDayBadge(date)
          return (
            <button
              key={date}
              type="button"
              aria-label={`${badge.weekday} ${badge.day}${schedule ? `, planifié à ${schedule.time}` : ''}`}
              aria-pressed={!!schedule}
              onClick={() => onDayClick(weekday)}
              style={dayBtnStyle(!!schedule)}
            >
              <span>{badge.weekday}</span>
              <span>{badge.day}</span>
              {schedule && <span>{schedule.time}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
