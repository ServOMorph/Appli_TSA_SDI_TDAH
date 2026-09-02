import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { Task } from '@/domain/entities/task'
import { TaskIcon } from '@/ui/components/TaskIcon'
import { MonthYearPickerModal } from '@/ui/components/MonthYearPickerModal'
import { DEFAULT_AMBIANCE_COLOR } from '@/ui/styles/ambiance'
import { todayStr, addDays, formatDayBadge, formatMonthYear, weekStrip } from '@/domain/rules/planningSlotRules'

const SWIPE_THRESHOLD_PX = 50

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-md)',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
  paddingBottom: 'var(--bottomnav-h)',
}

const backBtnStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
}

const monthBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-sm)',
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

function weekBoxStyle(ambianceColor: string): React.CSSProperties {
  return {
    border: `2px solid ${ambianceColor}`,
    borderRadius: 'var(--radius-md)',
    backgroundColor: `color-mix(in srgb, ${ambianceColor} 14%, var(--color-surface))`,
    overflow: 'hidden',
    flex: 1,
    minHeight: 0,
  }
}

const weekGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  height: '100%',
}

function dayColumnStyle(index: number): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    borderLeft: index === 0 ? 'none' : '1px solid var(--color-border)',
  }
}

function dayHeaderStyle(isToday: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
    padding: '6px 0',
    background: isToday ? 'var(--color-surface)' : 'transparent',
    borderBottom: '1px solid var(--color-border)',
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text)',
  }
}

const dayWeekdayStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
}

function dayNumberStyle(isToday: boolean): React.CSSProperties {
  return {
    fontSize: '0.8125rem',
    fontWeight: 700,
    textDecoration: isToday ? 'underline' : 'none',
    textUnderlineOffset: '2px',
  }
}

const dayTasksStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 0',
}

const taskIconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  flexShrink: 0,
  padding: 0,
  fontSize: '0.8125rem',
  fontWeight: 700,
}

function taskFallbackLabel(title: string): string {
  return title.trim().charAt(0).toUpperCase() || '•'
}

export function E12WeekPlanning() {
  const { getPlannedTasksForDate, selectTask, goTo, back, route, settings } = useApp()
  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR

  const [anchorDate, setAnchorDate] = useState(() =>
    route.name === 'planning' && route.date ? route.date : todayStr(),
  )
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({})
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const week = weekStrip(anchorDate)
  const today = todayStr()
  const showTodayBtn = !week.includes(today)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const days = weekStrip(anchorDate)
      const lists = await Promise.all(days.map((d) => getPlannedTasksForDate(d)))
      if (cancelled) return
      const map: Record<string, Task[]> = {}
      days.forEach((d, i) => {
        map[d] = lists[i]
      })
      setTasksByDate(map)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDate])

  function shiftWeek(direction: number) {
    setAnchorDate((prev) => addDays(prev, direction * 7))
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
    shiftWeek(delta < 0 ? 1 : -1)
  }

  function openTask(taskId: string) {
    selectTask(taskId)
    goTo('task-detail')
  }

  return (
    <>
      <main style={pageStyle}>
        <button style={backBtnStyle} onClick={() => back('dashboard')} aria-label="Retour">
          ← Retour
        </button>

        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Planning de la semaine</h1>

        <div style={monthBarStyle}>
          <button
            type="button"
            style={monthButtonStyle}
            aria-label={`${formatMonthYear(anchorDate)}, choisir un mois`}
            onClick={() => setMonthPickerOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatMonthYear(anchorDate)}
          </button>
          {showTodayBtn && (
            <button style={todayBtnStyle} onClick={() => setAnchorDate(today)}>
              Aujourd'hui
            </button>
          )}
        </div>

        <section
          aria-label="Planning de la semaine"
          style={weekBoxStyle(ambianceColor)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              ...weekGridStyle,
              transform: `translateX(${dragOffset}px)`,
              transition: dragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {week.map((d, i) => {
              const badge = formatDayBadge(d)
              const isToday = d === today
              const dayTasks = tasksByDate[d] ?? []
              return (
                <div key={d} style={dayColumnStyle(i)}>
                  <div style={dayHeaderStyle(isToday)}>
                    <span style={dayWeekdayStyle}>{badge.weekday}</span>
                    <span style={dayNumberStyle(isToday)}>{badge.day}</span>
                  </div>
                  <div style={dayTasksStyle} aria-label={`Tâches du ${d}`}>
                    {dayTasks.map((task) => (
                      <button
                        key={task.id}
                        style={taskIconBtnStyle}
                        onClick={() => openTask(task.id)}
                        aria-label={task.title}
                      >
                        {task.icon ? <TaskIcon icon={task.icon} size={18} /> : taskFallbackLabel(task.title)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {monthPickerOpen && (
        <MonthYearPickerModal
          year={new Date(anchorDate + 'T12:00:00').getFullYear()}
          month={new Date(anchorDate + 'T12:00:00').getMonth()}
          onSelect={(year, month) => {
            const yyyy = String(year).padStart(4, '0')
            const mm = String(month + 1).padStart(2, '0')
            setAnchorDate(`${yyyy}-${mm}-01`)
            setMonthPickerOpen(false)
          }}
          onClose={() => setMonthPickerOpen(false)}
        />
      )}
    </>
  )
}
