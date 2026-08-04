import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { IconPicker } from '@/ui/components/IconPicker'
import { ColorPicker } from '@/ui/components/ColorPicker'
import { DurationRoller } from '@/ui/components/DurationRoller'
import type { Task } from '@/domain/entities/task'
import { isCompleted } from '@/domain/rules/taskRules'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'
import type { Screen } from '@/app/AppContext'
import type { TaskEditScope, TaskFieldEdit } from '@/app/contexts/usePlanningState'
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
  onPlan: (subTask: Task) => void
  onRename: (subTask: Task) => void
}

function SortableSubTaskItem({ subTask, onDelete, onToggle, onPlan, onRename }: SortableSubTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subTask.id,
  })
  const completed = isCompleted(subTask)

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
            aria-label={`Planifier ${subTask.title}`}
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
              onPlan(subTask)
            }}
          >
            Planifier
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
      </Card>
    </div>
  )
}

function backScreenForTask(task: Task): Screen {
  if (task.status === 'today') return 'today'
  return 'inbox'
}

const fieldRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
  background: 'none',
  textAlign: 'left',
  width: '100%',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

const fieldLabelStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.875rem' }

const energyGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 'var(--spacing-xs)',
}

function energyGridButtonStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '10px 0',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: selected ? 'var(--color-accent)' : 'var(--color-surface)',
    color: selected ? '#fff' : 'var(--color-text)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
}

const ENERGY_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)

type EditableField = 'date' | 'time' | 'energy' | 'icon' | 'color' | null

