import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { DurationRoller } from '@/ui/components/DurationRoller'
import type { Task } from '@/domain/entities/task'
import type { TaskEditScope } from '@/app/contexts/usePlanningState'
import { isCompleted, addMinutesToTime, maxDurationBeforeMidnight } from '@/domain/rules/taskRules'
import { todayStr, formatFrenchDate } from '@/domain/rules/planningSlotRules'
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

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
  width: '100%',
  minWidth: 0,
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
  paddingBottom: 'var(--bottomnav-h)',
}

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalBox: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '360px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
}

const scheduleFieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  padding: '8px 0 0 30px',
}

const dateTimeInputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

interface SortableSubTaskItemProps {
  subTask: Task
  onDelete: (id: string) => void
  onToggle: (subTask: Task) => void
  onSchedule: (subTask: Task, date: string, start: string, durationMinutes: number | null) => void
}

function SortableSubTaskItem({ subTask, onDelete, onToggle, onSchedule }: SortableSubTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subTask.id,
  })
  const completed = isCompleted(subTask)
  const [scheduling, setScheduling] = useState(false)

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
      <Card style={{ padding: 'var(--spacing-md)' }}>
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
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ⠿
          </span>
          <input
            type="checkbox"
            checked={completed}
            aria-label={`${completed ? 'Marquer non terminée' : 'Marquer terminée'} : ${subTask.title}`}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggle(subTask)}
          />
          <span
            style={{
              color: completed ? 'var(--color-text-muted)' : 'var(--color-text)',
              textDecoration: completed ? 'line-through' : 'none',
              flex: 1,
            }}
          >
            {subTask.title}
          </span>
          <button
            aria-label={`Horaire de ${subTask.title}`}
            aria-pressed={scheduling}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: '0.75rem',
              padding: '4px 8px',
            }}
            onClick={(e) => {
              e.stopPropagation()
              setScheduling((v) => !v)
            }}
          >
            {subTask.scheduled_start
              ? `${subTask.scheduled_date ? formatFrenchDate(subTask.scheduled_date) : ''} ${subTask.scheduled_start}`
              : 'Horaire'}
          </button>
          <button
            aria-label={`Supprimer ${subTask.title}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: '1rem',
              padding: '4px',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(subTask.id)
            }}
          >
            ×
          </button>
        </div>

        {scheduling && (
          <div style={scheduleFieldStyle} onClick={(e) => e.stopPropagation()}>
            <input
              type="date"
              aria-label={`Date de ${subTask.title}`}
              defaultValue={subTask.scheduled_date ?? todayStr()}
              onChange={(e) =>
                onSchedule(subTask, e.target.value, subTask.scheduled_start ?? '09:00', subTask.duration_minutes)
              }
              style={dateTimeInputStyle}
            />
            <input
              type="time"
              aria-label={`Heure de ${subTask.title}`}
              defaultValue={subTask.scheduled_start ?? ''}
              onChange={(e) =>
                onSchedule(subTask, subTask.scheduled_date ?? todayStr(), e.target.value, subTask.duration_minutes)
              }
              style={dateTimeInputStyle}
            />
            <DurationRoller
              minutes={subTask.duration_minutes}
              maxMinutes={maxDurationBeforeMidnight(subTask.scheduled_start ?? '09:00')}
              onChange={(durationMinutes) =>
                onSchedule(
                  subTask,
                  subTask.scheduled_date ?? todayStr(),
                  subTask.scheduled_start ?? '09:00',
                  durationMinutes,
                )
              }
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export function E23Decompose() {
  const {
    selectedTaskId,
    inboxTasks,
    getSubTasks,
    getTaskById,
    addSubTaskScoped,
    deleteSubTask,
    toggleSubTask,
    reorderSubTasks,
    scheduleSubTask,
    refreshDashboard,
    goTo,
  } = useApp()

  const [subTasks, setSubTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)

  const taskFromLists = inboxTasks.find((t) => t.id === selectedTaskId)
  const task = taskFromLists ?? fetchedTask ?? undefined

  useEffect(() => {
    if (selectedTaskId) {
      getSubTasks(selectedTaskId).then(setSubTasks)
    }
  }, [getSubTasks, selectedTaskId])

  useEffect(() => {
    if (selectedTaskId && !taskFromLists) {
      getTaskById(selectedTaskId).then((t) => setFetchedTask(t ?? null))
    } else {
      setFetchedTask((prev) => (prev === null ? prev : null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskId, taskFromLists])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = subTasks.findIndex((st) => st.id === active.id)
    const newIndex = subTasks.findIndex((st) => st.id === over.id)
    const newOrder = arrayMove(subTasks, oldIndex, newIndex).map((st, i) => ({
      ...st,
      position: i,
    }))
    setSubTasks(newOrder)
    if (selectedTaskId)
      reorderSubTasks(
        selectedTaskId,
        newOrder.map((st) => st.id),
      )
  }

  async function addWithScope(title: string, scope: TaskEditScope) {
    if (!selectedTaskId) return
    await addSubTaskScoped(selectedTaskId, title, scope)
    setNewTitle('')
    const updated = await getSubTasks(selectedTaskId)
    setSubTasks(updated)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newTitle.trim()
    if (!selectedTaskId || !trimmed) return
    if (task?.recurrence_id) {
      setPendingTitle(trimmed)
      return
    }
    await addWithScope(trimmed, 'occurrence')
  }

  async function confirmScope(scope: TaskEditScope) {
    if (pendingTitle === null) return
    const title = pendingTitle
    setPendingTitle(null)
    await addWithScope(title, scope)
  }

  async function handleDelete(id: string) {
    await deleteSubTask(id)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
  }

  async function handleToggle(subTask: Task) {
    await toggleSubTask(subTask)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
  }

  async function handleSchedule(subTask: Task, date: string, start: string, durationMinutes: number | null) {
    const end = addMinutesToTime(start, durationMinutes ?? 0)
    await scheduleSubTask(subTask.id, date, start, end)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
    await refreshDashboard()
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo('task-detail')} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>Décomposer</h1>
      {task && <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{task.title}</p>}

      {subTasks.length === 0 ? (
        <p aria-live="polite">Aucune sous-étape.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={subTasks.map((st) => st.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {subTasks.map((st) => (
                <SortableSubTaskItem
                  key={st.id}
                  subTask={st}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onSchedule={handleSchedule}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ajouter une sous-étape"
          aria-label="Nouvelle sous-étape"
          style={inputStyle}
        />
        <Button type="submit" disabled={!newTitle.trim()}>
          Ajouter
        </Button>
      </form>

      {pendingTitle !== null && (
        <div role="dialog" aria-modal="true" aria-label="Modifier la série récurrente" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Tâche récurrente</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Ajouter la sous-étape à cette occurrence seulement, ou à toutes les occurrences
              futures de la série ?
            </p>
            <Button fullWidth onClick={() => confirmScope('occurrence')}>
              Cette occurrence
            </Button>
            <Button fullWidth onClick={() => confirmScope('series')}>
              Toutes les occurrences
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setPendingTitle(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
