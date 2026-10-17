import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask, PlannedRoutineOccurrence } from '@/app/AppContext'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { BatteryIcon } from '@/ui/components/BatteryIcon'
import { TaskIcon } from '@/ui/components/TaskIcon'
import { RoutineIcon } from '@/ui/components/RoutineIcon'
import { MonthYearPickerModal } from '@/ui/components/MonthYearPickerModal'
import { TaskExpenseModal } from '@/ui/components/TaskExpenseModal'
import { DEFAULT_AMBIANCE_COLOR, outlineOnlyStyle, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import { isCompleted, getTotalPlannedEnergy } from '@/domain/rules/taskRules'
import { todayStr, addDays, formatDayBadge, formatMonthYear, dateStrip } from '@/domain/rules/planningSlotRules'

const STRIP_VISIBLE_COUNT = 5
const STRIP_WINDOW_RADIUS = 21
const STRIP_RECENTER_DISTANCE = 10
const SCROLL_SETTLE_MS = 120
const CLICK_SCROLL_MAX_MS = 800

type PlanBlock =
  | { kind: 'task'; item: Task }
  | { kind: 'subtask'; item: PlannedSubTask }
  | { kind: 'routine'; item: PlannedRoutineOccurrence }

function blockId(block: PlanBlock): string {
  return block.kind === 'routine' ? block.item.scheduleId : block.item.id
}

function blockStart(block: PlanBlock): string | null {
  return block.kind === 'routine' ? block.item.time : block.item.scheduled_start
}

function blockEnd(block: PlanBlock): string | null {
  return block.kind === 'routine' ? block.item.endTime : block.item.scheduled_end
}

function blockCompleted(block: PlanBlock): boolean {
  return block.kind === 'routine' ? block.item.completed : isCompleted(block.item)
}

function blockEssential(block: PlanBlock): boolean {
  return block.kind === 'task' ? block.item.essential : false
}

function blockPostponed(block: PlanBlock): boolean {
  return block.kind !== 'routine' && !!block.item.postponed
}

function blockDisplayTitle(block: PlanBlock): string {
  if (block.kind === 'subtask') return `${block.item.parentTitle} - ${block.item.title}`
  if (block.kind === 'routine') return `routine « ${block.item.routineName} »`
  return block.item.title
}

function sortBlocks(blocks: PlanBlock[]): PlanBlock[] {
  return [...blocks].sort((a, b) => {
    const as = blockStart(a)
    const bs = blockStart(b)
    if (as === bs) return 0
    if (!as) return -1
    if (!bs) return 1
    return as.localeCompare(bs)
  })
}

const REPORTED_BADGE_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: '#fff',
  background: 'var(--color-warning)',
  borderRadius: 'var(--radius-sm)',
  padding: '2px 6px',
  flexShrink: 0,
}

function dateStripBoxStyle(ambianceColor: string): React.CSSProperties {
  return {
    ...outlineOnlyStyle(ambianceColor),
    borderRadius: 'var(--radius-md)',
    padding: '4px 0',
    overflow: 'hidden',
  }
}

const dateScrollerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  overflowX: 'auto',
  overflowY: 'hidden',
  touchAction: 'pan-x',
  overscrollBehaviorX: 'contain',
  scrollSnapType: 'x mandatory',
  scrollbarWidth: 'none',
  WebkitOverflowScrolling: 'touch',
}

const stripSpacerStyle: React.CSSProperties = {
  flex: `0 0 ${((STRIP_VISIBLE_COUNT - 1) / 2 / STRIP_VISIBLE_COUNT) * 100}%`,
}

const DAY_CELL_SELECTED_SCALE = 1.1

function dayCellStyle(isDisplayed: boolean, ambianceColor: string): React.CSSProperties {
  return {
    flex: `0 0 ${100 / STRIP_VISIBLE_COUNT}%`,
    boxSizing: 'border-box',
    scrollSnapAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 2px',
    backgroundColor: isDisplayed ? 'var(--color-surface)' : 'transparent',
    border: isDisplayed ? `2px solid ${ambianceColor}` : '2px solid transparent',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    transform: isDisplayed ? `scale(${DAY_CELL_SELECTED_SCALE})` : 'scale(1)',
    transition: 'transform 0.15s ease-out',
  }
}

const dayWeekdayStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
}

