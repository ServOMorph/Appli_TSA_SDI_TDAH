import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { SubTask } from '@/domain/entities/subTask'
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

interface SortableSubTaskItemProps {
  subTask: SubTask
  onDelete: (id: string) => void
}

function SortableSubTaskItem({ subTask, onDelete }: SortableSubTaskItemProps) {
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
          <span style={{ color: 'var(--color-text)', flex: 1 }}>{subTask.title}</span>
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

export function E23Decompose() {
  const {
    selectedTaskId,
    inboxTasks,
    todayTasks,
    laterTasks,
    getSubTasks,
    addSubTask,
    deleteSubTask,
    reorderSubTasks,
    goTo,
  } = useApp()

  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [newTitle, setNewTitle] = useState('')

  const task = [...inboxTasks, ...todayTasks, ...laterTasks].find((t) => t.id === selectedTaskId)

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newTitle.trim()
    if (!selectedTaskId || !trimmed) return
    await addSubTask(selectedTaskId, trimmed)
    setNewTitle('')
    const updated = await getSubTasks(selectedTaskId)
    setSubTasks(updated)
  }

  async function handleDelete(id: string) {
    await deleteSubTask(id)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
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
                <SortableSubTaskItem key={st.id} subTask={st} onDelete={handleDelete} />
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
    </main>
  )
}
