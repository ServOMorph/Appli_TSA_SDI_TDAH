import { useApp } from '@/app/AppContext'
import { useState, useEffect } from 'react'
import type { Task } from '@/domain/entities/task'
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
  } = useApp()

  const [visibleOrder, setVisibleOrder] = useState<Task[]>(() => todayTasks.slice(0, 3))

  useEffect(() => {
    setVisibleOrder(todayTasks.slice(0, 3))
  }, [todayTasks])

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
      ? `${todayEnergy} souffle`
      : todayEnergyStatus === 'skipped'
        ? 'Énergie ignorée'
        : 'Mon énergie'
  const energyAriaLabel =
    todayEnergyStatus === 'filled' && todayEnergy !== null
      ? `${todayEnergy} souffle aujourd'hui`
      : todayEnergyStatus === 'skipped'
        ? "Énergie ignorée aujourd'hui"
        : 'Renseigner mon énergie'

  if (overloadMode) {
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
          justifyContent: 'center',
        }}
      >
        <h1>Mode surcharge</h1>
        <Card>
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
        <Button fullWidth onClick={() => goTo('overload-recovery')}>
          Centre récupération
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setOverloadMode(false)}>
          Désactiver le mode surcharge
        </Button>
      </main>
    )
  }

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
      }}
    >
      <TopBar
        title="Appli pour AuDHD"
        energyLabel={energyLabel}
        energyAriaLabel={energyAriaLabel}
        onEnergyClick={() => goTo('energy-view')}
        onOverloadClick={() => setOverloadMode(true)}
        onResourcesClick={() => goTo('resources')}
        onSettingsClick={() => goTo('settings')}
      />

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
        <Button fullWidth onClick={() => goTo('task-create')}>
          Ajouter une tâche
        </Button>
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
            Inbox
          </button>
          <button onClick={() => goTo('today')} style={segmentStyle(true)}>
            Aujourd'hui
          </button>
          <button onClick={() => goTo('later')} style={segmentStyle(true)}>
            Plus tard
          </button>
        </div>
      </nav>
    </main>
  )
}
