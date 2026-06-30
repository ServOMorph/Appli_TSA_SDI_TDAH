import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { TaskStatusV2 } from '@/domain/entities/taskV2'

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

const DESTINATIONS: { value: TaskStatusV2; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'planned', label: 'Planifier' },
  { value: 'to_plan', label: 'A planifier plus tard' },
]

function destinationBtnStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
    backgroundColor: selected ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: '1rem',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    width: '100%',
  }
}

export function E21CreateTaskV2() {
  const { createTaskV2Dest, goTo } = useApp()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState<TaskStatusV2 | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || !destination) return
    await createTaskV2Dest(trimmed, destination)
    if (destination === 'planned') {
      goTo('planning')
    } else {
      goTo('inbox')
    }
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo('inbox')} aria-label="Retour">
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
          {DESTINATIONS.map((d) => (
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
    </main>
  )
}
