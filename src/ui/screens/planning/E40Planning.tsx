import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/AppContext'
import type { TaskV2 } from '@/domain/entities/taskV2'
import type { PlannedSubTask, MovingPlanItem } from '@/app/AppContext'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { DEFAULT_AMBIANCE_COLOR, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import { taskSlotRange, taskOccupiesSlot } from '@/domain/rules/taskRulesV2'
import {
  SLOT_INDEXES,
  slotTime,
  slotLabel,
  slotFromDate,
  todayStr,
  addDays,
  formatPlanningDate,
  isRangeAvailable,
  normalizeRange,
  moveTargetRange,
} from '@/domain/rules/planningSlotRules'

const ENERGY_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)

type PlanBlock =
  | { kind: 'task'; item: TaskV2 }
  | { kind: 'subtask'; item: PlannedSubTask }

function blockCompleted(block: PlanBlock): boolean {
  return block.kind === 'task' ? block.item.status === 'completed' : block.item.is_completed
}

function blockEssential(block: PlanBlock): boolean {
  return block.kind === 'task' ? block.item.essential : false
}

function blockPostponed(block: PlanBlock): boolean {
  return !!block.item.postponed
}

function blockDisplayTitle(block: PlanBlock): string {
  return block.kind === 'subtask' ? `${block.item.parentTitle} - ${block.item.title}` : block.item.title
}

function movingItemTitle(moving: MovingPlanItem): string {
  return moving.kind === 'task' ? moving.task.title : `${moving.subTask.parentTitle} - ${moving.subTask.title}`
}

type Picker =
  | { mode: 'assign'; start: number; end: number }
  | { mode: 'menu'; block: PlanBlock }
  | { mode: 'rename'; block: PlanBlock }
  | { mode: 'delete'; block: PlanBlock }
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
  return Number.isInteger(slot) && slot >= 0 && slot < SLOT_INDEXES.length ? slot : null
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

