import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { DurationRoller } from '@/ui/components/DurationRoller'
import type { Task } from '@/domain/entities/task'
import { isCompleted, addMinutesToTime } from '@/domain/rules/taskRules'
import { todayStr, formatFrenchDate } from '@/domain/rules/planningSlotRules'
import { DEFAULT_AMBIANCE_COLOR, pastelBackground } from '@/ui/styles/ambiance'
import type { Screen } from '@/app/AppContext'
import type { TaskEditScope } from '@/app/contexts/usePlanningState'
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

interface SortableSubTaskItemProps {
  subTask: Task
  onDelete: (id: string) => void
  onToggle: (subTask: Task) => void
  onSchedule: (subTask: Task, date: string, start: string, durationMinutes: number | null) => void
  onRename: (subTask: Task) => void
}

const subTaskScheduleFieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  padding: '8px 0 0 30px',
}

function SortableSubTaskItem({ subTask, onDelete, onToggle, onSchedule, onRename }: SortableSubTaskItemProps) {
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
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
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
            aria-label={`Renommer ${subTask.title}`}
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
              onRename(subTask)
            }}
          >
            Renommer
          </button>
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
          <div style={subTaskScheduleFieldStyle} onClick={(e) => e.stopPropagation()}>
            <input
              type="date"
              aria-label={`Date de ${subTask.title}`}
              defaultValue={subTask.scheduled_date ?? todayStr()}
              onChange={(e) =>
                onSchedule(subTask, e.target.value, subTask.scheduled_start ?? '09:00', subTask.duration_minutes)
              }
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <input
              type="time"
              aria-label={`Heure de ${subTask.title}`}
              defaultValue={subTask.scheduled_start ?? ''}
              onChange={(e) =>
                onSchedule(subTask, subTask.scheduled_date ?? todayStr(), e.target.value, subTask.duration_minutes)
              }
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <DurationRoller
              minutes={subTask.duration_minutes}
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

function backScreenForTask(task: Task): Screen {
  if (task.status === 'today' || task.status === 'planned') return 'dashboard'
  return 'inbox'
}

const fieldRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  width: '100%',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

const fieldLabelStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.875rem' }

