import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { SubTask } from '@/domain/entities/subTask'

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

export function E23Decompose() {
  const {
    selectedTaskId,
    inboxTasks,
    todayTasks,
    laterTasks,
    getSubTasks,
    addSubTask,
    deleteSubTask,
    goTo,
  } = useApp()

  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [newTitle, setNewTitle] = useState('')

  const task = [...inboxTasks, ...todayTasks, ...laterTasks].find((t) => t.id === selectedTaskId)

  useEffect(() => {
    if (selectedTaskId) {
      getSubTasks(selectedTaskId).then(setSubTasks)
    }
  }, [selectedTaskId])

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
      {task && (
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{task.title}</p>
      )}

      {subTasks.length === 0 ? (
        <p aria-live="polite">Aucune sous-étape.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {subTasks.map((st) => (
            <Card key={st.id} style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text)' }}>{st.title}</span>
                <button
                  aria-label={`Supprimer ${st.title}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '4px' }}
                  onClick={() => handleDelete(st.id)}
                >
                  ×
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
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
