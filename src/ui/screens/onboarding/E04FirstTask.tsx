import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'

export function E04FirstTask() {
  const { addTask, goTo } = useApp()
  const [title, setTitle] = useState('')

  async function submit() {
    if (title.trim()) {
      await addTask(title.trim())
    }
    goTo('dashboard')
  }

  function skip() {
    goTo('dashboard')
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        justifyContent: 'center',
      }}
    >
      <div>
        <h1>Votre première tâche</h1>
        <p>Quelle est la chose la plus importante à faire aujourd'hui ?</p>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex. : Appeler le médecin"
        aria-label="Titre de la tâche"
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        style={{
          padding: 'var(--spacing-md)',
          fontSize: '1rem',
          fontFamily: 'var(--font-body)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          outline: 'none',
        }}
      />
      <Button fullWidth onClick={submit}>
        Ajouter
      </Button>
      <Button variant="secondary" fullWidth onClick={skip}>
        Ignorer
      </Button>
    </main>
  )
}
