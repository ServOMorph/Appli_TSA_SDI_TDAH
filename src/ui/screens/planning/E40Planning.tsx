import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/AppContext'
import type { TaskV2 } from '@/domain/entities/taskV2'
import { ENERGY_MIN, ENERGY_MAX, isValidEnergyValue } from '@/domain/rules/energyRules'

const SLOTS = Array.from({ length: 48 }, (_, i) => i)
const ENERGY_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)

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
    borderBottom: '1px solid var(--color-text-muted)',
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
  borderRight: '1px solid var(--color-text-muted)',
}

const slotCellStyle: React.CSSProperties = {
  flex: 1,
  padding: '4px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  cursor: 'pointer',
}

function taskChipStyle(essential: boolean, completed: boolean, overloadMode: boolean): React.CSSProperties {
  const background = completed
    ? 'color-mix(in srgb, var(--color-success) 25%, transparent)'
    : essential
      ? overloadMode
        ? 'color-mix(in srgb, var(--color-primary) 30%, var(--color-surface))'
        : 'var(--color-primary)'
      : overloadMode
        ? 'var(--color-surface)'
        : 'color-mix(in srgb, var(--color-primary) 18%, transparent)'
  return {
    background,
    color: completed
      ? 'var(--color-text-muted)'
      : essential && !overloadMode
        ? '#fff'
        : overloadMode && !essential
          ? 'var(--color-text-muted)'
          : 'var(--color-text)',
    textDecoration: completed ? 'line-through' : 'none',
    border: overloadMode && !essential && !completed ? '1px solid var(--color-border)' : 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 8px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    width: '100%',
  }
}

const energyEssentialRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-sm)',
}

function paramSquareStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
    backgroundColor: 'var(--color-surface)',
  }
}

const energySelectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
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

const newTaskInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  boxSizing: 'border-box',
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
    scheduleV2Task,
    pendingPlanTask,
    clearPendingPlanTask,
    schedulePendingTask,
    postponeTask,
    overloadMode,
  } = useApp()

  const [displayDate, setDisplayDate] = useState(todayStr)
  const [scheduledTasks, setScheduledTasks] = useState<TaskV2[]>([])
  const [picker, setPicker] = useState<Picker>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const [essential, setEssential] = useState(false)

  const now = new Date()
  const currentSlot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0)
  const currentSlotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function load() {
      const sched = await getPlannedTasksForDate(displayDate)
      setScheduledTasks(sched)
    }
    load()
  }, [displayDate]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView?.({ behavior: 'instant', block: 'center' })
    }
  }, [])

  async function reload() {
    const sched = await getPlannedTasksForDate(displayDate)
    setScheduledTasks(sched)
  }

  async function handlePostpone(taskId: string) {
    await postponeTask(taskId)
    await reload()
  }

  async function handleMove(taskId: string, slot: number) {
    const conflict = scheduledTasks.some((t) => t.id !== taskId && taskSlot(t) === slot)
    if (conflict) {
      setConflictError(`Ce créneau (${slotLabel(slot)}) est déjà occupé par une autre tâche.`)
      return
    }
    setConflictError(null)
    const start = slotTime(slot)
    const end = slotTime(Math.min(slot + 1, 47))
    await scheduleV2Task(taskId, displayDate, start, end)
    await reload()
    setPicker(null)
  }

  async function handleConfirmPending(slot: number) {
    if (!pendingPlanTask) return
    const conflict = scheduledTasks.some((t) => taskSlot(t) === slot)
    if (conflict) {
      setConflictError(`Ce créneau (${slotLabel(slot)}) est déjà occupé par une autre tâche.`)
      return
    }
    setConflictError(null)
    const start = slotTime(slot)
    const end = slotTime(Math.min(slot + 1, 47))
    await schedulePendingTask(
      pendingPlanTask.title,
      displayDate,
      start,
      end,
      pendingPlanTask.sourceTaskId,
      energyCost,
      essential,
    )
    await reload()
    setPicker(null)
  }

  async function handleCreateAndAssign(slot: number) {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return
    const start = slotTime(slot)
    const end = slotTime(Math.min(slot + 1, 47))
    await schedulePendingTask(trimmed, displayDate, start, end, undefined, energyCost, essential)
    setNewTaskTitle('')
    await reload()
    setPicker(null)
  }

  function closePicker() {
    setPicker(null)
    setNewTaskTitle('')
    setConflictError(null)
    setEnergyCost(null)
    setEssential(false)
  }

  function handleBack() {
    clearPendingPlanTask()
    goTo('dashboard')
  }

  const isToday = displayDate === todayStr()

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <button style={iconBtnStyle} onClick={handleBack} aria-label="Retour">
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
                    setEnergyCost(null)
                    setEssential(false)
                    setPicker({ mode: 'assign', slot })
                  } else if (pendingPlanTask) {
                    handleConfirmPending(slot)
                  }
                }}
                aria-label={`Créneau ${slotLabel(slot)}`}
              >
                {tasksInSlot.map((task) => {
                  const completed = task.status === 'completed'
                  const canPostpone = isToday && overloadMode && !task.essential && !completed
                  return (
                    <div key={task.id} style={{ display: 'flex', gap: '4px', alignItems: 'stretch' }}>
                      <button
                        style={{ ...taskChipStyle(task.essential, completed, isToday && overloadMode), flex: 1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (pendingPlanTask) {
                            handleConfirmPending(slot)
                          } else {
                            setPicker({ mode: 'move', task, slot })
                          }
                        }}
                        aria-label={`${task.title} — déplacer`}
                      >
                        {task.title}
                        {task.energy_cost != null ? ` · ${task.energy_cost}` : ''}
                      </button>
                      {canPostpone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePostpone(task.id)
                          }}
                          aria-label={`Reporter ${task.title} à demain`}
                          style={{
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            flexShrink: 0,
                          }}
                        >
                          Reporter
                        </button>
                      )}
                    </div>
                  )
                })}
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
                  ? pendingPlanTask
                    ? `Placer « ${pendingPlanTask.title} » à ${slotLabel(picker.slot)}`
                    : `Ajouter une tâche à ${slotLabel(picker.slot)}`
                  : `Déplacer « ${picker.task.title} »`}
              </p>
              <button style={closeStyle} onClick={closePicker} aria-label="Fermer">
                ✕
              </button>
            </div>

            {picker.mode === 'assign' && (
              <>
                {!pendingPlanTask && (
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nom de la tâche"
                    aria-label="Nom de la tâche"
                    autoFocus
                    style={newTaskInputStyle}
                  />
                )}

                <div style={energyEssentialRowStyle}>
                  <div style={paramSquareStyle(energyCost !== null)}>
                    <label htmlFor="energy-cost-select" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Coût en énergie
                    </label>
                    <select
                      id="energy-cost-select"
                      aria-label="Coût en énergie"
                      style={energySelectStyle}
                      value={energyCost ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') {
                          setEnergyCost(null)
                          return
                        }
                        const value = Number(raw)
                        setEnergyCost(isValidEnergyValue(value) ? value : null)
                      }}
                    >
                      <option value="">Non défini</option>
                      {ENERGY_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={paramSquareStyle(essential)}>
                    <label
                      htmlFor="essential-checkbox"
                      style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}
                    >
                      Obligatoire
                    </label>
                    <input
                      id="essential-checkbox"
                      type="checkbox"
                      aria-label="Tâche obligatoire"
                      checked={essential}
                      onChange={(e) => setEssential(e.target.checked)}
                    />
                  </div>
                </div>

                {pendingPlanTask ? (
                  <button style={validateBtnStyle} onClick={() => handleConfirmPending(picker.slot)}>
                    Valider
                  </button>
                ) : (
                  <button
                    style={newTaskTitle.trim() ? validateBtnStyle : validateBtnDisabledStyle}
                    disabled={!newTaskTitle.trim()}
                    onClick={() => handleCreateAndAssign(picker.slot)}
                  >
                    Planifier
                  </button>
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
                    onClick={() => handleMove(picker.task.id, s)}
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