function slotCellStyle(block: PlanBlock | undefined, ambianceColor: string, isContinuation: boolean): React.CSSProperties {
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
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    ...(isContinuation ? { marginTop: '-1px' } : {}),
    ...(block ? plannedTaskTintStyle(blockCompleted(block), ambianceColor) : {}),
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
    startMoveSubTask,
    clearMoveTask,
    planningTargetDate,
    setPlanningTargetDate,
    getPlannedSubTasksForDate,
    scheduleSubTaskV2,
    reportSubTaskV2,
    renameSubTaskV2,
    deleteSubTask,
    toggleSubTask,
    overloadMode,
    settings,
  } = useApp()

  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR

  const [displayDate, setDisplayDate] = useState(() => planningTargetDate ?? todayStr())
  const [scheduledTasks, setScheduledTasks] = useState<TaskV2[]>([])
  const [scheduledSubTasks, setScheduledSubTasks] = useState<PlannedSubTask[]>([])
  const [picker, setPicker] = useState<Picker>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const [essential, setEssential] = useState(false)
  const [step, setStep] = useState<'name' | 'details'>('name')
  const [rangeStart, setRangeStart] = useState<number | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverlay, setDragOverlay] = useState<{ block: PlanBlock; x: number; y: number; label: string } | null>(null)

  const blocks: PlanBlock[] = [
    ...scheduledTasks.map((t): PlanBlock => ({ kind: 'task', item: t })),
    ...scheduledSubTasks.map((s): PlanBlock => ({ kind: 'subtask', item: s })),
  ]

  const currentSlot = slotFromDate(new Date())
  const currentSlotRef = useRef<HTMLDivElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ block: PlanBlock; sourceSlot: number; sourceDate: string; startX: number; startY: number } | null>(null)
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
      const [sched, schedSub] = await Promise.all([
        getPlannedTasksForDate(displayDateRef.current),
        getPlannedSubTasksForDate(displayDateRef.current),
      ])
      setScheduledTasks(sched)
      setScheduledSubTasks(schedSub)
    }
    load()
  }, [displayDate]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView?.({ behavior: 'instant', block: 'center' })
    }
  }, [])

  async function reload() {
    const [sched, schedSub] = await Promise.all([
      getPlannedTasksForDate(displayDateRef.current),
      getPlannedSubTasksForDate(displayDateRef.current),
    ])
    setScheduledTasks(sched)
    setScheduledSubTasks(schedSub)
  }

  async function handleComplete(block: PlanBlock) {
    if (block.kind === 'task') {
      await completeV2Task(block.item.id)
    } else {
      await toggleSubTask(block.item)
    }
    await reload()
  }

  async function handleMove(block: PlanBlock, slot: number, targetDate: string, report: boolean): Promise<boolean> {
    const target = moveTargetRange(block.item, slot)
    const [targetTasks, targetSubTasks] = await Promise.all([
      getPlannedTasksForDate(targetDate),
      getPlannedSubTasksForDate(targetDate),
    ])
    const others = [
      ...targetTasks.filter((t) => !(block.kind === 'task' && t.id === block.item.id)),
      ...targetSubTasks.filter((s) => !(block.kind === 'subtask' && s.id === block.item.id)),
    ]
    if (!isRangeAvailable(others, target.start, target.end)) {
      setConflictError(`La plage à partir de ${slotLabel(slot)} est déjà occupée par une autre tâche.`)
      return false
    }
    setConflictError(null)
    const start = slotTime(target.start)
    const end = slotTime(target.end + 1)
    if (block.kind === 'task') {
      if (report) await reportV2Task(block.item.id, targetDate, start, end)
      else await scheduleV2Task(block.item.id, targetDate, start, end)
    } else {
      if (report) await reportSubTaskV2(block.item.id, targetDate, start, end)
      else await scheduleSubTaskV2(block.item.id, targetDate, start, end)
    }
    await reload()
    return true
  }

  async function handleMoveTargetClick(slot: number) {
    if (!movingTask) return
    const block: PlanBlock =
      movingTask.kind === 'task' ? { kind: 'task', item: movingTask.task } : { kind: 'subtask', item: movingTask.subTask }
    const success = await handleMove(block, slot, displayDate, movingTask.report)
    if (success) clearMoveTask()
  }

  async function handleRename(block: PlanBlock) {
    const title = renameTitle.trim()
    if (!title) return
    if (block.kind === 'task') await renameV2Task(block.item.id, title)
    else await renameSubTaskV2(block.item.id, title)
    await reload()
    closePicker()
  }

  async function handleDelete(block: PlanBlock) {
    if (block.kind === 'task') await deleteV2Task(block.item.id)
    else await deleteSubTask(block.item.id)
    await reload()
    closePicker()
  }

  async function handlePlace(range: { start: number; end: number }) {
    const trimmed = newTaskTitle.trim()
    const title = pendingPlanTask?.title ?? trimmed
    if (!title) return
    const start = slotTime(range.start)
    const end = slotTime(range.end + 1)
    if (pendingPlanTask?.kind === 'subtask' && pendingPlanTask.subTaskId) {
      await scheduleSubTaskV2(pendingPlanTask.subTaskId, displayDate, start, end)
    } else if (pendingPlanTask?.taskId) {
      await scheduleV2Task(pendingPlanTask.taskId, displayDate, start, end)
    } else {
      await schedulePendingTask(title, displayDate, start, end, pendingPlanTask?.sourceTaskId, energyCost, essential)
    }
    setNewTaskTitle('')
    await reload()
    closePicker()
  }

  async function handleSlotClick(slot: number, block: PlanBlock | undefined) {
    if (movingTask) {
      await handleMoveTargetClick(slot)
      return
    }
    if (block && !pendingPlanTask) {
      setPicker({ mode: 'menu', block })
      return
    }
    if (block) {
      setConflictError(`Le créneau ${slotLabel(slot)} est déjà occupé.`)
      return
    }
    if (rangeStart === null) {
      setConflictError(null)
      setRangeStart(slot)
      return
    }

    const { start, end } = normalizeRange(rangeStart, slot)
    if (!isRangeAvailable([...scheduledTasks, ...scheduledSubTasks], start, end)) {
      setConflictError(`Un créneau de ${slotLabel(start)} à ${slotLabel(end)} est déjà occupé.`)
      return
    }
    setConflictError(null)
    setRangeStart(null)
    if (pendingPlanTask?.taskId || pendingPlanTask?.kind === 'subtask') {
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
    if (zone === 'right') return `→ ${formatPlanningDate(addDays(displayDateRef.current, 1))}`
    if (zone === 'left') {
      return canFlipLeft() ? `→ ${formatPlanningDate(addDays(displayDateRef.current, -1))}` : 'Retour impossible'
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
        setDragOverlay({ block: info.block, x: pos.x, y: pos.y, label: `→ ${formatPlanningDate(next)}` })
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
    handleMove(info.block, slot, date, false)
  }

  function handleTaskPointerDown(event: React.PointerEvent, block: PlanBlock) {
    const range = taskSlotRange(block.item)
    if (!range) return
    dragRef.current = { block, sourceSlot: range.start, sourceDate: displayDate, startX: event.clientX, startY: event.clientY }
    clearLongPressTimer()
    longPressTimerRef.current = setTimeout(() => {
      dragActiveRef.current = true
      setIsDragging(true)
      window.getSelection?.()?.removeAllRanges()
      const info = dragRef.current
      if (info) {
        setDragOverlay({ block: info.block, x: info.startX, y: info.startY, label: '' })
      }
    }, LONG_PRESS_MS)
  }

  function handleTaskPointerUp(event: React.PointerEvent, block: PlanBlock) {
    clearLongPressTimer()
    if (dragActiveRef.current) {
      finishDrag(event.clientX, event.clientY)
      return
    }
    dragRef.current = null
    setPicker({ mode: 'menu', block })
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
      setDragOverlay({ block: info.block, x: event.clientX, y: event.clientY, label: dragHoverLabel(event.clientX, event.clientY) })
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
    <main style={isDragging ? { ...pageStyle, userSelect: 'none', WebkitUserSelect: 'none' } : pageStyle}>
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
          {formatPlanningDate(displayDate)}
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
        {SLOT_INDEXES.map((slot) => {
          const isNow = isToday && slot === currentSlot
          const block = blocks.find((item) => taskOccupiesSlot(item.item, slot))
          const isTaskStart = block ? taskSlotRange(block.item)?.start === slot : false
          const isContinuation = block !== undefined && !isTaskStart
          const completed = block ? blockCompleted(block) : false
          const canPostpone = isTaskStart && block !== undefined && isToday && overloadMode && !blockEssential(block) && !completed

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
                style={slotCellStyle(block, ambianceColor, isContinuation)}
                onClick={movingTask || !block || pendingPlanTask ? () => handleSlotClick(slot, block) : undefined}
                onPointerDown={block && !pendingPlanTask && !movingTask ? (event) => handleTaskPointerDown(event, block) : undefined}
                onPointerUp={block && !pendingPlanTask && !movingTask ? (event) => handleTaskPointerUp(event, block) : undefined}
                onPointerCancel={block && !pendingPlanTask && !movingTask ? handleTaskPointerCancel : undefined}
                aria-label={`Créneau ${slotLabel(slot)}${block ? ` : ${blockDisplayTitle(block)}${isContinuation ? ' (suite)' : ''}` : ''}`}
              >
                {!block && (
                  <span style={emptySlotPlaceholderStyle} aria-hidden>
                    _
                  </span>
                )}
                {block && isTaskStart && (
                  <>
                    <div style={plannedTaskContentStyle}>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {block.kind === 'subtask' ? (
                          <>
                            <span>{block.item.parentTitle}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.85 }}>
                              - {block.item.title}
                            </span>
                          </>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {block.item.title}
                            {block.item.energy_cost != null && <BatteryCost cost={block.item.energy_cost} />}
                          </span>
                        )}
                        {blockPostponed(block) && <span style={REPORTED_BADGE_STYLE}>Reporté</span>}
                      </span>
                      <input
                        type="checkbox"
                        checked={completed}
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                        onPointerUp={(event) => event.stopPropagation()}
                        onChange={() => handleComplete(block)}
                        aria-label={`Terminer ${blockDisplayTitle(block)}`}
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
                            if (block.kind === 'task') startMoveTask(block.item, true)
                            else startMoveSubTask(block.item, true)
                          }}
                          aria-label={`Reporter ${blockDisplayTitle(block)}`}
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
                {picker.mode === 'menu' && `« ${blockDisplayTitle(picker.block)} »`}
                {picker.mode === 'rename' && `Renommer « ${picker.block.item.title} »`}
                {picker.mode === 'delete' && `Supprimer « ${blockDisplayTitle(picker.block)} » ?`}
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
                    if (picker.block.kind === 'task') startMoveTask(picker.block.item, false)
                    else startMoveSubTask(picker.block.item, false)
                    setPicker(null)
                  }}
                >
                  Déplacer
                </button>
                <button
                  style={pickerItemStyle}
                  onClick={() => {
                    setRenameTitle(picker.block.item.title)
                    setPicker({ mode: 'rename', block: picker.block })
                  }}
                >
                  Renommer
                </button>
                <button style={pickerItemStyle} onClick={() => setPicker({ mode: 'delete', block: picker.block })}>
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
                  onClick={() => handleRename(picker.block)}
                >
                  Enregistrer
                </button>
              </>
            )}

            {picker.mode === 'delete' && (
              <>
                <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                  {picker.block.kind === 'task' ? 'Cette tâche sera' : 'Cette sous-tâche sera'} définitivement supprimée.
                </p>
                <button style={{ ...validateBtnStyle, background: 'var(--color-error, #c0392b)' }} onClick={() => handleDelete(picker.block)}>
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
            « {movingItemTitle(movingTask)} » est en cours de déplacement.
          </span>
          <button style={taskActionStyle} onClick={clearMoveTask} aria-label={`Annuler le déplacement de ${movingItemTitle(movingTask)}`}>
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
          <span>{blockDisplayTitle(dragOverlay.block)}</span>
          {dragOverlay.label && <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>{dragOverlay.label}</span>}
        </div>
      )}
    </main>
  )
}
