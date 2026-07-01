import { useApp } from '@/app/AppContext'
import { useState, useEffect } from 'react'
import type { Task } from '@/domain/entities/task'
import type { TaskV2 } from '@/domain/entities/taskV2'
import type { Routine } from '@/domain/entities/routine'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { getActionImmediate } from '@/domain/rules/actionImmediateRules'
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

function planningChipStyle(essential: boolean): React.CSSProperties {
  return {
    background: essential ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
    color: essential ? '#fff' : 'var(--color-text)',
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

const planningRoutineChipStyle: React.CSSProperties = {
  background: 'var(--color-secondary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 10px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
  width: '100%',
}

function segmentStyle(withDivider: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '12px 8px',
    background: 'transparent',
    border: 'none',
    borderLeft: withDivider ? '1px solid var(--color-border)' : 'none',
    color: 'var(--color-secondary)',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
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
      <Card style={{ padding: 'var(--spacing-xs)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: '0.75rem',
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
              fontSize: '0.75rem',
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
              style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', flexShrink: 0 }}
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
    toPlanTasks,
    getPlannedTasksForDate,
    getRoutinesForDate,
    selectRoutine,
  } = useApp()

  const [visibleOrder, setVisibleOrder] = useState<Task[]>(() => todayTasks.slice(0, 3))
  const [todayPlanned, setTodayPlanned] = useState<TaskV2[]>([])
  const [todayRoutinesScheduled, setTodayRoutinesScheduled] = useState<Routine[]>([])

  useEffect(() => {
    setVisibleOrder(todayTasks.slice(0, 3))
  }, [todayTasks])

  useEffect(() => {
    async function loadPlanningToday() {
      const date = todayStr()
      const [planned, routinesForDate] = await Promise.all([
        getPlannedTasksForDate(date),
        getRoutinesForDate(date),
      ])
      setTodayPlanned(planned)
      setTodayRoutinesScheduled(routinesForDate)
    }
    loadPlanningToday()
  }, [getPlannedTasksForDate, getRoutinesForDate])

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

  function openRoutine(routineId: string) {
    selectRoutine(routineId)
    goTo('routine-detail')
  }

  const visiblePlannedTasks = todayPlanned.filter((t) => overloadMode ? t.essential : true)
  const hasPlanningToday = visiblePlannedTasks.length > 0 || todayRoutinesScheduled.length > 0

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
    reorderTodayTasks([...newVisible, ...todayTasks.slice(3)].map((t) => t.id))
  }

  const action = getActionImmediate([...visibleOrder, ...todayTasks.slice(3)], todaySubTasksMap)
  const isEmpty = todayTasks.length === 0

  const energyLabel =
    todayEnergyStatus === 'filled' && todayEnergy !== null
      ? `${todayEnergy} énergie`
      : todayEnergyStatus === 'skipped'
        ? 'Énergie ignorée'
        : 'Mon énergie'
  const energyAriaLabel =
    todayEnergyStatus === 'filled' && todayEnergy !== null
      ? `${todayEnergy} énergie aujourd'hui`
      : todayEnergyStatus === 'skipped'
        ? "Énergie ignorée aujourd'hui"
        : 'Renseigner mon énergie'

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        backgroundColor: overloadMode ? 'var(--color-surface)' : undefined,
      }}
    >
      <TopBar
        title="Appli pour AuDHD"
        energyLabel={energyLabel}
        energyAriaLabel={energyAriaLabel}
        onEnergyClick={() => goTo('energy-view')}
        overloadActive={overloadMode}
        onOverloadClick={() => setOverloadMode(!overloadMode)}
        onPlanningClick={() => goTo('planning')}
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

      <section aria-label="Action immédiate">
        <h2>Que faire maintenant ?</h2>
        <Card style={{ padding: 'var(--spacing-12)' }}>
          {action.type === 'task' && action.task ? (
            <button
              onClick={() => openDetail(action.task!.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                width: '100%',
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  fontSize: '1.1rem',
                  margin: 0,
                }}
              >
                {action.task.title}
              </p>
              {action.nextSubTask && (
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Prochaine étape : {action.nextSubTask.title}
                </p>
              )}
            </button>
          ) : (
            <p>Que souhaitez-vous ajouter ?</p>
          )}
        </Card>
      </section>

      <section aria-label="Planning du jour">
        <h2>Planning du jour</h2>
        {hasPlanningToday ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {todayRoutinesScheduled.map((routine) => (
              <button
                key={routine.id}
                style={planningRoutineChipStyle}
                onClick={() => openRoutine(routine.id)}
                aria-label={`${routine.name} — routine (${routine.duration_minutes} min)`}
              >
                {routine.scheduled_start} · {routine.name} ({routine.duration_minutes} min)
              </button>
            ))}
            {visiblePlannedTasks.map((task) => (
              <button
                key={task.id}
                style={planningChipStyle(task.essential)}
                onClick={() => goTo('planning')}
                aria-label={`${task.title} — voir dans le planning`}
              >
                {task.scheduled_start} · {task.title}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Rien de planifié aujourd'hui.</p>
        )}
      </section>

      {!isEmpty ? (
        <section aria-label="Tâches du jour">
          <h2>Tâches du jour</h2>
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
        </section>
      ) : null}

      <nav
        aria-label="Navigation principale"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          marginTop: 'auto',
        }}
      >
        <Button fullWidth onClick={() => goTo('task-create-v2')}>
          Ajouter une tâche
        </Button>
        {toPlanTasks.length > 0 && (
          <button
            aria-label="Tâches à planifier"
            onClick={() => goTo('to-plan-queue')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px var(--spacing-md)',
              cursor: 'pointer',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              width: '100%',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#d32f2f',
                flexShrink: 0,
              }}
            />
            À planifier
          </button>
        )}
        <div
          role="group"
          aria-label="Listes de tâches"
          style={{
            display: 'flex',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <button onClick={() => goTo('inbox')} style={segmentStyle(false)}>
            Todo
          </button>
          <button onClick={() => goTo('today')} style={segmentStyle(true)}>
            Aujourd'hui
          </button>
          <button onClick={() => goTo('later')} style={segmentStyle(true)}>
            À faire plus tard
          </button>
          <button onClick={() => goTo('routines')} style={segmentStyle(true)}>
            Routines
          </button>
          <button onClick={() => goTo('planning')} style={segmentStyle(true)}>
            Planifier
          </button>
          <button onClick={() => goTo('lists')} style={segmentStyle(true)}>
            Listes
          </button>
        </div>
      </nav>
    </main>
  )
}
