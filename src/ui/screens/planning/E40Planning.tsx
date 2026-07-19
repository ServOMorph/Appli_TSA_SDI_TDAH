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
  | { mode: 'menu'; task: TaskV2 }
  | { mode: 'rename'; task: TaskV2 }
  | { mode: 'delete'; task: TaskV2 }
  | null

const REPORTED_BADGE_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#fff',
  background: 'var(--color-warning)',
  borderRadius: 'var(--radius-sm)',
  padding: '2px 6px',
  flexShrink: 0,
}

const LONG_PRESS_MS = 400
const EDGE_DWELL_MS = 650

const dragOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  transform: 'translate(-50%, -120%)',
  pointerEvents: 'none',
  zIndex: 200,
  background: 'var(--color-accent)',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.875rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  whiteSpace: 'nowrap',
}

function slotFromPoint(clientX: number, clientY: number): number | null {
  let el: Element | null = null
  try {
    el = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(clientX, clientY) : null
  } catch {
    return null
  }
  const cell = el?.closest?.('[data-slot]') as HTMLElement | null
  if (!cell?.dataset.slot) return null
  const slot = Number(cell.dataset.slot)
  return Number.isInteger(slot) && slot >= 0 && slot < SLOTS.length ? slot : null
}

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
    renameV2Task,
    deleteV2Task,
    reportV2Task,
    movingTask,
    startMoveTask,
    clearMoveTask,
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
  const [renameTitle, setRenameTitle] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverlay, setDragOverlay] = useState<{ task: TaskV2; x: number; y: number; label: string } | null>(null)

  const now = new Date()
  const currentSlot = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0)
  const currentSlotRef = useRef<HTMLDivElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ task: TaskV2; sourceSlot: number; sourceDate: string; startX: number; startY: number } | null>(null)
  const dragActiveRef = useRef(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dwellZoneRef = useRef<'left' | 'right' | null>(null)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const displayDateRef = useRef(displayDate)

  useEffect(() => {
    displayDateRef.current = displayDate
  }, [displayDate])

  useEffect(() => {
    if (planningTargetDate) {
      setPlanningTargetDate(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (movingTask?.report) {
      setDisplayDate(addDays(todayStr(), 1))
    }
  }, [movingTask])

  useEffect(() => {
    async function load() {
      const sched = await getPlannedTasksForDate(displayDateRef.current)
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
    const sched = await getPlannedTasksForDate(displayDateRef.current)
    setScheduledTasks(sched)
  }

  async function handleComplete(taskId: string) {
    await completeV2Task(taskId)
    await reload()
  }

  async function handleMove(taskId: string, slot: number, targetDate: string, report: boolean): Promise<boolean> {
    const source = movingTask?.task.id === taskId ? movingTask.task : undefined
    const task = scheduledTasks.find((item) => item.id === taskId) ?? source
    const range = task ? taskSlotRange(task) : null
    const length = range ? range.end - range.start + 1 : 1
    const endSlot = slot + length - 1
    const targetTasks = await getPlannedTasksForDate(targetDate)
    const conflict = endSlot >= SLOTS.length || targetTasks.some(
      (t) => t.id !== taskId && SLOTS.slice(slot, endSlot + 1).some((candidate) => taskOccupiesSlot(t, candidate)),
    )
    if (conflict) {
      setConflictError(`La plage à partir de ${slotLabel(slot)} est déjà occupée par une autre tâche.`)
      return false
    }
    setConflictError(null)
    const start = slotTime(slot)
    const end = slotTime(slot + length)
    if (report) {
      await reportV2Task(taskId, targetDate, start, end)
    } else {
      await scheduleV2Task(taskId, targetDate, start, end)
    }
    await reload()
    return true
  }

  async function handleMoveTargetClick(slot: number) {
    if (!movingTask) return
    const success = await handleMove(movingTask.task.id, slot, displayDate, movingTask.report)
    if (success) clearMoveTask()
  }

  async function handleRename(taskId: string) {
    const title = renameTitle.trim()
    if (!title) return
    await renameV2Task(taskId, title)
    await reload()
    closePicker()
  }

  async function handleDelete(taskId: string) {
    await deleteV2Task(taskId)
    await reload()
    closePicker()
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
    if (movingTask) {
      await handleMoveTargetClick(slot)
      return
    }
    if (task && !pendingPlanTask) {
      setPicker({ mode: 'menu', task })
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
    setRenameTitle('')
  }

  function handleBack() {
    clearPendingPlanTask()
    clearMoveTask()
    goTo('dashboard')
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function edgeZoneAt(clientX: number): 'left' | 'right' | null {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    if (clientX > rect.right) return 'right'
    if (clientX < rect.left) return 'left'
    return null
  }

  function canFlipLeft(): boolean {
    return addDays(displayDateRef.current, -1) >= todayStr()
  }

  function dragHoverLabel(clientX: number, clientY: number): string {
    const zone = edgeZoneAt(clientX)
    if (zone === 'right') return `→ ${formatDate(addDays(displayDateRef.current, 1))}`
    if (zone === 'left') {
      return canFlipLeft() ? `→ ${formatDate(addDays(displayDateRef.current, -1))}` : 'Retour impossible'
    }
    const slot = slotFromPoint(clientX, clientY)
    return slot !== null ? `→ ${slotLabel(slot)}` : ''
  }

  function clearDwell() {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = null
    }
    dwellZoneRef.current = null
  }

  function armDwell(zone: 'left' | 'right') {
    dwellTimerRef.current = setTimeout(() => {
      if (!dragActiveRef.current || dwellZoneRef.current !== zone) return
      if (zone === 'right') {
        setDisplayDate(addDays(displayDateRef.current, 1))
      } else if (canFlipLeft()) {
        setDisplayDate(addDays(displayDateRef.current, -1))
      } else {
        return
      }
      const info = dragRef.current
      const pos = lastPointerRef.current
      if (info && pos) {
        const next = zone === 'right' ? addDays(displayDateRef.current, 1) : addDays(displayDateRef.current, -1)
        setDragOverlay({ task: info.task, x: pos.x, y: pos.y, label: `→ ${formatDate(next)}` })
      }
      armDwell(zone)
    }, EDGE_DWELL_MS)
  }

  function finishDrag(clientX: number, clientY: number) {
    const info = dragRef.current
    dragActiveRef.current = false
    dragRef.current = null
    setIsDragging(false)
    setDragOverlay(null)
    clearDwell()
    if (!info) return
    if (edgeZoneAt(clientX) !== null) return
    const slot = slotFromPoint(clientX, clientY)
    if (slot === null) return
    const date = displayDateRef.current
    if (slot === info.sourceSlot && date === info.sourceDate) return
    handleMove(info.task.id, slot, date, false)
  }

  function handleTaskPointerDown(event: React.PointerEvent, task: TaskV2) {
    const range = taskSlotRange(task)
    if (!range) return
    dragRef.current = { task, sourceSlot: range.start, sourceDate: displayDate, startX: event.clientX, startY: event.clientY }
    clearLongPressTimer()
    longPressTimerRef.current = setTimeout(() => {
      dragActiveRef.current = true
      setIsDragging(true)
      const info = dragRef.current
      if (info) {
        setDragOverlay({ task: info.task, x: info.startX, y: info.startY, label: '' })
      }
    }, LONG_PRESS_MS)
  }

  function handleTaskPointerUp(event: React.PointerEvent, task: TaskV2) {
    clearLongPressTimer()
    if (dragActiveRef.current) {
      finishDrag(event.clientX, event.clientY)
      return
    }
    dragRef.current = null
    setPicker({ mode: 'menu', task })
  }

  function handleTaskPointerCancel() {
    clearLongPressTimer()
    clearDwell()
    dragActiveRef.current = false
    dragRef.current = null
    setIsDragging(false)
    setDragOverlay(null)
  }

  useEffect(() => {
    if (!isDragging) return
    function onWindowPointerMove(event: PointerEvent) {
      const info = dragRef.current
      if (!info) return
      lastPointerRef.current = { x: event.clientX, y: event.clientY }
      const zone = edgeZoneAt(event.clientX)
      if (zone !== dwellZoneRef.current) {
        if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current)
          dwellTimerRef.current = null
        }
        dwellZoneRef.current = zone
        if (zone) armDwell(zone)
      }
      setDragOverlay({ task: info.task, x: event.clientX, y: event.clientY, label: dragHoverLabel(event.clientX, event.clientY) })
    }
    function onWindowPointerUp(event: PointerEvent) {
      finishDrag(event.clientX, event.clientY)
    }
    window.addEventListener('pointermove', onWindowPointerMove)
    window.addEventListener('pointerup', onWindowPointerUp)
    window.addEventListener('pointercancel', onWindowPointerUp)
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove)
      window.removeEventListener('pointerup', onWindowPointerUp)
      window.removeEventListener('pointercancel', onWindowPointerUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

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

      <div ref={gridRef} style={{ flex: 1, overflowY: 'auto' }} role="grid" aria-label="Planning de la journée">
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
                data-slot={slot}
                style={slotCellStyle(task, ambianceColor, isContinuation)}
                onClick={movingTask || !task || pendingPlanTask ? () => handleSlotClick(slot, task) : undefined}
                onPointerDown={task && !pendingPlanTask && !movingTask ? (event) => handleTaskPointerDown(event, task) : undefined}
                onPointerUp={task && !pendingPlanTask && !movingTask ? (event) => handleTaskPointerUp(event, task) : undefined}
                onPointerCancel={task && !pendingPlanTask && !movingTask ? handleTaskPointerCancel : undefined}
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
                        {task.postponed && <span style={REPORTED_BADGE_STYLE}>Reporté</span>}
                      </span>
                      <input
                        type="checkbox"
                        checked={completed}
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                        onPointerUp={(event) => event.stopPropagation()}
                        onChange={() => handleComplete(task.id)}
                        aria-label={`Terminer ${task.title}`}
                        style={taskCheckboxStyle}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {canPostpone && (
                        <button
                          onPointerDown={(event) => event.stopPropagation()}
                          onPointerUp={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation()
                            startMoveTask(task, true)
                          }}
                          aria-label={`Reporter ${task.title}`}
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
          aria-label={
            picker.mode === 'assign'
              ? 'Choisir une tâche'
              : picker.mode === 'menu'
                ? 'Actions sur la tâche'
                : picker.mode === 'rename'
                  ? 'Renommer la tâche'
                  : 'Supprimer la tâche'
          }
        >
          <div style={sheetStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {picker.mode === 'assign' &&
                  (pendingPlanTask
                    ? `Placer « ${pendingPlanTask.title} » de ${slotLabel(picker.start)} à ${slotLabel(picker.end)}`
                    : `Ajouter une tâche de ${slotLabel(picker.start)} à ${slotLabel(picker.end)}`)}
                {picker.mode === 'menu' && `« ${picker.task.title} »`}
                {picker.mode === 'rename' && `Renommer « ${picker.task.title} »`}
                {picker.mode === 'delete' && `Supprimer « ${picker.task.title} » ?`}
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

            {picker.mode === 'menu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <button
                  style={pickerItemStyle}
                  onClick={() => {
                    startMoveTask(picker.task, false)
                    setPicker(null)
                  }}
                >
                  Déplacer
                </button>
                <button
                  style={pickerItemStyle}
                  onClick={() => {
                    setRenameTitle(picker.task.title)
                    setPicker({ mode: 'rename', task: picker.task })
                  }}
                >
                  Renommer
                </button>
                <button style={pickerItemStyle} onClick={() => setPicker({ mode: 'delete', task: picker.task })}>
                  Supprimer
                </button>
              </div>
            )}

            {picker.mode === 'rename' && (
              <>
                <input
                  type="text"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  aria-label="Nouveau nom"
                  autoFocus
                  style={newTaskInputStyle}
                />
                <button
                  style={renameTitle.trim() ? validateBtnStyle : validateBtnDisabledStyle}
                  disabled={!renameTitle.trim()}
                  onClick={() => handleRename(picker.task.id)}
                >
                  Enregistrer
                </button>
              </>
            )}

            {picker.mode === 'delete' && (
              <>
                <p style={{ margin: 0, fontSize: '0.9375rem' }}>Cette tâche sera définitivement supprimée.</p>
                <button style={{ ...validateBtnStyle, background: 'var(--color-error, #c0392b)' }} onClick={() => handleDelete(picker.task.id)}>
                  Supprimer
                </button>
              </>
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

      {movingTask && (
        <div style={pendingBannerStyle}>
          <span aria-live="polite" style={{ flex: 1, fontSize: '0.8125rem' }}>
            « {movingTask.task.title} » est en cours de déplacement.
          </span>
          <button style={taskActionStyle} onClick={clearMoveTask} aria-label={`Annuler le déplacement de ${movingTask.task.title}`}>
            Annuler
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

      {dragOverlay && (
        <div style={{ ...dragOverlayStyle, left: dragOverlay.x, top: dragOverlay.y }} aria-hidden>
          <span>{dragOverlay.task.title}</span>
          {dragOverlay.label && <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>{dragOverlay.label}</span>}
        </div>
      )}
    </main>
  )
}
