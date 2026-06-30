import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/AppContext'
import type { TaskV2 } from '@/domain/entities/taskV2'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function taskHour(task: TaskV2): number | null {
  if (!task.scheduled_start) return null
  return parseInt(task.scheduled_start.slice(0, 2), 10)
}

type Picker =
  | { mode: 'assign'; hour: number }
  | { mode: 'move'; task: TaskV2; hour: number }
  | null

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
  position: 'relative',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-md) var(--spacing-xl)',
  position: 'sticky',
  top: 0,
  background: 'var(--color-background)',
  zIndex: 10,
  borderBottom: '1px solid var(--color-border)',
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1.25rem',
  padding: '4px 8px',
  lineHeight: 1,
  borderRadius: 'var(--radius-sm)',
}

function slotRowStyle(isNow: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '64px',
    borderBottom: '1px solid var(--color-border)',
    background: isNow ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'transparent',
  }
}

const hourLabelStyle: React.CSSProperties = {
  width: '48px',
  flexShrink: 0,
  padding: '8px 4px',
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  borderRight: '1px solid var(--color-border)',
}

const slotCellStyle: React.CSSProperties = {
  flex: 1,
  padding: '4px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  cursor: 'pointer',
}

function taskChipStyle(essential: boolean): React.CSSProperties {
  return {
    background: essential ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
    color: essential ? '#fff' : 'var(--color-text)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 8px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    width: '100%',
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'flex-end',
}

const sheetStyle: React.CSSProperties = {
  background: 'var(--color-background)',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
  padding: 'var(--spacing-xl)',
  maxHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

const closeStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: '4px',
}

const pickerItemStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  fontSize: '0.9375rem',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
}

export function E40Planning() {
  const { goTo, getPlannedTasksForDate, getUnscheduledPlannedTasks, scheduleV2Task } = useApp()

  const [displayDate, setDisplayDate] = useState(todayStr)
  const [scheduledTasks, setScheduledTasks] = useState<TaskV2[]>([])
  const [unscheduled, setUnscheduled] = useState<TaskV2[]>([])
  const [picker, setPicker] = useState<Picker>(null)

  const currentHour = new Date().getHours()
  const currentSlotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function load() {
      const [sched, unsched] = await Promise.all([
        getPlannedTasksForDate(displayDate),
        getUnscheduledPlannedTasks(),
      ])
      setScheduledTasks(sched)
      setUnscheduled(unsched)
    }
    load()
  }, [displayDate]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView?.({ behavior: 'instant', block: 'center' })
    }
  }, [])

  async function handleAssign(taskId: string, hour: number) {
    const start = `${String(hour).padStart(2, '0')}:00`
    const end = `${String(Math.min(hour + 1, 23)).padStart(2, '0')}:00`
    await scheduleV2Task(taskId, displayDate, start, end)
    const [sched, unsched] = await Promise.all([
      getPlannedTasksForDate(displayDate),
      getUnscheduledPlannedTasks(),
    ])
    setScheduledTasks(sched)
    setUnscheduled(unsched)
    setPicker(null)
  }

  const isToday = displayDate === todayStr()

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <button style={iconBtnStyle} onClick={() => goTo('dashboard')} aria-label="Retour">
          &larr;
        </button>
        <button
          style={iconBtnStyle}
          onClick={() => setDisplayDate((d) => addDays(d, -1))}
          aria-label="Jour précédent"
        >
          &lsaquo;
        </button>
        <span
          style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '0.9375rem', textTransform: 'capitalize' }}
        >
          {formatDate(displayDate)}
        </span>
        <button
          style={iconBtnStyle}
          onClick={() => setDisplayDate((d) => addDays(d, 1))}
          aria-label="Jour suivant"
        >
          &rsaquo;
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} role="grid" aria-label="Planning de la journée">
        {HOURS.map((hour) => {
          const isNow = isToday && hour === currentHour
          const tasksInSlot = scheduledTasks.filter((t) => taskHour(t) === hour)

          return (
            <div
              key={hour}
              ref={isNow ? currentSlotRef : null}
              role="row"
              style={slotRowStyle(isNow)}
            >
              <div style={hourLabelStyle} aria-hidden>
                {hour}h
              </div>
              <div
                role="gridcell"
                style={slotCellStyle}
                onClick={() => tasksInSlot.length === 0 && setPicker({ mode: 'assign', hour })}
                aria-label={`Créneau ${hour}h`}
              >
                {tasksInSlot.map((task) => (
                  <button
                    key={task.id}
                    style={taskChipStyle(task.essential)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setPicker({ mode: 'move', task, hour })
                    }}
                    aria-label={`${task.title} — déplacer`}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {picker !== null && (
        <div
          style={overlayStyle}
          role="dialog"
          aria-modal
          aria-label={picker.mode === 'assign' ? 'Choisir une tâche' : 'Déplacer la tâche'}
        >
          <div style={sheetStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {picker.mode === 'assign'
                  ? `Placer à ${String(picker.hour).padStart(2, '0')}h00`
                  : `Déplacer « ${picker.task.title} »`}
              </p>
              <button style={closeStyle} onClick={() => setPicker(null)} aria-label="Fermer">
                ✕
              </button>
            </div>

            {picker.mode === 'assign' && (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {unscheduled.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                    Aucune tâche à planifier. Ajoutez une tâche et choisissez "Planifier".
                  </p>
                ) : (
                  unscheduled.map((task) => (
                    <button
                      key={task.id}
                      style={pickerItemStyle}
                      onClick={() => handleAssign(task.id, picker.hour)}
                    >
                      {task.title}
                    </button>
                  ))
                )}
              </div>
            )}

            {picker.mode === 'move' && (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {HOURS.filter((h) => h !== picker.hour).map((h) => (
                  <button
                    key={h}
                    style={pickerItemStyle}
                    onClick={() => handleAssign(picker.task.id, h)}
                  >
                    {String(h).padStart(2, '0')}h00
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
