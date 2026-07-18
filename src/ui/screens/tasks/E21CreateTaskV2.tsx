import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { TaskStatusV2 } from '@/domain/entities/taskV2'

type Destination = TaskStatusV2 | 'list' | 'today'

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  boxSizing: 'border-box',
}

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'today', label: 'Tâche du jour' },
  { value: 'planned', label: 'Planifier' },
  { value: 'list', label: 'Mettre dans une liste' },
]

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

function destinationBtnStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
    backgroundColor: selected ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: '1rem',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    width: '100%',
  }
}

export function E21CreateTaskV2() {
  const {
    createTaskV2Dest,
    createTaskInbox,
    goTo,
    lists,
    addListItem,
    addTask,
    createList,
    selectList,
    startPlanTask,
    taskCreateOrigin,
  } = useApp()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState<Destination | null>(null)
  const [showListPicker, setShowListPicker] = useState(false)
  const [newListName, setNewListName] = useState('')
  const destinations = taskCreateOrigin === 'inbox'
    ? DESTINATIONS.filter((d) => d.value !== 'planned')
    : DESTINATIONS

  function returnToOrigin() {
    goTo(taskCreateOrigin ?? 'inbox')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || !destination) return
    if (destination === 'todo') {
      await createTaskInbox(trimmed)
      goTo('inbox')
      return
    }
    if (destination === 'list') {
      setShowListPicker(true)
      return
    }
    if (destination === 'today') {
      await addTask(trimmed)
      goTo('today')
      return
    }
    if (destination === 'planned') {
      startPlanTask(trimmed)
      goTo('planning')
      return
    }
    await createTaskV2Dest(trimmed, destination)
    goTo('inbox')
  }

  async function handleChooseList(listId: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    await addListItem(listId, trimmed)
    setShowListPicker(false)
    selectList(listId)
    goTo('list-detail')
  }

  async function handleCreateList() {
    const trimmed = title.trim()
    if (!trimmed || !newListName.trim()) return
    const listId = await createList(newListName.trim())
    await addListItem(listId, trimmed)
    setNewListName('')
    setShowListPicker(false)
    selectList(listId)
    goTo('list-detail')
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={returnToOrigin} aria-label="Retour">
        &larr; Retour
      </button>

      <h1 style={{ margin: 0 }}>Nouvelle tâche</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div>
          <label
            htmlFor="task-title"
            style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-muted)' }}
          >
            Titre de la tâche
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Que faut-il faire ?"
            autoFocus
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Que faire de cette tâche ?</p>
          {destinations.map((d) => (
            <button
              key={d.value}
              type="button"
              aria-pressed={destination === d.value}
              onClick={() => setDestination(d.value)}
              style={destinationBtnStyle(destination === d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <Button fullWidth type="submit" disabled={!title.trim() || !destination}>
          Valider
        </Button>
        <Button variant="secondary" fullWidth type="button" onClick={() => goTo('inbox')}>
          Annuler
        </Button>
      </form>

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

    </main>
  )
}
