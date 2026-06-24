import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'

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

export function E21CreateTask() {
  const { createTaskInbox, goTo } = useApp()
  const [title, setTitle] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await createTaskInbox(trimmed)
    goTo('inbox')
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo('inbox')} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>Nouvelle tâche</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div>
          <label htmlFor="task-title" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
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

        <Button fullWidth type="submit" disabled={!title.trim()}>
          Valider
        </Button>
        <Button variant="secondary" fullWidth type="button" onClick={() => goTo('inbox')}>
          Annuler
        </Button>
      </form>
    </main>
  )
}