function dayNumberStyle(isToday: boolean): React.CSSProperties {
  return {
    fontSize: '0.9375rem',
    fontWeight: 700,
    textDecoration: isToday ? 'underline' : 'none',
    textUnderlineOffset: '3px',
  }
}

const monthButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '0.75rem',
  fontWeight: 700,
  fontFamily: 'var(--font-body)',
  padding: '10px 4px',
  minHeight: '44px',
  whiteSpace: 'nowrap',
}

const ROW_MIN_HEIGHT = 44
const ROW_MAX_HEIGHT = 160
const ROW_HEIGHT_PER_MINUTE = 0.6

function rowStyle(durationMinutes: number | null | undefined): React.CSSProperties {
  const minHeight = Math.min(
    ROW_MAX_HEIGHT,
    Math.max(ROW_MIN_HEIGHT, ROW_MIN_HEIGHT + (durationMinutes ?? 0) * ROW_HEIGHT_PER_MINUTE),
  )
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: '6px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    background: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    width: '100%',
    minHeight: `${minHeight}px`,
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
  }
}

const rowHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--spacing-sm)',
  width: '100%',
}

const monthBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-sm)',
}

const planningLogoBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text)',
  padding: '10px 4px',
  minHeight: '44px',
  minWidth: '32px',
}

const totalEnergyBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  color: 'var(--color-text-muted)',
  fontSize: '0.8125rem',
  fontVariantNumeric: 'tabular-nums',
  flexShrink: 0,
}

const todayBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '4px 10px',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-body)',
  flexShrink: 0,
}

function rowTintStyle(block: PlanBlock, ambianceColor: string): React.CSSProperties {
  const color = block.kind === 'task' || block.kind === 'routine' ? block.item.color : ambianceColor
  return plannedTaskTintStyle(blockCompleted(block), color)
}

const timeColStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'inherit',
  opacity: 0.8,
  width: '42px',
  flexShrink: 0,
  fontVariantNumeric: 'tabular-nums',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

const endTimeStyle: React.CSSProperties = {
  opacity: 0.7,
}

const titleColStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
}

const titleTextStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const ENERGY_COL_WIDTH_PX = 34

// Largeur réservée même sans énergie affichée : sinon le compteur de sous-étapes se décale selon
// les lignes, cassant l'alignement de sa colonne (#37f9f912).
const energyColStyle: React.CSSProperties = {
  minWidth: `${ENERGY_COL_WIDTH_PX}px`,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
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

const expandBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'inherit',
  fontSize: '0.75rem',
  padding: '2px 4px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
}

const subTaskListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  paddingLeft: '26px',
}

function rowContainerStyle(tint: React.CSSProperties): React.CSSProperties {
  return {
    display: 'flex',
    backgroundColor: tint.backgroundColor,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    flexShrink: 0,
  }
}

const subTaskRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  fontSize: '0.8125rem',
}

const emptyStateStyle: React.CSSProperties = {
  padding: 'var(--spacing-md)',
  minHeight: '48px',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '0.875rem',
  textAlign: 'center',
}

