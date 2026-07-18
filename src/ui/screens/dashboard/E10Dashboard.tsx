import { useApp } from '@/app/AppContext'
import { useState, useEffect } from 'react'
import type { Task } from '@/domain/entities/task'
import type { TaskV2 } from '@/domain/entities/taskV2'
import { getRemainingPlannedCost } from '@/domain/rules/taskRulesV2'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { BatteryCost } from '@/ui/components/BatteryCost'
import { DEFAULT_AMBIANCE_COLOR, flashyBackground, plannedTaskTintStyle } from '@/ui/styles/ambiance'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

interface SortableTaskItemProps {
  task: Task
  subs: { is_completed: boolean }[]
  onOpen: (id: string) => void
}

function SortableTaskItem({ task, subs, onOpen }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const done = subs.filter((s) => s.is_completed).length
  const total = subs.length
  const completed = task.status === 'completed'

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <Card style={{
        padding: 'var(--spacing-12)',
        ...(completed ? { backgroundColor: flashyBackground('var(--color-accent)'), borderColor: 'var(--color-accent)', color: '#fff' } : {}),
      }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: '0.9rem',
              color: completed ? '#fff' : 'var(--color-text-muted)',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ⠿
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpen(task.id)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: completed ? '#fff' : 'var(--color-text)',
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: 0,
              textAlign: 'left',
              flex: 1,
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </button>
          {total > 0 && (
            <span
              aria-label={`${done} sur ${total} étapes`}
              style={{ fontSize: '0.75rem', color: completed ? '#fff' : 'var(--color-text-muted)', flexShrink: 0 }}
            >
              {done}/{total}
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

export function E10Dashboard() {
  const {
    todayTasks,
    todaySubTasksMap,
    todayEnergy,
    todayEnergyStatus,
    todayPlannedTasks,
    overloadMode,
    goTo,
    selectTask,
    setTaskDetailOrigin,
    reorderTodayTasks,
    getPlannedTasksForDate,
    completeV2Task,
    postponeTask,
    repeatTaskTomorrow,
    setPlanningTargetDate,
    settings,
  } = useApp()

  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR

  const [visibleOrder, setVisibleOrder] = useState<Task[]>(() => todayTasks)
  const [todayPlanned, setTodayPlanned] = useState<TaskV2[]>([])

  useEffect(() => {
    setVisibleOrder(todayTasks)
  }, [todayTasks])

  useEffect(() => {
    async function loadPlanningToday() {
      const date = todayStr()
      const planned = await getPlannedTasksForDate(date)
      setTodayPlanned(planned)
    }
    loadPlanningToday()
  }, [getPlannedTasksForDate])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function openDetail(taskId: string) {
    selectTask(taskId)
    setTaskDetailOrigin('dashboard')
    goTo('task-detail')
  }

  const hasPlanningToday = todayPlanned.length > 0

  async function handleCompletePlanned(taskId: string) {
    await completeV2Task(taskId)
    const date = todayStr()
    const planned = await getPlannedTasksForDate(date)
    setTodayPlanned(planned)
  }

  async function handlePostponePlanned(taskId: string) {
    await postponeTask(taskId)
    const date = todayStr()
    const planned = await getPlannedTasksForDate(date)
    setTodayPlanned(planned)
  }

  async function handleRepeatTomorrowPlanned(taskId: string) {
    const nextDate = await repeatTaskTomorrow(taskId)
    if (nextDate) {
      setPlanningTargetDate(nextDate)
      goTo('planning')
    } else {
      const date = todayStr()
      const planned = await getPlannedTasksForDate(date)
      setTodayPlanned(planned)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = visibleOrder.findIndex((t) => t.id === active.id)
    const newIndex = visibleOrder.findIndex((t) => t.id === over.id)
    const newVisible = arrayMove(visibleOrder, oldIndex, newIndex).map((t, i) => ({
      ...t,
      position: i,
    }))
    setVisibleOrder(newVisible)
    reorderTodayTasks(newVisible.map((t) => t.id))
  }

  const isEmpty = todayTasks.length === 0

  return (
    <AppShell overloadMode={overloadMode}>
      <TopBar
        title="AuDHD"
        energyStatus={todayEnergyStatus}
        energyValue={todayEnergy}
        onEnergyClick={() => goTo('energy-view')}
        overloadActive={overloadMode}
        plannedCost={getRemainingPlannedCost(todayPlannedTasks)}
        onResourcesClick={() => goTo('resources')}
        onSettingsClick={() => goTo('settings')}
      />

      {overloadMode && (
        <Card style={{ borderColor: 'var(--color-warning)' }}>
          <p style={{ fontWeight: 600, margin: 0, color: 'var(--color-warning)' }}>
            Mode surcharge actif
          </p>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
            Prenez le temps qu'il vous faut.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => goTo('overload-recovery')}
            style={{ marginTop: 'var(--spacing-sm)' }}
          >
            Centre récupération
          </Button>
        </Card>
      )}

      {!overloadMode && (
        <section aria-label="Tâche du jour">
          <h2 style={{ fontSize: '1.1rem' }}>Tâche du jour</h2>
          {isEmpty ? (
            <p>Rien à faire aujourd'hui</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleOrder.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {visibleOrder.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      subs={todaySubTasksMap[task.id] ?? []}
                      onOpen={openDetail}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      )}

      <section aria-label="Planning du jour">
        <h2>Planning du jour</h2>
        {hasPlanningToday ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {todayPlanned.map((task) => {
              const completed = task.status === 'completed'
              return (
              <Card key={task.id} style={{ padding: 'var(--spacing-sm)', ...plannedTaskTintStyle(completed, ambianceColor) }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => handleCompletePlanned(task.id)}
                    aria-label={`Terminer ${task.title}`}
                    style={{ width: '20px', height: '20px', margin: 0, accentColor: 'var(--color-accent)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <button
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      padding: '6px 0',
                      color: 'inherit',
                      textDecoration: completed ? 'line-through' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      font: 'inherit',
                    }}
                    onClick={() => goTo('planning')}
                    aria-label={`${task.title} — voir dans le planning`}
                  >
                    {task.scheduled_start} · {task.title}
                    {task.energy_cost != null && <BatteryCost cost={task.energy_cost} />}
                  </button>
                  {!completed && overloadMode && !task.essential && (
                    <button
                      aria-label={`Reporter ${task.title} à demain`}
                      onClick={() => handlePostponePlanned(task.id)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'inherit',
                        flexShrink: 0,
                      }}
                    >
                      Reporter
                    </button>
                  )}
                  <button
                    aria-label={`Répéter ${task.title} demain`}
                    onClick={() => handleRepeatTomorrowPlanned(task.id)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: 'inherit',
                      flexShrink: 0,
                    }}
                  >
                    Répéter demain
                  </button>
                </div>
              </Card>
              )
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Rien de planifié aujourd'hui.</p>
        )}
      </section>
    </AppShell>
  )
}
