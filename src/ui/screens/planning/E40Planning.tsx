import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/AppContext'
import type { TaskV2 } from '@/domain/entities/taskV2'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { DEFAULT_AMBIANCE_COLOR, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import { taskSlotRange, taskOccupiesSlot } from '@/domain/rules/taskRulesV2'

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


type Picker =
  | { mode: 'assign'; start: number; end: number }
  | { mode: 'move'; task: TaskV2; slot: number }
  | null

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
  paddingBottom: 'var(--bottomnav-h)',
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
    borderBottom: '1px solid var(--color-text-muted)',
    background: isNow ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'transparent',
  }
}

const emptySlotPlaceholderStyle: React.CSSProperties = {
  visibility: 'hidden',
  padding: '8px 10px',
  fontSize: '0.9375rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
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

function slotCellStyle(task: TaskV2 | undefined, ambianceColor: string, isContinuation: boolean): React.CSSProperties {
  return {
    flex: 1,
    paddingTop: isContinuation ? 0 : '4px',
    paddingRight: '8px',
    paddingBottom: isContinuation ? 0 : '4px',
    paddingLeft: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
    ...(isContinuation ? { marginTop: '-1px' } : {}),
    ...(task ? plannedTaskTintStyle(task.status === 'completed', ambianceColor) : {}),
  }
}

const plannedTaskContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-sm)',
  minHeight: '36px',
  fontSize: '0.9375rem',
  fontWeight: 600,
}

const taskCheckboxStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  margin: 0,
  accentColor: 'var(--color-accent)',
  cursor: 'pointer',
  flexShrink: 0,
}

const taskActionStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid currentColor',
  borderRadius: 'var(--radius-sm)',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: 'inherit',
  flexShrink: 0,
}

const energyGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 'var(--spacing-xs)',
}

function energyGridButtonStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '10px 0',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: selected ? 'var(--color-accent)' : 'var(--color-surface)',
    color: selected ? '#fff' : 'var(--color-text)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  }
}

const pendingBannerStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 'var(--bottomnav-h)',
  zIndex: 39,
  maxWidth: '480px',
  margin: '0 auto',
  padding: 'var(--spacing-sm) var(--spacing-xl)',
  display: 'flex',
  gap: 'var(--spacing-sm)',
  alignItems: 'center',
  background: 'var(--color-background)',
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
  background: 'var(--color-accent)',
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
    completeV2Task,
    postponeTask,
    planningTargetDate,
    setPlanningTargetDate,
    overloadMode,
    settings,
  } = useApp()

  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR

  const [displayDate, setDisplayDate] = useState(() => planningTargetDate ?? todayStr())
  const [scheduledTasks, setScheduledTasks] = useState<TaskV2[]>([])
  const [picker, setPicker] = useState<Picker>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const [essential, setEssential] = useState(false)
  const [step, setStep] = useState<'name' | 'details'>('name')
  const [rangeStart, setRangeStart] = useState<number | null>(null)

  const now = new Date()
  const currentSlot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0)
  const currentSlotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (planningTargetDate) {
      setPlanningTargetDate(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  async function handleComplete(taskId: string) {
    await completeV2Task(taskId)
    await reload()
  }

  async function handleMove(taskId: string, slot: number) {
    const task = scheduledTasks.find((item) => item.id === taskId)
    const range = task ? taskSlotRange(task) : null
    const length = range ? range.end - range.start + 1 : 1
    const endSlot = slot + length - 1
    const conflict = endSlot >= SLOTS.length || scheduledTasks.some(
      (t) => t.id !== taskId && SLOTS.slice(slot, endSlot + 1).some((candidate) => taskOccupiesSlot(t, candidate)),
    )
    if (conflict) {
      setConflictError(`La plage à partir de ${slotLabel(slot)} est déjà occupée par une autre tâche.`)
      return
    }
    setConflictError(null)
    const start = slotTime(slot)
    const end = slotTime(slot + length)
    await scheduleV2Task(taskId, displayDate, start, end)
    await reload()
    setPicker(null)
  }

  function rangeIsAvailable(start: number, end: number): boolean {
    return !scheduledTasks.some((task) =>
      SLOTS.slice(start, end + 1).some((slot) => taskOccupiesSlot(task, slot)),
    )
  }

  async function handlePlace(range: { start: number; end: number }) {
    const trimmed = newTaskTitle.trim()
    const title = pendingPlanTask?.title ?? trimmed
    if (!title) return
    const start = slotTime(range.start)
    const end = slotTime(range.end + 1)
    if (pendingPlanTask?.taskId) {
      await scheduleV2Task(pendingPlanTask.taskId, displayDate, start, end)
    } else {
      await schedulePendingTask(title, displayDate, start, end, pendingPlanTask?.sourceTaskId, energyCost, essential)
    }
    setNewTaskTitle('')
    await reload()
    closePicker()
  }

  async function handleSlotClick(slot: number, task: TaskV2 | undefined) {
    if (task && !pendingPlanTask) {
      setPicker({ mode: 'move', task, slot })
      return
    }
    if (task) {
      setConflictError(`Le créneau ${slotLabel(slot)} est déjà occupé.`)
      return
    }
    if (rangeStart === null) {
      setConflictError(null)
      setRangeStart(slot)
      return
    }

    const start = Math.min(rangeStart, slot)
    const end = Math.max(rangeStart, slot)
    if (!rangeIsAvailable(start, end)) {
      setConflictError(`Un créneau de ${slotLabel(start)} à ${slotLabel(end)} est déjà occupé.`)
      return
    }
    setConflictError(null)
    setRangeStart(null)
    if (pendingPlanTask?.taskId) {
      await handlePlace({ start, end })
      return
    }
    setEnergyCost(null)
    setEssential(false)
    setStep(pendingPlanTask ? 'details' : 'name')
    setPicker({ mode: 'assign', start, end })
  }

  function closePicker() {
    setPicker(null)
    setNewTaskTitle('')
    setConflictError(null)
    setEnergyCost(null)
    setEssential(false)
    setStep('name')
    setRangeStart(null)
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
        {rangeStart !== null && (
          <p style={{ margin: 'var(--spacing-sm) var(--spacing-xl)', fontSize: '0.8125rem' }} aria-live="polite">
            Début sélectionné à {slotLabel(rangeStart)}. Choisissez la fin.
          </p>
        )}
        {SLOTS.map((slot) => {
          const isNow = isToday && slot === currentSlot
          const task = scheduledTasks.find((item) => taskOccupiesSlot(item, slot))
          const isTaskStart = task ? taskSlotRange(task)?.start === slot : false
          const isContinuation = task !== undefined && !isTaskStart
          const completed = task?.status === 'completed'
          const canPostpone = isTaskStart && task !== undefined && isToday && overloadMode && !task.essential && !completed

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
                style={slotCellStyle(task, ambianceColor, isContinuation)}
                onClick={() => handleSlotClick(slot, task)}
                aria-label={`Créneau ${slotLabel(slot)}${task ? ` : ${task.title}${isContinuation ? ' (suite)' : ''}` : ''}`}
              >
                {!task && (
                  <span style={emptySlotPlaceholderStyle} aria-hidden>
                    _
                  </span>
                )}
                {task && isTaskStart && (
                  <>
                    <div style={plannedTaskContentStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {task.title}
                        {task.energy_cost != null && <BatteryCost cost={task.energy_cost} />}
                      </span>
                      <input
                        type="checkbox"
                        checked={completed}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => handleComplete(task.id)}
                        aria-label={`Terminer ${task.title}`}
                        style={taskCheckboxStyle}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {canPostpone && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handlePostpone(task.id)
                          }}
                          aria-label={`Reporter ${task.title} à demain`}
                          style={taskActionStyle}
                        >
                          Reporter
                        </button>
                      )}
                    </div>
                  </>
                )}
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
                    ? `Placer « ${pendingPlanTask.title} » de ${slotLabel(picker.start)} à ${slotLabel(picker.end)}`
                    : `Ajouter une tâche de ${slotLabel(picker.start)} à ${slotLabel(picker.end)}`
                  : `Déplacer « ${picker.task.title} »`}
              </p>
              <button style={closeStyle} onClick={closePicker} aria-label="Fermer">
                ✕
              </button>
            </div>

            {picker.mode === 'assign' && step === 'name' && (
              <>
                {pendingPlanTask ? (
                  <p style={{ margin: 0, fontSize: '0.9375rem' }}>{pendingPlanTask.title}</p>
                ) : (
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
                <button
                  style={pendingPlanTask || newTaskTitle.trim() ? validateBtnStyle : validateBtnDisabledStyle}
                  disabled={!pendingPlanTask && !newTaskTitle.trim()}
                  onClick={() => setStep('details')}
                >
                  Valider
                </button>
              </>
            )}

            {picker.mode === 'assign' && step === 'details' && (
              <>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Coût en énergie (facultatif)
                </p>
                <div style={energyGridStyle} role="group" aria-label="Coût en énergie">
                  {ENERGY_OPTIONS.map((v) => (
                    <button
                      key={v}
                      style={energyGridButtonStyle(energyCost === v)}
                      onClick={() => setEnergyCost((current) => (current === v ? null : v))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={essential} onChange={(event) => setEssential(event.target.checked)} />
                  Obligatoire
                </label>
                <button style={validateBtnStyle} onClick={() => handlePlace(picker)}>
                  Placer
                </button>
              </>
            )}

            {conflictError && (
              <p role="alert" style={{ color: 'var(--color-error, #c0392b)', margin: 0 }}>
                {conflictError}
              </p>
            )}

            {picker.mode === 'move' && (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {SLOTS.filter((s) => s !== picker.slot).map((s) => (
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

      {pendingPlanTask && (
        <div style={pendingBannerStyle}>
          <span aria-live="polite" style={{ flex: 1, fontSize: '0.8125rem' }}>
            « {pendingPlanTask.title} » est en cours de planification.
          </span>
          <button style={taskActionStyle} onClick={clearPendingPlanTask} aria-label={`Terminer la planification de ${pendingPlanTask.title}`}>
            Terminer
          </button>
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
