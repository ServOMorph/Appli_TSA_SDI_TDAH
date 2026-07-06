import { useApp } from '@/app/AppContext'
import { useState, useEffect } from 'react'
import type { Task } from '@/domain/entities/task'
import type { TaskV2 } from '@/domain/entities/taskV2'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { BottomNav } from '@/ui/components/BottomNav'
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

function planningChipStyle(essential: boolean, completed: boolean): React.CSSProperties {
  return {
    background: completed
      ? 'color-mix(in srgb, var(--color-success) 25%, transparent)'
      : essential
        ? 'var(--color-primary)'
        : 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
    color: completed ? 'var(--color-text-muted)' : essential ? '#fff' : 'var(--color-text)',
    textDecoration: completed ? 'line-through' : 'none',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 10px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    width: '100%',
  }
}

interface SortableTaskItemProps {
  task: { id: string; title: string }
  subs: { is_completed: boolean }[]
  onOpen: (id: string) => void
}

function SortableTaskItem({ task, subs, onOpen }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const done = subs.filter((s) => s.is_completed).length
  const total = subs.length

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
      <Card style={{ padding: 'var(--spacing-12)' }}>
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
              color: 'var(--color-text-muted)',
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
              color: 'var(--color-text)',
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: 0,
              textAlign: 'left',
              flex: 1,
            }}
          >
            {task.title}
          </button>
          {total > 0 && (
            <span
              aria-label={`${done} sur ${total} étapes`}
              style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}
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
    overloadMode,
    setOverloadMode,
    goTo,
    selectTask,
    setTaskDetailOrigin,
    reorderTodayTasks,
    inboxTasks,
    getPlannedTasksForDate,
    completeV2Task,
  } = useApp()

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
        title="Appli pour AuDHD"
        energyStatus={todayEnergyStatus}
        energyValue={todayEnergy}
        onEnergyClick={() => goTo('energy-view')}
        overloadActive={overloadMode}
        onOverloadClick={() => setOverloadMode(!overloadMode)}
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

      {!overloadMode && (
      <section aria-label="Planning du jour">
        <h2>Planning du jour</h2>
        {hasPlanningToday ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {todayPlanned.map((task) => {
              const completed = task.status === 'completed'
              return (
              <div key={task.id} style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                <button
                  style={{ ...planningChipStyle(task.essential, completed), flex: 1 }}
                  onClick={() => goTo('planning')}
                  aria-label={`${task.title} — voir dans le planning`}
                >
                  {task.scheduled_start} · {task.title}
                </button>
                {!completed && (
                  <button
                    aria-label={`Terminer ${task.title}`}
                    onClick={() => handleCompletePlanned(task.id)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    Terminer
                  </button>
                )}
              </div>
              )
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Rien de planifié aujourd'hui.</p>
        )}
      </section>
      )}

      <BottomNav
        overloadMode={overloadMode}
        inboxHasTasks={inboxTasks.length > 0}
        onAddTask={() => goTo('task-create-v2')}
        onGoTodo={() => goTo('inbox')}
        onGoPlanning={() => goTo('planning')}
        onGoLists={() => goTo('lists')}
        onExitOverload={() => setOverloadMode(false)}
      />
    </AppShell>
  )
}
