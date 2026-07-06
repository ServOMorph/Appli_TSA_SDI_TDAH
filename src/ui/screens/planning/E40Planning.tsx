import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/AppContext'
import type { TaskV2 } from '@/domain/entities/taskV2'

const SLOTS = Array.from({ length: 48 }, (_, i) => i)

function slotTime(slot: number): string {
  const hour = Math.floor(slot / 2)
  const minute = slot % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
}

function slotLabel(slot: number): string {
  const hour = Math.floor(slot / 2)
  const minute = slot % 2 === 0 ? '00' : '30'
  return `${hour}h${minute}`
}

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

function taskSlot(task: TaskV2): number | null {
  if (!task.scheduled_start) return null
  const [h, m] = task.scheduled_start.split(':').map(Number)
  return h * 2 + (m >= 30 ? 1 : 0)
}

type Picker =
  | { mode: 'assign'; slot: number }
  | { mode: 'move'; task: TaskV2; slot: number }
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

function pickerItemSelectedStyle(selected: boolean): React.CSSProperties {
  return {
    ...pickerItemStyle,
    border: selected ? '2px solid var(--color-primary)' : pickerItemStyle.border,
    background: selected ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' : pickerItemStyle.background,
  }
}

const validateBtnStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--color-primary)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  color: '#fff',
  fontSize: '0.9375rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  width: '100%',
}

const validateBtnDisabledStyle: React.CSSProperties = {
  ...validateBtnStyle,
  background: 'var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed',
}

export function E40Planning() {
  const {
    goTo,
    getPlannedTasksForDate,
    getUnscheduledPlannedTasks,
    scheduleV2Task,
    selectedTaskId: pendingTaskId,
    selectTask,
  } = useApp()

  const [displayDate, setDisplayDate] = useState(todayStr)
  const [scheduledTasks, setScheduledTasks] = useState<TaskV2[]>([])
  const [unscheduled, setUnscheduled] = useState<TaskV2[]>([])
  const [picker, setPicker] = useState<Picker>(null)
  const [pickerSelectedId, setPickerSelectedId] = useState<string | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)

  const now = new Date()
  const currentSlot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0)
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

  async function handleAssign(taskId: string, slot: number) {
    const conflict = scheduledTasks.some((t) => t.id !== taskId && taskSlot(t) === slot)
    if (conflict) {
      setConflictError(`Ce créneau (${slotLabel(slot)}) est déjà occupé par une autre tâche.`)
      return
    }
    setConflictError(null)
    const start = slotTime(slot)
    const end = slotTime(Math.min(slot + 1, 47))
    await scheduleV2Task(taskId, displayDate, start, end)
    const [sched, unsched] = await Promise.all([
      getPlannedTasksForDate(displayDate),
      getUnscheduledPlannedTasks(),
    ])
    setScheduledTasks(sched)
    setUnscheduled(unsched)
    setPicker(null)
    setPickerSelectedId(null)
    if (taskId === pendingTaskId) {
      selectTask(null)
    }
  }

  function closePicker() {
    setPicker(null)
    setPickerSelectedId(null)
    setConflictError(null)
  }

  const isToday = displayDate === todayStr()
  const pendingTask = picker?.mode === 'assign' ? unscheduled.find((t) => t.id === pendingTaskId) ?? null : null

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
        {SLOTS.map((slot) => {
          const isNow = isToday && slot === currentSlot
          const tasksInSlot = scheduledTasks.filter((t) => taskSlot(t) === slot)

          return (
            <div
              key={slot}
              ref={isNow ? currentSlotRef : null}
              role="row"
              style={slotRowStyle(isNow)}
            >
              <div style={hourLabelStyle} aria-hidden>
                {slotLabel(slot)}
              </div>
              <div
                role="gridcell"
                style={slotCellStyle}
                onClick={() => {
                  if (tasksInSlot.length === 0) {
                    setConflictError(null)
                    setPicker({ mode: 'assign', slot })
                  } else if (pendingTaskId) {
                    handleAssign(pendingTaskId, slot)
                  }
                }}
                aria-label={`Créneau ${slotLabel(slot)}`}
              >
                {tasksInSlot.map((task) => (
                  <button
                    key={task.id}
                    style={taskChipStyle(task.essential)}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (pendingTaskId) {
                        handleAssign(pendingTaskId, slot)
                      } else {
                        setPicker({ mode: 'move', task, slot })
                      }
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
                  ? pendingTask
                    ? `Placer « ${pendingTask.title} » à ${slotLabel(picker.slot)}`
                    : `Placer à ${slotLabel(picker.slot)}`
                  : `Déplacer « ${picker.task.title} »`}
              </p>
              <button style={closeStyle} onClick={closePicker} aria-label="Fermer">
                ✕
              </button>
            </div>

            {picker.mode === 'assign' && (
              <>
                {pendingTask ? (
                  <button style={validateBtnStyle} onClick={() => handleAssign(pendingTask.id, picker.slot)}>
                    Valider
                  </button>
                ) : (
                  <>
                    <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                      {unscheduled.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                          Aucune tâche à planifier. Ajoutez une tâche et choisissez "Planifier".
                        </p>
                      ) : (
                        unscheduled.map((task) => (
                          <button
                            key={task.id}
                            style={pickerItemSelectedStyle(pickerSelectedId === task.id)}
                            aria-pressed={pickerSelectedId === task.id}
                            onClick={() => setPickerSelectedId(task.id)}
                          >
                            {task.title}
                          </button>
                        ))
                      )}
                    </div>
                    {unscheduled.length > 0 && (
                      <button
                        style={pickerSelectedId ? validateBtnStyle : validateBtnDisabledStyle}
                        disabled={!pickerSelectedId}
                        onClick={() => pickerSelectedId && handleAssign(pickerSelectedId, picker.slot)}
                      >
                        Valider
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {conflictError && (
              <p role="alert" style={{ color: 'var(--color-error, #c0392b)', margin: 0 }}>
                {conflictError}
              </p>
            )}

            {picker.mode === 'move' && (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {SLOTS.filter(
                  (s) => s !== picker.slot && !scheduledTasks.some((t) => t.id !== picker.task.id && taskSlot(t) === s),
                ).map((s) => (
                  <button
                    key={s}
                    style={pickerItemStyle}
                    onClick={() => handleAssign(picker.task.id, s)}
                  >
                    {slotLabel(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {conflictError && picker === null && (
        <div style={overlayStyle} role="dialog" aria-modal aria-label="Créneau occupé">
          <div style={sheetStyle}>
            <p role="alert" style={{ margin: 0, color: 'var(--color-error, #c0392b)' }}>
              {conflictError}
            </p>
            <button style={validateBtnStyle} onClick={() => setConflictError(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
