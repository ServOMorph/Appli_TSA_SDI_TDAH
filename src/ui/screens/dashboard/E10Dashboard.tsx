import { useApp } from '@/app/AppContext'
import { useState, useEffect } from 'react'
import type { Task } from '@/domain/entities/task'
import { getRemainingPlannedCost } from '@/domain/rules/taskRulesV2'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { PlanningBoard } from '@/ui/screens/dashboard/PlanningBoard'
import { flashyBackground } from '@/ui/styles/ambiance'
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

const handleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-xs)',
  width: '100%',
  padding: '8px 0',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '0.8125rem',
  fontFamily: 'var(--font-body)',
}

const handleBarStyle: React.CSSProperties = {
  display: 'block',
  width: '36px',
  height: '4px',
  borderRadius: '2px',
  background: 'var(--color-border)',
}

const widgetBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  padding: 0,
}

export function E10Dashboard() {
  const {
    route,
    todayTasks,
    todaySubTasksMap,
    todayEnergy,
    todayEnergyStatus,
    todayPlannedTasks,
    overloadMode,
    goTo,
    selectTask,
    reorderTodayTasks,
  } = useApp()

  const expanded = route.name === 'planning'

  const [visibleOrder, setVisibleOrder] = useState<Task[]>(() => todayTasks)

  useEffect(() => {
    setVisibleOrder(todayTasks)
  }, [todayTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function openDetail(taskId: string) {
    selectTask(taskId)
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
    reorderTodayTasks(newVisible.map((t) => t.id))
  }

  const isEmpty = todayTasks.length === 0
  const showSecondary = !expanded

  const handle = (
    <button
      onClick={() => goTo(expanded ? 'dashboard' : 'planning')}
      aria-expanded={expanded}
      aria-label={expanded ? 'Replier le planning' : 'Déplier le planning'}
      style={handleStyle}
    >
      <span aria-hidden style={handleBarStyle} />
      <span>{expanded ? 'Replier' : 'Déplier'}</span>
    </button>
  )

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
        onOverloadClick={() => goTo('overload-recovery')}
      />

      {overloadMode && showSecondary && (
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          ...(expanded ? { flex: 1 } : {}),
        }}
      >
        {expanded && handle}
        <PlanningBoard collapsed={!expanded} onRequestExpand={() => goTo('planning')} />
        {!expanded && handle}
      </div>

      {showSecondary && !overloadMode && (
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

      {showSecondary && !overloadMode && (
        <section aria-label="Outils">
          <h2 style={{ fontSize: '1.1rem' }}>Outils</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <Card>
              <button style={widgetBtnStyle} onClick={() => goTo('tools')}>
                Outils
              </button>
            </Card>
            <Card>
              <button style={widgetBtnStyle} onClick={() => goTo('lists')}>
                Listes
              </button>
            </Card>
          </div>
        </section>
      )}
    </AppShell>
  )
}
