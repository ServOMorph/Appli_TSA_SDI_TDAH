import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { SubTask } from '@/domain/entities/subTask'
import type { Task } from '@/domain/entities/task'
import type { Screen } from '@/app/AppContext'
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
  subTask: SubTask
  onDelete: (id: string) => void
  onToggle: (subTask: SubTask) => void
  onPlan: (subTask: SubTask) => void
  onRename: (subTask: SubTask) => void
}

function SortableSubTaskItem({ subTask, onDelete, onToggle, onPlan, onRename }: SortableSubTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subTask.id,
  })

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
            checked={subTask.is_completed}
            aria-label={`${subTask.is_completed ? 'Marquer non terminée' : 'Marquer terminée'} : ${subTask.title}`}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggle(subTask)}
          />
          <span
            style={{
              color: subTask.is_completed ? 'var(--color-text-muted)' : 'var(--color-text)',
              textDecoration: subTask.is_completed ? 'line-through' : 'none',
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

export function E22TaskDetail() {
  const {
    selectedTaskId,
    inboxTasks,
    todayTasks,
    lists,
    getSubTasks,
    deleteSubTask,
    toggleSubTask,
    renameSubTaskV2,
    completeTask,
    deleteTask,
    selectTask,
    selectList,
    setListDetailOrigin,
    reorderSubTasks,
    refreshDashboard,
    taskDetailOrigin,
    goTo,
    moveTask,
    startPlanTask,
    startPlanSubTask,
    moveTodoTaskToList,
    createList,
  } = useApp()

  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showListPicker, setShowListPicker] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [subtaskWarningAction, setSubtaskWarningAction] = useState<'plan' | 'list' | null>(null)
  const [renamingSubTask, setRenamingSubTask] = useState<SubTask | null>(null)
  const [renameSubTaskTitle, setRenameSubTaskTitle] = useState('')

  const task = [...inboxTasks, ...todayTasks].find((t) => t.id === selectedTaskId)

  useEffect(() => {
    if (selectedTaskId) {
      getSubTasks(selectedTaskId).then(setSubTasks)
    }
  }, [getSubTasks, selectedTaskId])

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

  async function handleToggleSubTask(subTask: SubTask) {
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

  function handlePlanSubTask(subTask: SubTask) {
    startPlanSubTask(subTask.id, subTask.title)
    goTo('planning')
  }

  function handleOpenRenameSubTask(subTask: SubTask) {
    setRenamingSubTask(subTask)
    setRenameSubTaskTitle(subTask.title)
  }

  async function handleConfirmRenameSubTask() {
    const trimmed = renameSubTaskTitle.trim()
    if (!renamingSubTask || !trimmed) return
    await renameSubTaskV2(renamingSubTask.id, trimmed)
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
    setListDetailOrigin('lists')
    goTo('list-detail')
  }

  async function handleCreateList() {
    if (!selectedTaskId || !newListName.trim()) return
    const listId = await createList(newListName.trim())
    await moveTodoTaskToList(selectedTaskId, listId)
    setNewListName('')
    selectTask(null)
    selectList(listId)
    setListDetailOrigin('lists')
    goTo('list-detail')
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

  const back = taskDetailOrigin ?? backScreenForTask(task)

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo(back)} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>{task.title}</h1>

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
        <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(true)}>
          Supprimer
        </Button>
      </div>

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
