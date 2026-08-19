import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'

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

const textAreaStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  minHeight: '96px',
  resize: 'vertical',
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

export function E62ListItemDetail() {
  const {
    selectedListItemId,
    getListItem,
    updateListItemDescription,
    getListItemSubTasks,
    addListItemSubTask,
    toggleListItemSubTask,
    deleteListItemSubTask,
    back,
  } = useApp()

  const [item, setItem] = useState<ListItem | null>(null)
  const [description, setDescription] = useState('')
  const [subTasks, setSubTasks] = useState<ListItemSubTask[]>([])
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')

  useEffect(() => {
    if (!selectedListItemId) return
    getListItem(selectedListItemId).then((loaded) => {
      if (loaded) {
        setItem(loaded)
        setDescription(loaded.description)
      }
    })
    getListItemSubTasks(selectedListItemId).then(setSubTasks)
  }, [selectedListItemId, getListItem, getListItemSubTasks])

  async function handleDescriptionBlur() {
    if (!selectedListItemId) return
    await updateListItemDescription(selectedListItemId, description)
  }

  async function handleAddSubTask(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newSubTaskTitle.trim()
    if (!selectedListItemId || !trimmed) return
    await addListItemSubTask(selectedListItemId, trimmed)
    setNewSubTaskTitle('')
    setSubTasks(await getListItemSubTasks(selectedListItemId))
  }

  async function handleToggleSubTask(id: string) {
    await toggleListItemSubTask(id)
    if (selectedListItemId) setSubTasks(await getListItemSubTasks(selectedListItemId))
  }

  async function handleDeleteSubTask(id: string) {
    await deleteListItemSubTask(id)
    if (selectedListItemId) setSubTasks(await getListItemSubTasks(selectedListItemId))
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => back('list-detail')} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>{item?.title ?? 'Élément'}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <label htmlFor="item-description" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Description
        </label>
        <textarea
          id="item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          placeholder="Ajouter une description…"
          style={textAreaStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Sous-tâches</h2>
        {subTasks.length === 0 ? (
          <p aria-live="polite" style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Aucune sous-tâche.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {subTasks.map((subTask) => (
              <li
                key={subTask.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--spacing-xs)',
                }}
              >
                <input
                  type="checkbox"
                  checked={subTask.checked}
                  aria-label={`${subTask.checked ? 'Décocher' : 'Cocher'} ${subTask.title}`}
                  onChange={() => handleToggleSubTask(subTask.id)}
                />
                <span
                  style={{
                    flex: 1,
                    textDecoration: subTask.checked ? 'line-through' : 'none',
                    color: subTask.checked ? 'var(--color-text-muted)' : 'var(--color-text)',
                  }}
                >
                  {subTask.title}
                </span>
                <button
                  aria-label={`Supprimer ${subTask.title}`}
                  onClick={() => handleDeleteSubTask(subTask.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)', padding: '0 4px' }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddSubTask} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <input
            type="text"
            value={newSubTaskTitle}
            onChange={(e) => setNewSubTaskTitle(e.target.value)}
            placeholder="Ajouter une sous-tâche"
            aria-label="Nouvelle sous-tâche"
            style={inputStyle}
          />
          <Button type="submit" disabled={!newSubTaskTitle.trim()}>
            Ajouter
          </Button>
        </form>
      </div>
    </main>
  )
}
