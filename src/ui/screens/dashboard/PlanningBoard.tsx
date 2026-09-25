import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { Task } from '@/domain/entities/task'
import type { PlannedSubTask, PlannedRoutineOccurrence } from '@/app/AppContext'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { BatteryIcon } from '@/ui/components/BatteryIcon'
import { TaskIcon } from '@/ui/components/TaskIcon'
import { RoutineIcon } from '@/ui/components/RoutineIcon'
import { MonthYearPickerModal } from '@/ui/components/MonthYearPickerModal'
import { DEFAULT_AMBIANCE_COLOR, outlineOnlyStyle, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import { isCompleted, getTotalPlannedEnergy } from '@/domain/rules/taskRules'
import { todayStr, addDays, formatDayBadge, formatMonthYear, dateStrip } from '@/domain/rules/planningSlotRules'

const DATE_STRIP_RADIUS = 2
const SWIPE_THRESHOLD_PX = 50

// Jours supplémentaires rendus (masqués par le overflow:hidden du bandeau) de part et d'autre
// des jours visibles, pour que le glissement révèle du contenu réel au lieu d'un vide (#38).
const STRIP_BUFFER_DAYS = 1
const STRIP_RENDER_RADIUS = DATE_STRIP_RADIUS + STRIP_BUFFER_DAYS
const STRIP_VISIBLE_COUNT = DATE_STRIP_RADIUS * 2 + 1
const STRIP_RENDER_COUNT = STRIP_RENDER_RADIUS * 2 + 1
const STRIP_TRACK_WIDTH_PERCENT = (STRIP_RENDER_COUNT / STRIP_VISIBLE_COUNT) * 100

// Position de la piste, en fonction du "cran" (jours déjà avalés par le glissement en cours,
// -1/0/1) et du décalage brut du doigt en px. Exprimée en % (calc), la cible d'un cran est
// résolue par le navigateur en pixels réels au moment du calcul — ce qui permet à la transition
// CSS d'interpoler correctement entre un état suivi au pixel près (glissement) et un état exprimé
// en fraction de la piste (cran final), sans mesure de layout côté JS.
function stripShiftTransform(shiftNumerator: number, dragPx: number): string {
  return `translateX(calc(-100% * ${shiftNumerator} / ${STRIP_RENDER_COUNT} + ${dragPx}px))`
}

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
  return block.kind === 'routine' ? null : block.item.scheduled_end
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
    padding: '4px 2px',
    overflow: 'hidden',
    touchAction: 'pan-y',
  }
}

const dateTrackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  width: `${STRIP_TRACK_WIDTH_PERCENT}%`,
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

  const displayDateRef = useRef(displayDate)
  const touchStartX = useRef<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'settling'>('idle')
  const [dragOffsetPx, setDragOffsetPx] = useState(0)
  const [pendingShift, setPendingShift] = useState(0)
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
    if (block.kind === 'task') await completeTaskById(block.item.id)
    else if (block.kind === 'subtask') await toggleSubTask(block.item)
    await reload()
  }

  async function handleToggleSubTaskRow(taskId: string, subTask: Task) {
    await toggleSubTask(subTask)
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

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null
    setPhase('dragging')
    setDragOffsetPx(0)
    setPendingShift(0)
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (touchStartX.current === null) return
    const currentX = event.touches[0]?.clientX ?? touchStartX.current
    setDragOffsetPx(currentX - touchStartX.current)
  }

  // Au relâchement, la piste continue de glisser (transition CSS) jusqu'au cran plein le plus
  // proche — jamais un saut brut à 0 — et ce n'est qu'une fois cette animation terminée
  // (handleTrackTransitionEnd) que le jour affiché change réellement. Sans ce découplage, changer
  // le jour en même temps que réinitialiser le décalage produit le saut visuel signalé (#38).
  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) {
      setPhase('idle')
      return
    }
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null
    const shift = Math.abs(delta) < SWIPE_THRESHOLD_PX ? 0 : delta < 0 ? 1 : -1
    setPendingShift(shift)
    setDragOffsetPx(0)
    setPhase('settling')
  }

  function handleTrackTransitionEnd(event: React.TransitionEvent) {
    if (event.target !== event.currentTarget) return
    if (phase !== 'settling') return
    setPhase('idle')
    setPendingShift(0)
    if (pendingShift !== 0) jumpTo(addDays(displayDate, pendingShift))
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
            transform: stripShiftTransform(
              STRIP_BUFFER_DAYS + (phase === 'settling' ? pendingShift : 0),
              phase === 'dragging' ? dragOffsetPx : 0,
            ),
            transition: phase === 'dragging' ? 'none' : 'transform 0.2s ease-out',
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {dateStrip(stripCenter, STRIP_RENDER_RADIUS).map((d, i) => {
            const offset = i - STRIP_RENDER_RADIUS
            const isBuffer = Math.abs(offset) > DATE_STRIP_RADIUS
            const badge = formatDayBadge(d)
            const isDisplayed = d === displayDate
            const scale = dayCellScale(Math.abs(offset))
            return (
              <button
                key={d}
                style={{
                  ...dayCellStyle(isDisplayed),
                  transform: `scale(${scale})`,
                  transition: phase === 'dragging' ? 'none' : 'transform 0.2s ease-out',
                  ...(scale > 1 ? { position: 'relative', zIndex: 2 } : null),
                }}
                onClick={() => jumpTo(d)}
                aria-current={isDisplayed ? 'date' : undefined}
                aria-label={d}
                aria-hidden={isBuffer || undefined}
                tabIndex={isBuffer ? -1 : undefined}
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
                    ...rowStyle(block.kind === 'routine' ? null : block.item.duration_minutes),
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