export function PlanningBoard() {
  const {
    getPlannedTasksForDate,
    getPlannedSubTasksForDate,
    getPlannedRoutinesForDate,
    completeTaskById,
    clearTaskExpensePlanned,
    budgetCategories,
    createBudgetEntry,
    reportTaskById,
    toggleSubTask,
    reportSubTask,
    getSubTasks,
    overloadMode,
    settings,
    selectTask,
    selectRoutine,
    goTo,
    route,
    replace,
  } = useApp()

  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR

  const [displayDate, setDisplayDate] = useState(() =>
    route.name === 'dashboard' && route.date ? route.date : todayStr(),
  )
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([])
  const [scheduledSubTasks, setScheduledSubTasks] = useState<PlannedSubTask[]>([])
  const [scheduledRoutines, setScheduledRoutines] = useState<PlannedRoutineOccurrence[]>([])
  const [subTasksByTask, setSubTasksByTask] = useState<Record<string, Task[]>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [expenseTask, setExpenseTask] = useState<Task | null>(null)
  const expenseSubmittingRef = useRef(false)

  const displayDateRef = useRef(displayDate)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const smoothTargetRef = useRef<string | null>(null)
  const clickScrollRef = useRef<{ left: number; timer: ReturnType<typeof setTimeout> } | null>(null)
  const [scrubDate, setScrubDate] = useState<string | null>(null)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [stripCenter, setStripCenter] = useState(() =>
    route.name === 'dashboard' && route.date ? route.date : todayStr(),
  )
  const stripDates = useMemo(() => dateStrip(stripCenter, STRIP_WINDOW_RADIUS), [stripCenter])

  useEffect(() => {
    displayDateRef.current = displayDate
  }, [displayDate])

  // Ne jamais appeler replace() (setState d'AppProvider) depuis l'updater de setDisplayDate :
  // React peut executer cet updater pendant le rendu de PlanningBoard, ce qui declenchait
  // l'avertissement "Cannot update a component (AppProvider) while rendering a different
  // component (PlanningBoard)".
  function updateDisplayDate(next: string) {
    setDisplayDate(next)
    replace({ name: 'dashboard', date: next })
  }

  function jumpTo(date: string) {
    setStripCenter(date)
    updateDisplayDate(date)
  }

  async function reload() {
    const date = displayDateRef.current
    const [tasks, subs, routines] = await Promise.all([
      getPlannedTasksForDate(date),
      getPlannedSubTasksForDate(date),
      getPlannedRoutinesForDate(date),
    ])
    setScheduledTasks(tasks)
    setScheduledSubTasks(subs)
    setScheduledRoutines(routines)
    const children = await Promise.all(tasks.map((t) => getSubTasks(t.id)))
    const map: Record<string, Task[]> = {}
    tasks.forEach((t, i) => {
      map[t.id] = children[i]
    })
    setSubTasksByTask(map)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayDate])

  function toggleExpand(taskId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  async function handleComplete(block: PlanBlock) {
    if (block.kind === 'task') {
      if (block.item.expense_planned && !isCompleted(block.item)) {
        setExpenseTask(block.item)
        return
      }
      await completeTaskById(block.item.id)
    } else if (block.kind === 'subtask') {
      const parent = await toggleSubTask(block.item, { deferExpenseParent: true })
      if (parent) setExpenseTask(parent)
    }
    await reload()
  }

  async function finishExpenseTask(categoryId: string | null, amount: number) {
    const task = expenseTask
    if (!task || expenseSubmittingRef.current) return
    expenseSubmittingRef.current = true
    try {
      if (categoryId) {
        await createBudgetEntry(categoryId, amount, task.title, displayDateRef.current)
        await clearTaskExpensePlanned(task.id)
      }
      await completeTaskById(task.id)
      setExpenseTask(null)
    } finally {
      expenseSubmittingRef.current = false
    }
    await reload()
  }

  async function handleToggleSubTaskRow(taskId: string, subTask: Task) {
    const parent = await toggleSubTask(subTask, { deferExpenseParent: true })
    if (parent) setExpenseTask(parent)
    const updated = await getSubTasks(taskId)
    setSubTasksByTask((prev) => ({ ...prev, [taskId]: updated }))
    await reload()
  }

  async function handleReport(block: PlanBlock) {
    if (block.kind === 'routine') return
    const target = addDays(displayDateRef.current, 1)
    const start = block.item.scheduled_start ?? '09:00'
    const end = block.item.scheduled_end ?? start
    if (block.kind === 'task') await reportTaskById(block.item.id, target, start, end)
    else await reportSubTask(block.item.id, target, start, end)
    await reload()
  }

  function openRoutineSteps(routineId: string) {
    selectRoutine(routineId)
    goTo({ name: 'routine-steps', date: displayDateRef.current })
  }

  function openDetail(taskId: string) {
    selectTask(taskId)
    goTo('task-detail')
  }

  function cellWidth(): number {
    return (scrollerRef.current?.clientWidth ?? 0) / STRIP_VISIBLE_COUNT
  }

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const width = cellWidth()
    if (!scroller || !width) return
    if (smoothTargetRef.current === displayDate) {
      smoothTargetRef.current = null
      return
    }
    const index = stripDates.indexOf(displayDate)
    if (index < 0) return
    const target = index * width
    if (Math.abs(scroller.scrollLeft - target) > 1) scroller.scrollLeft = target
  }, [stripDates, displayDate])

  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current)
      if (clickScrollRef.current) clearTimeout(clickScrollRef.current.timer)
    },
    [],
  )

  function endClickScroll() {
    if (!clickScrollRef.current) return
    clearTimeout(clickScrollRef.current.timer)
    clickScrollRef.current = null
  }

  function settleScroll(date: string, index: number) {
    setScrubDate(null)
    if (date !== displayDateRef.current) updateDisplayDate(date)
    if (Math.abs(index - STRIP_WINDOW_RADIUS) >= STRIP_RECENTER_DISTANCE) setStripCenter(date)
  }

  function handleStripScroll() {
    const scroller = scrollerRef.current
    const width = cellWidth()
    if (!scroller || !width) return
    if (clickScrollRef.current) {
      if (Math.abs(scroller.scrollLeft - clickScrollRef.current.left) <= 1) endClickScroll()
      return
    }
    const index = Math.min(stripDates.length - 1, Math.max(0, Math.round(scroller.scrollLeft / width)))
    const date = stripDates[index]
    setScrubDate(date)
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => settleScroll(date, index), SCROLL_SETTLE_MS)
  }

  function selectDayFromStrip(date: string) {
    const scroller = scrollerRef.current
    const width = cellWidth()
    const index = stripDates.indexOf(date)
    if (scroller && width && index >= 0) {
      smoothTargetRef.current = date !== displayDateRef.current ? date : null
      if (settleTimer.current) clearTimeout(settleTimer.current)
      endClickScroll()
      if (typeof scroller.scrollTo === 'function' && Math.abs(scroller.scrollLeft - index * width) > 1) {
        clickScrollRef.current = { left: index * width, timer: setTimeout(endClickScroll, CLICK_SCROLL_MAX_MS) }
      }
      scroller.scrollTo?.({ left: index * width, behavior: 'smooth' })
    }
    updateDisplayDate(date)
  }

  const isToday = displayDate === todayStr()
  const blocks: PlanBlock[] = sortBlocks([
    ...scheduledTasks.map((t): PlanBlock => ({ kind: 'task', item: t })),
    ...scheduledSubTasks.map((s): PlanBlock => ({ kind: 'subtask', item: s })),
    ...scheduledRoutines.map((r): PlanBlock => ({ kind: 'routine', item: r })),
  ])
  const totalEnergy = getTotalPlannedEnergy(
    blocks.filter((b): b is Extract<PlanBlock, { kind: 'task' | 'subtask' }> => b.kind !== 'routine').map((b) => b.item),
  )

  const displayDateObj = new Date(displayDate + 'T12:00:00')

  return (
    <>
    <section
      aria-label="Planning du jour"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: 'var(--spacing-sm)' }}
    >
      <div style={monthBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: 0 }}>
          <button
            type="button"
            style={planningLogoBtnStyle}
            aria-label="Ouvrir le planning de la semaine"
            onClick={() => goTo({ name: 'planning', date: displayDate })}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18M9 9v11M15 9v11" />
            </svg>
          </button>
          <button
            type="button"
            style={monthButtonStyle}
            aria-label={`${formatMonthYear(displayDate)}, choisir un mois`}
            onClick={() => setMonthPickerOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatMonthYear(displayDate)}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <span style={totalEnergyBadgeStyle} aria-label={`${totalEnergy} énergie planifiée ce jour`}>
            <BatteryIcon size={16} />
            {totalEnergy}
          </span>
          {!isToday && (
            <button style={todayBtnStyle} onClick={() => jumpTo(todayStr())}>
              Aujourd'hui
            </button>
          )}
        </div>
      </div>
      <div aria-label="Bandeau des jours de la semaine" style={dateStripBoxStyle(ambianceColor)}>
        <div ref={scrollerRef} style={dateScrollerStyle} onScroll={handleStripScroll} onTouchStart={endClickScroll} onWheel={endClickScroll}>
          <div style={stripSpacerStyle} aria-hidden />
          {stripDates.map((d) => {
            const badge = formatDayBadge(d)
            const isDisplayed = d === (scrubDate ?? displayDate)
            return (
              <button
                key={d}
                style={dayCellStyle(isDisplayed, ambianceColor)}
                onClick={() => selectDayFromStrip(d)}
                aria-current={d === displayDate ? 'date' : undefined}
                aria-label={d}
              >
                <span style={dayWeekdayStyle}>{badge.weekday}</span>
                <span style={dayNumberStyle(d === todayStr())}>{badge.day}</span>
              </button>
            )
          })}
          <div style={stripSpacerStyle} aria-hidden />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {blocks.length === 0 && <p style={emptyStateStyle}>Rien de planifié ce jour-là.</p>}

        {blocks.map((block) => {
          const completed = blockCompleted(block)
          const canPostpone = block.kind !== 'routine' && isToday && overloadMode && !blockEssential(block) && !completed
          const subs = block.kind === 'task' ? (subTasksByTask[block.item.id] ?? []) : []
          const hasSubs = subs.length > 0
          const done = subs.filter(isCompleted).length
          const id = blockId(block)
          const expanded = expandedIds.has(id)
          const tint = rowTintStyle(block, ambianceColor)
          const start = blockStart(block)
          const end = blockEnd(block)
          const openBlock = () =>
            block.kind === 'routine' ? openRoutineSteps(block.item.routineId) : openDetail(block.item.id)

          return (
            <div key={`${block.kind}-${id}`} style={rowContainerStyle(tint)}>
              <span style={timeColStyle}>
                <span>{start ?? 'Sans horaire'}</span>
                {start && end && end !== start && <span style={endTimeStyle}>{end}</span>}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  role="button"
                  tabIndex={0}
                  style={{
                    ...rowStyle(block.kind === 'routine' ? block.item.durationMinutes : block.item.duration_minutes),
                    color: tint.color,
                    textDecoration: tint.textDecoration,
                  }}
                  onClick={openBlock}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openBlock()
                    }
                  }}
                >
                  <div style={rowHeaderStyle}>
                    {block.kind === 'task' && block.item.icon && <TaskIcon icon={block.item.icon} size={18} />}
                    {block.kind === 'routine' && <RoutineIcon size={18} />}
                    <span style={titleColStyle}>
                      <span style={titleTextStyle}>{blockDisplayTitle(block)}</span>
                      {blockPostponed(block) && <span style={REPORTED_BADGE_STYLE}>Reporté</span>}
                    </span>
                    {hasSubs && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`${done} sur ${subs.length} sous-étapes, ${expanded ? 'replier' : 'déplier'}`}
                        style={expandBtnStyle}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleExpand(id)
                        }}
                      >
                        {done}/{subs.length} {expanded ? '▾' : '▸'}
                      </span>
                    )}
                    <span style={energyColStyle}>
                      {block.kind !== 'routine' && block.item.energy_cost != null && (
                        <BatteryCost cost={block.item.energy_cost} />
                      )}
                    </span>
                    {block.kind === 'routine' ? (
                      <input
                        type="checkbox"
                        checked={completed}
                        disabled
                        aria-label={`${blockDisplayTitle(block)}, ${completed ? 'terminée' : 'non terminée'}`}
                        style={taskCheckboxStyle}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={completed}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => handleComplete(block)}
                        aria-label={`Terminer ${blockDisplayTitle(block)}`}
                        style={taskCheckboxStyle}
                      />
                    )}
                    {canPostpone && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          handleReport(block)
                        }}
                        aria-label={`Reporter ${blockDisplayTitle(block)}`}
                        style={taskActionStyle}
                      >
                        Reporter
                      </button>
                    )}
                  </div>

                  {expanded && hasSubs && (
                    <div style={subTaskListStyle}>
                      {subs.map((st) => (
                        <div
                          key={st.id}
                          style={subTaskRowStyle}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted(st)}
                            onChange={() => handleToggleSubTaskRow(id, st)}
                            aria-label={`Terminer ${st.title}`}
                            style={taskCheckboxStyle}
                          />
                          <span
                            style={{ textDecoration: isCompleted(st) ? 'line-through' : 'none', flex: 1 }}
                          >
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
    {expenseTask && (
      <TaskExpenseModal
        taskTitle={expenseTask.title}
        categories={budgetCategories}
        onSubmit={(categoryId, amount) => finishExpenseTask(categoryId, amount)}
        onSkip={() => finishExpenseTask(null, 0)}
      />
    )}
    {monthPickerOpen && (
      <MonthYearPickerModal
        year={displayDateObj.getFullYear()}
        month={displayDateObj.getMonth()}
        onSelect={(year, month) => {
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const day = Math.min(displayDateObj.getDate(), daysInMonth)
          const yyyy = String(year).padStart(4, '0')
          const mm = String(month + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          jumpTo(`${yyyy}-${mm}-${dd}`)
          setMonthPickerOpen(false)
        }}
        onClose={() => setMonthPickerOpen(false)}
      />
    )}
    </>
  )
}
