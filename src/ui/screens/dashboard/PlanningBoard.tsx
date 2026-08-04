import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask } from '@/app/AppContext'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { TaskIcon } from '@/ui/components/TaskIcon'
import { DEFAULT_AMBIANCE_COLOR, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import { isCompleted } from '@/domain/rules/taskRules'
import { todayStr, addDays, formatDayBadge, dateStrip } from '@/domain/rules/planningSlotRules'

const COLLAPSED_ROW_LIMIT = 4
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

const dateStripStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1.25rem',
  padding: '4px 6px',
  lineHeight: 1,
  borderRadius: 'var(--radius-sm)',
  flexShrink: 0,
}

function dayCellStyle(isDisplayed: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 2px',
    background: isDisplayed ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'none',
    border: 'none',
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

const jumpInputStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: 'var(--color-text-muted)',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-body)',
  flexShrink: 0,
  width: '28px',
  cursor: 'pointer',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
}

function rowTintStyle(block: PlanBlock, ambianceColor: string): React.CSSProperties {
  return plannedTaskTintStyle(blockCompleted(block), block.kind === 'task' ? (block.item.color ?? ambianceColor) : ambianceColor)
}

const timeLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'inherit',
  opacity: 0.8,
  width: '42px',
  flexShrink: 0,
  fontVariantNumeric: 'tabular-nums',
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
  padding: '4px 0 4px 42px',
}

const subTaskRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  fontSize: '0.8125rem',
}

const emptyStateStyle: React.CSSProperties = {
  padding: 'var(--spacing-md)',
  color: 'var(--color-text-muted)',
  fontSize: '0.875rem',
  textAlign: 'center',
}

interface PlanningBoardProps {
  collapsed: boolean
}

export function PlanningBoard({ collapsed }: PlanningBoardProps) {
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
  } = useApp()

  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR

  const [displayDate, setDisplayDate] = useState(() => todayStr())
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([])
  const [scheduledSubTasks, setScheduledSubTasks] = useState<PlannedSubTask[]>([])
  const [subTasksByTask, setSubTasksByTask] = useState<Record<string, Task[]>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const effectiveDate = collapsed ? todayStr() : displayDate
  const displayDateRef = useRef(effectiveDate)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    displayDateRef.current = effectiveDate
  }, [effectiveDate])

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
  }, [effectiveDate])

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
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    setDisplayDate((d) => addDays(d, delta < 0 ? 1 : -1))
  }

  const isToday = effectiveDate === todayStr()
  let blocks: PlanBlock[] = sortBlocks([
    ...scheduledTasks.map((t): PlanBlock => ({ kind: 'task', item: t })),
    ...scheduledSubTasks.map((s): PlanBlock => ({ kind: 'subtask', item: s })),
  ])
  if (collapsed) blocks = blocks.slice(0, COLLAPSED_ROW_LIMIT)

  return (
    <section
      aria-label="Planning du jour"
      style={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 'var(--spacing-sm)' }}
    >
      {!collapsed && (
        <div style={dateStripStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <button style={iconBtnStyle} onClick={() => setDisplayDate((d) => addDays(d, -1))} aria-label="Jour précédent">
            &lsaquo;
          </button>
          {dateStrip(displayDate, DATE_STRIP_RADIUS).map((d) => {
            const badge = formatDayBadge(d)
            const isDisplayed = d === displayDate
            return (
              <button
                key={d}
                style={dayCellStyle(isDisplayed)}
                onClick={() => setDisplayDate(d)}
                aria-current={isDisplayed ? 'date' : undefined}
                aria-label={d}
              >
                <span style={dayWeekdayStyle}>{badge.weekday}</span>
                <span style={dayNumberStyle(d === todayStr())}>{badge.day}</span>
                <span style={isDisplayed ? dayDotStyle : dayDotPlaceholderStyle} aria-hidden />
              </button>
            )
          })}
          <button style={iconBtnStyle} onClick={() => setDisplayDate((d) => addDays(d, 1))} aria-label="Jour suivant">
            &rsaquo;
          </button>
          <input
            type="date"
            aria-label="Aller à une date"
            value={displayDate}
            onChange={(e) => e.target.value && setDisplayDate(e.target.value)}
            style={jumpInputStyle}
          />
        </div>
      )}

      <div style={collapsed ? undefined : { flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {blocks.length === 0 && <p style={emptyStateStyle}>Rien de planifié ce jour-là.</p>}

        {blocks.map((block) => {
          const completed = blockCompleted(block)
          const canPostpone = isToday && overloadMode && !blockEssential(block) && !completed
          const subs = block.kind === 'task' ? (subTasksByTask[block.item.id] ?? []) : []
          const hasSubs = subs.length > 0
          const done = subs.filter(isCompleted).length
          const expanded = expandedIds.has(block.item.id)

          return (
            <div key={`${block.kind}-${block.item.id}`}>
              <button style={rowStyle} onClick={() => openDetail(block.item.id)}>
                <div style={{ ...rowTintStyle(block, ambianceColor), display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, borderRadius: 'var(--radius-md)', padding: '6px 8px' }}>
                  <span style={timeLabelStyle}>{block.item.scheduled_start ?? 'Sans horaire'}</span>
                  {block.kind === 'task' && block.item.icon && <TaskIcon icon={block.item.icon} size={18} />}
                  <span style={titleColStyle}>
                    <span style={titleTextStyle}>{blockDisplayTitle(block)}</span>
                    {blockPostponed(block) && <span style={REPORTED_BADGE_STYLE}>Reporté</span>}
                  </span>
                  {block.item.energy_cost != null && <BatteryCost cost={block.item.energy_cost} />}
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
                </div>
              </button>

              {expanded && hasSubs && (
                <div style={subTaskListStyle}>
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
  )
}