export function E22TaskDetail() {
  const {
    selectedTaskId,
    inboxTasks,
    todayTasks,
    getSubTasks,
    deleteSubTask,
    toggleSubTask,
    renameSubTask,
    deleteTask,
    selectTask,
    reorderSubTasks,
    refreshDashboard,
    back,
    goTo,
    scheduleSubTask,
    getTaskById,
    duplicateTaskById,
    deleteTaskScoped,
    settings,
  } = useApp()

  const [subTasks, setSubTasks] = useState<Task[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [renamingSubTask, setRenamingSubTask] = useState<Task | null>(null)
  const [renameSubTaskTitle, setRenameSubTaskTitle] = useState('')
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null)
  const [pendingDelete, setPendingDelete] = useState(false)

  const taskFromLists = [...inboxTasks, ...todayTasks].find((t) => t.id === selectedTaskId)
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

  function requiresScopeChoice(): boolean {
    return !!task?.recurrence_id
  }

  async function confirmScope(scope: TaskEditScope) {
    if (!selectedTaskId || !pendingDelete) return
    setPendingDelete(false)
    await deleteTaskScoped(selectedTaskId, scope)
    selectTask(null)
    goTo(task ? backScreenForTask(task) : 'inbox')
  }

  function cancelScope() {
    setPendingDelete(false)
  }

  async function handleDuplicate() {
    if (!selectedTaskId) return
    await duplicateTaskById(selectedTaskId)
    selectTask(null)
    goTo(task ? backScreenForTask(task) : 'inbox')
  }

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

  async function handleDeleteSubTask(id: string) {
    await deleteSubTask(id)
    await refreshDashboard()
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
  }

  async function handleToggleSubTask(subTask: Task) {
    await toggleSubTask(subTask)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
  }

  async function handleDelete() {
    if (!selectedTaskId) return
    if (requiresScopeChoice()) {
      setShowDeleteConfirm(false)
      setPendingDelete(true)
      return
    }
    await deleteTask(selectedTaskId)
    selectTask(null)
    goTo(task ? backScreenForTask(task) : 'inbox')
  }

  async function handleScheduleSubTask(subTask: Task, date: string, start: string, durationMinutes: number | null) {
    const end = addMinutesToTime(start, durationMinutes ?? 0)
    await scheduleSubTask(subTask.id, date, start, end)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
    await refreshDashboard()
  }

  function handleOpenRenameSubTask(subTask: Task) {
    setRenamingSubTask(subTask)
    setRenameSubTaskTitle(subTask.title)
  }

  async function handleConfirmRenameSubTask() {
    const trimmed = renameSubTaskTitle.trim()
    if (!renamingSubTask || !trimmed) return
    await renameSubTask(renamingSubTask.id, trimmed)
    setRenamingSubTask(null)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
  }

  if (!task) {
    return (
      <main style={pageStyle}>
        <button style={backBtnStyle} onClick={() => goTo('inbox')} aria-label="Retour">
          ← Retour
        </button>
        <p>Tâche introuvable.</p>
      </main>
    )
  }


  const ambianceColor = settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR
  const detailPageStyle: React.CSSProperties = task.scheduled_date
    ? { ...pageStyle, backgroundColor: pastelBackground(ambianceColor) }
    : pageStyle

  return (
    <main style={detailPageStyle}>
      <button style={backBtnStyle} onClick={() => back(backScreenForTask(task))} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>{task.title}</h1>

      <section aria-label="Détails" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Titre</span>
          <span>{task.title}</span>
        </div>

        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Icône</span>
          <span>{task.icon ?? 'Aucune'}</span>
        </div>

        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Couleur</span>
          <span>{task.color ?? 'Aucune couleur'}</span>
        </div>

        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Date</span>
          <span>{task.scheduled_date ? formatFrenchDate(task.scheduled_date) : 'Non planifiée'}</span>
        </div>

        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Horaire</span>
          <span>{task.scheduled_start ? `${task.scheduled_start} (${task.duration_minutes ?? 0} min)` : 'Non planifié'}</span>
        </div>

        <div style={fieldRowStyle}>
          <span style={fieldLabelStyle}>Coût en énergie</span>
          <span>{task.energy_cost ?? 'Non défini'}</span>
        </div>
      </section>

      {subTasks.length > 0 && (
        <section aria-label="Sous-étapes">
          <h2>Sous-étapes</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={subTasks.map((st) => st.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {subTasks.map((st) => (
                  <SortableSubTaskItem
                    key={st.id}
                    subTask={st}
                    onDelete={handleDeleteSubTask}
                    onToggle={handleToggleSubTask}
                    onSchedule={handleScheduleSubTask}
                    onRename={handleOpenRenameSubTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <Button fullWidth onClick={() => goTo('task-edit')}>
          Modifier
        </Button>
        <Button fullWidth onClick={() => goTo('task-decompose')}>
          Décomposer
        </Button>
        <Button fullWidth onClick={handleDuplicate}>
          Dupliquer
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(true)}>
          Supprimer
        </Button>
      </div>

      {pendingDelete && (
        <div role="dialog" aria-modal="true" aria-label="Modifier la série récurrente" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Tâche récurrente</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Appliquer la suppression à cette occurrence seulement, ou à toutes les occurrences
              futures de la série ?
            </p>
            <Button fullWidth onClick={() => confirmScope('occurrence')}>
              Cette occurrence
            </Button>
            <Button fullWidth onClick={() => confirmScope('series')}>
              Toutes les occurrences
            </Button>
            <Button variant="secondary" fullWidth onClick={cancelScope}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer la tâche" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer cette tâche ?</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Cette action est irréversible.
            </p>
            <Button fullWidth onClick={handleDelete}>
              Supprimer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {renamingSubTask && (
        <div role="dialog" aria-modal="true" aria-label="Renommer la sous-étape" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Renommer la sous-étape</h2>
            <input
              type="text"
              value={renameSubTaskTitle}
              onChange={(e) => setRenameSubTaskTitle(e.target.value)}
              aria-label="Nouveau nom"
              autoFocus
              style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
            <Button fullWidth onClick={handleConfirmRenameSubTask} disabled={!renameSubTaskTitle.trim()}>
              Enregistrer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setRenamingSubTask(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