export function E22TaskDetail() {
  const {
    selectedTaskId,
    inboxTasks,
    todayTasks,
    lists,
    getSubTasks,
    deleteSubTask,
    toggleSubTask,
    renameSubTask,
    completeTask,
    deleteTask,
    selectTask,
    selectList,
    goToPath,
    reorderSubTasks,
    refreshDashboard,
    back,
    goTo,
    moveTask,
    startPlanTask,
    startPlanSubTask,
    moveTodoTaskToList,
    createList,
    getTaskById,
    duplicateTaskById,
    updateTaskFields,
    deleteTaskScoped,
  } = useApp()

  const [subTasks, setSubTasks] = useState<Task[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showListPicker, setShowListPicker] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [subtaskWarningAction, setSubtaskWarningAction] = useState<'plan' | 'list' | null>(null)
  const [renamingSubTask, setRenamingSubTask] = useState<Task | null>(null)
  const [renameSubTaskTitle, setRenameSubTaskTitle] = useState('')
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null)
  const [activeField, setActiveField] = useState<EditableField>(null)
  const [pendingEdit, setPendingEdit] = useState<TaskFieldEdit | null>(null)
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

  async function refreshFetchedTask() {
    if (selectedTaskId) {
      const t = await getTaskById(selectedTaskId)
      setFetchedTask(t ?? null)
    }
  }

  function requiresScopeChoice(): boolean {
    return !!task?.recurrence_id
  }

  async function handleFieldEdit(edit: TaskFieldEdit) {
    if (!selectedTaskId) return
    setActiveField(null)
    if (requiresScopeChoice()) {
      setPendingEdit(edit)
    } else {
      await updateTaskFields(selectedTaskId, edit, 'occurrence')
      await refreshFetchedTask()
    }
  }

  async function confirmScope(scope: TaskEditScope) {
    if (!selectedTaskId) return
    if (pendingEdit) {
      await updateTaskFields(selectedTaskId, pendingEdit, scope)
      setPendingEdit(null)
      await refreshFetchedTask()
    } else if (pendingDelete) {
      setPendingDelete(false)
      await deleteTaskScoped(selectedTaskId, scope)
      selectTask(null)
      goTo(task ? backScreenForTask(task) : 'inbox')
    }
  }

  function cancelScope() {
    setPendingEdit(null)
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

  async function handleComplete() {
    if (!selectedTaskId) return
    await completeTask(selectedTaskId)
    selectTask(null)
    goTo('dashboard')
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

  async function handleMoveToToday() {
    if (!selectedTaskId) return
    await moveTask(selectedTaskId, 'today')
  }

  function handlePlan() {
    if (!selectedTaskId || !task) return
    startPlanTask(task.title, selectedTaskId)
    goTo('planning')
  }

  function handlePlanSubTask(subTask: Task) {
    startPlanSubTask(subTask.id, subTask.title)
    goTo('planning')
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

  async function handleChooseList(listId: string) {
    if (!selectedTaskId) return
    await moveTodoTaskToList(selectedTaskId, listId)
    selectTask(null)
    selectList(listId)
    goToPath(['lists', 'list-detail'])
  }

  async function handleCreateList() {
    if (!selectedTaskId || !newListName.trim()) return
    const listId = await createList(newListName.trim())
    await moveTodoTaskToList(selectedTaskId, listId)
    setNewListName('')
    selectTask(null)
    selectList(listId)
    goToPath(['lists', 'list-detail'])
  }

  function handleClickPlan() {
    if (subTasks.length > 0) {
      setSubtaskWarningAction('plan')
    } else {
      handlePlan()
    }
  }

  function handleClickList() {
    if (subTasks.length > 0) {
      setSubtaskWarningAction('list')
    } else {
      setShowListPicker(true)
    }
  }

  function confirmSubtaskWarning() {
    const action = subtaskWarningAction
    setSubtaskWarningAction(null)
    if (action === 'plan') {
      handlePlan()
    } else if (action === 'list') {
      setShowListPicker(true)
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


  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => back(backScreenForTask(task))} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>{task.title}</h1>

      <section aria-label="Détails" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <button
          type="button"
          style={fieldRowStyle}
          onClick={() => setActiveField(activeField === 'icon' ? null : 'icon')}
        >
          <span style={fieldLabelStyle}>Icône</span>
          <span>{task.icon ?? 'Aucune'}</span>
        </button>
        {activeField === 'icon' && (
          <IconPicker value={task.icon} onChange={(icon) => handleFieldEdit({ icon })} />
        )}

        <button
          type="button"
          style={fieldRowStyle}
          onClick={() => setActiveField(activeField === 'color' ? null : 'color')}
        >
          <span style={fieldLabelStyle}>Couleur</span>
          <span>{task.color ?? 'Aucune couleur'}</span>
        </button>
        {activeField === 'color' && (
          <ColorPicker value={task.color} onChange={(color) => handleFieldEdit({ color })} />
        )}

        <button
          type="button"
          style={fieldRowStyle}
          onClick={() => setActiveField(activeField === 'date' ? null : 'date')}
        >
          <span style={fieldLabelStyle}>Date</span>
          <span>{task.scheduled_date ?? 'Non planifiée'}</span>
        </button>
        {activeField === 'date' && (
          <input
            type="date"
            aria-label="Modifier la date"
            defaultValue={task.scheduled_date ?? ''}
            onChange={(e) => handleFieldEdit({ date: e.target.value })}
            style={inputStyle}
          />
        )}

        <button
          type="button"
          style={fieldRowStyle}
          onClick={() => setActiveField(activeField === 'time' ? null : 'time')}
        >
          <span style={fieldLabelStyle}>Horaire</span>
          <span>{task.scheduled_start ? `${task.scheduled_start} (${task.duration_minutes ?? 0} min)` : 'Non planifié'}</span>
        </button>
        {activeField === 'time' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <input
              type="time"
              aria-label="Modifier l'heure de début"
              defaultValue={task.scheduled_start ?? ''}
              onChange={(e) => handleFieldEdit({ startTime: e.target.value })}
              style={inputStyle}
            />
            <DurationRoller
              minutes={task.duration_minutes}
              onChange={(durationMinutes) => handleFieldEdit({ durationMinutes })}
            />
          </div>
        )}

        <button
          type="button"
          style={fieldRowStyle}
          onClick={() => setActiveField(activeField === 'energy' ? null : 'energy')}
        >
          <span style={fieldLabelStyle}>Coût en énergie</span>
          <span>{task.energy_cost ?? 'Non défini'}</span>
        </button>
        {activeField === 'energy' && (
          <div style={energyGridStyle} role="group" aria-label="Modifier le coût en énergie">
            {ENERGY_OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                style={energyGridButtonStyle(task.energy_cost === v)}
                onClick={() => handleFieldEdit({ energyCost: task.energy_cost === v ? null : v })}
              >
                {v}
              </button>
            ))}
          </div>
        )}
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
                    onPlan={handlePlanSubTask}
                    onRename={handleOpenRenameSubTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <Button fullWidth onClick={() => goTo('task-decompose')}>
          Décomposer
        </Button>
        {task.status !== 'today' && (
          <Button fullWidth onClick={handleMoveToToday}>
            Tâche du jour
          </Button>
        )}
        <Button fullWidth onClick={handleClickPlan}>
          Planifier
        </Button>
        <Button fullWidth onClick={handleClickList}>
          Liste
        </Button>
        <Button fullWidth onClick={handleComplete}>
          Terminer
        </Button>
        <Button fullWidth onClick={handleDuplicate}>
          Dupliquer
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(true)}>
          Supprimer
        </Button>
      </div>

      {(pendingEdit || pendingDelete) && (
        <div role="dialog" aria-modal="true" aria-label="Modifier la série récurrente" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Tâche récurrente</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Appliquer {pendingDelete ? 'la suppression' : 'la modification'} à cette occurrence
              seulement, ou à toutes les occurrences futures de la série ?
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

      {showListPicker && (
        <div role="dialog" aria-modal="true" aria-label="Choisir une liste" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter à une liste</h2>
            {lists.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Aucune liste pour l'instant.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {lists.map((l) => (
                  <button
                    key={l.id}
                    aria-label={`Ajouter à ${l.name}`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', textAlign: 'left' }}
                    onClick={() => handleChooseList(l.id)}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nouvelle liste"
                aria-label="Nom de la nouvelle liste"
                style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
              <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                Créer
              </Button>
            </div>
            <Button variant="secondary" fullWidth onClick={() => setShowListPicker(false)}>
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

      {subtaskWarningAction && (
        <div role="dialog" aria-modal="true" aria-label="Sous-tâches perdues" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Sous-tâches non conservées</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              {`« ${task.title} » a ${subTasks.length} sous-tâche${subTasks.length > 1 ? 's' : ''}. ${
                subTasks.length > 1 ? 'Elles seront' : 'Elle sera'
              } supprimée${subTasks.length > 1 ? 's' : ''} et ne sera pas reportée sur la nouvelle destination. Continuer ?`}
            </p>
            <Button fullWidth onClick={confirmSubtaskWarning}>
              Continuer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setSubtaskWarningAction(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
