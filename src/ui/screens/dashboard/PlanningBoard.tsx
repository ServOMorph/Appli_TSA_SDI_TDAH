import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask } from '@/app/AppContext'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { TaskIcon } from '@/ui/components/TaskIcon'
import { MonthYearPickerModal } from '@/ui/components/MonthYearPickerModal'
import { DEFAULT_AMBIANCE_COLOR, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import { isCompleted } from '@/domain/rules/taskRules'
import { todayStr, addDays, formatDayBadge, formatMonthYear, dateStrip } from '@/domain/rules/planningSlotRules'

const DATE_STRIP_RADIUS = 2
const SWIPE_THRESHOLD_PX = 50

type PlanBlock =
  | { kind: 'task'; item: Task }
  | { kind: 'subtask'; item: PlannedSubTask }

function blockCompleted(block: PlanBlock): boolean {
  return isCompleted(block.item)
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

function sortBlocks(blocks: PlanBlock[]): PlanBlock[] {
  return [...blocks].sort((a, b) => {
    const as = a.item.scheduled_start
    const bs = b.item.scheduled_start
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
    border: `2px solid ${ambianceColor}`,
    borderRadius: 'var(--radius-md)',
    padding: '4px 2px',
    backgroundColor: `color-mix(in srgb, ${ambianceColor} 14%, var(--color-surface))`,
    overflow: 'hidden',
  }
}

const dateTrackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}

const DAY_CELL_MAX_SCALE = 1.18

// Grossissement du jour au sélecteur central : max au centre, dégressif vers les bords.
function dayCellScale(distanceFromCenter: number): number {
  const t = Math.max(0, 1 - distanceFromCenter / 2)
  return Math.round((1 + t * (DAY_CELL_MAX_SCALE - 1)) * 1000) / 1000
}

function dayCellStyle(isDisplayed: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 2px',
    backgroundColor: isDisplayed ? 'var(--color-surface)' : 'transparent',
    border: isDisplayed ? '1px solid var(--color-border)' : '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
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

const dayDotStyle: React.CSSProperties = {
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: 'var(--color-accent)',
}

const dayDotPlaceholderStyle: React.CSSProperties = {
  width: '4px',
  height: '4px',
}

const monthButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '0.875rem',
  fontWeight: 700,
  fontFamily: 'var(--font-body)',
  padding: '10px 4px',
  minHeight: '44px',
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
    alignItems: 'flex-start',
    gap: 'var(--spacing-sm)',
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
  return plannedTaskTintStyle(blockCompleted(block), block.kind === 'task' ? block.item.color : ambianceColor)
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
  padding: '0 12px 10px 54px',
}

function rowContainerStyle(tint: React.CSSProperties): React.CSSProperties {
  return {
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
    completeTaskById,
    reportTaskById,
    toggleSubTask,
    reportSubTask,
    getSubTasks,
    overloadMode,
    settings,
    selectTask,
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
  const [subTasksByTask, setSubTasksByTask] = useState<Record<string, Task[]>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const displayDateRef = useRef(displayDate)
  const touchStartX = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [stripCenter, setStripCenter] = useState(() =>
    route.name === 'dashboard' && route.date ? route.date : todayStr(),
  )

  useEffect(() => {
    displayDateRef.current = displayDate
  }, [displayDate])

  function updateDisplayDate(updater: string | ((d: string) => string)) {
    setDisplayDate((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      replace({ name: 'dashboard', date: next })
      return next
    })
  }

  function jumpTo(date: string) {
    setStripCenter(date)
    updateDisplayDate(date)
  }

  async function reload() {
    const date = displayDateRef.current
    const [tasks, subs] = await Promise.all([getPlannedTasksForDate(date), getPlannedSubTasksForDate(date)])
    setScheduledTasks(tasks)
    setScheduledSubTasks(subs)
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
    if (block.kind === 'task') await completeTaskById(block.item.id)
    else await toggleSubTask(block.item)
    await reload()
  }

  async function handleToggleSubTaskRow(taskId: string, subTask: Task) {
    await toggleSubTask(subTask)
    const updated = await getSubTasks(taskId)
    setSubTasksByTask((prev) => ({ ...prev, [taskId]: updated }))
    await reload()
  }

  async function handleReport(block: PlanBlock) {
    const target = addDays(displayDateRef.current, 1)
    const start = block.item.scheduled_start ?? '09:00'
    const end = block.item.scheduled_end ?? start
    if (block.kind === 'task') await reportTaskById(block.item.id, target, start, end)
    else await reportSubTask(block.item.id, target, start, end)
    await reload()
  }

  function openDetail(taskId: string) {
    selectTask(taskId)
    goTo('task-detail')
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null
    setDragging(true)
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (touchStartX.current === null) return
    const currentX = event.touches[0]?.clientX ?? touchStartX.current
    setDragOffset(currentX - touchStartX.current)
  }

  function handleTouchEnd(event: React.TouchEvent) {
    setDragging(false)
    setDragOffset(0)
    if (touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    jumpTo(addDays(displayDate, delta < 0 ? 1 : -1))
  }

  const isToday = displayDate === todayStr()
  const blocks: PlanBlock[] = sortBlocks([
    ...scheduledTasks.map((t): PlanBlock => ({ kind: 'task', item: t })),
    ...scheduledSubTasks.map((s): PlanBlock => ({ kind: 'subtask', item: s })),
  ])

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
        {!isToday && (
          <button style={todayBtnStyle} onClick={() => jumpTo(todayStr())}>
            Aujourd'hui
          </button>
        )}
      </div>
      <div
        aria-label="Bandeau des jours de la semaine"
        style={dateStripBoxStyle(ambianceColor)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            ...dateTrackStyle,
            transform: `translateX(${dragOffset}px)`,
            transition: dragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {dateStrip(stripCenter, DATE_STRIP_RADIUS).map((d, i, arr) => {
            const badge = formatDayBadge(d)
            const isDisplayed = d === displayDate
            const scale = dayCellScale(Math.abs(i - (arr.length - 1) / 2))
            return (
              <button
                key={d}
                style={{
                  ...dayCellStyle(isDisplayed),
                  transform: `scale(${scale})`,
                  transition: dragging ? 'none' : 'transform 0.2s ease-out',
                  ...(scale > 1 ? { position: 'relative', zIndex: 2 } : null),
                }}
                onClick={() => updateDisplayDate(d)}
                aria-current={isDisplayed ? 'date' : undefined}
                aria-label={d}
              >
                <span style={dayWeekdayStyle}>{badge.weekday}</span>
                <span style={dayNumberStyle(d === todayStr())}>{badge.day}</span>
                <span style={isDisplayed ? dayDotStyle : dayDotPlaceholderStyle} aria-hidden />
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {blocks.length === 0 && <p style={emptyStateStyle}>Rien de planifié ce jour-là.</p>}

        {blocks.map((block) => {
          const completed = blockCompleted(block)
          const canPostpone = isToday && overloadMode && !blockEssential(block) && !completed
          const subs = block.kind === 'task' ? (subTasksByTask[block.item.id] ?? []) : []
          const hasSubs = subs.length > 0
          const done = subs.filter(isCompleted).length
          const expanded = expandedIds.has(block.item.id)
          const tint = rowTintStyle(block, ambianceColor)

          return (
            <div key={`${block.kind}-${block.item.id}`} style={rowContainerStyle(tint)}>
              <button
                style={{
                  ...rowStyle(block.item.duration_minutes),
                  color: tint.color,
                  textDecoration: tint.textDecoration,
                }}
                onClick={() => openDetail(block.item.id)}
              >
                <span style={timeColStyle}>
                  <span>{block.item.scheduled_start ?? 'Sans horaire'}</span>
                  {block.item.scheduled_start &&
                    block.item.scheduled_end &&
                    block.item.scheduled_end !== block.item.scheduled_start && (
                      <span style={endTimeStyle}>{block.item.scheduled_end}</span>
                    )}
                </span>
                {block.kind === 'task' && block.item.icon && <TaskIcon icon={block.item.icon} size={18} />}
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
                      toggleExpand(block.item.id)
                    }}
                  >
                    {done}/{subs.length} {expanded ? '▾' : '▸'}
                  </span>
                )}
                {block.item.energy_cost != null && <BatteryCost cost={block.item.energy_cost} />}
                <input
                  type="checkbox"
                  checked={completed}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => handleComplete(block)}
                  aria-label={`Terminer ${blockDisplayTitle(block)}`}
                  style={taskCheckboxStyle}
                />
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
              </button>

              {expanded && hasSubs && (
                <div style={{ ...subTaskListStyle, color: tint.color }}>
                  {subs.map((st) => (
                    <div key={st.id} style={subTaskRowStyle}>
                      <input
                        type="checkbox"
                        checked={isCompleted(st)}
                        onChange={() => handleToggleSubTaskRow(block.item.id, st)}
                        aria-label={`Terminer ${st.title}`}
                        style={taskCheckboxStyle}
                      />
                      <span style={{ textDecoration: isCompleted(st) ? 'line-through' : 'none', flex: 1 }}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
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
